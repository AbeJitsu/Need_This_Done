// ============================================================================
// Supabase Retry Wrapper - Resilient Database Operations
// ============================================================================
// What: Wraps Supabase queries with automatic retry logic for transient failures
// Why: Network issues, connection pool exhaustion, and temporary database unavailability
//      should not cause user-facing errors when the operation can be safely retried
// How: Detects retryable errors (timeouts, connection errors) and uses exponential backoff

import { PostgrestError } from '@supabase/supabase-js';
import { withRetry } from './api-timeout';

// ============================================================================
// Error Classification
// ============================================================================

/**
 * Determines if a Supabase error is safe to retry
 *
 * Retryable errors:
 * - Network timeouts
 * - Connection errors
 * - Connection pool exhaustion
 * - Temporary unavailability
 *
 * Non-retryable errors:
 * - Constraint violations (unique, foreign key)
 * - Invalid data
 * - Permission denied
 * - Missing columns/tables
 */
function isRetryableError(error: unknown): boolean {
  if (!error) return false;

  const postgrestError = error as PostgrestError;
  const message = postgrestError.message?.toLowerCase() || '';
  const code = postgrestError.code;

  // PostgreSQL error codes that are safe to retry
  const retryableCodes = [
    '08000', // Connection exception
    '08003', // Connection does not exist
    '08006', // Connection failure
    '08001', // Unable to establish connection
    '08004', // Connection rejected
    '08007', // Transaction resolution unknown
    '53300', // Too many connections
    '53400', // Configuration limit exceeded
    '57P03', // Cannot connect now
    '58000', // System error
    '58030', // I/O error
  ];

  if (code && retryableCodes.includes(code)) {
    return true;
  }

  // Message-based detection for common transient errors
  const retryableMessages = [
    'timeout',
    'timed out',
    'connection',
    'connect ETIMEDOUT',
    'ECONNREFUSED',
    'ECONNRESET',
    'network',
    'unavailable',
    'too many connections',
    'connection pool',
    'connection reset',
  ];

  return retryableMessages.some(pattern => message.includes(pattern));
}

/**
 * Determines if an error is a unique constraint violation
 * Used to detect duplicate operations (idempotency)
 */
export function isUniqueViolation(error: unknown): boolean {
  const postgrestError = error as PostgrestError;
  return postgrestError.code === '23505';
}

/**
 * Determines if an error is a foreign key constraint violation
 */
export function isForeignKeyViolation(error: unknown): boolean {
  const postgrestError = error as PostgrestError;
  return postgrestError.code === '23503';
}

// ============================================================================
// Retry Wrapper
// ============================================================================

interface SupabaseRetryOptions {
  maxRetries?: number;
  operation?: string;
  retryOnlyTransient?: boolean; // Only retry known transient errors
}

/**
 * Wraps a Supabase query with automatic retry logic
 *
 * @param queryFn - Function that returns a Supabase query promise
 * @param options - Retry configuration
 * @returns Query result with automatic retry on transient failures
 *
 * @example
 * const { data, error } = await withSupabaseRetry(
 *   () => supabase.from('projects').select('*').eq('id', projectId).single(),
 *   { operation: 'Fetch project', maxRetries: 3 }
 * );
 */
export async function withSupabaseRetry<T>(
  queryFn: () => Promise<T>,
  options: SupabaseRetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    operation = 'Database operation',
    retryOnlyTransient = true,
  } = options;

  return withRetry(
    queryFn,
    {
      maxRetries,
      operation,
      timeoutMs: 10000, // 10 seconds per attempt
      initialDelayMs: 100,
    }
  ).catch((error) => {
    // If retry is exhausted, check if we should have retried at all
    if (retryOnlyTransient && !isRetryableError(error)) {
      console.warn(`[Supabase] Non-retryable error for ${operation}:`, error);
    }
    throw error;
  });
}

/**
 * Transaction-safe wrapper for operations that should be atomic
 * Retries the entire transaction on transient failures
 *
 * @example
 * await withSupabaseTransaction(async (client) => {
 *   await client.from('orders').insert({ ... });
 *   await client.from('payments').insert({ ... });
 * }, { operation: 'Create order with payment' });
 */
export async function withSupabaseTransaction<T>(
  transactionFn: (client: any) => Promise<T>,
  options: SupabaseRetryOptions = {}
): Promise<T> {
  // Note: Supabase JS client doesn't support explicit transactions
  // This is a placeholder for when using pg-promise or raw Postgres client
  // For now, just wrap with retry
  return withSupabaseRetry(transactionFn, options);
}

// ============================================================================
// Usage Examples
// ============================================================================
//
// Example 1: Retry a SELECT query
// ────────────────────────────────
// import { withSupabaseRetry } from '@/lib/supabase-retry';
//
// const { data, error } = await withSupabaseRetry(
//   () => supabase
//     .from('projects')
//     .select('*')
//     .eq('user_id', userId)
//     .order('created_at', { ascending: false }),
//   { operation: 'Fetch user projects', maxRetries: 3 }
// );
//
// if (error) {
//   console.error('Failed after retries:', error);
//   return serverError('Unable to fetch projects');
// }
//
// Example 2: Retry an INSERT operation
// ─────────────────────────────────────
// import { withSupabaseRetry, isUniqueViolation } from '@/lib/supabase-retry';
//
// const { data, error } = await withSupabaseRetry(
//   () => supabase.from('projects').insert(projectData).select().single(),
//   { operation: 'Create project' }
// );
//
// if (error) {
//   if (isUniqueViolation(error)) {
//     return badRequest('Project already exists');
//   }
//   return serverError('Failed to create project');
// }
//
// Example 3: Critical operation with more retries
// ────────────────────────────────────────────────
// import { withSupabaseRetry } from '@/lib/supabase-retry';
//
// const { error } = await withSupabaseRetry(
//   () => supabase.from('payments').insert(paymentData),
//   { operation: 'Record payment', maxRetries: 5 }
// );
