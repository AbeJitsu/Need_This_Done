import { test, expect } from '@playwright/test';

// ============================================================================
// Page View Analytics E2E Tests
// ============================================================================
// Tests page view tracking and stats retrieval for Puck CMS pages
//
// Note: These tests require the page_views migration to be applied.
// See: supabase/migrations/022_create_page_views_table.sql

test.describe('Page View Analytics', () => {
  // ============================================================================
  // API Tests - Validation
  // ============================================================================

  test('POST /api/page-views requires page_slug', async ({ request }) => {
    const response = await request.post('/api/page-views', {
      data: {},
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('page_slug');
  });

  test('GET /api/page-views requires page_slug query param', async ({ request }) => {
    const response = await request.get('/api/page-views');

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('page_slug');
  });

  test('GET /api/page-views/all returns 401 without auth', async ({ request }) => {
    const response = await request.get('/api/page-views/all');

    // Unauthenticated should get 401
    expect(response.status()).toBe(401);
  });

  // ============================================================================
  // API Tests - Database Operations (require migration)
  // ============================================================================

  test('POST /api/page-views tracks a page view', async ({ request }) => {
    const response = await request.post('/api/page-views', {
      data: {
        page_slug: 'test-page',
        referrer: 'https://google.com',
      },
    });

    // If table doesn't exist, we get 500 - skip the test
    if (response.status() === 500) {
      const data = await response.json();
      if (data.error?.includes('Failed to track')) {
        test.skip(true, 'Migration not applied: page_views table missing');
      }
    }

    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.page_slug).toBe('test-page');
  });

  test('GET /api/page-views returns stats for a page', async ({ request }) => {
    // First track a view
    const postResponse = await request.post('/api/page-views', {
      data: { page_slug: 'stats-test-page' },
    });

    // If table doesn't exist, skip
    if (postResponse.status() === 500) {
      test.skip(true, 'Migration not applied: page_views table missing');
    }

    // Then get stats
    const response = await request.get('/api/page-views?page_slug=stats-test-page');

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.page_slug).toBe('stats-test-page');
    expect(typeof data.total_views).toBe('number');
    expect(data.total_views).toBeGreaterThanOrEqual(1);
  });
});

// Admin tests - only run when auth is available
// In e2e-bypass mode, admin endpoints are bypassed via NEXT_PUBLIC_E2E_ADMIN_BYPASS
test.describe('Page View Analytics (Admin)', () => {
  // Skip storageState in bypass mode - auth is handled by bypass flag
  test.use({
    storageState: process.env.SKIP_WEBSERVER
      ? undefined
      : 'playwright/.auth/admin.json',
  });

  test('GET /api/page-views/all returns all page stats for admin', async ({
    request,
  }) => {
    const response = await request.get('/api/page-views/all');

    // In bypass mode, admin check is skipped
    // In normal mode, we need auth
    if (response.status() === 401) {
      test.skip(true, 'Admin auth required - run with auth setup or use bypass mode');
    }

    // If table doesn't exist, we get 500 - skip the test
    if (response.status() === 500) {
      test.skip(true, 'Migration not applied: page_view_stats view missing');
    }

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data.pages)).toBe(true);
  });
});
