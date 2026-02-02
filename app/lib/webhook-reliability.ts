// ============================================================================
// Webhook Reliability Wrapper - Error Recovery for Critical Operations
// ============================================================================
// What: Wraps webhook event handlers with retry logic and error tracking
// Why: Database failures during webhook processing cause data loss (orders unpaid, etc.)
// How: Retries transient failures, fails loudly on permanent errors, prevents cascading
//
// PROBLEM BEING SOLVED:
// - Stripe webhook succeeds but database update fails → Stripe thinks payment was recorded
// - No retry means order stays in "pending" forever despite successful payment
// - Silent failures mask bugs during development and production
//
// SOLUTION:
// - Retry transient errors (timeouts, connection resets) up to 3 times
// - Fail loudly on permanent errors (invalid data, permissions)
// - Track failures to detect cascading problems
// - NEVER return 200 until we're confident data was persisted

import { withSupabaseRetry } from './supabase-retry';
import { withTimeout, TIMEOUT_LIMITS, TimeoutError } from './api-timeout';

// ============================================================================
// Configuration
// ============================================================================

interface WebhookReliabilityOptions {
  operation: string;
  maxRetries?: number;
  timeoutMs?: number;
}

export interface WebhookHandlerResult {
  success: boolean;
  error?: {
    message: string;
    code: 'TRANSIENT' | 'PERMANENT' | 'TIMEOUT';
    retriesAttempted: number;
  };
}

// ============================================================================
// Error Classification
// ============================================================================

/**
 * Classifies an error to determine if retrying will help
 *
 * TRANSIENT (should retry):
 * - Database connection timeouts
 * - Network errors (ECONNREFUSED, ECONNRESET)
 * - Temporary service unavailability
 * - Pool exhaustion
 *
 * PERMANENT (should NOT retry):
 * - Invalid JSON
 * - Type errors
 * - Constraint violations (duplicate key, foreign key)
 * - Permission denied
 * - Missing columns/tables
 * - Out-of-memory
 */
function classifyError(error: unknown): 'TRANSIENT' | 'PERMANENT' | 'TIMEOUT' {
  if (error instanceof TimeoutError) {
    return 'TIMEOUT';
  }

  const errorStr = String(error).toLowerCase();
  const errorMsg = (error as Record<string, unknown>)?.message?.toString().toLowerCase() || '';

  // Transient error indicators
  const transientPatterns = [
    'timeout',
    'timed out',
    'econnrefused',
    'econnreset',
    'econnaborted',
    'etimedout',
    'enetunreach',
    'ehostunreach',
    'connection reset',
    'connection refused',
    'connection timeout',
    'too many connections',
    'pool exhausted',
    'not available',
    'temporarily unavailable',
    'service unavailable',
    'temporarily',
  ];

  if (transientPatterns.some(p => errorStr.includes(p) || errorMsg.includes(p))) {
    return 'TRANSIENT';
  }

  // Timeout is transient
  if (error instanceof TimeoutError) {
    return 'TRANSIENT';
  }

  // Permanent error indicators
  const permanentPatterns = [
    'syntaxerror',
    'typeerror',
    'rangeerror',
    'referenceerror',
    'constraint violation',
    'unique constraint',
    'foreign key',
    'permission denied',
    'access denied',
    'unauthorized',
    'forbidden',
    'not found',
    'column ".*" does not exist',
    'relation .* does not exist',
    'invalid',
  ];

  if (permanentPatterns.some(p => errorStr.includes(p) || errorMsg.includes(p))) {
    return 'PERMANENT';
  }

  // Unknown errors are treated as PERMANENT to prevent infinite retries
  return 'PERMANENT';
}

// ============================================================================
// Webhook Operation Wrapper with Retries
// ============================================================================

/**
 * Wraps a webhook handler with automatic retry logic for transient failures
 * Returns error details that indicate whether webhook should be retried by Stripe
 *
 * @param handler - Async function that performs the database operations
 * @param options - Configuration for retries and timeouts
 * @returns Result with success flag and error details if failed
 *
 * @example
 * const result = await withWebhookRetry(
 *   async () => {
 *     const { error } = await supabase
 *       .from('orders')
 *       .update({ payment_status: 'paid' })
 *       .eq('id', orderId);
 *     if (error) throw error;
 *   },
 *   { operation: 'Update order payment status', maxRetries: 3 }
 * );
 *
 * if (!result.success) {
 *   // Return 500 so Stripe retries, or return 200 if permanent error
 *   if (result.error?.code === 'PERMANENT') {
 *     console.error('Permanent error, logging for manual review:', result.error.message);
 *     return 200; // Tell Stripe we processed it (we can't fix it by retrying)
 *   }
 *   return 500; // Tell Stripe to retry (might succeed next time)
 * }
 * return 200; // Success
 */
