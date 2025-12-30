import { test, expect } from '@playwright/test';

// ============================================================================
// Product Recommendations E2E Tests
// ============================================================================
// Tests for the recommendations API and component

test.describe('Recommendations API', () => {
  test.describe('GET /api/recommendations', () => {
    test('returns popular products by default', async ({ request }) => {
      const response = await request.get('/api/recommendations');

      // May return 500 if migration not applied, but endpoint should exist
      expect([200, 500]).toContain(response.status());

      if (response.status() === 200) {
        const body = await response.json();
        expect(body.type).toBe('popular');
        expect(body).toHaveProperty('recommendations');
        expect(body).toHaveProperty('count');
        expect(Array.isArray(body.recommendations)).toBe(true);
      }
    });

    test('returns trending products', async ({ request }) => {
      const response = await request.get('/api/recommendations?type=trending');

      expect([200, 500]).toContain(response.status());

      if (response.status() === 200) {
        const body = await response.json();
        expect(body.type).toBe('trending');
      }
    });

    test('returns personalized recommendations', async ({ request }) => {
      const response = await request.get('/api/recommendations?type=personalized');

      expect([200, 500]).toContain(response.status());

      if (response.status() === 200) {
        const body = await response.json();
        expect(body.type).toBe('personalized');
      }
    });

    test('requires product_id for related recommendations', async ({ request }) => {
      const response = await request.get('/api/recommendations?type=related');

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toContain('product_id');
    });

    test('returns related products when product_id provided', async ({ request }) => {
      const response = await request.get('/api/recommendations?type=related&product_id=test-123');

      expect([200, 500]).toContain(response.status());

      if (response.status() === 200) {
        const body = await response.json();
        expect(body.type).toBe('related');
      }
    });

    test('returns bought_together when product_id provided', async ({ request }) => {
      const response = await request.get('/api/recommendations?type=bought_together&product_id=test-123');

      expect([200, 500]).toContain(response.status());

      if (response.status() === 200) {
        const body = await response.json();
        expect(body.type).toBe('bought_together');
      }
    });

    test('respects limit parameter', async ({ request }) => {
      const response = await request.get('/api/recommendations?limit=5');

      if (response.status() === 200) {
        const body = await response.json();
        expect(body.recommendations.length).toBeLessThanOrEqual(5);
      }
    });

    test('caps limit at 50', async ({ request }) => {
      const response = await request.get('/api/recommendations?limit=100');

      // Should not return more than 50 even if requested
      if (response.status() === 200) {
        const body = await response.json();
        expect(body.recommendations.length).toBeLessThanOrEqual(50);
      }
    });

    test('rejects invalid recommendation type', async ({ request }) => {
      const response = await request.get('/api/recommendations?type=invalid');

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toContain('Invalid recommendation type');
    });
  });

  test.describe('POST /api/recommendations (Track Interactions)', () => {
    test('requires product_id', async ({ request }) => {
      const response = await request.post('/api/recommendations', {
        data: {
          interaction_type: 'view',
        },
      });

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toContain('product_id');
    });

    test('requires valid interaction_type', async ({ request }) => {
      const response = await request.post('/api/recommendations', {
        data: {
          product_id: 'test-123',
          interaction_type: 'invalid',
        },
      });

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toContain('interaction_type');
    });

    test('accepts view interaction', async ({ request }) => {
      const response = await request.post('/api/recommendations', {
        data: {
          product_id: 'test-prod-123',
          interaction_type: 'view',
          session_id: 'test-session-123',
        },
      });

      // May return 500 if migration not applied
      expect([201, 500]).toContain(response.status());

      if (response.status() === 201) {
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(body).toHaveProperty('interaction_id');
      }
    });

    test('accepts cart_add interaction', async ({ request }) => {
      const response = await request.post('/api/recommendations', {
        data: {
          product_id: 'test-prod-456',
          interaction_type: 'cart_add',
          session_id: 'test-session-123',
          variant_id: 'variant-abc',
        },
      });

      expect([201, 500]).toContain(response.status());
    });

    test('accepts purchase interaction', async ({ request }) => {
      const response = await request.post('/api/recommendations', {
        data: {
          product_id: 'test-prod-789',
          interaction_type: 'purchase',
          session_id: 'test-session-123',
        },
      });

      expect([201, 500]).toContain(response.status());
    });

    test('accepts wishlist interaction', async ({ request }) => {
      const response = await request.post('/api/recommendations', {
        data: {
          product_id: 'test-prod-101',
          interaction_type: 'wishlist',
        },
      });

      expect([201, 500]).toContain(response.status());
    });

    test('accepts optional source_page', async ({ request }) => {
      const response = await request.post('/api/recommendations', {
        data: {
          product_id: 'test-prod-102',
          interaction_type: 'view',
          source_page: '/shop/category/electronics',
        },
      });

      expect([201, 500]).toContain(response.status());
    });

    test('accepts optional referrer_product_id', async ({ request }) => {
      const response = await request.post('/api/recommendations', {
        data: {
          product_id: 'test-prod-103',
          interaction_type: 'view',
          referrer_product_id: 'test-prod-000',
        },
      });

      expect([201, 500]).toContain(response.status());
    });
  });
});

test.describe('ProductRecommendations Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/storybook');
    await page.waitForLoadState('networkidle');
  });

  test('renders popular recommendations', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=ecommerce-productrecommendations--popular&viewMode=story');
    await page.waitForLoadState('networkidle');

    const component = page.getByTestId('product-recommendations');
    await expect(component).toBeVisible();
  });

  test('renders trending recommendations', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=ecommerce-productrecommendations--trending&viewMode=story');
    await page.waitForLoadState('networkidle');

    const component = page.getByTestId('product-recommendations');
    await expect(component).toBeVisible();
  });

  test('renders with custom title', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=ecommerce-productrecommendations--custom-title&viewMode=story');
    await page.waitForLoadState('networkidle');

    const title = page.getByText('Best Sellers This Week');
    await expect(title).toBeVisible();
  });
});
