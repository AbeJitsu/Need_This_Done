// ============================================================================
// Request Size Validation - Prevent Memory Exhaustion & DoS Attacks
// ============================================================================
// What: Validates incoming request body size before processing
// Why: Prevents DoS via oversized payloads that could exhaust server memory
// How: Checks Content-Length header and enforces per-route limits

import { NextRequest, NextResponse } from 'next/server';
import { badRequest } from './api-errors';

/**
 * Size limits for different API endpoint types (in bytes)
 * Helps prevent memory exhaustion and DoS attacks
 */
export const SIZE_LIMITS = {
  CHAT_MESSAGE: 50 * 1024, // 50 KB for chat messages
  FORM_SUBMISSION: 10 * 1024 * 1024, // 10 MB for forms (includes file metadata)
  JSON_PAYLOAD: 1 * 1024 * 1024, // 1 MB for typical JSON payloads
  FILE_METADATA: 100 * 1024, // 100 KB for file list metadata
} as const;

/**
 * Validate request body size before processing
 * Rejects requests that exceed the limit
 *
 * @param request - Next.js request
 * @param limitBytes - Maximum allowed size in bytes
 * @param operation - Description for logging (e.g., "Chat message")
 * @returns Error response if size exceeds limit, otherwise null
 *
 * @example
 * const sizeError = validateRequestSize(request, SIZE_LIMITS.CHAT_MESSAGE, 'Chat message');
 * if (sizeError) return sizeError;
 */
export function validateRequestSize(
  request: NextRequest,
  limitBytes: number,
  operation: string
): NextResponse | null {
  const contentLength = request.headers.get('content-length');

  if (!contentLength) {
    // No size header provided - reject for safety
    console.warn(`[Size Limit] Missing Content-Length for ${operation}`);
    return badRequest('Content-Length header is required');
  }

  const sizeBytes = parseInt(contentLength, 10);

  if (isNaN(sizeBytes)) {
    // Invalid size header
    console.warn(`[Size Limit] Invalid Content-Length for ${operation}: ${contentLength}`);
    return badRequest('Invalid Content-Length header');
  }

  if (sizeBytes > limitBytes) {
    const limitMB = (limitBytes / 1024 / 1024).toFixed(1);
    const actualMB = (sizeBytes / 1024 / 1024).toFixed(1);

    console.warn(
      `[Size Limit] ${operation} exceeded limit: ${actualMB}MB > ${limitMB}MB`
    );

    return badRequest(
      `Request too large (${actualMB}MB). Maximum size is ${limitMB}MB.`
    );
  }

  // Size is acceptable
  return null;
}

/**
 * Extract and validate request body with size checking
 * Safely parses JSON and enforces size limits
 *
 * @param request - Next.js request
 * @param limitBytes - Maximum allowed size
 * @param operation - Description for logging
 * @returns Parsed JSON or error response
 */
export async function validateRequestSizeAndParse<T>(
  request: NextRequest,
  limitBytes: number,
  operation: string
): Promise<{ success: true; data: T } | { success: false; error: NextResponse }> {
  // First validate size
  const sizeError = validateRequestSize(request, limitBytes, operation);
  if (sizeError) {
    return { success: false, error: sizeError };
  }

  // Then parse body
  try {
    const data = (await request.json()) as T;
    return { success: true, data };
  } catch (error) {
    console.error(`[Size Limit] JSON parsing error for ${operation}:`, error);

    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: badRequest('Invalid JSON in request body'),
      };
    }

    return {
      success: false,
      error: badRequest(`Failed to parse ${operation}`),
    };
  }
}

// ============================================================================
// Usage Examples
// ============================================================================
//
// Example 1: Validate size before parsing
// ────────────────────────────────────────
// import { validateRequestSize, SIZE_LIMITS } from '@/lib/request-size-limit';
//
// export async function POST(request: NextRequest) {
//   const sizeError = validateRequestSize(
//     request,
//     SIZE_LIMITS.JSON_PAYLOAD,
//     'API request'
//   );
//   if (sizeError) return sizeError;
//
//   const body = await request.json();
//   // ... process body
// }
//
// Example 2: Combined validation and parsing
// ───────────────────────────────────────────
// import { validateRequestSizeAndParse, SIZE_LIMITS } from '@/lib/request-size-limit';
//
// export async function POST(request: NextRequest) {
//   const result = await validateRequestSizeAndParse(
//     request,
//     SIZE_LIMITS.CHAT_MESSAGE,
//     'Chat message'
//   );
//
//   if (!result.success) return result.error;
//
//   const { messages } = result.data; // Type-safe!
//   // ... process messages
// }
