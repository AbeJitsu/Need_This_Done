import { http, HttpResponse } from 'msw';

// ============================================================================
// Mock Service Worker Handlers
// ============================================================================
// These handlers mock API responses for component testing.
// Add handlers as needed for components that make API calls.

export const handlers = [
  // Mock coupon validation API
  http.get('/api/coupons', () => {
    return HttpResponse.json({
      valid: true,
      discount_type: 'percentage',
      discount_value: 10,
      message: '10% discount applied',
    });
  }),

  // Mock enrollment API
  http.post('/api/enrollments', () => {
    return HttpResponse.json({
      success: true,
      enrollment_id: 'test-enrollment-123',
    });
  }),
];
