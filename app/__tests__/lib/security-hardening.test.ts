/**
 * Retained Database Security Tests
 *
 * Verifies the security hardening arc that fixed 168 Supabase linter errors:
 * - Admin role system (user_roles + is_admin function)
 * - Encrypted token storage (pgcrypto)
 * - Zero linter errors
 *
 * Prerequisites: Local Supabase running (`supabase start && supabase db reset`)
 * Run: cd app && npx vitest run ../supabase/tests/security-hardening.test.ts
 */

import { describe as vitestDescribe, test, expect, beforeAll, afterAll } from 'vitest';
import {
  sql,
  closePool,
  isRLSEnabled,
  columnExists,
  getColumnType,
  functionExists,
  runSupabaseLint,
  getAnonClient,
  getAdminClient,
  createTestAdmin,
  cleanupTestData,
} from './db-security-helpers';

// ============================================
// Test Configuration
// ============================================

const runLocalSupabaseTests = process.env.RUN_LOCAL_SUPABASE_TESTS === 'true';
const describe = runLocalSupabaseTests ? vitestDescribe : vitestDescribe.skip;

let testAdminId: string;

// ============================================
// Setup & Teardown
// ============================================

beforeAll(async () => {
  if (!runLocalSupabaseTests) return;
  testAdminId = await createTestAdmin();
});

afterAll(async () => {
  if (!runLocalSupabaseTests) return;
  await cleanupTestData();
  await closePool();
});

// ============================================
// ADMIN ROLE SYSTEM
// ============================================

describe('Section 2: Secure Admin Role System', () => {
  test('user_roles table exists with RLS', async () => {
    expect(await isRLSEnabled('user_roles')).toBe(true);
  });

  test('is_admin() function exists', async () => {
    expect(await functionExists('is_admin')).toBe(true);
  });

  test('is_admin() returns true for admin users', async () => {
    const rows = await sql<{ is_admin: boolean }>(
      `SELECT public.is_admin($1) AS is_admin`,
      [testAdminId]
    );
    expect(rows[0].is_admin).toBe(true);
  });

  test('is_admin() returns false for non-admin users', async () => {
    const rows = await sql<{ is_admin: boolean }>(
      `SELECT public.is_admin('00000000-0000-0000-0000-000000000099'::uuid) AS is_admin`
    );
    expect(rows[0].is_admin).toBe(false);
  });

  test('is_admin() has explicit search_path', async () => {
    const rows = await sql<{ proconfig: string[] | null }>(
      `SELECT p.proconfig
       FROM pg_proc p
       JOIN pg_namespace n ON p.pronamespace = n.oid
       WHERE n.nspname = 'public' AND p.proname = 'is_admin'`
    );
    const hasSearchPath = rows[0]?.proconfig?.some((c) => c.startsWith('search_path='));
    expect(hasSearchPath).toBe(true);
  });
});

// ============================================
// OAUTH TOKEN ENCRYPTION
// ============================================

