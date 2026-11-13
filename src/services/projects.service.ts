import { getSupabaseClient } from '../config/supabase'
import type { Database, ProjectRow } from '../types/database'

interface ProjectsQuery {
  select(columns: '*'): ProjectsQuery
  order(field: 'created_at', options: { ascending: boolean }): Promise<{
    data: ProjectRow[] | null
    error: unknown | null
  }>
}

export interface ProjectsClient {
  from(table: 'projects'): ProjectsQuery
}

function getProjectsClient(): ProjectsClient {
  return getSupabaseClient() as unknown as ProjectsClient
}

export class ProjectsServiceError extends Error {
  readonly cause?: unknown

  constructor(message: string, cause?: unknown) {
    super(message)
    this.name = 'ProjectsServiceError'
    this.cause = cause
  }
}

export async function getProjectsForCurrentUser(
  client: ProjectsClient = getProjectsClient(),
): Promise<ProjectRow[]> {
  const { data, error } = await client
    .from('projects')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    throw new ProjectsServiceError('No se pudieron cargar los proyectos.', error)
  }
  return data ?? []
}

export type { Database }
