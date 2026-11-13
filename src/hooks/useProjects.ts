import { useCallback, useEffect, useRef, useState } from 'react'
import { getProjectsForCurrentUser } from '../services/projects.service'
import type { ProjectRow } from '../types/database'

export interface UseProjectsResult {
  data: ProjectRow[]
  loading: boolean
  error: Error | null
  refreshProjects(): Promise<void>
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

export function useProjects(userId: string | null): UseProjectsResult {
  const [data, setData] = useState<ProjectRow[]>([])
  const [dataOwnerId, setDataOwnerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [errorOwnerId, setErrorOwnerId] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const refreshProjects = useCallback(async () => {
    const requestId = ++requestIdRef.current
    if (!userId) {
      return
    }
    setLoading(true)
    setError(null)
    setErrorOwnerId(null)
    try {
      const projects = await getProjectsForCurrentUser()
      if (requestId === requestIdRef.current) {
        setData(projects)
        setDataOwnerId(userId)
      }
    } catch (cause) {
      if (requestId === requestIdRef.current) {
        setError(toError(cause))
        setErrorOwnerId(userId)
      }
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    queueMicrotask(() => void refreshProjects())
  }, [refreshProjects])

  return {
    data: dataOwnerId === userId ? data : [],
    loading: userId ? loading : false,
    error: errorOwnerId === userId ? error : null,
    refreshProjects,
  }
}