describe('Section 4: OAuth Token Encryption', () => {
  test('google_calendar_tokens has encrypted columns', async () => {
    expect(await columnExists('google_calendar_tokens', 'access_token_encrypted')).toBe(true);
    expect(await columnExists('google_calendar_tokens', 'refresh_token_encrypted')).toBe(true);
  });

  test('encrypted columns use bytea type', async () => {
    expect(await getColumnType('google_calendar_tokens', 'access_token_encrypted')).toBe('bytea');
    expect(await getColumnType('google_calendar_tokens', 'refresh_token_encrypted')).toBe('bytea');
  });

  test('token getter functions exist', async () => {
    expect(await functionExists('get_calendar_access_token')).toBe(true);
    expect(await functionExists('get_calendar_refresh_token')).toBe(true);
  });

  test('stores only encrypted tokens and allows the server to retrieve them', async () => {
    const client = getAdminClient();
    const encryptionKey = 'local-calendar-test-key-at-least-32-characters';
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const { error: storeError } = await client.rpc('store_google_calendar_tokens', {
      p_user_id: testAdminId,
      p_access_token: 'local-access-secret',
      p_refresh_token: 'local-refresh-secret',
      p_token_type: 'Bearer',
      p_expires_at: expiresAt,
      p_google_email: 'calendar-test@local.invalid',
      p_encryption_key: encryptionKey,
    });
    expect(storeError).toBeNull();

    const rows = await sql<{ id: string; access_token: string | null; refresh_token: string | null; access_token_encrypted: Buffer; refresh_token_encrypted: Buffer }>(
      `select id, access_token, refresh_token, access_token_encrypted, refresh_token_encrypted
       from public.google_calendar_tokens where user_id = $1`,
      [testAdminId],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].access_token).toBeNull();
    expect(rows[0].refresh_token).toBeNull();
    expect(rows[0].access_token_encrypted.toString()).not.toContain('local-access-secret');
    expect(rows[0].refresh_token_encrypted.toString()).not.toContain('local-refresh-secret');

    const { data: accessToken, error: accessError } = await client.rpc(
      'get_calendar_access_token',
      { token_id: rows[0].id, p_encryption_key: encryptionKey },
    );
    const { data: refreshToken, error: refreshError } = await client.rpc(
      'get_calendar_refresh_token',
      { token_id: rows[0].id, p_encryption_key: encryptionKey },
    );
    expect(accessError).toBeNull();
    expect(refreshError).toBeNull();
    expect(accessToken).toBe('local-access-secret');
    expect(refreshToken).toBe('local-refresh-secret');
  });

  test('pgcrypto extension is in extensions schema', async () => {
    const rows = await sql<{ nspname: string }>(
      `SELECT n.nspname
       FROM pg_extension e
       JOIN pg_namespace n ON e.extnamespace = n.oid
       WHERE e.extname = 'pgcrypto'`
    );
    expect(rows[0]?.nspname).toBe('extensions');
  });
});

// ============================================
// SUPABASE LINT — ZERO ERRORS
// ============================================

describe('Section 5: Supabase Lint Verification', () => {
  test('supabase db lint shows no errors', () => {
    const output = runSupabaseLint();
    expect(output).toContain('No schema errors found');
  }, 30000);
});

// ============================================
// POLICY REPLACEMENT COVERAGE
// ============================================

describe('Retained policies avoid insecure metadata authorization', () => {
  test('no policies reference user_metadata anywhere', async () => {
    const rows = await sql<{ tablename: string; polname: string }>(
      `SELECT c.relname AS tablename, p.polname
       FROM pg_policy p
       JOIN pg_class c ON p.polrelid = c.oid
       JOIN pg_namespace n ON c.relnamespace = n.oid
       WHERE n.nspname = 'public'
         AND pg_get_expr(p.polqual, p.polrelid) LIKE '%user_metadata%'`
    );
    expect(rows).toEqual([]);
  });
});

// ============================================
// SECTION 9: ALWAYS-TRUE POLICY FIXES
// ============================================

describe('Section 9: Always-True Policy Fixes', () => {
  test('page_views INSERT requires page_slug IS NOT NULL', async () => {
    const client = getAnonClient();
    const { error } = await client.from('page_views').insert({
      page_slug: null,
    });
    expect(error).not.toBeNull();
  });

  test('projects INSERT requires name and email', async () => {
    const client = getAnonClient();
    const { error } = await client.from('projects').insert({
      message: 'Test without name/email',
    });
    expect(error).not.toBeNull();
  });

});

// ============================================
// SECTION 10: VECTOR EXTENSION
// ============================================

describe('Section 10: Vector Extension', () => {
  test('vector extension is in extensions schema', async () => {
    const rows = await sql<{ nspname: string }>(
      `SELECT n.nspname
       FROM pg_extension e
       JOIN pg_namespace n ON e.extnamespace = n.oid
       WHERE e.extname = 'vector'`
    );
    expect(rows[0]?.nspname).toBe('extensions');
  });

  test('match_page_embeddings function exists', async () => {
    expect(await functionExists('match_page_embeddings')).toBe(true);
  });
});
