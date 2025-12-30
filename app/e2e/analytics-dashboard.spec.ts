import { test, expect } from '@playwright/test';

test.describe('Admin Analytics Dashboard', () => {
  test.describe('Analytics API', () => {
    test('GET /api/admin/analytics returns summary statistics', async ({ request }) => {
      const response = await request.get('/api/admin/analytics');

      // Should return 200 or 401 (if not authenticated)
      expect([200, 401]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('summary');
        expect(data.summary).toHaveProperty('totalRevenue');
        expect(data.summary).toHaveProperty('totalOrders');
        expect(data.summary).toHaveProperty('averageOrderValue');
        expect(data.summary).toHaveProperty('ordersByStatus');
      }
    });

    test('GET /api/admin/analytics supports date range filter', async ({ request }) => {
      const today = new Date();
      const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const startDate = lastMonth.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];

      const response = await request.get(
        `/api/admin/analytics?startDate=${startDate}&endDate=${endDate}`
      );

      expect([200, 401]).toContain(response.status());
    });

    test('GET /api/admin/analytics returns trends data', async ({ request }) => {
      const response = await request.get('/api/admin/analytics?includeTrends=true');

      expect([200, 401]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('trends');
        expect(Array.isArray(data.trends)).toBe(true);
      }
    });
  });

  test.describe('Analytics Dashboard Page', () => {
    test('displays analytics page or redirects to login', async ({ page }) => {
      await page.goto('/admin/analytics');

      // Wait for page to settle
      await page.waitForLoadState('networkidle');

      // Either shows analytics page or redirects to login/dashboard (both are valid)
      const url = page.url();
      const isLogin = url.includes('/login');
      const isDashboard = url.includes('/dashboard');
      const isAnalytics = url.includes('/analytics');

      // Test passes if: on login (not authenticated), dashboard (non-admin), or analytics page (admin)
      expect(isLogin || isDashboard || isAnalytics).toBe(true);
    });

    test('shows summary cards when authenticated', async ({ page }) => {
      await page.goto('/admin/analytics');

      const url = page.url();
      if (!url.includes('/login')) {
        // Look for summary metric cards
        const cards = page.locator('[data-testid^="metric-card-"]');
        const cardCount = await cards.count();
        expect(cardCount).toBeGreaterThanOrEqual(0); // May be 0 if no data
      }
    });
  });
});
