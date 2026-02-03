/**
 * Payment Attempt History Tracking
 *
 * Logs all payment attempts (success/failure) for audit trail and debugging.
 * Helps admins understand why final payments fail and when to retry.
 */

import { getSupabaseAdmin } from './supabase';
import { withSupabaseRetry } from './supabase-retry';

// ============================================================================
// Type Definitions
// ============================================================================

export interface PaymentAttempt {
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

export interface CreatePaymentAttemptData {
  order_id: string;
  payment_method: 'card' | 'cash' | 'check' | 'other';
  stripe_payment_method_id?: string | null;
  amount_cents?: number;
  status?: 'processing' | 'succeeded' | 'failed';
  decline_code?: string | null;
  error_message?: string | null;
  payment_intent_id?: string | null;
  collected_by_admin_id?: string | null;
  idempotency_key?: string | null;
  attempted_at?: string;
}

export interface UpdatePaymentAttemptData {
  status?: 'processing' | 'succeeded' | 'failed';
  decline_code?: string | null;
  error_message?: string | null;
  payment_intent_id?: string | null;
  succeeded_at?: string | null;
  failed_at?: string | null;
}

// ============================================================================
// Create Payment Attempt
// ============================================================================

/**
 * Log a new payment attempt in the audit trail
 *
 * Handles idempotency: if an idempotency_key is provided and already exists,
 * returns the existing record instead of creating a duplicate.
 *
 * @param data - Payment attempt details
 * @returns Created or existing payment attempt record
 */
export async function createPaymentAttempt(
  data: CreatePaymentAttemptData
): Promise<PaymentAttempt> {
  const supabase = getSupabaseAdmin();

  // If idempotency_key is provided, check if already exists
  if (data.idempotency_key) {
    const existing = await withSupabaseRetry(
      async () =>
        supabase
          .from('payment_attempts')
          .select('*')
          .eq('idempotency_key', data.idempotency_key)
          .single(),
      { operation: 'Check for existing payment attempt by idempotency key' }
    );

    if (existing && existing.data) {
      // Return existing attempt instead of creating duplicate
      return existing.data as PaymentAttempt;
    }
  }

  // Create new attempt
  const attempt = await withSupabaseRetry(
    async () =>
      supabase
        .from('payment_attempts')
        .insert([
          {
            order_id: data.order_id,
            payment_method: data.payment_method,
            stripe_payment_method_id: data.stripe_payment_method_id || null,
            amount_cents: data.amount_cents || 0,
            status: data.status || 'processing',
            decline_code: data.decline_code || null,
            error_message: data.error_message || null,
            payment_intent_id: data.payment_intent_id || null,
            collected_by_admin_id: data.collected_by_admin_id || null,
            idempotency_key: data.idempotency_key || null,
            attempted_at: data.attempted_at || new Date().toISOString(),
          },
        ])
        .select()
        .single(),
    { operation: 'Create payment attempt' }
  );

  if (!attempt || !attempt.data) {
    console.error('[Payment Attempts] Failed to create attempt');
    throw new Error('Failed to create payment attempt');
  }

  return attempt.data as PaymentAttempt;
}

// ============================================================================
// Update Payment Attempt
// ============================================================================

/**
 * Update an existing payment attempt with outcome
 *
 * Used when initial attempt was 'processing' and now we know the result.
 * Sets succeeded_at or failed_at timestamp based on status.
 *
 * @param orderId - Order ID to update the last attempt for
 * @param updates - Status and outcome data
 * @returns Updated payment attempt record
 */
export async function updatePaymentAttempt(
  orderId: string,
  updates: UpdatePaymentAttemptData
): Promise<PaymentAttempt> {
  const supabase = getSupabaseAdmin();

  // Find the most recent 'processing' attempt for this order
  const result = await withSupabaseRetry(
    async () =>
      supabase
        .from('payment_attempts')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
    { operation: 'Fetch last payment attempt' }
  );

  if (!result || !result.data) {
    console.error('[Payment Attempts] No payment attempt found for order:', orderId);
    throw new Error(`No payment attempt found for order ${orderId}`);
  }

  const lastAttempt = result.data;

  // Update the attempt
  const updated = await withSupabaseRetry(
    async () =>
      supabase
        .from('payment_attempts')
        .update({
          status: updates.status || lastAttempt.status,
          decline_code: updates.decline_code !== undefined ? updates.decline_code : lastAttempt.decline_code,
          error_message: updates.error_message !== undefined ? updates.error_message : lastAttempt.error_message,
          payment_intent_id: updates.payment_intent_id || lastAttempt.payment_intent_id,
          succeeded_at: updates.succeeded_at || null,
          failed_at: updates.failed_at || null,
        })
        .eq('id', lastAttempt.id)
        .select()
        .single(),
    { operation: 'Update payment attempt with outcome' }
  );

  if (!updated || !updated.data) {
    console.error('[Payment Attempts] Failed to update attempt');
    throw new Error('Failed to update payment attempt');
  }

  return updated.data as PaymentAttempt;
}

// ============================================================================
// Retrieve Payment Attempts
// ============================================================================

/**
 * Get all payment attempts for an order, sorted chronologically
 *
 * Used by admin dashboard to show payment history and why payments failed.
 *
 * @param orderId - Order ID to fetch attempts for
 * @returns Array of payment attempts, oldest first
 */
export async function getPaymentAttempts(orderId: string): Promise<PaymentAttempt[]> {
  const supabase = getSupabaseAdmin();

  const result = await withSupabaseRetry(
    async () =>
      supabase
        .from('payment_attempts')
        .select('*')
        .eq('order_id', orderId)
        .order('attempted_at', { ascending: true }),
    { operation: 'Fetch payment attempts for order' }
  );

  if (!result || !result.data) {
    console.error('[Payment Attempts] Failed to fetch attempts for order:', orderId);
    return [];
  }

  return (result.data || []) as PaymentAttempt[];
}

// ============================================================================
// Payment Statistics
// ============================================================================

/**
 * Get statistics on payment attempts for an order
 *
 * Useful for admin dashboard to show attempt count, success rate, etc.
 *
 * @param orderId - Order ID to analyze
 * @returns Statistics object with counts and status breakdown
 */
export async function getPaymentAttemptStats(
  orderId: string
): Promise<{
  total: number;
  succeeded: number;
  failed: number;
  processing: number;
  lastAttempt?: PaymentAttempt;
}> {
  const attempts = await getPaymentAttempts(orderId);

  const stats = {
    total: attempts.length,
    succeeded: attempts.filter(a => a.status === 'succeeded').length,
    failed: attempts.filter(a => a.status === 'failed').length,
    processing: attempts.filter(a => a.status === 'processing').length,
    lastAttempt: attempts.length > 0 ? attempts[attempts.length - 1] : undefined,
  };

  return stats;
}

// ============================================================================
// Idempotency Check
// ============================================================================

/**
 * Check if a request was already processed using idempotency key
 *
 * Prevents double-charging if the same payment request is submitted twice.
 * Useful for form resubmissions or retries.
 *
 * @param idempotencyKey - Unique request identifier
 * @returns Existing attempt if found, null otherwise
 */
export async function checkIdempotency(idempotencyKey: string): Promise<PaymentAttempt | null> {
  const supabase = getSupabaseAdmin();

  const result = await withSupabaseRetry(
    async () =>
      supabase
        .from('payment_attempts')
        .select('*')
        .eq('idempotency_key', idempotencyKey)
        .single(),
    { operation: 'Check idempotency key' }
  );

  if (!result || !result.data) {
    return null;
  }

  return result.data as PaymentAttempt;
}
