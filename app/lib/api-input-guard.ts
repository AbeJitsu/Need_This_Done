// ============================================================================
// API Input Guard - Centralized Request Validation & DoS Prevention
// ============================================================================
// What: Unified input validation for all API routes (body, params, query)
// Why: Prevents malformed data, oversized payloads, and resource exhaustion
// How: Early validation fails fast before processing, prevents bugs downstream
//
// PROBLEMS BEING SOLVED:
// - Silent null pointer exceptions when required fields missing
// - Memory exhaustion from huge file uploads or arrays
// - Type mismatches causing database constraint errors
// - Missing validation leads to inconsistent error messages
// - DoS via oversized or deeply nested payloads

import { NextRequest, NextResponse } from 'next/server';
import { z, ZodSchema } from 'zod';

// ============================================================================
// Configuration
// ============================================================================

export const INPUT_LIMITS = {
  // Request body size limits (in bytes)
  SMALL_PAYLOAD: 1024, // 1KB - for login/signup
  MEDIUM_PAYLOAD: 10 * 1024, // 10KB - for form submissions
  LARGE_PAYLOAD: 100 * 1024, // 100KB - for file metadata
  MAX_PAYLOAD: 1 * 1024 * 1024, // 1MB - absolute maximum

  // Array/string length limits
  MAX_ARRAY_LENGTH: 1000,
  MAX_STRING_LENGTH: 10000,
  MAX_NESTED_DEPTH: 10,

  // Field-specific limits
  EMAIL_MAX_LENGTH: 254,
  NAME_MAX_LENGTH: 100,
  MESSAGE_MAX_LENGTH: 5000,
  URL_MAX_LENGTH: 2048,
};

// ============================================================================
// Request Size Validation
// ============================================================================

/**
 * Validates request size to prevent memory exhaustion attacks
 * Must be called BEFORE reading request body
 *
 * @param request - Next.js request object
 * @param maxBytes - Maximum allowed size in bytes
 * @param context - Operation name for error messages
 * @returns Error response if too large, null if valid
 *
 * @example
 * const sizeError = validateRequestSize(request, 10 * 1024, 'Form submission');
 * if (sizeError) return sizeError;
 * const body = await request.json();
 */
export function validateRequestSize(
  request: NextRequest,
  maxBytes: number,
  context: string
): NextResponse | null {
  const contentLength = request.headers.get('content-length');

  if (!contentLength) {
    // If header is missing, we can't validate before reading
    // This is acceptable - the read will fail naturally if too large
    return null;
  }

  const size = parseInt(contentLength, 10);

  if (isNaN(size)) {
    return badRequest(`${context}: Invalid Content-Length header`);
  }

  if (size > maxBytes) {
    const maxKb = Math.round(maxBytes / 1024);
    return badRequest(
      `${context}: Request too large (${Math.round(size / 1024)}KB > ${maxKb}KB limit)`
    );
  }

  return null;
}

// ============================================================================
// Payload Structure Validation
// ============================================================================

/**
 * Validates that parsed JSON doesn't have pathological structure
 * Prevents DoS via deeply nested objects or huge arrays
 *
 * @param obj - Parsed JSON object to validate
 * @param context - Operation name for error messages
 * @returns Error message if invalid, null if valid
 *
 * @example
 * const body = await request.json();
 * const structureError = validatePayloadStructure(body, 'Form submission');
 * if (structureError) return badRequest(structureError);
 */
