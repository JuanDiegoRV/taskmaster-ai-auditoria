import { describe, expect, it, vi } from 'vitest'
import {
  createTask,
  deleteTask,
  getTasksByProject,
  TaskServiceError,
  type TasksClient,
  updateTask,
} from '../services/tasks.service'
import type { TaskRow } from '../types/database'

const task: TaskRow = {
  id: 'task-1',
  project_id: 'project-1',
  title: 'Preparar demo',
  description: null,
  status: 'todo',
  priority: 'high',
  creator_id: 'user-1',
  assignee_id: null,
  created_at: '2026-11-12T00:00:00Z',
  updated_at: '2026-11-12T00:00:00Z',
}

interface FakeOptions {
  rows?: TaskRow[]
  result?: TaskRow
  queryError?: Error | null
  deleteError?: Error | null
  userId?: string | null
}

function createFakeClient(options: FakeOptions = {}) {
  const calls = {
    from: vi.fn(),
    eq: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
  const result = options.result ?? task
  const readChain = {
    select: vi.fn(() => readChain),
    eq: vi.fn((field: string, value: string) => {
      calls.eq(field, value)
      return readChain
    }),
    order: vi.fn(async () => ({ data: options.rows ?? [task], error: options.queryError ?? null })),
  }
  const mutationChain = {
    select: vi.fn(() => mutationChain),
    eq: vi.fn((field: string, value: string) => {
      calls.eq(field, value)
      return mutationChain
    }),
    single: vi.fn(async () => ({ data: result, error: options.queryError ?? null })),
  }
  const deleteChain = {
    eq: vi.fn(async (field: string, value: string) => {
      calls.eq(field, value)
      return { error: options.deleteError ?? null }
    }),
  }

  const client = {
    from: vi.fn(() => ({
      select: vi.fn(() => readChain),
      insert: vi.fn((payload: unknown) => {
        calls.insert(payload)
        return mutationChain
      }),
      update: vi.fn((changes: unknown) => {
        calls.update(changes)
        return mutationChain
      }),
      delete: vi.fn(() => {
        calls.delete()
        return deleteChain
      }),
    })),
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: options.userId ? { id: options.userId } : null },
        error: null,
      })),
    },
  } as unknown as TasksClient

  return { client, calls }
}

describe('tasks.service', () => {
  it('consulta tareas filtradas por project_id', async () => {
    const { client, calls } = createFakeClient({ rows: [task] })

    await expect(getTasksByProject('project-1', client)).resolves.toEqual([task])

    expect(client.from).toHaveBeenCalledWith('tasks')
    expect(calls.eq).toHaveBeenCalledWith('project_id', 'project-1')
  })

  it('inserta la tarea con el usuario autenticado, no con creator_id de la UI', async () => {
    const { client, calls } = createFakeClient({ userId: 'user-1' })

    await expect(
      createTask({ project_id: 'project-1', title: 'Nueva tarea' }, client),
    ).resolves.toEqual(task)

    expect(calls.insert).toHaveBeenCalledWith({
      project_id: 'project-1',
      title: 'Nueva tarea',
      creator_id: 'user-1',
    })
  })

  it('actualiza solo los campos permitidos por el servicio', async () => {
    const { client, calls } = createFakeClient()

    await expect(updateTask('task-1', { status: 'done', priority: 'low' }, client)).resolves.toEqual(task)

    expect(calls.update).toHaveBeenCalledWith({ status: 'done', priority: 'low' })
    expect(calls.eq).toHaveBeenCalledWith('id', 'task-1')
  })

  it('elimina una tarea por id', async () => {
    const { client, calls } = createFakeClient()

    await expect(deleteTask('task-1', client)).resolves.toBeUndefined()

    expect(calls.delete).toHaveBeenCalledOnce()
    expect(calls.eq).toHaveBeenCalledWith('id', 'task-1')
  })

  it('propaga los errores de Supabase como TaskServiceError sin silenciarlos', async () => {
    const error = new Error('RLS denied')
    const { client } = createFakeClient({ queryError: error })

    await expect(getTasksByProject('project-1', client)).rejects.toMatchObject({
      name: 'TaskServiceError',
      operation: 'consultar tareas del proyecto',
      cause: error,
    })
  })

  it('rechaza crear una tarea cuando no hay sesión autenticada', async () => {
    const { client } = createFakeClient({ userId: null })

    await expect(createTask({ project_id: 'project-1', title: 'Sin sesión' }, client)).rejects.toBeInstanceOf(
      TaskServiceError,
    )
  })
})
