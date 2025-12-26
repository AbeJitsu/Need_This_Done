import { NextResponse } from 'next/server';

// ============================================================================
// Shared API Error Handling
// ============================================================================
// Standardized error response handlers used across all API routes.
// Prevents duplication of error handling logic and ensures consistent responses.

/**
 * Handle unexpected API errors with logging
 * @param error The caught error object
 * @param context Optional context string to identify where error occurred
 * @returns NextResponse with 500 status
 */
export function handleApiError(error: unknown, context?: string): NextResponse {
  if (context) {
    console.error(`${context} error:`, error);
  } else {
    console.error('API error:', error);
  }

  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  );
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
