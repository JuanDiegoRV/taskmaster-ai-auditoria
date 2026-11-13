import type { Session, User } from '@supabase/supabase-js'
import { getSupabaseClient } from '../config/supabase'

export interface AuthCredentials {
  email: string
  password: string
}

export class AuthServiceError extends Error {
  readonly cause?: unknown

  constructor(message: string, cause?: unknown) {
    super(message)
    this.name = 'AuthServiceError'
    this.cause = cause
  }
}

interface AuthClient {
  auth: {
    getSession(): Promise<{ data: { session: Session | null }; error: unknown | null }>
    signInWithPassword(credentials: AuthCredentials): Promise<{
      data: { user: User | null }
      error: unknown | null
    }>
    signOut(): Promise<{ error: unknown | null }>
    onAuthStateChange(callback: (event: string, session: Session | null) => void): {
      data: { subscription: { unsubscribe(): void } }
    }
  }
}

function getAuthClient(): AuthClient {
  return getSupabaseClient() as unknown as AuthClient
}

function getAuthErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) {
      return `No se pudo iniciar sesión: ${message}`
    }
  }
  return 'No se pudo iniciar sesión. Revisa el correo, la contraseña y la configuración de Auth.'
}

export async function getCurrentSession(client: AuthClient = getAuthClient()): Promise<Session | null> {
  const { data, error } = await client.auth.getSession()
  if (error) {
    throw new AuthServiceError('No se pudo recuperar la sesión.', error)
  }
  return data.session
}

export async function signIn(
  credentials: AuthCredentials,
  client: AuthClient = getAuthClient(),
): Promise<User> {
  const { data, error } = await client.auth.signInWithPassword(credentials)
  if (error) {
    throw new AuthServiceError(getAuthErrorMessage(error), error)
  }
  if (!data.user) {
    throw new AuthServiceError('Supabase no devolvió un usuario autenticado.')
  }
  return data.user
}

export async function signOut(client: AuthClient = getAuthClient()): Promise<void> {
  const { error } = await client.auth.signOut()
  if (error) {
    throw new AuthServiceError('No se pudo cerrar sesión.', error)
  }
}

export function subscribeToAuthState(
  callback: (user: User | null) => void,
  client: AuthClient = getAuthClient(),
): () => void {
  const { data } = client.auth.onAuthStateChange((_event, session) => callback(session?.user ?? null))
  return () => data.subscription.unsubscribe()
}
