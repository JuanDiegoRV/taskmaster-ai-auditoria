import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

export class SupabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SupabaseConfigurationError'
  }
}

export interface SupabaseConfig {
  url: string
  publishableKey: string
  keySource: 'publishable' | 'legacy-anon'
}

export function getSupabaseConfig(
  env: Record<string, string | undefined> = import.meta.env,
): SupabaseConfig {
  const url = env.VITE_SUPABASE_URL?.trim()
  const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
  const legacyAnonKey = env.VITE_SUPABASE_ANON_KEY?.trim()
  const key = publishableKey || legacyAnonKey

  if (!url || !key) {
    throw new SupabaseConfigurationError(
      'Supabase no está configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY.',
    )
  }

  if (key.toLowerCase().includes('service_role')) {
    throw new SupabaseConfigurationError(
      'La clave service_role no puede utilizarse en el navegador.',
    )
  }

  return {
    url,
    publishableKey: key,
    keySource: publishableKey ? 'publishable' : 'legacy-anon',
  }
}

let supabaseClient: SupabaseClient<Database> | undefined

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseClient) {
    const config = getSupabaseConfig()
    supabaseClient = createClient<Database>(config.url, config.publishableKey)
  }

  return supabaseClient
}

export function resetSupabaseClientForTests(): void {
  supabaseClient = undefined
}
