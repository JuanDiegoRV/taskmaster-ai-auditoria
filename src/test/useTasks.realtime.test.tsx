// @vitest-environment jsdom
import { StrictMode, type ReactNode } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTasks } from '../hooks/useTasks'
import type { TaskRow } from '../types/database'
import {
  createTask as createTaskService,
  getTasksByProject,
} from '../services/tasks.service'

const realtime = vi.hoisted(() => {
  const channels: Array<{
    name: string
    handlers: Array<{ event: string; config: Record<string, string>; callback: () => void }>
    statusCallbacks: Array<(status: string, error?: unknown) => void>
    removed: boolean
  }> = []

  const client = {
    channel: vi.fn((name: string) => {
      const channel = {
        name,
        handlers: [] as Array<{ event: string; config: Record<string, string>; callback: () => void }>,
        statusCallbacks: [] as Array<(status: string, error?: unknown) => void>,
        removed: false,
        on: vi.fn((event: string, config: Record<string, string>, callback: () => void) => {
          channel.handlers.push({ event, config, callback })
          return channel
        }),
        subscribe: vi.fn((callback: (status: string, error?: unknown) => void) => {
          channel.statusCallbacks.push(callback)
          return channel
        }),
      }
      channels.push(channel)
      return channel
    }),
    removeChannel: vi.fn(async (channel: (typeof channels)[number]) => {
      channel.removed = true
      return 'ok'
    }),
  }

  return { channels, client }
})

vi.mock('../config/supabase', () => ({
  getSupabaseClient: vi.fn(() => realtime.client),
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

function currentChannel() {
  const channel = realtime.channels[realtime.channels.length - 1]
  if (!channel) throw new Error('No channel was created')
  return channel
}

function emit(channel: ReturnType<typeof currentChannel>, event: 'INSERT' | 'UPDATE' | 'DELETE') {
  const handler = channel.handlers.find((entry) => entry.config.event === event)
  if (!handler) throw new Error(`No ${event} handler was registered`)
  handler.callback()
}

function setStatus(
  channel: ReturnType<typeof currentChannel>,
  status: string,
  error?: unknown,
) {
  channel.statusCallbacks.forEach((callback) => callback(status, error))
}

describe('useTasks Realtime', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    realtime.channels.splice(0)
  })

  it('registra y procesa eventos INSERT con filtro por proyecto', async () => {
    getTasksMock.mockResolvedValueOnce([]).mockResolvedValueOnce([task('project-a')])
    const { result } = renderHook(() => useTasks('project-a'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    const channel = currentChannel()
    emit(channel, 'INSERT')
    await waitFor(() => expect(result.current.data).toEqual([task('project-a')]))

    expect(channel.handlers.find((entry) => entry.config.event === 'INSERT')?.config).toEqual({
      event: 'INSERT',
      schema: 'public',
      table: 'tasks',
      filter: 'project_id=eq.project-a',
    })
  })

  it('refresca después de eventos UPDATE y DELETE', async () => {
    getTasksMock
      .mockResolvedValueOnce([task('project-a')])
      .mockResolvedValueOnce([{ ...task('project-a'), status: 'done' }])
      .mockResolvedValueOnce([])
    const { result } = renderHook(() => useTasks('project-a'))
    await waitFor(() => expect(result.current.data).toEqual([task('project-a')]))
    const channel = currentChannel()

    emit(channel, 'UPDATE')
    await waitFor(() => expect(result.current.data[0]?.status).toBe('done'))
    emit(channel, 'DELETE')
    await waitFor(() => expect(result.current.data).toEqual([]))

    expect(channel.handlers.map((entry) => entry.config.event)).toEqual(['INSERT', 'UPDATE', 'DELETE'])
  })

  it('coalesce eventos consecutivos y evita duplicados mediante refresco del servidor', async () => {
    getTasksMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([task('project-a')])
      .mockResolvedValueOnce([task('project-a')])
    const { result } = renderHook(() => useTasks('project-a'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    const channel = currentChannel()

    emit(channel, 'INSERT')
    emit(channel, 'UPDATE')
    emit(channel, 'DELETE')
    await waitFor(() => expect(result.current.data).toEqual([task('project-a')]))

    expect(getTasksMock).toHaveBeenCalledTimes(3)
    expect(new Set(result.current.data.map((item) => item.id)).size).toBe(result.current.data.length)
  })

  it('elimina el canal anterior al cambiar de projectId', async () => {
    getTasksMock.mockResolvedValue([task('project-a')])
    const { result, rerender } = renderHook(({ projectId }) => useTasks(projectId), {
      initialProps: { projectId: 'project-a' },
    })
    await waitFor(() => expect(result.current.data[0]?.project_id).toBe('project-a'))
    const firstChannel = currentChannel()

    getTasksMock.mockResolvedValue([task('project-b')])
    rerender({ projectId: 'project-b' })
    await waitFor(() => expect(result.current.data[0]?.project_id).toBe('project-b'))

    expect(firstChannel.removed).toBe(true)
    expect(realtime.client.removeChannel).toHaveBeenCalledWith(firstChannel)
    expect(currentChannel().name).toBe('tasks:project-b')
  })

  it('limpia suscripciones y no duplica canales bajo React Strict Mode', async () => {
    getTasksMock.mockResolvedValue([])
    const wrapper = ({ children }: { children: ReactNode }) => <StrictMode>{children}</StrictMode>
    const { unmount } = renderHook(() => useTasks('project-a'), {
      wrapper,
      reactStrictMode: true,
    })
    await waitFor(() => expect(getTasksMock).toHaveBeenCalled())

    expect(realtime.channels.length).toBeGreaterThanOrEqual(1)
    expect(realtime.channels.filter((channel) => !channel.removed)).toHaveLength(1)
    expect(realtime.client.removeChannel).toHaveBeenCalledTimes(realtime.channels.length - 1)
    unmount()
    expect(realtime.client.removeChannel).toHaveBeenCalledTimes(realtime.channels.length)
  })

  it('expone errores CHANNEL_ERROR y recupera al reconectarse', async () => {
    getTasksMock.mockResolvedValueOnce([]).mockResolvedValueOnce([task('project-a')])
    const { result } = renderHook(() => useTasks('project-a'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    const channel = currentChannel()

    setStatus(channel, 'CHANNEL_ERROR', new Error('socket failed'))
    await waitFor(() => expect(result.current.error?.message).toContain('CHANNEL_ERROR'))

    setStatus(channel, 'TIMED_OUT')
    await waitFor(() => expect(result.current.error?.message).toContain('TIMED_OUT'))

    setStatus(channel, 'SUBSCRIBED')
    await waitFor(() => expect(result.current.data).toEqual([task('project-a')]))
    expect(result.current.error).toBeNull()
  })

  it('mantiene las mutaciones públicas existentes mientras sincroniza', async () => {
    getTasksMock.mockResolvedValueOnce([]).mockResolvedValueOnce([task('project-a')])
    createTaskMock.mockResolvedValueOnce(task('project-a'))
    const { result } = renderHook(() => useTasks('project-a'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.createTask({ title: 'Local task' })
    })
    expect(result.current.data).toEqual([task('project-a')])
  })
})
