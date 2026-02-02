// ============================================================================
// Request Deduplication - Prevent Duplicate Submissions
// ============================================================================
// What: Prevents duplicate API requests from double-clicks or network retries
// Why: Users may click submit buttons multiple times, or browsers may retry
//      requests on network hiccups, causing duplicate database records
// How: Track request fingerprints in Redis with short TTL (60 seconds)

import { redis } from './redis';
import { createHash } from 'crypto';

// ============================================================================
// Configuration
// ============================================================================

const DEDUP_TTL_SECONDS = 60; // How long to remember a request
const DEDUP_KEY_PREFIX = 'dedup:';

// ============================================================================
// Request Fingerprinting
// ============================================================================

/**
 * Creates a unique fingerprint for a request based on its content
 * Same content = same fingerprint = duplicate request
 *
 * @param data - Request data to fingerprint (usually form data or body)
 * @param userId - Optional user ID to scope deduplication per user
 * @returns Unique fingerprint string
 */
export function createRequestFingerprint(
  data: Record<string, unknown>,
  userId?: string
): string {
  // Serialize data in a stable way (sorted keys)
  const keys = Object.keys(data).sort();
  const serialized = keys.map(key => `${key}:${String(data[key])}`).join('|');

  // Include user ID if provided to prevent cross-user deduplication
  const content = userId ? `user:${userId}|${serialized}` : serialized;

  // Create SHA-256 hash for compact, collision-resistant fingerprint
  return createHash('sha256').update(content).digest('hex').substring(0, 32);
}

// ============================================================================
// Deduplication Logic
// ============================================================================

/**
 * Check if a request is a duplicate and mark it as seen
 * Returns true if this is a NEW request (should process)
 * Returns false if this is a DUPLICATE request (should reject)
 *
 * @param fingerprint - Request fingerprint from createRequestFingerprint()
 * @param operation - Description for logging (e.g., "project submission")
 * @returns true if request should be processed, false if duplicate
 */
export async function checkAndMarkRequest(
  fingerprint: string,
  operation: string = 'request'
): Promise<boolean> {
  const key = `${DEDUP_KEY_PREFIX}${fingerprint}`;

  try {
    // CRITICAL: Use SET with NX (only set if not exists) + EX (expiration) atomically
    // This ensures exactly-once semantics even under high concurrency
    // Returns "OK" if set successfully, null if key already exists
    const result = await redis.raw.set(key, new Date().toISOString(), {
      NX: true, // Only set if key doesn't exist (atomic test-and-set)
      EX: DEDUP_TTL_SECONDS,
    });

    if (result === null) {
      // Key already exists - this is a duplicate request
      console.warn(`[Dedup] Blocked duplicate ${operation} (fingerprint: ${fingerprint.substring(0, 8)}...)`);
      return false;
    }

    // Key was set successfully - this is a new request
    return true;
  } catch (error) {
    console.error(`[Dedup] Redis error for ${operation}:`, error);
    // On Redis failure, allow the request through to avoid blocking legitimate traffic
    // Better to risk a duplicate than to block all requests
    return true;
  }
}

/**
 * Manually clear a request fingerprint (useful for testing or error recovery)
 *
 * @param fingerprint - Request fingerprint to clear
 */
export async function clearRequestFingerprint(fingerprint: string): Promise<void> {
  const key = `${DEDUP_KEY_PREFIX}${fingerprint}`;
  try {
    await redis.del(key);
  } catch (error) {
    console.error('[Dedup] Failed to clear fingerprint:', error);
  }
}

// ============================================================================
// High-Level Wrapper
// ============================================================================

/**
 * Wrapper that handles deduplication + execution in one call
 * Use this for simple cases where you just want to wrap a function
 *
 * @param data - Request data to fingerprint
 * @param fn - Function to execute if not duplicate
 * @param options - Deduplication options
 * @returns Result of fn() or throws DuplicateRequestError
 *
 * @example
 * const result = await withDeduplication(
 *   { email: req.body.email, message: req.body.message },
 *   async () => {
 *     return await createProject(req.body);
 *   },
 *   { operation: 'project submission', userId: req.user?.id }
 * );
 */
export async function withDeduplication<T>(
  data: Record<string, unknown>,
  fn: () => Promise<T>,
  options: {
    operation?: string;
    userId?: string;
  } = {}
): Promise<T> {
  const { operation = 'request', userId } = options;

  const fingerprint = createRequestFingerprint(data, userId);
  const isNew = await checkAndMarkRequest(fingerprint, operation);

  if (!isNew) {
    throw new DuplicateRequestError(
      `Duplicate ${operation} detected. Please wait a moment before trying again.`
    );
  }

  return fn();
}

/**
 * Custom error class for duplicate requests
 */
export class DuplicateRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DuplicateRequestError';
  }
}

/**
 * Type guard to check if error is a DuplicateRequestError
 */
export function isDuplicateRequestError(error: unknown): error is DuplicateRequestError {
  return error instanceof DuplicateRequestError;
}

// ============================================================================
// Usage Examples
// ============================================================================
//
// Example 1: Manual deduplication check
// ──────────────────────────────────────
// import { createRequestFingerprint, checkAndMarkRequest } from '@/lib/request-dedup';
//
// export async function POST(request: Request) {
//   const body = await request.json();
//
//   const fingerprint = createRequestFingerprint({
//     email: body.email,
//     message: body.message,
//   });
//
//   const isNew = await checkAndMarkRequest(fingerprint, 'project submission');
//   if (!isNew) {
//     return NextResponse.json(
//       { error: 'Duplicate submission detected. Please wait before trying again.' },
//       { status: 429 }
//     );
//   }
//
//   // Process the request...
// }
//
// Example 2: Using the wrapper
// ────────────────────────────
// import { withDeduplication, isDuplicateRequestError } from '@/lib/request-dedup';
//
// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//
//     const result = await withDeduplication(
//       { email: body.email, message: body.message },
//       async () => {
//         // This code only runs if not a duplicate
//         return await supabase.from('projects').insert(body);
//       },
//       { operation: 'project submission', userId: body.userId }
//     );
//
//     return NextResponse.json(result);
//   } catch (error) {
//     if (isDuplicateRequestError(error)) {
//       return NextResponse.json(
//         { error: error.message },
//         { status: 429 }
//       );
//     }
//     throw error;
//   }
// }
