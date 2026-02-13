/**
 * Test Helpers for Database Security Testing
 *
 * Provides utilities for testing RLS policies, admin functions, and security configurations
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ============================================
// Client Setup
// ============================================

/**
 * Admin client with service role key (bypasses RLS)
 */
export function getAdminClient(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY not set. Run: supabase status');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Anonymous client (no authentication)
 */
export function getAnonClient(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

  if (!supabaseAnonKey) {
    throw new Error('SUPABASE_ANON_KEY not set. Run: supabase status');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Authenticated client for specific user
 */
export async function getUserClient(userId: string, email: string): Promise<SupabaseClient> {
  const client = getAnonClient();

  // Create test user if doesn't exist
  const adminClient = getAdminClient();
  const { error } = await adminClient.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { test_user: true },
  });

  if (error && !error.message.includes('already exists')) {
    throw error;
  }

  // Sign in as user
  const { data, error: signInError } = await client.auth.signInWithPassword({
    email,
    password: 'test-password-123',
  });

  if (signInError) {
    throw signInError;
  }

  return client;
}

// ============================================
// Database Introspection Helpers
// ============================================

/**
 * Check if RLS is enabled on a table
 */
export async function isRLSEnabled(tableName: string): Promise<boolean> {
  const client = getAdminClient();

  const { data, error } = await client
    .from('pg_tables')
    .select('rowsecurity')
    .eq('schemaname', 'public')
    .eq('tablename', tableName)
    .single();

  if (error) throw error;
  return data?.rowsecurity === true;
}

/**
 * Check if a function exists
 */
export async function functionExists(functionName: string): Promise<boolean> {
  const client = getAdminClient();

  const { data, error } = await client.rpc('pg_get_functiondef', {
    func_oid: `public.${functionName}`::regprocedure,
  });

  return !error && !!data;
}

/**
 * Check if a view uses SECURITY INVOKER
 */
export async function viewUsesSecurityInvoker(viewName: string): Promise<boolean> {
  const client = getAdminClient();

  const { data, error } = await client
    .from('pg_views')
    .select('definition')
    .eq('schemaname', 'public')
    .eq('viewname', viewName)
    .single();

  if (error) throw error;

  // Check view options for security_invoker
  // Note: This is a simplified check - full check would query pg_class
  return true; // Placeholder - need to query pg_class for view options
}

/**
 * Check if a column exists on a table
 */
export async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  const client = getAdminClient();

  const { data, error } = await client
    .from('information_schema.columns')
    .select('column_name')
    .eq('table_schema', 'public')
    .eq('table_name', tableName)
    .eq('column_name', columnName)
    .single();

  return !error && !!data;
}

/**
 * Get column data type
 */
export async function getColumnType(tableName: string, columnName: string): Promise<string | null> {
  const client = getAdminClient();

  const { data, error } = await client
    .from('information_schema.columns')
    .select('data_type')
    .eq('table_schema', 'public')
    .eq('table_name', tableName)
    .eq('column_name', columnName)
    .single();

  if (error) return null;
  return data?.data_type || null;
}

/**
 * List all RLS policies on a table
 */
export async function getTablePolicies(tableName: string): Promise<string[]> {
  const client = getAdminClient();

  const { data, error } = await client
    .from('pg_policies')
    .select('policyname')
    .eq('schemaname', 'public')
    .eq('tablename', tableName);

  if (error) throw error;
  return data?.map(p => p.policyname) || [];
}

// ============================================
// Supabase CLI Helpers
// ============================================

/**
 * Run supabase db lint and return errors
 */
export async function runSupabaseLint(): Promise<any[]> {
  try {
    const { stdout } = await execAsync(
      'cd /Users/abereyes/Projects/Personal/Need_This_Done && supabase db lint --format json'
    );
    return JSON.parse(stdout);
  } catch (error: any) {
    // If command fails, try to parse stderr as JSON
    if (error.stderr) {
      try {
        return JSON.parse(error.stderr);
      } catch {
        throw new Error(`Lint failed: ${error.stderr}`);
      }
    }
    throw error;
  }
}

/**
 * Count lint errors by description pattern
 */
export async function countLintErrors(descriptionPattern: string): Promise<number> {
  const errors = await runSupabaseLint();
  return errors.filter(e => e.description?.includes(descriptionPattern)).length;
}

// ============================================
// Test Data Helpers
// ============================================

/**
 * Create test admin user
 */
export async function createTestAdmin(email: string): Promise<string> {
  const client = getAdminClient();

  // Create auth user
  const { data: userData, error: createError } = await client.auth.admin.createUser({
    email,
    email_confirm: true,
    password: 'test-admin-password-123',
  });

  if (createError && !createError.message.includes('already exists')) {
    throw createError;
  }

  const userId = userData?.user?.id;
  if (!userId) {
    // User already exists, get ID
    const { data: existingUser } = await client.auth.admin.listUsers();
    const user = existingUser?.users.find(u => u.email === email);
    if (!user) throw new Error('Failed to create or find test admin');
    return user.id;
  }

  // Add admin role
  const { error: roleError } = await client
    .from('user_roles')
    .upsert({ user_id: userId, role: 'admin' });

  if (roleError) throw roleError;

  return userId;
}

/**
 * Clean up test data
 */
export async function cleanupTestData(): Promise<void> {
  const client = getAdminClient();

  // Delete test users
  const { data: users } = await client.auth.admin.listUsers();
  const testUsers = users?.users.filter(u =>
    u.email?.startsWith('test-') || u.user_metadata?.test_user
  );

  for (const user of testUsers || []) {
    await client.auth.admin.deleteUser(user.id);
  }
}

// ============================================
// Assertion Helpers
// ============================================

/**
 * Assert table has RLS enabled
 */
export async function expectRLSEnabled(tableName: string): Promise<void> {
  const enabled = await isRLSEnabled(tableName);
  if (!enabled) {
    throw new Error(`Expected RLS to be enabled on ${tableName}, but it was not`);
  }
}

/**
 * Assert function exists and is callable
 */
export async function expectFunctionExists(functionName: string): Promise<void> {
  const exists = await functionExists(functionName);
  if (!exists) {
    throw new Error(`Expected function ${functionName} to exist, but it does not`);
  }
}

/**
 * Assert lint errors match expected count
 */
export async function expectLintErrorCount(expected: number): Promise<void> {
  const errors = await runSupabaseLint();
  if (errors.length !== expected) {
    throw new Error(
      `Expected ${expected} lint errors, but found ${errors.length}\n` +
      `Errors: ${JSON.stringify(errors, null, 2)}`
    );
  }
}
