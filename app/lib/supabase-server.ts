import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ============================================================================
// Server-Side Supabase Client
// ============================================================================
// Creates a Supabase client that can read the user's session from cookies.
// Use this in API routes and Server Components to get the authenticated user.
//
// Why this exists:
// - The regular client (supabase.ts) is stateless - it has no session context
// - API routes run on the server and need to read cookies from the request
// - This client integrates with Next.js cookies to restore the user's session
//
// Usage:
// import { createSupabaseServerClient } from '@/lib/supabase-server';
// const supabase = await createSupabaseServerClient();
// const { data: { user } } = await supabase.auth.getUser();

/**
 * Create a Supabase server client with session management from cookies
 *
 * @throws Error if environment variables are not configured
 * @returns Supabase server client
 *
 * @example
 * const supabase = await createSupabaseServerClient();
 * const { data: { user } } = await supabase.auth.getUser();
 */
export async function createSupabaseServerClient() {
  // Validate environment variables before creating client
  // This prevents silent failures when config is missing
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    const missing = [];
    if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');

    console.error(
      '[Supabase] Cannot create server client - missing environment variables:',
      missing
    );

    throw new Error(
      `Supabase configuration error: ${missing.join(', ')} not set`
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from Server Component where cookies can't be set
          // This is expected and safe to ignore
        }
      },
    },
  });
}
