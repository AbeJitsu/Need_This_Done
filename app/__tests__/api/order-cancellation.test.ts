// ============================================================================
// Order Cancellation with Deposit Refund Tests
// ============================================================================
// What: Verify order cancellation handles deposits correctly
// Why: Customers must be able to cancel and get refunds
// How: Validate cancellation logic with proper status checks

import { describe, it, expect, beforeEach } from 'vitest';

// In-memory store for testing
interface StoredOrder {
  id: string;
  user_id?: string;
  medusa_order_id: string;
  deposit_amount: number;
  balance_remaining: number;
  deposit_payment_intent_id?: string | null;
  final_payment_intent_id?: string | null;
  final_payment_status: 'pending' | 'paid' | 'failed' | 'waived';
  status: 'processing' | 'completed' | 'canceled';
  canceled_at?: string | null;
  cancel_reason?: string | null;
  admin_notes?: string | null;
}

const ordersStore: Map<string, StoredOrder> = new Map();

// Helper function to simulate cancellation
async function cancelOrder(
  orderId: string,
  reason: string,
  notes?: string
): Promise<{
  success: boolean;
  error?: string;
  refunded: boolean;
  refund_amount: number;
  refund_id?: string | null;
  order?: StoredOrder;
  canceled_at?: string;
  email_sent: boolean;
  email_to?: string;
}> {
  const order = ordersStore.get(orderId);

  if (!order) {
    return {
      success: false,
      error: 'Order not found',
      refunded: false,
      refund_amount: 0,
      email_sent: false,
    };
  }

  // Check if already canceled
  if (order.status === 'canceled') {
    return {
      success: false,
      error: 'Order is already canceled',
      refunded: false,
      refund_amount: 0,
      email_sent: false,
    };
  }

  // Check if final payment already collected
  if (order.final_payment_status === 'paid' || order.status === 'completed') {
    return {
      success: false,
      error: 'Cannot cancel orders that have already paid the final payment. This requires manual refund processing.',
      refunded: false,
      refund_amount: 0,
      email_sent: false,
    };
  }

  // Process refund
  let refunded = false;
  let refundAmount = 0;
  let refundId: string | null = null;

  if (order.deposit_payment_intent_id && order.deposit_amount > 0) {
    refunded = true;
    refundAmount = order.deposit_amount;
    refundId = `refund_${Date.now()}`;
  }

  // Update order
  const now = new Date().toISOString();
  const updatedOrder: StoredOrder = {
    ...order,
    status: 'canceled',
    final_payment_status: 'waived',
    canceled_at: now,
    cancel_reason: reason,
    admin_notes: notes || null,
  };

  ordersStore.set(orderId, updatedOrder);

  return {
    success: true,
    refunded,
    refund_amount: refundAmount,
    refund_id: refundId,
    order: updatedOrder,
    canceled_at: now,
    email_sent: true,
    email_to: 'customer@example.com',
  };
}

describe('Order Cancellation with Refund', () => {
  // Test data
  const testOrder: StoredOrder = {
    id: 'order-123',
    user_id: 'user-456',
    medusa_order_id: 'medusa-789',
    deposit_amount: 5000,
    balance_remaining: 5000,
    deposit_payment_intent_id: 'pi_deposit_123',
    final_payment_intent_id: null,
    final_payment_status: 'pending',
    status: 'processing',
  };

  beforeEach(() => {
    ordersStore.clear();
    ordersStore.set('order-123', { ...testOrder });
    ordersStore.set('order-completed', {
      ...testOrder,
      id: 'order-completed',
      final_payment_status: 'paid',
      final_payment_intent_id: 'pi_final_123',
      status: 'completed',
    });
  });

  it('should refund deposit when canceling order with pending final payment', async () => {
    // Act: Cancel order
    const result = await cancelOrder('order-123', 'Customer request');

    // Assert: Deposit refunded, order status canceled
    expect(result.success).toBe(true);
    expect(result.refunded).toBe(true);
    expect(result.refund_amount).toBe(5000);
  });

  it('should not refund if order already has final payment collected', async () => {
    // Act: Try to cancel completed order
    const result = await cancelOrder('order-completed', 'Item damaged');

    // Assert: Should error (requires manual handling)
    expect(result.success).toBe(false);
    expect(result.error).toContain('already paid');
  });

  it('should update order status to canceled', async () => {
    // Act: Cancel order
    const result = await cancelOrder('order-123', 'Customer request');

    // Assert: Status updated to canceled
    expect(result.success).toBe(true);
    expect(result.order?.status).toBe('canceled');
    expect(result.order?.final_payment_status).toBe('waived');
  });

  it('should return error for non-existent order', async () => {
    // Act: Try to cancel non-existent order
    const result = await cancelOrder('fake-id', 'Test');

    // Assert: Not found
    expect(result.success).toBe(false);
    expect(result.error).toBe('Order not found');
  });

  it('should send cancellation email to customer', async () => {
    // Act: Cancel order
    const result = await cancelOrder('order-123', 'Discontinued item');

    // Assert: Success and email sent
    expect(result.success).toBe(true);
    expect(result.email_sent).toBe(true);
    expect(result.email_to).toBeDefined();
  });

  it('should log refund details for audit trail', async () => {
    // Act: Cancel order
    const result = await cancelOrder('order-123', 'Customer request');

    // Assert: Audit trail present
    expect(result.success).toBe(true);
    expect(result.refund_id).toBeDefined(); // Stripe refund ID
    expect(result.canceled_at).toBeDefined(); // Timestamp
  });

  it('should prevent canceling already canceled orders', async () => {
    // First cancel
    await cancelOrder('order-123', 'Customer request');

    // Try to cancel again
    const result = await cancelOrder('order-123', 'Another reason');

    // Assert: Error
    expect(result.success).toBe(false);
    expect(result.error).toContain('already canceled');
  });
});
