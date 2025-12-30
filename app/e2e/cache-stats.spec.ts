import { test, expect } from '@playwright/test';

test.describe('Admin Cache Stats', () => {
  test.describe('Cache Stats API', () => {
    test('GET /api/admin/cache-stats returns statistics', async ({ request }) => {
      const response = await request.get('/api/admin/cache-stats');

      // Should return 200 or 401 (if not authenticated)
      expect([200, 401]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('total');
        expect(data).toHaveProperty('byPattern');
        expect(data).toHaveProperty('uptimeSeconds');
        expect(data.total).toHaveProperty('hits');
        expect(data.total).toHaveProperty('misses');
        expect(data.total).toHaveProperty('hitRate');
      }
    });

    test('POST /api/admin/cache-stats resets statistics', async ({ request }) => {
      const response = await request.post('/api/admin/cache-stats');

      // Should return 200 or 401 (if not authenticated)
      expect([200, 401]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        expect(data.message).toBe('Cache statistics reset');
      }
    });
  });
});
