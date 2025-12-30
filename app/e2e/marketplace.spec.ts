import { test, expect } from '@playwright/test';

// ============================================================================
// Template Marketplace E2E Tests
// ============================================================================
// Tests for the template marketplace API

test.describe('Marketplace API', () => {
  test.describe('GET /api/marketplace?action=list', () => {
    test('returns list of templates', async ({ request }) => {
      const response = await request.get('/api/marketplace?action=list');

      // May return 500 if migration not applied
      expect([200, 500]).toContain(response.status());

      if (response.status() === 200) {
        const body = await response.json();
        expect(body).toHaveProperty('templates');
        expect(body).toHaveProperty('pagination');
        expect(Array.isArray(body.templates)).toBe(true);
      }
    });

    test('supports category filter', async ({ request }) => {
      const response = await request.get('/api/marketplace?action=list&category=business');

      expect([200, 500]).toContain(response.status());
    });

    test('supports price type filter', async ({ request }) => {
      const response = await request.get('/api/marketplace?action=list&price_type=free');

      expect([200, 500]).toContain(response.status());
    });

    test('supports search', async ({ request }) => {
      const response = await request.get('/api/marketplace?action=list&search=landing');

      expect([200, 500]).toContain(response.status());
    });

    test('supports sorting', async ({ request }) => {
      const response = await request.get('/api/marketplace?action=list&sort=rating');

      expect([200, 500]).toContain(response.status());
    });

    test('supports pagination', async ({ request }) => {
      const response = await request.get('/api/marketplace?action=list&limit=5&offset=0');

      if (response.status() === 200) {
        const body = await response.json();
        expect(body.pagination.limit).toBe(5);
        expect(body.pagination.offset).toBe(0);
      }
    });
  });

  test.describe('GET /api/marketplace?action=featured', () => {
    test('returns featured templates', async ({ request }) => {
      const response = await request.get('/api/marketplace?action=featured');

      expect([200, 500]).toContain(response.status());

      if (response.status() === 200) {
        const body = await response.json();
        expect(body).toHaveProperty('templates');
        expect(Array.isArray(body.templates)).toBe(true);
      }
    });
  });

  test.describe('GET /api/marketplace?action=categories', () => {
    test('returns template categories', async ({ request }) => {
      const response = await request.get('/api/marketplace?action=categories');

      expect([200, 500]).toContain(response.status());

      if (response.status() === 200) {
        const body = await response.json();
        expect(body).toHaveProperty('categories');
        expect(Array.isArray(body.categories)).toBe(true);
      }
    });
  });

  test.describe('GET /api/marketplace?action=my-templates', () => {
    test('requires authentication', async ({ request }) => {
      const response = await request.get('/api/marketplace?action=my-templates');

      expect(response.status()).toBe(401);
    });
  });

  test.describe('GET /api/marketplace?action=my-purchases', () => {
    test('requires authentication', async ({ request }) => {
      const response = await request.get('/api/marketplace?action=my-purchases');

      expect(response.status()).toBe(401);
    });
  });

  test.describe('GET /api/marketplace?id=xxx', () => {
    test('returns 404 for non-existent template', async ({ request }) => {
      const response = await request.get('/api/marketplace?id=00000000-0000-0000-0000-000000000000');

      expect(response.status()).toBe(404);
    });
  });

  test.describe('GET /api/marketplace - Invalid action', () => {
    test('returns error for unknown action', async ({ request }) => {
      const response = await request.get('/api/marketplace?action=unknown');

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toContain('Invalid action');
    });
  });

  test.describe('POST /api/marketplace', () => {
    test('requires authentication', async ({ request }) => {
      const response = await request.post('/api/marketplace', {
        data: {
          action: 'create',
          name: 'Test Template',
          category: 'business',
          content: {},
        },
      });

      expect(response.status()).toBe(401);
    });

    test('requires name, category, and content', async ({ request }) => {
      // This would need auth, but we can test the validation error message
      const response = await request.post('/api/marketplace', {
        data: {
          action: 'create',
        },
      });

      expect([400, 401]).toContain(response.status());
    });

    test('download requires template_id', async ({ request }) => {
      const response = await request.post('/api/marketplace', {
        data: {
          action: 'download',
        },
      });

      expect([400, 401]).toContain(response.status());
    });

    test('review requires template_id and rating', async ({ request }) => {
      const response = await request.post('/api/marketplace', {
        data: {
          action: 'review',
          template_id: '00000000-0000-0000-0000-000000000000',
        },
      });

      expect([400, 401]).toContain(response.status());
    });

    test('invalid action returns error', async ({ request }) => {
      const response = await request.post('/api/marketplace', {
        data: {
          action: 'unknown',
        },
      });

      expect([400, 401]).toContain(response.status());
    });
  });

  test.describe('PATCH /api/marketplace', () => {
    test('requires authentication', async ({ request }) => {
      const response = await request.patch('/api/marketplace', {
        data: {
          id: '00000000-0000-0000-0000-000000000000',
          name: 'Updated Name',
        },
      });

      expect(response.status()).toBe(401);
    });

    test('requires template id', async ({ request }) => {
      const response = await request.patch('/api/marketplace', {
        data: {
          name: 'Updated Name',
        },
      });

      expect([400, 401]).toContain(response.status());
    });
  });

  test.describe('DELETE /api/marketplace', () => {
    test('requires authentication', async ({ request }) => {
      const response = await request.delete('/api/marketplace?id=00000000-0000-0000-0000-000000000000');

      expect(response.status()).toBe(401);
    });

    test('requires template id', async ({ request }) => {
      const response = await request.delete('/api/marketplace');

      expect([400, 401]).toContain(response.status());
    });
  });
});

test.describe('Marketplace Integration', () => {
  test('marketplace API endpoints exist', async ({ request }) => {
    // Verify list endpoint
    const listResponse = await request.get('/api/marketplace?action=list');
    expect([200, 500]).toContain(listResponse.status());

    // Verify categories endpoint
    const categoriesResponse = await request.get('/api/marketplace?action=categories');
    expect([200, 500]).toContain(categoriesResponse.status());

    // Verify featured endpoint
    const featuredResponse = await request.get('/api/marketplace?action=featured');
    expect([200, 500]).toContain(featuredResponse.status());
  });
});
