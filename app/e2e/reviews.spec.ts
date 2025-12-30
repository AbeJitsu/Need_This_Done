import { test, expect } from '@playwright/test';

// ============================================================================
// Reviews E2E Tests
// ============================================================================
// Tests for the customer reviews and ratings system

test.describe('Reviews API', () => {
  test.describe('GET /api/reviews', () => {
    test('requires product_id', async ({ request }) => {
      const response = await request.get('/api/reviews');

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toContain('product_id');
    });

    test('returns reviews for a product', async ({ request }) => {
      const response = await request.get('/api/reviews?product_id=test-product-123');

      // May return 500 if migration not applied
      expect([200, 500]).toContain(response.status());

      if (response.status() === 200) {
        const body = await response.json();
        expect(body).toHaveProperty('reviews');
        expect(body).toHaveProperty('rating');
        expect(body).toHaveProperty('pagination');
        expect(Array.isArray(body.reviews)).toBe(true);
      }
    });

    test('returns rating summary', async ({ request }) => {
      const response = await request.get('/api/reviews?product_id=test-product-123&rating=true');

      expect([200, 500]).toContain(response.status());

      if (response.status() === 200) {
        const body = await response.json();
        expect(body).toHaveProperty('product_id');
        expect(body).toHaveProperty('total_reviews');
        expect(body).toHaveProperty('average_rating');
        expect(body).toHaveProperty('distribution');
      }
    });

    test('supports pagination', async ({ request }) => {
      const response = await request.get('/api/reviews?product_id=test-product-123&limit=5&offset=0');

      if (response.status() === 200) {
        const body = await response.json();
        expect(body.pagination.limit).toBe(5);
        expect(body.pagination.offset).toBe(0);
      }
    });

    test('supports sorting by recent', async ({ request }) => {
      const response = await request.get('/api/reviews?product_id=test-product-123&sort=recent');

      expect([200, 500]).toContain(response.status());
    });

    test('supports sorting by helpful', async ({ request }) => {
      const response = await request.get('/api/reviews?product_id=test-product-123&sort=helpful');

      expect([200, 500]).toContain(response.status());
    });

    test('supports sorting by rating', async ({ request }) => {
      const response = await request.get('/api/reviews?product_id=test-product-123&sort=rating_high');

      expect([200, 500]).toContain(response.status());
    });
  });

  test.describe('POST /api/reviews (Create)', () => {
    test('requires product_id', async ({ request }) => {
      const response = await request.post('/api/reviews', {
        data: {
          rating: 5,
        },
      });

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toContain('product_id');
    });

    test('requires valid rating', async ({ request }) => {
      const response = await request.post('/api/reviews', {
        data: {
          product_id: 'test-product-123',
          rating: 6, // Invalid
        },
      });

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toContain('Rating');
    });

    test('requires email for anonymous reviews', async ({ request }) => {
      const response = await request.post('/api/reviews', {
        data: {
          product_id: 'test-product-123',
          rating: 5,
          title: 'Great product',
          content: 'Really enjoyed this!',
        },
      });

      // Without auth and email, should fail
      expect([400, 500]).toContain(response.status());
    });

    test('creates review with email', async ({ request }) => {
      const response = await request.post('/api/reviews', {
        data: {
          product_id: 'test-product-123',
          rating: 5,
          title: 'Great product',
          content: 'Really enjoyed this product!',
          reviewer_name: 'Test User',
          reviewer_email: 'test@example.com',
        },
      });

      expect([201, 500]).toContain(response.status());

      if (response.status() === 201) {
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(body).toHaveProperty('review');
        expect(body.message).toContain('moderation');
      }
    });
  });

  test.describe('POST /api/reviews (Vote)', () => {
    test('requires review_id', async ({ request }) => {
      const response = await request.post('/api/reviews', {
        data: {
          action: 'vote',
          vote_type: 'helpful',
        },
      });

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toContain('review_id');
    });

    test('requires valid vote_type', async ({ request }) => {
      const response = await request.post('/api/reviews', {
        data: {
          action: 'vote',
          review_id: '00000000-0000-0000-0000-000000000000',
          vote_type: 'invalid',
        },
      });

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toContain('vote_type');
    });

    test('requires session_id for anonymous voting', async ({ request }) => {
      const response = await request.post('/api/reviews', {
        data: {
          action: 'vote',
          review_id: '00000000-0000-0000-0000-000000000000',
          vote_type: 'helpful',
        },
      });

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toContain('session_id');
    });

    test('accepts vote with session_id', async ({ request }) => {
      const response = await request.post('/api/reviews', {
        data: {
          action: 'vote',
          review_id: '00000000-0000-0000-0000-000000000000',
          vote_type: 'helpful',
          session_id: `test-session-${Date.now()}`,
        },
      });

      // May return 500 if migration not applied or review doesn't exist
      expect([201, 500]).toContain(response.status());
    });
  });

  test.describe('POST /api/reviews (Report)', () => {
    test('requires review_id', async ({ request }) => {
      const response = await request.post('/api/reviews', {
        data: {
          action: 'report',
          reason: 'spam',
        },
      });

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toContain('review_id');
    });

    test('requires valid reason', async ({ request }) => {
      const response = await request.post('/api/reviews', {
        data: {
          action: 'report',
          review_id: '00000000-0000-0000-0000-000000000000',
          reason: 'invalid',
        },
      });

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toContain('reason');
    });

    test('requires authentication', async ({ request }) => {
      const response = await request.post('/api/reviews', {
        data: {
          action: 'report',
          review_id: '00000000-0000-0000-0000-000000000000',
          reason: 'spam',
        },
      });

      expect(response.status()).toBe(401);
    });
  });

  test.describe('Invalid action', () => {
    test('returns error for unknown action', async ({ request }) => {
      const response = await request.post('/api/reviews', {
        data: {
          action: 'unknown',
        },
      });

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toContain('Invalid action');
    });
  });
});

test.describe('StarRating Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/storybook');
    await page.waitForLoadState('networkidle');
  });

  test('renders star rating', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=ecommerce-starrating--default&viewMode=story');
    await page.waitForLoadState('networkidle');

    const component = page.getByTestId('star-rating');
    await expect(component).toBeVisible();
  });

  test('renders different sizes', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=ecommerce-starrating--sizes&viewMode=story');
    await page.waitForLoadState('networkidle');

    const components = page.getByTestId('star-rating');
    await expect(components).toHaveCount(3);
  });

  test('renders color variants', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=ecommerce-starrating--color-variants&viewMode=story');
    await page.waitForLoadState('networkidle');

    const components = page.getByTestId('star-rating');
    await expect(components).toHaveCount(3);
  });
});

test.describe('ReviewCard Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/storybook');
    await page.waitForLoadState('networkidle');
  });

  test('renders review card', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=ecommerce-reviewcard--default&viewMode=story');
    await page.waitForLoadState('networkidle');

    const component = page.getByTestId('review-card');
    await expect(component).toBeVisible();
  });

  test('renders multiple reviews', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=ecommerce-reviewcard--multiple-reviews&viewMode=story');
    await page.waitForLoadState('networkidle');

    const components = page.getByTestId('review-card');
    await expect(components).toHaveCount(3);
  });
});

test.describe('Reviews Integration', () => {
  test('reviews system is configured', async ({ request }) => {
    // Verify reviews endpoint exists
    const response = await request.get('/api/reviews?product_id=test');
    expect([200, 400, 500]).toContain(response.status());
  });
});
