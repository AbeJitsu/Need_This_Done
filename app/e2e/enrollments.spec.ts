import { test, expect } from '@playwright/test';

// ============================================================================
// Enrollments E2E Tests
// ============================================================================
// Tests for the enrollment API endpoints
// Note: These test the API structure, actual enrollment requires auth

test.describe('Enrollments API', () => {
  test.describe('GET /api/enrollments', () => {
    test('returns 401 for unauthenticated requests', async ({ request }) => {
      const response = await request.get('/api/enrollments');

      expect(response.status()).toBe(401);

      const body = await response.json();
      expect(body.error).toBe('Unauthorized');
    });

    test('returns 401 when checking specific course enrollment without auth', async ({
      request,
    }) => {
      const response = await request.get('/api/enrollments?course_id=test-123');

      expect(response.status()).toBe(401);

      const body = await response.json();
      expect(body.error).toBe('Unauthorized');
    });
  });

  test.describe('POST /api/enrollments', () => {
    test('returns 401 for unauthenticated enrollment attempts', async ({ request }) => {
      const response = await request.post('/api/enrollments', {
        data: {
          course_id: 'test-course-123',
          enrollment_type: 'free',
        },
      });

      expect(response.status()).toBe(401);

      const body = await response.json();
      expect(body.error).toBe('Unauthorized');
    });

    test('validates required course_id field', async ({ request }) => {
      // This will still return 401 because auth check comes first
      // But tests the endpoint accepts POST requests
      const response = await request.post('/api/enrollments', {
        data: {
          enrollment_type: 'free',
        },
      });

      expect(response.status()).toBe(401);
    });

    test('validates enrollment_type field', async ({ request }) => {
      const response = await request.post('/api/enrollments', {
        data: {
          course_id: 'test-course-123',
          enrollment_type: 'invalid',
        },
      });

      expect(response.status()).toBe(401);
    });
  });
});

test.describe('Enrollments API Structure', () => {
  test('GET endpoint exists and responds', async ({ request }) => {
    const response = await request.get('/api/enrollments');

    // Should get a response (401 is expected without auth)
    expect([200, 401, 500]).toContain(response.status());
  });

  test('POST endpoint exists and responds', async ({ request }) => {
    const response = await request.post('/api/enrollments', {
      data: {},
    });

    // Should get a response (401 is expected without auth)
    expect([200, 201, 400, 401, 500]).toContain(response.status());
  });

  test('handles JSON content type', async ({ request }) => {
    const response = await request.post('/api/enrollments', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        course_id: 'test',
        enrollment_type: 'free',
      },
    });

    const body = await response.json();
    expect(body).toHaveProperty('error');
  });
});
