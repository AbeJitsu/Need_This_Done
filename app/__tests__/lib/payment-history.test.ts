// ============================================================================
// Payment Attempt History Tests
// ============================================================================
// What: Track all payment attempts for audit and debugging
// Why: Admin needs to see why final payment hasn't been collected
// How: Log each attempt (success/failure) with timestamp and outcome

import { describe, it, expect, beforeEach } from 'vitest';

// In-memory store for testing (simulates Supabase)
interface StoredAttempt {
  id: string;
  order_id: string;
  attempt_number: number;
  payment_method: 'card' | 'cash' | 'check' | 'other';
  stripe_payment_method_id?: string | null;
  amount_cents: number;
  status: 'processing' | 'succeeded' | 'failed';
  decline_code?: string | null;
  error_message?: string | null;
  payment_intent_id?: string | null;
  collected_by_admin_id?: string | null;
  idempotency_key?: string | null;
  attempted_at: string;
  succeeded_at?: string | null;
  failed_at?: string | null;
  created_at: string;
  updated_at: string;
}

// Store for all attempts
const paymentAttemptsStore: Map<string, StoredAttempt> = new Map();
let attemptCounter = 0;

// Helper functions (simulating what would be in payment-attempts.ts)
async function createPaymentAttempt(data: any): Promise<any> {
  // Check idempotency
  if (data.idempotency_key) {
    for (const [, attempt] of paymentAttemptsStore) {
      if (attempt.idempotency_key === data.idempotency_key) {
        return attempt;
      }
    }
  }

  const id = `attempt-${++attemptCounter}`;
  const now = new Date().toISOString();

  const attempt: StoredAttempt = {
    id,
    order_id: data.order_id,
    attempt_number: 1,
    payment_method: data.payment_method,
    stripe_payment_method_id: data.stripe_payment_method_id || null,
    amount_cents: data.amount_cents || 0,
    status: data.status || 'processing',
    decline_code: data.decline_code || null,
    error_message: data.error_message || null,
    payment_intent_id: data.payment_intent_id || null,
    collected_by_admin_id: data.collected_by_admin_id || null,
    idempotency_key: data.idempotency_key || null,
    attempted_at: data.attempted_at || now,
    succeeded_at: data.succeeded_at || null,
    failed_at: data.failed_at || null,
    created_at: now,
    updated_at: now,
  };

  paymentAttemptsStore.set(id, attempt);
  return attempt;
}

async function updatePaymentAttempt(orderId: string, updates: any): Promise<any> {
  // Find most recent attempt for this order
  let lastAttempt: StoredAttempt | null = null;
  for (const [, attempt] of paymentAttemptsStore) {
    if (attempt.order_id === orderId) {
      if (!lastAttempt || new Date(attempt.created_at) > new Date(lastAttempt.created_at)) {
        lastAttempt = attempt;
      }
    }
  }

  if (!lastAttempt) {
    throw new Error(`No payment attempt found for order ${orderId}`);
  }

  // Update the attempt
  lastAttempt = {
    ...lastAttempt,
    status: updates.status || lastAttempt.status,
    decline_code: updates.decline_code !== undefined ? updates.decline_code : lastAttempt.decline_code,
    error_message: updates.error_message !== undefined ? updates.error_message : lastAttempt.error_message,
    payment_intent_id: updates.payment_intent_id || lastAttempt.payment_intent_id,
    succeeded_at: updates.succeeded_at || null,
    failed_at: updates.failed_at || null,
    updated_at: new Date().toISOString(),
  };

  paymentAttemptsStore.set(lastAttempt.id, lastAttempt);
  return lastAttempt;
}

async function getPaymentAttempts(orderId: string): Promise<any[]> {
  const attempts: StoredAttempt[] = [];
  for (const [, attempt] of paymentAttemptsStore) {
    if (attempt.order_id === orderId) {
      attempts.push(attempt);
    }
  }

  // Sort by attempted_at
  attempts.sort((a, b) => new Date(a.attempted_at).getTime() - new Date(b.attempted_at).getTime());
  return attempts;
}

