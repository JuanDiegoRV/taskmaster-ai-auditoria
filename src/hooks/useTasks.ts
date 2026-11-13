import { useCallback, useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabaseClient } from '../config/supabase'
import {
  createTask as createTaskService,
  deleteTask as deleteTaskService,
  getTasksByProject,
  updateTask as updateTaskService,
  type CreateTaskInput,
  type UpdateTaskInput,
} from '../services/tasks.service'
import type { TaskRow } from '../types/database'

export type UseTasksCreateInput = Omit<CreateTaskInput, 'project_id'>

export interface UseTasksResult {
  data: TaskRow[]
  loading: boolean
  error: Error | null
  createTask(input: UseTasksCreateInput): Promise<TaskRow>
  updateTask(taskId: string, changes: UpdateTaskInput): Promise<TaskRow>
  deleteTask(taskId: string): Promise<void>
  refreshTasks(): Promise<void>
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

export function useTasks(projectId: string): UseTasksResult {
  const [data, setData] = useState<TaskRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const mountedRef = useRef(true)
  const requestIdRef = useRef(0)
  const subscriptionStatusRef = useRef<string>('CLOSED')
  const realtimeSyncStateRef = useRef({ inFlight: false, pending: false })
  const realtimeSyncRef = useRef<() => void>(() => undefined)

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
      requestIdRef.current += 1
    }
  }, [])

  const refreshTasks = useCallback(async (): Promise<void> => {
    const requestId = ++requestIdRef.current

    if (!projectId.trim()) {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setData([])
        setLoading(false)
        setError(null)
      }
      return
    }

    if (mountedRef.current) {
      setLoading(true)
      setError(null)
    }

    try {
      const tasks = await getTasksByProject(projectId)

      if (mountedRef.current && requestId === requestIdRef.current) {
        setData(tasks)
        setError(null)
      }
    } catch (cause) {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setError(toError(cause))
      }
      throw cause
    } finally {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }, [projectId])

  const syncFromRealtime = useCallback((): void => {
    const syncState = realtimeSyncStateRef.current

    if (syncState.inFlight) {
      syncState.pending = true
      return
    }

    syncState.inFlight = true
    void refreshTasks()
      .catch((cause) => {
        if (mountedRef.current) {
          setError(toError(cause))
        }
      })
      .finally(() => {
        syncState.inFlight = false
        if (syncState.pending) {
          syncState.pending = false
          realtimeSyncRef.current()
        }
      })
  }, [refreshTasks])

  useEffect(() => {
    realtimeSyncRef.current = syncFromRealtime
  }, [syncFromRealtime])

  useEffect(() => {
    void refreshTasks().catch(() => undefined)
  }, [refreshTasks])

  useEffect(() => {
    let disposed = false
    let channel: RealtimeChannel | null = null
    let supabase: ReturnType<typeof getSupabaseClient> | null = null

    if (!projectId.trim()) {
      return () => undefined
    }

    try {
      supabase = getSupabaseClient()
      const filter = `project_id=eq.${projectId}`
      const handleChange = () => {
        if (!disposed) {
          realtimeSyncRef.current()
        }
      }

      channel = supabase
        .channel(`tasks:${projectId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tasks', filter }, handleChange)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks', filter }, handleChange)
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'tasks', filter }, handleChange)

      channel.subscribe((status, subscribeError) => {
        if (disposed) {
          return
        }

        subscriptionStatusRef.current = status

        if (status === 'SUBSCRIBED') {
          setError(null)
          realtimeSyncRef.current()
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          const detail = subscribeError instanceof Error ? subscribeError.message : status
          setError(new Error(`Supabase Realtime ${status}: ${detail}`))
        }
      })
    } catch (cause) {
      queueMicrotask(() => {
        if (!disposed) {
          setError(toError(cause))
        }
      })
    }

    return () => {
      disposed = true
      subscriptionStatusRef.current = 'CLOSED'
      if (channel && supabase) {
        void supabase.removeChannel(channel)
      }
    }
  }, [projectId])

  const createTask = useCallback(
    async (input: UseTasksCreateInput): Promise<TaskRow> => {
      try {
        const createdTask = await createTaskService({ ...input, project_id: projectId })
        await refreshTasks()
        return createdTask
      } catch (cause) {
        if (mountedRef.current) {
          setError(toError(cause))
        }
        throw cause
      }
    },
    [projectId, refreshTasks],
  )

  const updateTask = useCallback(
    async (taskId: string, changes: UpdateTaskInput): Promise<TaskRow> => {
      try {
        const updatedTask = await updateTaskService(taskId, changes)
        await refreshTasks()
        return updatedTask
      } catch (cause) {
        if (mountedRef.current) {
          setError(toError(cause))
        }
        throw cause
      }
    },
    [refreshTasks],
  )

  const deleteTask = useCallback(
    async (taskId: string): Promise<void> => {
      try {
        await deleteTaskService(taskId)
        await refreshTasks()
      } catch (cause) {
        if (mountedRef.current) {
          setError(toError(cause))
        }
        throw cause
      }
    },
    [refreshTasks],
  )

  return { data, loading, error, createTask, updateTask, deleteTask, refreshTasks }
}
