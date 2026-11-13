// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTasks } from '../hooks/useTasks'
import type { TaskRow } from '../types/database'
import {
  createTask as createTaskService,
  deleteTask as deleteTaskService,
  getTasksByProject,
  updateTask as updateTaskService,
} from '../services/tasks.service'

vi.mock('../config/supabase', () => ({
  getSupabaseClient: vi.fn(() => {
    const channel = {
      on: vi.fn(() => channel),
      subscribe: vi.fn(() => channel),
    }

    return {
      channel: vi.fn(() => channel),
      removeChannel: vi.fn(async () => 'ok'),
    }
  }),
}))

vi.mock('../services/tasks.service', async () => {
  const actual = await vi.importActual<typeof import('../services/tasks.service')>(
    '../services/tasks.service',
  )

  return {
    ...actual,
    createTask: vi.fn(),
    deleteTask: vi.fn(),
    getTasksByProject: vi.fn(),
    updateTask: vi.fn(),
  }
})

const getTasksMock = vi.mocked(getTasksByProject)
const createTaskMock = vi.mocked(createTaskService)
const updateTaskMock = vi.mocked(updateTaskService)
const deleteTaskMock = vi.mocked(deleteTaskService)

function task(projectId: string, id = `${projectId}-task`): TaskRow {
  return {
    id,
    project_id: projectId,
    title: `Task ${id}`,
    description: null,
    status: 'todo',
    priority: 'medium',
    creator_id: 'user-1',
    assignee_id: null,
    created_at: '2026-11-12T00:00:00Z',
    updated_at: '2026-11-12T00:00:00Z',
  }
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve
    reject = promiseReject
  })
  return { promise, resolve, reject }
}

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('carga inicialmente las tareas del proyecto', async () => {
    const tasks = [task('project-a')]
    getTasksMock.mockResolvedValueOnce(tasks)

    const { result } = renderHook(() => useTasks('project-a'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(getTasksMock).toHaveBeenCalledWith('project-a')
    expect(result.current.data).toEqual(tasks)
    expect(result.current.error).toBeNull()
  })

  it('representa correctamente una lista vacía', async () => {
    getTasksMock.mockResolvedValueOnce([])

    const { result } = renderHook(() => useTasks('project-empty'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.data).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('expone errores de consulta sin ocultarlos', async () => {
    const error = new Error('RLS denied')
    getTasksMock.mockRejectedValueOnce(error)

    const { result } = renderHook(() => useTasks('project-a'))

    await waitFor(() => expect(result.current.error).toBe(error))

    expect(result.current.loading).toBe(false)
    expect(result.current.data).toEqual([])
  })

  it('crea, actualiza y elimina usando refrescos confirmados', async () => {
    const initial = [task('project-a')]
    const afterCreate = [task('project-a'), task('project-a', 'task-2')]
    const afterUpdate = [{ ...afterCreate[1], status: 'done' as const }]
    getTasksMock
      .mockResolvedValueOnce(initial)
      .mockResolvedValueOnce(afterCreate)
      .mockResolvedValueOnce(afterUpdate)
      .mockResolvedValueOnce([])
    createTaskMock.mockResolvedValueOnce(afterCreate[1])
    updateTaskMock.mockResolvedValueOnce(afterUpdate[0])
    deleteTaskMock.mockResolvedValueOnce()

    const { result } = renderHook(() => useTasks('project-a'))
    await waitFor(() => expect(result.current.data).toEqual(initial))

    await act(async () => {
      await result.current.createTask({ title: 'Nueva tarea' })
    })
    expect(result.current.data).toEqual(afterCreate)

    await act(async () => {
      await result.current.updateTask('task-2', { status: 'done' })
    })
    expect(result.current.data).toEqual(afterUpdate)

    await act(async () => {
      await result.current.deleteTask('task-2')
    })
    expect(result.current.data).toEqual([])
    expect(createTaskMock).toHaveBeenCalledWith({ project_id: 'project-a', title: 'Nueva tarea' })
    expect(updateTaskMock).toHaveBeenCalledWith('task-2', { status: 'done' })
    expect(deleteTaskMock).toHaveBeenCalledWith('task-2')
  })

  it('descarta la respuesta anterior al cambiar projectId', async () => {
    const projectA = deferred<TaskRow[]>()
    getTasksMock.mockImplementation((projectId) =>
      projectId === 'project-a' ? projectA.promise : Promise.resolve([task('project-b')]),
    )

    const { result, rerender } = renderHook(({ projectId }) => useTasks(projectId), {
      initialProps: { projectId: 'project-a' },
    })

    rerender({ projectId: 'project-b' })
    await waitFor(() => expect(result.current.data).toEqual([task('project-b')]))

    await act(async () => {
      projectA.resolve([task('project-a')])
      await projectA.promise
    })

    expect(result.current.data).toEqual([task('project-b')])
  })

  it('conserva la respuesta más reciente cuando las respuestas llegan fuera de orden', async () => {
    const first = deferred<TaskRow[]>()
    const second = deferred<TaskRow[]>()
    getTasksMock.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)

    const { result } = renderHook(() => useTasks('project-a'))
    await act(async () => {
      void result.current.refreshTasks()
    })

    await act(async () => {
      second.resolve([task('project-a', 'second')])
      await second.promise
    })
    await waitFor(() => expect(result.current.data[0]?.id).toBe('second'))

    await act(async () => {
      first.resolve([task('project-a', 'first')])
      await first.promise
    })

    expect(result.current.data[0]?.id).toBe('second')
  })

  it('no actualiza estado después de desmontarse durante una consulta', async () => {
    const pending = deferred<TaskRow[]>()
    getTasksMock.mockReturnValueOnce(pending.promise)
    const { unmount } = renderHook(() => useTasks('project-a'))

    unmount()
    await act(async () => {
      pending.resolve([task('project-a')])
      await pending.promise
    })
  })

  it('permite recuperarse después de un error al refrescar', async () => {
    const error = new Error('temporary failure')
    getTasksMock.mockRejectedValueOnce(error).mockResolvedValueOnce([task('project-a')])
    const { result } = renderHook(() => useTasks('project-a'))

    await waitFor(() => expect(result.current.error).toBe(error))
    await act(async () => {
      await result.current.refreshTasks()
    })

    expect(result.current.error).toBeNull()
    expect(result.current.data).toEqual([task('project-a')])
  })
})
