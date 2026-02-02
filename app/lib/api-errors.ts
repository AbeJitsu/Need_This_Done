import { NextResponse } from 'next/server';

// ============================================================================
// Shared API Error Handling
// ============================================================================
// Standardized error response handlers used across all API routes.
// Prevents duplication of error handling logic and ensures consistent responses.
//
// Error Classification:
// - 'transient': Network, timeout, connection errors - retry is safe
// - 'validation': Input validation, constraint violations - client must change input
// - 'auth': Authentication/authorization - user must re-authenticate
// - 'infrastructure': Service misconfiguration - ops must investigate
// - 'unknown': Unexpected errors - should investigate

export type ErrorClassification = 'transient' | 'validation' | 'auth' | 'infrastructure' | 'unknown';

export interface StructuredErrorResponse {
  error: string;
  code?: string;
  classification?: ErrorClassification;
  retryable?: boolean;
  retryAfterMs?: number;
}

/**
 * Classify an error to help clients decide whether to retry
 * @param error The caught error object
 * @returns Error classification type
 */
function classifyError(error: unknown): ErrorClassification {
  if (!error) return 'unknown';

  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  const errorStr = String(error);

  // Transient errors (safe to retry)
  if (message.includes('timeout') ||
      message.includes('econnrefused') ||
      message.includes('econnreset') ||
      message.includes('enotfound') ||
      message.includes('socket hang up') ||
      message.includes('unable to connect') ||
      message.includes('too many connections') ||
      message.includes('unavailable') ||
      errorStr.includes('ETIMEDOUT')) {
    return 'transient';
  }

  // Validation errors (user must fix input)
  if (message.includes('constraint') ||
      message.includes('unique violation') ||
      message.includes('not null') ||
      message.includes('foreign key') ||
      message.includes('invalid') ||
      message.includes('23505') || // PostgreSQL unique constraint
      message.includes('23503')) { // PostgreSQL foreign key
    return 'validation';
  }

  // Auth errors (user must re-authenticate)
  if (message.includes('unauthorized') ||
      message.includes('invalid token') ||
      message.includes('jwt') ||
      message.includes('permission denied') ||
      message.includes('forbidden')) {
    return 'auth';
  }

  // Infrastructure errors (missing config, etc.)
  if (message.includes('environment variable') ||
      message.includes('undefined') ||
      message.includes('not configured') ||
      message.includes('no such table') ||
      message.includes('does not exist')) {
    return 'infrastructure';
  }

  return 'unknown';
}

/**
 * Calculate retry guidance based on error classification
 * @param classification Error classification
 * @returns Object with retryable flag and suggested delay
 */
function getRetryGuidance(classification: ErrorClassification) {
  switch (classification) {
    case 'transient':
      return { retryable: true, retryAfterMs: 1000 };
    case 'validation':
      return { retryable: false, retryAfterMs: 0 };
    case 'auth':
      return { retryable: false, retryAfterMs: 0 };
    case 'infrastructure':
      return { retryable: true, retryAfterMs: 5000 };
    default:
      return { retryable: true, retryAfterMs: 2000 };
  }
}

/**
 * Handle unexpected API errors with intelligent classification
 * Returns structured error response to enable smart client retry logic
 *
 * @param error The caught error object
 * @param context Optional context string to identify where error occurred
 * @returns NextResponse with 500 status and structured error info
 */
export function handleApiError(error: unknown, context?: string): NextResponse {
  const classification = classifyError(error);
  const { retryable, retryAfterMs } = getRetryGuidance(classification);

  // Log with context and classification for debugging
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`[API Error] ${context || 'Unknown operation'} [${classification}]:`, errorMessage);

  const response: StructuredErrorResponse = {
    error: 'An unexpected error occurred',
    code: classification === 'transient' ? 'SERVICE_TEMPORARILY_UNAVAILABLE' :
          classification === 'infrastructure' ? 'SERVICE_MISCONFIGURED' :
          'UNEXPECTED_ERROR',
    classification,
    retryable,
  };

  // Add retry guidance for transient and infrastructure errors
  if (retryAfterMs > 0) {
    response.retryAfterMs = retryAfterMs;
  }

  return NextResponse.json(response, { status: 500 });
}

/**
 * Return a 400 Bad Request error response
 * @param message The error message to return to the client
 * @returns NextResponse with 400 status
 */
export function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Return a 401 Unauthorized error response
 * @param message The error message (defaults to generic message)
 * @returns NextResponse with 401 status
 */
export function unauthorized(message: string = 'Unauthorized'): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Return a 403 Forbidden error response
 * @param message The error message (defaults to generic message)
 * @returns NextResponse with 403 status
 */
export function forbidden(message: string = 'Forbidden'): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * Return a 404 Not Found error response
 * @param message The error message (defaults to generic message)
 * @returns NextResponse with 404 status
 */
export function notFound(message: string = 'Not found'): NextResponse {
  return NextResponse.json({ error: message }, { status: 404 });
}

/**
 * Return a 500 Server Error response
 * @param message The error message (defaults to generic message)
 * @returns NextResponse with 500 status
 */
export function serverError(
  message: string = 'An unexpected error occurred'
): NextResponse {
  return NextResponse.json({ error: message }, { status: 500 });
}
