import { useCallback, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import {
  getCurrentSession,
  signIn as signInService,
  signOut as signOutService,
  subscribeToAuthState,
  type AuthCredentials,
} from '../services/auth.service'

export interface UseAuthResult {
  user: User | null
  loading: boolean
  error: Error | null
  signIn(credentials: AuthCredentials): Promise<void>
  signOut(): Promise<void>
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let active = true
    let unsubscribe: () => void = () => undefined

    void Promise.resolve()
      .then(() => getCurrentSession())
      .then((session) => {
        if (active) setUser(session?.user ?? null)
      })
      .catch((cause) => {
        if (active) setError(toError(cause))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    try {
      unsubscribe = subscribeToAuthState((nextUser) => {
        if (active) {
          setUser(nextUser)
          setError(null)
        }
      })
    } catch (cause) {
      queueMicrotask(() => {
        if (active) {
          setError(toError(cause))
          setLoading(false)
        }
      })
    }

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (credentials: AuthCredentials) => {
    setLoading(true)
    setError(null)
    try {
      const nextUser = await signInService(credentials)
      setUser(nextUser)
    } catch (cause) {
      const nextError = toError(cause)
      setError(nextError)
      throw nextError
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      await signOutService()
      setUser(null)
      setError(null)
    } catch (cause) {
      const nextError = toError(cause)
      setError(nextError)
      throw nextError
    } finally {
      setLoading(false)
    }
  }, [])

  return { user, loading, error, signIn, signOut }
}
