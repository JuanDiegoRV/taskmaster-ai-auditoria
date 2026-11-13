import { getSupabaseClient } from '../config/supabase'
import type { Database, TaskPriority, TaskRow, TaskStatus } from '../types/database'

type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type QueryResult<T> = Promise<{ data: T | null; error: unknown | null }>

interface TaskMutationBuilder {
  select(columns: '*'): TaskMutationBuilder
  eq(field: 'id', value: string): TaskMutationBuilder
  single(): QueryResult<TaskRow>
}

interface TaskReadBuilder {
  select(columns: '*'): TaskReadBuilder
  eq(field: 'project_id', value: string): TaskReadBuilder
  order(field: 'created_at', options: { ascending: boolean }): QueryResult<TaskRow[]>
}

interface TasksTable {
  select(columns: '*'): TaskReadBuilder
  insert(values: TaskInsert): TaskMutationBuilder
  update(values: UpdateTaskInput): TaskMutationBuilder
  delete(): { eq(field: 'id', value: string): QueryResult<null> }
}

export interface TasksClient {
  from(table: 'tasks'): TasksTable
  auth: {
    getUser(): Promise<{ data: { user: { id: string } | null }; error: unknown | null }>
  }
}

function getTasksClient(): TasksClient {
  return getSupabaseClient() as unknown as TasksClient
}

export type CreateTaskInput = Pick<TaskInsert, 'project_id' | 'title'> &
  Partial<Pick<TaskInsert, 'description' | 'status' | 'priority' | 'assignee_id'>>

export type UpdateTaskInput = Partial<
  Pick<TaskRow, 'title' | 'description' | 'status' | 'priority' | 'assignee_id'>
>

export class TaskServiceError extends Error {
  readonly operation: string
  override readonly cause: unknown

  constructor(operation: string, cause: unknown) {
    super(`No se pudo completar la operación de tareas: ${operation}.`)
    this.name = 'TaskServiceError'
    this.operation = operation
    this.cause = cause
  }
}

function assertNonEmpty(value: string, fieldName: string): void {
  if (!value.trim()) {
    throw new TaskServiceError(`${fieldName} es obligatorio`, new Error('empty value'))
  }
}

function throwIfError(operation: string, error: unknown): never {
  throw new TaskServiceError(operation, error)
}

function requireTask(operation: string, data: TaskRow | null): TaskRow {
  if (!data) {
    throw new TaskServiceError(operation, new Error('Supabase no devolvió la tarea'))
  }

  return data
}

export async function getTasksByProject(
  projectId: string,
  client: TasksClient = getTasksClient(),
): Promise<TaskRow[]> {
  assertNonEmpty(projectId, 'projectId')

  const { data, error } = await client
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    throwIfError('consultar tareas del proyecto', error)
  }

  return data ?? []
}

export async function createTask(
  input: CreateTaskInput,
  client: TasksClient = getTasksClient(),
): Promise<TaskRow> {
  assertNonEmpty(input.project_id, 'project_id')
  assertNonEmpty(input.title, 'title')

  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser()

  if (authError) {
    throwIfError('obtener usuario autenticado', authError)
  }

  if (!user) {
    throw new TaskServiceError('crear tarea sin sesión autenticada', new Error('no user'))
  }

  const payload: TaskInsert = {
    ...input,
    creator_id: user.id,
  }

  const { data, error } = await client.from('tasks').insert(payload).select('*').single()

  if (error) {
    throwIfError('crear tarea', error)
  }

  return requireTask('crear tarea sin resultado', data)
}

export async function updateTask(
  taskId: string,
  changes: UpdateTaskInput,
  client: TasksClient = getTasksClient(),
): Promise<TaskRow> {
  assertNonEmpty(taskId, 'taskId')

  const { data, error } = await client
    .from('tasks')
    .update(changes)
    .eq('id', taskId)
    .select('*')
    .single()

  if (error) {
    throwIfError('actualizar tarea', error)
  }

  return requireTask('actualizar tarea sin resultado', data)
}

export async function deleteTask(
  taskId: string,
  client: TasksClient = getTasksClient(),
): Promise<void> {
  assertNonEmpty(taskId, 'taskId')

  const { error } = await client.from('tasks').delete().eq('id', taskId)

  if (error) {
    throwIfError('eliminar tarea', error)
  }
}

export type { TaskPriority, TaskStatus }