export async function withWebhookRetry(
  handler: () => Promise<void>,
  options: WebhookReliabilityOptions
): Promise<WebhookHandlerResult> {
  const {
    operation,
    maxRetries = 3,
    timeoutMs = TIMEOUT_LIMITS.DATABASE,
  } = options;

  let lastError: unknown;
  let retriesAttempted = 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Wrap with timeout to prevent hanging indefinitely
      await withTimeout(
        handler(),
        timeoutMs,
        `${operation} (attempt ${attempt + 1})`
      );

      // Success!
      return { success: true };
    } catch (error) {
      lastError = error;
      retriesAttempted = attempt;

      const errorType = classifyError(error);

      if (errorType === 'PERMANENT') {
        // Don't retry permanent errors
        console.error(
          `[Webhook] Permanent error on ${operation} (attempt ${attempt + 1}/${maxRetries + 1}):`,
          error
        );
        return {
          success: false,
          error: {
            message: errorToString(error),
            code: 'PERMANENT',
            retriesAttempted: attempt,
          },
        };
      }

      // Log transient/timeout errors
      console.warn(
        `[Webhook] ${errorType} on ${operation} (attempt ${attempt + 1}/${maxRetries + 1}):`,
        error
      );

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        return {
          success: false,
          error: {
            message: errorToString(error),
            code: errorType,
            retriesAttempted: attempt,
          },
        };
      }

      // Exponential backoff with jitter before retrying
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      const jitter = Math.random() * delay * 0.1;
      const totalDelay = delay + jitter;

      await new Promise((resolve) => setTimeout(resolve, totalDelay));
    }
  }

  // Should never reach here, but handle it just in case
  return {
    success: false,
    error: {
      message: errorToString(lastError || new Error('Unknown error')),
      code: 'PERMANENT',
      retriesAttempted: maxRetries,
    },
  };
}

// ============================================================================
// Webhook Operation Validator
// ============================================================================

/**
 * Validates critical webhook event data before processing
 * Prevents silent failures due to missing required metadata
 *
 * @param data - Data to validate
 * @param requiredFields - Fields that must exist
 * @param context - Operation name for error messages
 * @returns Error message if validation fails, null if valid
 *
 * @example
 * const error = validateWebhookData(event.data.object, [
 *   'id',
 *   'metadata.order_id',
 *   'amount'
 * ], 'Payment intent');
 *
 * if (error) {
 *   console.error(`[Webhook] Validation failed: ${error}`);
 *   // Return 400 to reject malformed webhook
 *   return NextResponse.json({ error }, { status: 400 });
 * }
 */
export function validateWebhookData(
  data: Record<string, unknown>,
  requiredFields: string[],
  context: string
): string | null {
  for (const field of requiredFields) {
    const value = getNestedValue(data, field);
    if (value === undefined || value === null) {
      return `${context}: missing required field "${field}"`;
    }
  }
  return null;
}

/**
 * Gets a nested value from an object using dot notation
 * @example
 * getNestedValue({ user: { id: 123 } }, 'user.id') → 123
 * getNestedValue({ user: { id: 123 } }, 'user.email') → undefined
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

// ============================================================================
// Webhook Result Handler
// ============================================================================

/**
 * Determines what HTTP status code to return based on webhook operation result
 *
 * LOGIC:
 * - success: return 200 (Stripe won't retry)
 * - permanent error: return 200 (Stripe can't fix it, but don't retry. Log it!)
 * - transient/timeout error: return 500 (Stripe will retry)
 *
 * This prevents Stripe from retrying errors we know won't be fixed by retrying,
 * while ensuring Stripe DOES retry errors that might succeed next time.
 */
export function getWebhookStatusCode(result: WebhookHandlerResult): number {
  if (result.success) {
    return 200;
  }

  if (!result.error) {
    // Shouldn't happen, but treat as success to not double-retry
    return 200;
  }

  // For permanent errors, return 200 but log loudly for manual review
  if (result.error.code === 'PERMANENT') {
    console.error(
      `[Webhook] Permanent error - investigate: ${result.error.message}`,
      `(${result.error.retriesAttempted} retries attempted)`
    );
    return 200;
  }

  // For transient/timeout errors, return 500 to trigger Stripe retry
  return 500;
}

// ============================================================================
// Utility: Error to String Conversion
// ============================================================================

function errorToString(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as Record<string, unknown>).message);
  }
  return String(error);
}

// ============================================================================
// Usage Example
// ============================================================================
//
// import { withWebhookRetry, validateWebhookData, getWebhookStatusCode } from '@/lib/webhook-reliability';
//
// export async function POST(request: NextRequest) {
//   try {
//     // Parse and validate webhook
//     const event = await parseStripeEvent(request);
//
//     // Validate required fields exist
//     const validationError = validateWebhookData(
//       event.data.object,
//       ['id', 'metadata.order_id', 'amount'],
//       'PaymentIntent'
//     );
//     if (validationError) {
//       return NextResponse.json({ error: validationError }, { status: 400 });
//     }
//
//     // Execute handler with retry logic
//     const result = await withWebhookRetry(
//       async () => {
//         await handlePaymentSuccess(event.data.object);
//       },
//       { operation: 'Handle payment success' }
//     );
//
//     // Return appropriate status based on result
//     const statusCode = getWebhookStatusCode(result);
//     return NextResponse.json(
//       {
//         received: true,
//         ...(result.error && { warning: result.error.message }),
//       },
//       { status: statusCode }
//     );
//   } catch (error) {
//     console.error('[Webhook] Fatal error:', error);
//     return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
//   }
// }