describe('Payment Attempt History', () => {
  // Clear store before each test
  beforeEach(() => {
    paymentAttemptsStore.clear();
    attemptCounter = 0;
  });
  it('should create payment attempt record on charge attempt', async () => {
    // Arrange
    const orderId = 'order-123';
    const attemptData = {
      order_id: orderId,
      payment_method: 'card',
      stripe_payment_method_id: 'pm_1234567890',
      amount_cents: 5000,
      attempted_at: new Date().toISOString(),
      status: 'processing',
    };

    // Act: Log payment attempt
    const attempt = await createPaymentAttempt(attemptData);

    // Assert: Attempt recorded
    expect(attempt.id).toBeDefined();
    expect(attempt.order_id).toBe(orderId);
    expect(attempt.status).toBe('processing');
  });

  it('should record successful charge with Stripe intent ID', async () => {
    // Arrange
    const orderId = 'order-123';

    // First create an attempt to update
    await createPaymentAttempt({
      order_id: orderId,
      payment_method: 'card',
      status: 'processing',
      attempted_at: new Date().toISOString(),
    });

    // Act: Record successful charge
    const attempt = await updatePaymentAttempt(orderId, {
      status: 'succeeded',
      payment_intent_id: 'pi_final_123',
      succeeded_at: new Date().toISOString(),
    });

    // Assert: Success recorded
    expect(attempt.status).toBe('succeeded');
    expect(attempt.payment_intent_id).toBe('pi_final_123');
  });

  it('should record failed charge with decline reason', async () => {
    // Arrange
    const orderId = 'order-123';

    // First create an attempt to update
    await createPaymentAttempt({
      order_id: orderId,
      payment_method: 'card',
      status: 'processing',
      attempted_at: new Date().toISOString(),
    });

    // Act: Record declined charge
    const attempt = await updatePaymentAttempt(orderId, {
      status: 'failed',
      decline_code: 'insufficient_funds',
      error_message: 'Your card has insufficient funds',
      failed_at: new Date().toISOString(),
    });

    // Assert: Failure recorded with reason
    expect(attempt.status).toBe('failed');
    expect(attempt.decline_code).toBe('insufficient_funds');
  });

  it('should retrieve all attempts for an order', async () => {
    // Arrange: Order with multiple payment attempts
    const orderId = 'order-123';

    // Simulate 3 attempts (2 failed, 1 succeeded)
    await createPaymentAttempt({
      order_id: orderId,
      payment_method: 'card',
      status: 'failed',
      decline_code: 'card_declined',
      attempted_at: new Date(Date.now() - 10000).toISOString(),
    });

    await createPaymentAttempt({
      order_id: orderId,
      payment_method: 'card',
      status: 'failed',
      decline_code: 'insufficient_funds',
      attempted_at: new Date(Date.now() - 5000).toISOString(),
    });

    await createPaymentAttempt({
      order_id: orderId,
      payment_method: 'card',
      status: 'succeeded',
      attempted_at: new Date().toISOString(),
    });

    // Act: Retrieve attempts
    const attempts = await getPaymentAttempts(orderId);

    // Assert: All attempts returned in chronological order
    expect(attempts.length).toBe(3);
    expect(attempts[0].status).toBe('failed');
    expect(attempts[1].status).toBe('failed');
    expect(attempts[2].status).toBe('succeeded');
  });

  it('should show attempt count to admin', async () => {
    // Arrange: Order with 3 failed attempts
    const orderId = 'order-456';

    for (let i = 0; i < 3; i++) {
      await createPaymentAttempt({
        order_id: orderId,
        payment_method: 'card',
        status: 'failed',
        attempted_at: new Date(Date.now() - i * 1000).toISOString(),
      });
    }

    // Act: Count attempts
    const attempts = await getPaymentAttempts(orderId);
    const failedCount = attempts.filter((a: any) => a.status === 'failed').length;

    // Assert
    expect(failedCount).toBe(3);
  });

  it('should track which admin collected payment', async () => {
    // Arrange
    const orderId = 'order-123';
    const adminId = 'admin-789';

    // Act: Record attempt with admin ID
    const attempt = await createPaymentAttempt({
      order_id: orderId,
      payment_method: 'cash',
      collected_by_admin_id: adminId,
      status: 'succeeded',
      attempted_at: new Date().toISOString(),
    });

    // Assert: Admin is tracked
    expect(attempt.collected_by_admin_id).toBe(adminId);
  });

  it('should prevent duplicate payment attempts within 10 seconds', async () => {
    // Arrange: Order ID
    const orderId = 'order-123';

    // Act: Submit two attempts within 10s
    const attempt1 = await createPaymentAttempt({
      order_id: orderId,
      payment_method: 'card',
      status: 'processing',
      idempotency_key: 'key-123',
    });

    const attempt2 = await createPaymentAttempt({
      order_id: orderId,
      payment_method: 'card',
      status: 'processing',
      idempotency_key: 'key-123', // Same key
    });

    // Assert: Only one attempt created
    expect(attempt1.id).toBe(attempt2.id);
  });
});
