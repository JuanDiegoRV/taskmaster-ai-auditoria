import { describe, expect, it } from 'vitest'
import { getSupabaseConfig, SupabaseConfigurationError } from '../config/supabase'

describe('supabase configuration', () => {
  it('informa de forma controlada cuando faltan variables', () => {
    expect(() => getSupabaseConfig({})).toThrow(SupabaseConfigurationError)
  })

  it('rechaza una clave service_role en el navegador', () => {
    expect(() =>
      getSupabaseConfig({
        VITE_SUPABASE_URL: 'https://example.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'service_role_secret',
      }),
    ).toThrow('service_role')
  })

  it('admite la clave anon legacy y registra su origen', () => {
    expect(
      getSupabaseConfig({
        VITE_SUPABASE_URL: 'https://example.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'anon_public_key',
      }),
    ).toMatchObject({ keySource: 'legacy-anon', publishableKey: 'anon_public_key' })
  })
})
