// ============================================================================
// API Timeout Protection
// ============================================================================
// What: Wraps async operations with configurable timeout limits
// Why: Prevents hanging requests to external APIs (Stripe, Medusa) from blocking users
// How: Race between operation promise and timeout promise
//
// Usage:
//   const cart = await withTimeout(
//     medusaClient.carts.get(cartId),
//     5000,
//     'Medusa cart fetch'
//   );

// ============================================================================
// Timeout Configuration
// ============================================================================

export const TIMEOUT_LIMITS = {
  DATABASE: 10000, // 10 seconds for database queries
  EXTERNAL_API: 8000, // 8 seconds for external API calls (Stripe, Medusa)
  CACHE: 2000, // 2 seconds for cache operations
  FILE_UPLOAD: 30000, // 30 seconds for file uploads
  EMAIL: 10000, // 10 seconds for email sending
  WEBHOOK: 15000, // 15 seconds for webhook processing
} as const;

// ============================================================================
// Timeout Error Class
// ============================================================================

export class TimeoutError extends Error {
  constructor(
    public readonly operation: string,
    public readonly timeoutMs: number
  ) {
    super(`Operation "${operation}" timed out after ${timeoutMs}ms`);
    this.name = 'TimeoutError';
  }
}

// ============================================================================
// Timeout Wrapper Functions
// ============================================================================

/**
 * Wraps a promise with a timeout - rejects if operation takes too long
 *
 * @param promise - The async operation to execute
 * @param timeoutMs - Max time to wait in milliseconds
 * @param operation - Description of operation (for error messages)
 * @returns Promise that resolves with operation result or rejects on timeout
 * @throws TimeoutError if operation exceeds timeout
 *
 * @example
 * const data = await withTimeout(
 *   fetch('https://api.example.com/data'),
 *   5000,
 *   'External API fetch'
 * );
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operation: string
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new TimeoutError(operation, timeoutMs));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
}

/**
 * Wraps a promise with a timeout and default value on timeout
 * Useful for non-critical operations where fallback is acceptable
 *
 * @param promise - The async operation to execute
 * @param timeoutMs - Max time to wait in milliseconds
 * @param defaultValue - Value to return if timeout occurs
 * @param operation - Description of operation (for logging)
 * @returns Promise that resolves with operation result or default value
 *
 * @example
 * const cached = await withTimeoutOrDefault(
 *   cache.get('key'),
 *   1000,
 *   null,
 *   'Cache lookup'
 * );
 */
export async function withTimeoutOrDefault<T>(
  promise: Promise<T>,
  timeoutMs: number,
  defaultValue: T,
  operation: string
): Promise<T> {
  try {
    return await withTimeout(promise, timeoutMs, operation);
  } catch (error) {
    if (error instanceof TimeoutError) {
      console.warn(`[Timeout] ${operation} exceeded ${timeoutMs}ms, using default value`);
      return defaultValue;
    }
    throw error;
  }
}

/**
 * Wraps multiple promises with individual timeouts
 * Useful when calling multiple external APIs in parallel
 *
 * @param operations - Array of {promise, timeout, name} objects
 * @returns Array of results matching input order
 * @throws TimeoutError if any operation times out
 *
 * @example
 * const [user, orders] = await withTimeoutAll([
 *   { promise: fetchUser(id), timeout: 3000, name: 'User fetch' },
 *   { promise: fetchOrders(id), timeout: 5000, name: 'Orders fetch' }
 * ]);
 */
export async function withTimeoutAll<T extends unknown[]>(
  operations: {
    promise: Promise<unknown>;
    timeout: number;
    name: string;
  }[]
): Promise<T> {
  const wrappedPromises = operations.map(({ promise, timeout, name }) =>
    withTimeout(promise, timeout, name)
  );

  return (await Promise.all(wrappedPromises)) as T;
}

/**
 * Retry a promise with exponential backoff and timeout on each attempt
 *
 * @param fn - Function that returns a promise to retry
 * @param options - Retry configuration
 * @returns Promise that resolves with successful result or rejects after all retries
 *
 * @example
 * const data = await withRetry(
 *   () => fetch('https://api.example.com/data'),
 *   { maxRetries: 3, timeoutMs: 5000, initialDelayMs: 100 }
 * );
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    timeoutMs?: number;
    initialDelayMs?: number;
    operation?: string;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    timeoutMs = TIMEOUT_LIMITS.EXTERNAL_API,
    initialDelayMs = 100,
    operation = 'Operation',
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await withTimeout(fn(), timeoutMs, `${operation} (attempt ${attempt + 1})`);
    } catch (error) {
      lastError = error as Error;

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff with jitter
      const delay = initialDelayMs * Math.pow(2, attempt);
      const jitter = Math.random() * delay * 0.1; // 10% jitter
      const totalDelay = delay + jitter;

      console.warn(
        `[Retry] ${operation} failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${Math.round(totalDelay)}ms:`,
        error instanceof Error ? error.message : error
      );

      await new Promise((resolve) => setTimeout(resolve, totalDelay));
    }
  }

  throw lastError || new Error(`${operation} failed after ${maxRetries + 1} attempts`);
}

// ============================================================================
// Usage Examples
// ============================================================================
//
// Example 1: Wrap external API call with timeout
// ───────────────────────────────────────────────
// import { withTimeout, TIMEOUT_LIMITS } from '@/lib/api-timeout';
//
// export async function GET(request: NextRequest) {
//   try {
//     const cart = await withTimeout(
//       medusaClient.carts.get(cartId),
//       TIMEOUT_LIMITS.EXTERNAL_API,
//       'Medusa cart fetch'
//     );
//     return NextResponse.json({ cart });
//   } catch (error) {
//     if (error instanceof TimeoutError) {
//       return serverError('Cart service is currently slow, please try again');
//     }
//     throw error;
//   }
// }
//
// Example 2: Parallel API calls with individual timeouts
// ───────────────────────────────────────────────────────
// import { withTimeoutAll, TIMEOUT_LIMITS } from '@/lib/api-timeout';
//
// const [products, cart] = await withTimeoutAll([
//   {
//     promise: medusaClient.products.list(),
//     timeout: TIMEOUT_LIMITS.EXTERNAL_API,
//     name: 'Products fetch'
//   },
//   {
//     promise: medusaClient.carts.get(cartId),
//     timeout: TIMEOUT_LIMITS.EXTERNAL_API,
//     name: 'Cart fetch'
//   }
// ]);
//
// Example 3: Retry with timeout
// ──────────────────────────────
// import { withRetry, TIMEOUT_LIMITS } from '@/lib/api-timeout';
//
// const payment = await withRetry(
//   () => stripe.paymentIntents.create({...}),
//   {
//     maxRetries: 3,
//     timeoutMs: TIMEOUT_LIMITS.EXTERNAL_API,
//     operation: 'Create payment intent'
//   }
// );
//
// Example 4: Cache lookup with default on timeout
// ────────────────────────────────────────────────
// import { withTimeoutOrDefault, TIMEOUT_LIMITS } from '@/lib/api-timeout';
//
// const cached = await withTimeoutOrDefault(
//   cache.get('products'),
//   TIMEOUT_LIMITS.CACHE,
//   null,
//   'Cache lookup'
// );
