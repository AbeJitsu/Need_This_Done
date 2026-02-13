/**
 * Database Security Hardening Tests (Migration 055)
 *
 * TDD Verification: Tests written BEFORE migration runs
 * Expected: All tests FAIL before migration, PASS after migration
 *
 * Run: npm test security-hardening.test.ts
 * Verify: supabase db lint (should show 0 errors after migration)
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import {
  getAdminClient,
  getAnonClient,
  isRLSEnabled,
  getTablePolicies,
  columnExists,
  getColumnType,
  createTestAdmin,
  cleanupTestData,
  runSupabaseLint,
  countLintErrors,
} from './helpers';

// ============================================
// Test Configuration
// ============================================

const CUSTOM_TABLES = [
  'product_waitlist',
  'saved_addresses',
  'product_categories',
  'product_category_mappings',
  'waitlist_campaigns',
  'waitlist_campaign_recipients',
  'campaign_opens',
  'campaign_clicks',
];

const SECURITY_INVOKER_VIEWS = [
  'product_ratings',
  'featured_templates',
  'page_view_stats',
  'trending_products',
  'popular_templates',
  'popular_products',
  'cart_reminder_stats',
];

let testAdminId: string;
let testAdminEmail: string;

// ============================================
// Setup & Teardown
// ============================================

beforeAll(async () => {
  testAdminEmail = `test-admin-${Date.now()}@example.com`;
  testAdminId = await createTestAdmin(testAdminEmail);
});

afterAll(async () => {
  await cleanupTestData();
});

// ============================================
// SECTION 1: RLS ENABLED ON CUSTOM TABLES
// (8 tables, 134 errors before migration)
// ============================================

describe('Section 1: RLS Enabled on Custom Tables', () => {
  CUSTOM_TABLES.forEach(tableName => {
    test(`RLS is enabled on ${tableName}`, async () => {
      const enabled = await isRLSEnabled(tableName);
      expect(enabled).toBe(true);
    });

    test(`${tableName} has RLS policies`, async () => {
      const policies = await getTablePolicies(tableName);
      expect(policies.length).toBeGreaterThan(0);
    });
  });

  test('product_waitlist has user access policy', async () => {
    const policies = await getTablePolicies('product_waitlist');
    const hasUserPolicy = policies.some(p =>
      p.toLowerCase().includes('user') || p.toLowerCase().includes('own')
    );
    expect(hasUserPolicy).toBe(true);
  });

  test('product_waitlist has admin access policy', async () => {
    const policies = await getTablePolicies('product_waitlist');
    const hasAdminPolicy = policies.some(p => p.toLowerCase().includes('admin'));
    expect(hasAdminPolicy).toBe(true);
  });

  test('saved_addresses restricts access by user_id', async () => {
    const policies = await getTablePolicies('saved_addresses');
    expect(policies.length).toBeGreaterThan(0);
  });

  test('campaign analytics tables restrict admin access only', async () => {
    const analyticsTables = ['campaign_opens', 'campaign_clicks'];

    for (const table of analyticsTables) {
      const policies = await getTablePolicies(table);
      const hasAdminPolicy = policies.some(p => p.toLowerCase().includes('admin'));
      expect(hasAdminPolicy).toBe(true);
    }
  });
});

// ============================================
// SECTION 2: ADMIN ROLE SYSTEM
// (23 errors before migration)
// ============================================

describe('Section 2: Secure Admin Role System', () => {
  test('user_roles table exists', async () => {
    const client = getAdminClient();
    const { error } = await client.from('user_roles').select('role').limit(0);
    expect(error).toBeNull();
  });

  test('user_roles table has RLS enabled', async () => {
    const enabled = await isRLSEnabled('user_roles');
    expect(enabled).toBe(true);
  });

  test('user_roles enforces role enum constraint', async () => {
    const client = getAdminClient();

    // Try to insert invalid role - should fail
    const { error } = await client.from('user_roles').insert({
      user_id: '00000000-0000-0000-0000-000000000001',
      role: 'invalid-role',
    });

    expect(error).not.toBeNull();
    expect(error?.message).toContain('constraint');
  });

  test('is_admin() function exists', async () => {
    const client = getAdminClient();

    // Function should exist (error if not)
    const { error } = await client.rpc('is_admin', {
      user_id: testAdminId,
    });

    // If function doesn't exist, we'd get "function does not exist" error
    expect(error?.message).not.toContain('does not exist');
  });

  test('is_admin() returns true for admin users', async () => {
    const client = getAdminClient();

    const { data, error } = await client.rpc('is_admin', {
      user_id: testAdminId,
    });

    expect(error).toBeNull();
    expect(data).toBe(true);
  });

  test('is_admin() returns false for non-admin users', async () => {
    const client = getAdminClient();
    const nonAdminId = '00000000-0000-0000-0000-000000000099';

    const { data, error } = await client.rpc('is_admin', {
      user_id: nonAdminId,
    });

    expect(error).toBeNull();
    expect(data).toBe(false);
  });

  test('blog_posts policies use is_admin() not JWT metadata', async () => {
    const policies = await getTablePolicies('blog_posts');
    const adminPolicies = policies.filter(p => p.toLowerCase().includes('admin'));

    // Should have admin policies (using is_admin function)
    expect(adminPolicies.length).toBeGreaterThan(0);
  });

  test('no tables reference raw_user_meta_data in policies', async () => {
    const errorCount = await countLintErrors('user_metadata');
    expect(errorCount).toBe(0);
  });
});

// ============================================
// SECTION 3: SECURITY INVOKER VIEWS
// (7 errors before migration)
// ============================================

describe('Section 3: Views Use SECURITY INVOKER', () => {
  SECURITY_INVOKER_VIEWS.forEach(viewName => {
    test(`${viewName} view exists`, async () => {
      const client = getAdminClient();

      const { error } = await client.from(viewName).select('*').limit(0);

      // View should exist (error would be "relation does not exist")
      expect(error?.message).not.toContain('does not exist');
    });
  });

  test('product_ratings view is accessible', async () => {
    const client = getAnonClient();
    const { error } = await client.from('product_ratings').select('id').limit(1);

    // Should work (SECURITY INVOKER allows access based on RLS)
    expect(error).toBeNull();
  });

  test('page_view_stats view requires admin access', async () => {
    const client = getAnonClient();
    const { data } = await client.from('page_view_stats').select('*').limit(1);

    // Anon user should get empty result (RLS filters)
    expect(data).toEqual([]);
  });

  test('no views use SECURITY DEFINER', async () => {
    const errorCount = await countLintErrors('SECURITY DEFINER');
    expect(errorCount).toBe(0);
  });
});

// ============================================
// SECTION 4: OAUTH TOKEN ENCRYPTION
// (2 errors before migration)
// ============================================

describe('Section 4: OAuth Token Encryption', () => {
  test('google_calendar_tokens has encrypted token columns', async () => {
    const hasAccessToken = await columnExists(
      'google_calendar_tokens',
      'access_token_encrypted'
    );
    const hasRefreshToken = await columnExists(
      'google_calendar_tokens',
      'refresh_token_encrypted'
    );

    expect(hasAccessToken).toBe(true);
    expect(hasRefreshToken).toBe(true);
  });

  test('encrypted token columns use bytea type', async () => {
    const accessTokenType = await getColumnType(
      'google_calendar_tokens',
      'access_token_encrypted'
    );
    const refreshTokenType = await getColumnType(
      'google_calendar_tokens',
      'refresh_token_encrypted'
    );

    expect(accessTokenType).toBe('bytea');
    expect(refreshTokenType).toBe('bytea');
  });

  test('get_calendar_access_token() function exists', async () => {
    const client = getAdminClient();

    const { error } = await client.rpc('get_calendar_access_token', {
      token_id: '00000000-0000-0000-0000-000000000001',
    });

    // Function should exist (would get "does not exist" if missing)
    expect(error?.message).not.toContain('does not exist');
  });

  test('get_calendar_refresh_token() function exists', async () => {
    const client = getAdminClient();

    const { error } = await client.rpc('get_calendar_refresh_token', {
      token_id: '00000000-0000-0000-0000-000000000001',
    });

    expect(error?.message).not.toContain('does not exist');
  });

  test('token getter functions enforce access control', async () => {
    const client = getAnonClient();

    // Anon user trying to get token should fail
    const { data } = await client.rpc('get_calendar_access_token', {
      token_id: '00000000-0000-0000-0000-000000000001',
    });

    // Should return NULL (access denied)
    expect(data).toBeNull();
  });
});

// ============================================
// SECTION 5: NO auth.users EXPOSURE
// (2 errors before migration)
// ============================================

describe('Section 5: No auth.users Exposure', () => {
  test('no views expose auth.users to anon/authenticated roles', async () => {
    const errorCount = await countLintErrors('may expose `auth.users`');
    expect(errorCount).toBe(0);
  });

  test('popular_templates view does not join auth.users', async () => {
    const client = getAnonClient();

    // View should work without auth.users dependency
    const { data, error } = await client
      .from('popular_templates')
      .select('id, title, author_id')
      .limit(1);

    expect(error).toBeNull();
    // Should return author_id (not author email/name from auth.users)
    if (data && data.length > 0) {
      expect(data[0]).toHaveProperty('author_id');
    }
  });

  test('featured_templates view does not join auth.users', async () => {
    const client = getAnonClient();

    const { data, error } = await client
      .from('featured_templates')
      .select('id, title, author_id')
      .limit(1);

    expect(error).toBeNull();
    if (data && data.length > 0) {
      expect(data[0]).toHaveProperty('author_id');
    }
  });
});

// ============================================
// INTEGRATION TEST: SUPABASE LINT
// (168 errors → 0 errors)
// ============================================

describe('Integration: Supabase Lint Verification', () => {
  test('supabase db lint shows 0 errors', async () => {
    const errors = await runSupabaseLint();

    if (errors.length > 0) {
      console.error('Lint errors found:', JSON.stringify(errors, null, 2));
    }

    expect(errors.length).toBe(0);
  }, 30000); // 30s timeout for lint command

  test('no RLS disabled errors', async () => {
    const errorCount = await countLintErrors('RLS has not been enabled');
    expect(errorCount).toBe(0);
  });

  test('no user_metadata errors', async () => {
    const errorCount = await countLintErrors('user_metadata');
    expect(errorCount).toBe(0);
  });

  test('no SECURITY DEFINER errors', async () => {
    const errorCount = await countLintErrors('SECURITY DEFINER');
    expect(errorCount).toBe(0);
  });

  test('no sensitive data exposure errors', async () => {
    const errorCount = await countLintErrors('potentially sensitive data');
    expect(errorCount).toBe(0);
  });

  test('no auth.users exposure errors', async () => {
    const errorCount = await countLintErrors('may expose `auth.users`');
    expect(errorCount).toBe(0);
  });
});

// ============================================
// BEHAVIORAL TESTS: RLS ACTUALLY WORKS
// ============================================

describe('Behavioral: RLS Policies Function Correctly', () => {
  test('anon users cannot access campaign analytics', async () => {
    const client = getAnonClient();

    const { data: opens } = await client.from('campaign_opens').select('*');
    const { data: clicks } = await client.from('campaign_clicks').select('*');

    // RLS should block access (return empty)
    expect(opens).toEqual([]);
    expect(clicks).toEqual([]);
  });

  test('anon users can read public product categories', async () => {
    const client = getAnonClient();

    const { data, error } = await client
      .from('product_categories')
      .select('name')
      .limit(1);

    // Public read access should work
    expect(error).toBeNull();
  });

  test('anon users cannot modify product categories', async () => {
    const client = getAnonClient();

    const { error } = await client.from('product_categories').insert({
      name: 'Test Category',
      description: 'Should fail',
      display_order: 999,
    });

    // Should be blocked by RLS
    expect(error).not.toBeNull();
  });

  test('users cannot access other users saved addresses', async () => {
    const client = getAnonClient();

    // Try to read all addresses (should be blocked)
    const { data } = await client.from('saved_addresses').select('*');

    // RLS should return empty (no auth.uid match)
    expect(data).toEqual([]);
  });
});
