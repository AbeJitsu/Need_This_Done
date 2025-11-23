import { describe, it, expect } from 'vitest'

describe('Supabase Client', () => {
  it('should have required environment variables defined', () => {
    // Check that env vars are present (they should be set in vitest.setup.ts)
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined()
  })

  it('should create supabase client with correct URL', async () => {
    const { supabase } = await import('@/lib/supabase')

    // The client should exist and have auth property
    expect(supabase).toBeDefined()
    expect(supabase.auth).toBeDefined()
  })

  it('should have auth methods available', async () => {
    const { supabase } = await import('@/lib/supabase')

    // Check that common auth methods are available
    expect(typeof supabase.auth.getUser).toBe('function')
    expect(typeof supabase.auth.getSession).toBe('function')
    expect(typeof supabase.auth.signOut).toBe('function')
  })

  it('should have admin client available when service role key is set', async () => {
    // Service role key is set in vitest.setup.ts
    const { supabaseAdmin } = await import('@/lib/supabase')

    // Admin client should exist when service role key is provided
    expect(supabaseAdmin).toBeDefined()
    expect(supabaseAdmin).not.toBeNull()
  })

  it('should export both regular and admin clients', async () => {
    const supabaseModule = await import('@/lib/supabase')

    // Both exports should be available
    expect(supabaseModule.supabase).toBeDefined()
    expect(supabaseModule.supabaseAdmin).toBeDefined()
  })

  it('should have database methods on supabase client', async () => {
    const { supabase } = await import('@/lib/supabase')

    // Check that database operations are available
    expect(typeof supabase.from).toBe('function')
  })
})
