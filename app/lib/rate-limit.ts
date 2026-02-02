// ============================================================================
// Rate Limiting - Prevent Brute Force & Abuse
// ============================================================================
// What: Limits requests per IP address/user ID to prevent brute-force attacks
// Why: Auth endpoints without rate limits allow unlimited password guesses
// How: Track request counts in Redis with sliding window TTL

import { redis } from './redis';
import { withTimeout, TIMEOUT_LIMITS, TimeoutError } from './api-timeout';

// ============================================================================
// Configuration
// ============================================================================

export const RATE_LIMITS = {
  // Auth endpoints: 5 attempts per 15 minutes
  AUTH_LOGIN: { maxAttempts: 5, windowSeconds: 900 }, // 15 min
  AUTH_SIGNUP: { maxAttempts: 3, windowSeconds: 900 }, // 15 min

  // API endpoints: 30 requests per minute
  API_GENERAL: { maxAttempts: 30, windowSeconds: 60 },

  // Sensitive actions: 3 attempts per 5 minutes
  SENSITIVE_ACTION: { maxAttempts: 3, windowSeconds: 300 }, // 5 min
};

const RATE_LIMIT_KEY_PREFIX = 'rate-limit:';

// ============================================================================
// Rate Limit Check
// ============================================================================

/**
 * Check if a request should be rate limited
 * Returns { allowed: boolean, remaining: number, resetAt: Date }
 *
 * @param identifier - Unique identifier (IP address, user ID, email, etc.)
 * @param limitConfig - Rate limit configuration
 * @param context - Optional context for logging
 * @returns Rate limit status and metadata
 */
export async function checkRateLimit(
  identifier: string,
  limitConfig: { maxAttempts: number; windowSeconds: number },
  context: string = 'request'
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const key = `${RATE_LIMIT_KEY_PREFIX}${identifier}`;

  try {
    // Check if Redis circuit breaker is open
    if (redis.isCircuitBreakerOpen()) {
      console.warn(`[RateLimit] Redis circuit breaker open for ${context} - allowing request`);
      // When Redis is down, allow requests (fail open) rather than blocking all traffic
      return {
        allowed: true,
        remaining: limitConfig.maxAttempts,
        resetAt: new Date(Date.now() + limitConfig.windowSeconds * 1000),
      };
    }

    // ATOMIC: Increment counter first to prevent race conditions
    // If concurrent requests both check THEN increment, they can both pass
    // By incrementing first, we ensure count is accurate before checking
    const newCount = await withTimeout(
      redis.raw.incr(key),
      TIMEOUT_LIMITS.CACHE,
      `Rate limit increment for ${context}`
    );

    // Set TTL only on first increment (when newCount becomes 1)
    if (newCount === 1) {
      await withTimeout(
        redis.raw.expire(key, limitConfig.windowSeconds),
        TIMEOUT_LIMITS.CACHE,
        `Rate limit TTL set for ${context}`
      );
    }

    // Now check if we're allowed (compare against max attempts)
    const allowed = newCount <= limitConfig.maxAttempts;
    const remaining = Math.max(0, limitConfig.maxAttempts - newCount);

    // Calculate reset time
    const ttl = await withTimeout(
      redis.raw.ttl(key),
      TIMEOUT_LIMITS.CACHE,
      `Rate limit TTL check for ${context}`
    );
    const resetAt = new Date(Date.now() + Math.max(ttl, limitConfig.windowSeconds) * 1000);

    if (!allowed) {
      console.warn(
        `[RateLimit] Rate limit exceeded for ${context} (identifier: ${identifier.substring(0, 8)}..., count: ${newCount}/${limitConfig.maxAttempts})`
      );
    }

    return { allowed, remaining, resetAt };
  } catch (error) {
    // Handle timeout errors
    if (error instanceof TimeoutError) {
      console.error(`[RateLimit] Timeout on ${context}:`, error.message);
      // Fail open - allow the request when Redis is slow
      return {
        allowed: true,
        remaining: limitConfig.maxAttempts,
        resetAt: new Date(Date.now() + limitConfig.windowSeconds * 1000),
      };
    }

    console.error(`[RateLimit] Error checking rate limit for ${context}:`, error);
    // Fail open - allow the request on errors
    return {
      allowed: true,
      remaining: limitConfig.maxAttempts,
      resetAt: new Date(Date.now() + limitConfig.windowSeconds * 1000),
    };
  }
}

// ============================================================================
// HTTP Response Helpers
// ============================================================================

/**
 * Create a 429 Too Many Requests response
 */
export function rateLimitResponse(
  resetAt: Date,
  message: string = 'Too many requests. Please try again later.'
) {
  const { NextResponse } = require('next/server');

  const response = NextResponse.json(
    { error: message, retryAfter: Math.ceil((resetAt.getTime() - Date.now()) / 1000) },
    { status: 429 }
  );

  // Set Retry-After header (seconds until rate limit resets)
  response.headers.set('Retry-After', String(Math.ceil((resetAt.getTime() - Date.now()) / 1000)));

  // Set rate limit headers for client consumption
  response.headers.set('X-RateLimit-Reset', resetAt.toISOString());

  return response;
}

// ============================================================================
// Usage Examples
// ============================================================================
//
// Example 1: Rate limit login endpoint
// ─────────────────────────────────────
// import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit';
//
// export async function POST(request: NextRequest) {
//   // Get client IP
//   const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
//
//   // Check rate limit
//   const { allowed, resetAt } = await checkRateLimit(ip, RATE_LIMITS.AUTH_LOGIN, 'login');
//   if (!allowed) {
//     return rateLimitResponse(resetAt, 'Too many login attempts. Please try again later.');
//   }
//
//   // Process login...
// }
//
// Example 2: Rate limit per email address
// ───────────────────────────────────────
// const { allowed, resetAt } = await checkRateLimit(
//   `signup:${email}`,
//   RATE_LIMITS.AUTH_SIGNUP,
//   'signup'
// );
//
// Example 3: Rate limit per user ID
// ──────────────────────────────────
// const { allowed, resetAt } = await checkRateLimit(
//   `api:${userId}`,
//   RATE_LIMITS.API_GENERAL,
//   'api call'
// );
