import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// Supabase Client Setup - Connection to the Filing Cabinet
// ============================================================================
// Supabase is like a secure filing cabinet for permanent data storage
// We create the connection once here and import it everywhere
//
// Two clients:
// 1. Browser client: Uses @supabase/ssr to store auth in cookies (not localStorage)
//    This enables SSR and allows server API routes to read the session
// 2. Admin client: Uses service role key, only for server-side operations
//    Bypasses RLS - can read and write any data (use carefully!)
//
// Environment variables come from .env.local
// NEXT_PUBLIC_* = visible in browser (safe to expose)
// SUPABASE_* = server-only (keep secret)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// During build, env vars may not be available yet (they're injected at runtime).
// We create a dummy client during build to avoid errors, but it will be properly
// initialized when the app actually runs.
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

// ============================================================================
// Browser Client - For Client-Side Operations with Cookie Storage
// ============================================================================
// Uses @supabase/ssr to store auth state in cookies instead of localStorage.
// This is critical for SSR because:
// 1. PKCE code_verifier is stored in cookies (server callback can read it)
// 2. Session tokens are in cookies (API routes can authenticate)
// 3. Works seamlessly with server components and API routes
//
// ⚠️  WARNING: DO NOT USE IN API ROUTES FOR AUTHENTICATION  ⚠️
// ============================================================================
// For API routes, use createSupabaseServerClient from '@/lib/supabase-server'
// which reads cookies from the request context.
// ============================================================================

if (!isBuildTime && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Did you copy .env.example to .env.local and fill in your credentials?'
  );
}

// Use dummy values during build, real values at runtime
export const supabase = createBrowserClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// ============================================================================
// Admin Client - For Server-Only Administrative Operations
// ============================================================================
// This client has full permissions and bypasses RLS
// ONLY use for:
// - Initializing data
// - Administrative operations
// - Server-side processing where security is handled at the API level
//
// NEVER expose this to the browser - the service role key is like the master key

if (!isBuildTime && !supabaseServiceRoleKey) {
  console.warn(
    'SUPABASE_SERVICE_ROLE_KEY not set. ' +
    'Some admin operations will fail. This is OK for development.'
  );
}

export const supabaseAdmin = supabaseServiceRoleKey || isBuildTime
  ? createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseServiceRoleKey || 'placeholder-service-key'
    )
  : null;

// ============================================================================
// Admin Client Factory
// ============================================================================
// Use this function instead of directly accessing supabaseAdmin to ensure
// the client is configured. Throws an error if service role key is not set.

export function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error(
      'Admin client not configured. Missing SUPABASE_SERVICE_ROLE_KEY environment variable.'
    );
  }
  return supabaseAdmin;
}

// ============================================================================
// Usage Examples
// ============================================================================
// Regular Client (safe in browser):
// const { data, error } = await supabase
//   .from('tasks')
//   .select('*')
//   .eq('user_id', userId);
//
// Admin Client (server-side only):
// const { data, error } = await supabaseAdmin
//   .from('users')
//   .update({ role: 'admin' })
//   .eq('id', userId);
