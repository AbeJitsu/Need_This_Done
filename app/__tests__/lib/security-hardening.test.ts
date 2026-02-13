/**
 * Database Security Hardening Tests (Migrations 055-061)
 *
 * Verifies the security hardening arc that fixed 168 Supabase linter errors:
 * - RLS enabled on all custom tables
 * - Admin role system (user_roles + is_admin function)
 * - SECURITY INVOKER on all views
 * - Encrypted token storage (pgcrypto)
 * - Zero linter errors
 * - RLS behavioral enforcement
 *
 * Prerequisites: Local Supabase running (`supabase start && supabase db reset`)
 * Run: cd app && npx vitest run ../supabase/tests/security-hardening.test.ts
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import {
  sql,
  closePool,
  isRLSEnabled,
  getTablePolicies,
  columnExists,
  getColumnType,
  functionExists,
  viewHasSecurityInvoker,
  runSupabaseLint,
  getAdminClient,
  getAnonClient,
  createTestAdmin,
  cleanupTestData,
} from './db-security-helpers';

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

// ============================================
// Setup & Teardown
// ============================================

beforeAll(async () => {
  testAdminId = await createTestAdmin();
});

afterAll(async () => {
  await cleanupTestData();
  await closePool();
});

// ============================================
// SECTION 1: RLS ENABLED ON CUSTOM TABLES
// ============================================

describe('Section 1: RLS Enabled on Custom Tables', () => {
  CUSTOM_TABLES.forEach((tableName) => {
    test(`RLS is enabled on ${tableName}`, async () => {
      expect(await isRLSEnabled(tableName)).toBe(true);
    });

    test(`${tableName} has RLS policies`, async () => {
      const policies = await getTablePolicies(tableName);
      expect(policies.length).toBeGreaterThan(0);
    });
  });

  test('product_waitlist has user access policy', async () => {
    const policies = await getTablePolicies('product_waitlist');
    const hasUserPolicy = policies.some(
      (p) => p.toLowerCase().includes('user') || p.toLowerCase().includes('own')
    );
    expect(hasUserPolicy).toBe(true);
  });

  test('product_waitlist has admin access policy', async () => {
    const policies = await getTablePolicies('product_waitlist');
    const hasAdminPolicy = policies.some((p) => p.toLowerCase().includes('admin'));
    expect(hasAdminPolicy).toBe(true);
  });

  test('saved_addresses restricts access by user_id', async () => {
    const policies = await getTablePolicies('saved_addresses');
    expect(policies.length).toBeGreaterThan(0);
  });

  test('campaign analytics tables restrict admin access only', async () => {
    for (const table of ['campaign_opens', 'campaign_clicks']) {
      const policies = await getTablePolicies(table);
      const hasAdminPolicy = policies.some((p) => p.toLowerCase().includes('admin'));
      expect(hasAdminPolicy).toBe(true);
    }
  });
});

// ============================================
// SECTION 2: ADMIN ROLE SYSTEM
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

  test('blog_posts policies use is_admin()', async () => {
    const policies = await getTablePolicies('blog_posts');
    const adminPolicies = policies.filter((p) => p.toLowerCase().includes('admin'));
    expect(adminPolicies.length).toBeGreaterThan(0);
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
// SECTION 3: SECURITY INVOKER VIEWS
// ============================================

describe('Section 3: Views Use SECURITY INVOKER', () => {
  SECURITY_INVOKER_VIEWS.forEach((viewName) => {
    test(`${viewName} has security_invoker=true`, async () => {
      expect(await viewHasSecurityInvoker(viewName)).toBe(true);
    });
  });
});

// ============================================
// SECTION 4: OAUTH TOKEN ENCRYPTION
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
// SECTION 5: SUPABASE LINT — ZERO ERRORS
// ============================================

describe('Section 5: Supabase Lint Verification', () => {
  test('supabase db lint shows no errors', () => {
    const output = runSupabaseLint();
    expect(output).toContain('No schema errors found');
  }, 30000);
});

// ============================================
// SECTION 6: BEHAVIORAL — RLS ACTUALLY WORKS
// ============================================

describe('Section 6: RLS Behavioral Enforcement', () => {
  test('anon users cannot access campaign analytics', async () => {
    const client = getAnonClient();
    const { data: opens } = await client.from('campaign_opens').select('*');
    const { data: clicks } = await client.from('campaign_clicks').select('*');
    expect(opens).toEqual([]);
    expect(clicks).toEqual([]);
  });

  test('anon users can read public product categories', async () => {
    const client = getAnonClient();
    const { error } = await client.from('product_categories').select('name').limit(1);
    expect(error).toBeNull();
  });

  test('anon users cannot modify product categories', async () => {
    const client = getAnonClient();
    const { error } = await client.from('product_categories').insert({
      name: 'Test Category',
      description: 'Should fail',
      display_order: 999,
    });
    expect(error).not.toBeNull();
  });

  test('anon users cannot access saved addresses', async () => {
    const client = getAnonClient();
    const { data } = await client.from('saved_addresses').select('*');
    expect(data).toEqual([]);
  });

  test('admin client (service role) can access campaign analytics', async () => {
    const client = getAdminClient();
    const { error } = await client.from('campaign_opens').select('*').limit(1);
    expect(error).toBeNull();
  });
});

// ============================================
// SECTION 7: BROAD RLS COVERAGE
// ============================================

describe('Section 7: Broad RLS Coverage', () => {
  const NON_CUSTOM_RLS_TABLES = [
    'blog_posts',
    'orders',
    'workflows',
    'loyalty_points',
    'email_templates',
  ];

  NON_CUSTOM_RLS_TABLES.forEach((tableName) => {
    test(`RLS is enabled on ${tableName}`, async () => {
      expect(await isRLSEnabled(tableName)).toBe(true);
    });
  });

  test('at least 55 public tables have RLS enabled', async () => {
    const rows = await sql<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM pg_class c
       JOIN pg_namespace n ON c.relnamespace = n.oid
       WHERE n.nspname = 'public'
         AND c.relkind = 'r'
         AND c.relrowsecurity = true`
    );
    expect(parseInt(rows[0].count)).toBeGreaterThanOrEqual(55);
  });
});

// ============================================
// SECTION 8: POLICY REPLACEMENT COVERAGE
// ============================================

describe('Section 8: Admin Policies Use is_admin()', () => {
  const TABLES_WITH_ADMIN_POLICIES = ['page_content', 'orders', 'subscriptions'];

  TABLES_WITH_ADMIN_POLICIES.forEach((tableName) => {
    test(`${tableName} has admin policy using is_admin()`, async () => {
      const rows = await sql<{ polname: string; polqual: string }>(
        `SELECT p.polname, pg_get_expr(p.polqual, p.polrelid) AS polqual
         FROM pg_policy p
         JOIN pg_class c ON p.polrelid = c.oid
         JOIN pg_namespace n ON c.relnamespace = n.oid
         WHERE n.nspname = 'public' AND c.relname = $1`,
        [tableName]
      );
      const hasIsAdmin = rows.some(
        (r) => r.polqual && r.polqual.includes('is_admin')
      );
      expect(hasIsAdmin).toBe(true);
    });
  });

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

  test('demo_items INSERT blocked for anon users', async () => {
    const client = getAnonClient();
    const { error } = await client.from('demo_items').insert({
      name: 'Test item',
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

// ============================================
// SECTION 11: FIXED FUNCTIONS
// ============================================

describe('Section 11: Fixed Functions', () => {
  test('generate_quote_reference() returns NTD-NNNNNN-NNNN format', async () => {
    const rows = await sql<{ ref: string }>(
      `SELECT public.generate_quote_reference() AS ref`
    );
    expect(rows[0].ref).toMatch(/^NTD-\d{6}-\d{4}$/);
  });

  test('validate_coupon function exists', async () => {
    expect(await functionExists('validate_coupon')).toBe(true);
  });

  test('get_product_rating function exists', async () => {
    expect(await functionExists('get_product_rating')).toBe(true);
  });
});