export function validatePayloadStructure(
  obj: unknown,
  context: string
): string | null {
  const errors: string[] = [];

  // Check for basic types
  if (typeof obj !== 'object' || obj === null) {
    return `${context}: Request body must be an object`;
  }

  // Validate depth and size
  const maxDepth = INPUT_LIMITS.MAX_NESTED_DEPTH;
  const maxSize = INPUT_LIMITS.MAX_PAYLOAD;

  try {
    const jsonStr = JSON.stringify(obj);
    if (jsonStr.length > maxSize) {
      return `${context}: Payload exceeds maximum size (${Math.round(jsonStr.length / 1024)}KB > ${Math.round(maxSize / 1024)}KB)`;
    }
  } catch (err) {
    return `${context}: Invalid JSON structure`;
  }

  // Validate depth by traversing
  const checkDepth = (val: unknown, depth: number = 0): boolean => {
    if (depth > maxDepth) {
      errors.push(`${context}: Payload nested too deeply (max ${maxDepth} levels)`);
      return false;
    }

    if (typeof val !== 'object' || val === null) {
      return true;
    }

    if (Array.isArray(val)) {
      if (val.length > INPUT_LIMITS.MAX_ARRAY_LENGTH) {
        errors.push(
          `${context}: Array too long (${val.length} > ${INPUT_LIMITS.MAX_ARRAY_LENGTH})`
        );
        return false;
      }
      return val.every(item => checkDepth(item, depth + 1));
    }

    return Object.values(val).every(value => checkDepth(value, depth + 1));
  };

  if (!checkDepth(obj)) {
    return errors[0] || `${context}: Invalid payload structure`;
  }

  return null;
}

// ============================================================================
// Unified Request Validation
// ============================================================================

export interface ValidatedRequest<T> {
  success: true;
  data: T;
}

export interface ValidatedRequestError {
  success: false;
  error: NextResponse;
}

export type ValidationResult<T> = ValidatedRequest<T> | ValidatedRequestError;

/**
 * Comprehensive request validation in one call
 * Handles size, structure, and schema validation
 *
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @param options - Configuration options
 * @returns Validation result with type-safe data or error response
 *
 * @example
 * export async function POST(request: NextRequest) {
 *   const result = await validateAndParseRequest(request, CreateUserSchema, {
 *     maxSize: INPUT_LIMITS.MEDIUM_PAYLOAD,
 *     context: 'User creation'
 *   });
 *
 *   if (!result.success) return result.error;
 *   const { email, name } = result.data; // Fully type-safe!
 * }
 */
export async function validateAndParseRequest<T extends ZodSchema>(
  request: NextRequest,
  schema: T,
  options: {
    maxSize?: number;
    context?: string;
  } = {}
): Promise<ValidationResult<z.infer<T>>> {
  const {
    maxSize = INPUT_LIMITS.MEDIUM_PAYLOAD,
    context = 'Request',
  } = options;

  try {
    // Step 1: Check size before parsing
    const sizeError = validateRequestSize(request, maxSize, context);
    if (sizeError) {
      return { success: false, error: sizeError };
    }

    // Step 2: Parse JSON
    let body: unknown;
    try {
      body = await request.json();
    } catch (err) {
      return {
        success: false,
        error: badRequest(`${context}: Invalid JSON in request body`),
      };
    }

    // Step 3: Validate structure
    const structureError = validatePayloadStructure(body, context);
    if (structureError) {
      return {
        success: false,
        error: badRequest(structureError),
      };
    }

    // Step 4: Validate schema
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      const message =
        firstError.path.length > 0
          ? `${firstError.path.join('.')}: ${firstError.message}`
          : firstError.message;

      return {
        success: false,
        error: badRequest(message),
      };
    }

    return {
      success: true,
      data: parsed.data,
    };
  } catch (error) {
    console.error(`${context} validation error:`, error);
    return {
      success: false,
      error: badRequest(`${context}: Validation failed`),
    };
  }
}

// ============================================================================
// Type Validators - Reusable field validators
// ============================================================================

/**
 * Validators for common field types
 * Use with Zod to ensure consistent validation across routes
 *
 * @example
 * const CreateUserSchema = z.object({
 *   email: typeValidators.email(),
 *   name: typeValidators.name(),
 *   bio: typeValidators.optionalText(500),
 * });
 */
