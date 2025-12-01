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

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );
}
