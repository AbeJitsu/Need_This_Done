/**
 * Test Helpers for Database Security Testing
 *
 * Uses direct PostgreSQL connection for system catalog queries
 * and Supabase JS client for behavioral RLS tests.
 */

import { Pool } from 'pg';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import path from 'path';

// ============================================
// PostgreSQL Direct Connection
// ============================================

let pool: Pool;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString:
        process.env.DATABASE_URL ||
        'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
    });
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
  }
}

/**
 * Run a raw SQL query against the local database
 */
export async function sql<T = Record<string, unknown>>(
  query: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await getPool().query(query, params);
  return result.rows as T[];
}

// ============================================
// Supabase Client Setup (for RLS behavioral tests)
// ============================================

function getKeys(): { url: string; anonKey: string; serviceKey: string } {
  // Parse from supabase status if env vars not set
  if (
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return {
      url: process.env.SUPABASE_URL,
      anonKey: process.env.SUPABASE_ANON_KEY,
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    };
  }

  // Fall back to supabase status -o env
  const status = execSync('supabase status -o env', {
    cwd: path.resolve(__dirname, '../../..'),
    encoding: 'utf-8',
  });
  const parseEnv = (key: string) =>
    status.match(new RegExp(`^${key}="?([^"\\n]+)"?`, 'm'))?.[1] || '';

  const url = parseEnv('API_URL') || 'http://127.0.0.1:54321';
  const anonKey = parseEnv('ANON_KEY');
  const serviceKey = parseEnv('SERVICE_ROLE_KEY');

  if (!anonKey || !serviceKey) {
    throw new Error(
      'Could not find Supabase keys. Set SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY or run `supabase start`.'
    );
  }

  return { url, anonKey, serviceKey };
}

export function getAdminClient(): SupabaseClient {
  const { url, serviceKey } = getKeys();
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getAnonClient(): SupabaseClient {
  const { url, anonKey } = getKeys();
  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ============================================
// Database Introspection (Direct SQL)
// ============================================

export async function isRLSEnabled(tableName: string): Promise<boolean> {
  const rows = await sql<{ rowsecurity: boolean }>(
    `SELECT relrowsecurity AS rowsecurity
     FROM pg_class
     WHERE relname = $1
       AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')`,
    [tableName]
  );
  return rows[0]?.rowsecurity === true;
}

export async function getTablePolicies(tableName: string): Promise<string[]> {
  const rows = await sql<{ policyname: string }>(
    `SELECT policyname FROM pg_policies
     WHERE schemaname = 'public' AND tablename = $1`,
    [tableName]
  );
  return rows.map((r) => r.policyname);
}

export async function columnExists(
  tableName: string,
  columnName: string
): Promise<boolean> {
  const rows = await sql(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = $1
       AND column_name = $2`,
    [tableName, columnName]
  );
  return rows.length > 0;
}

export async function getColumnType(
  tableName: string,
  columnName: string
): Promise<string | null> {
  const rows = await sql<{ data_type: string }>(
    `SELECT data_type FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = $1
       AND column_name = $2`,
    [tableName, columnName]
  );
  return rows[0]?.data_type || null;
}

export async function functionExists(functionName: string): Promise<boolean> {
  const rows = await sql(
    `SELECT 1 FROM pg_proc p
     JOIN pg_namespace n ON p.pronamespace = n.oid
     WHERE n.nspname = 'public' AND p.proname = $1`,
    [functionName]
  );
  return rows.length > 0;
}

export async function viewHasSecurityInvoker(viewName: string): Promise<boolean> {
  const rows = await sql<{ reloptions: string[] | null }>(
    `SELECT c.reloptions
     FROM pg_class c
     JOIN pg_namespace n ON c.relnamespace = n.oid
     WHERE n.nspname = 'public'
       AND c.relname = $1
       AND c.relkind = 'v'`,
    [viewName]
  );
  const opts = rows[0]?.reloptions || [];
  return opts.some((o) => o === 'security_invoker=true');
}

// ============================================
// Supabase Lint
// ============================================

export function runSupabaseLint(): string {
  try {
    return execSync('supabase db lint 2>&1', {
      cwd: path.resolve(__dirname, '../../..'),
      encoding: 'utf-8',
      timeout: 30000,
      shell: '/bin/bash',
    });
  } catch (error: unknown) {
    const e = error as { stdout?: string; stderr?: string };
    return (e.stdout || '') + (e.stderr || '');
  }
}

// ============================================
// Test Data Helpers
// ============================================

export async function createTestAdmin(): Promise<string> {
  // Use a deterministic UUID for the test admin
  const testAdminId = '00000000-0000-0000-0000-000000000042';

  // Create auth user directly via SQL (bypasses JWT validation)
  // Delete first to ensure clean state
  await sql(`DELETE FROM public.user_roles WHERE user_id = $1`, [testAdminId]);
  await sql(`DELETE FROM auth.users WHERE id = $1`, [testAdminId]);
  await sql(
    `INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
     VALUES ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
             'test-admin@example.com', extensions.crypt('test-password', extensions.gen_salt('bf')),
             now(), now(), now(), '', '{"provider":"email","providers":["email"]}', '{"test_user":true}')`,
    [testAdminId]
  );

  // Add admin role
  await sql(`INSERT INTO public.user_roles (user_id, role) VALUES ($1, 'admin')`, [testAdminId]);

  return testAdminId;
}

export async function cleanupTestData(): Promise<void> {
  const testAdminId = '00000000-0000-0000-0000-000000000042';
  await sql(`DELETE FROM public.user_roles WHERE user_id = $1`, [testAdminId]);
  await sql(`DELETE FROM auth.users WHERE id = $1`, [testAdminId]);
}