export const typeValidators = {
  // Email with RFC 5322 compliance
  email: () =>
    z
      .string()
      .email('Invalid email address')
      .max(INPUT_LIMITS.EMAIL_MAX_LENGTH, `Email too long (max ${INPUT_LIMITS.EMAIL_MAX_LENGTH} chars)`)
      .transform(s => s.trim().toLowerCase()),

  // Person name with reasonable length
  name: (maxLength = INPUT_LIMITS.NAME_MAX_LENGTH) =>
    z
      .string()
      .min(1, 'Name is required')
      .max(maxLength, `Name too long (max ${maxLength} chars)`)
      .transform(s => s.trim()),

  // Optional name (null if empty)
  optionalName: (maxLength = INPUT_LIMITS.NAME_MAX_LENGTH) =>
    z
      .string()
      .max(maxLength, `Name too long (max ${maxLength} chars)`)
      .optional()
      .transform(s => (s?.trim() ? s.trim() : null)),

  // Text message with configurable length
  message: (maxLength = INPUT_LIMITS.MESSAGE_MAX_LENGTH) =>
    z
      .string()
      .min(1, 'Message is required')
      .max(maxLength, `Message too long (max ${maxLength} chars)`)
      .transform(s => s.trim()),

  // Optional text message
  optionalMessage: (maxLength = INPUT_LIMITS.MESSAGE_MAX_LENGTH) =>
    z
      .string()
      .max(maxLength, `Message too long (max ${maxLength} chars)`)
      .optional()
      .transform(s => (s?.trim() ? s.trim() : null)),

  // URL with length limit
  url: () =>
    z
      .string()
      .url('Invalid URL')
      .max(INPUT_LIMITS.URL_MAX_LENGTH, `URL too long (max ${INPUT_LIMITS.URL_MAX_LENGTH} chars)`),

  // ID (UUID or similar)
  id: () =>
    z
      .string()
      .uuid('Invalid ID format'),

  // Positive integer (for prices, counts)
  positiveInt: () =>
    z
      .number()
      .int('Must be an integer')
      .positive('Must be positive'),

  // Non-negative integer
  nonNegativeInt: () =>
    z
      .number()
      .int('Must be an integer')
      .nonnegative('Must be non-negative'),

  // Array with size limit
  array: <T extends ZodSchema>(schema: T, maxItems = INPUT_LIMITS.MAX_ARRAY_LENGTH) =>
    z
      .array(schema)
      .max(maxItems, `Too many items (max ${maxItems})`),
};

// ============================================================================
// Error Response Helpers
// ============================================================================

function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

// ============================================================================
// Usage Examples
// ============================================================================
//
// Example 1: Simple route with size and schema validation
// ───────────────────────────────────────────────────────
// import { validateAndParseRequest, INPUT_LIMITS, typeValidators } from '@/lib/api-input-guard';
// import { z } from 'zod';
//
// const CreateProjectSchema = z.object({
//   name: typeValidators.name(),
//   email: typeValidators.email(),
//   message: typeValidators.message(),
// });
//
// export async function POST(request: NextRequest) {
//   const result = await validateAndParseRequest(request, CreateProjectSchema, {
//     maxSize: INPUT_LIMITS.MEDIUM_PAYLOAD,
//     context: 'Create project'
//   });
//
//   if (!result.success) return result.error;
//   const { name, email, message } = result.data;
//   // ... use validated data
// }
//
// Example 2: Route with custom size limit
// ────────────────────────────────────────
// const result = await validateAndParseRequest(request, FileUploadSchema, {
//   maxSize: INPUT_LIMITS.LARGE_PAYLOAD, // 100KB for files
//   context: 'File upload'
// });
//
// Example 3: Manual structure validation before parsing
// ───────────────────────────────────────────────────────
// const sizeError = validateRequestSize(request, 5 * 1024, 'API call');
// if (sizeError) return sizeError;
//
// const body = await request.json();
// const structureError = validatePayloadStructure(body, 'API call');
// if (structureError) return badRequest(structureError);
// // ... now safe to use body
