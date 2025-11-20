import { createClient } from '@supabase/supabase-js';

// ============================================================================
// Supabase Client Setup - Connection to the Filing Cabinet
// ============================================================================
// Supabase is like a secure filing cabinet for permanent data storage
// We create the connection once here and import it everywhere
//
// Two clients:
// 1. Regular client: Uses anon key, safe for browser and server
//    Respects Row Level Security (RLS) policies - users only see their own data
// 2. Admin client: Uses service role key, only for server-side operations
//    Bypasses RLS - can read and write any data (use carefully!)
//
// Environment variables come from .env.local
// NEXT_PUBLIC_* = visible in browser (safe to expose)
// SUPABASE_* = server-only (keep secret)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ============================================================================
// Regular Client - For Browsers and Client-Side Operations
// ============================================================================
// This client is safe to use in the browser because:
// 1. The anon key has limited permissions
// 2. Row Level Security (RLS) ensures users only see their own data
// 3. It's the recommended approach for Supabase

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Did you copy .env.example to .env.local and fill in your credentials?'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

if (!supabaseServiceRoleKey) {
  console.warn(
    'SUPABASE_SERVICE_ROLE_KEY not set. ' +
    'Some admin operations will fail. This is OK for development.'
  );
}

export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

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
