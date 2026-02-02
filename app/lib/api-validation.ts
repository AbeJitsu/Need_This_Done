import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError, ZodSchema } from 'zod';
import { badRequest } from './api-errors';

// ============================================================================
// API Request Validation Middleware
// ============================================================================
// What: Type-safe request validation using Zod schemas
// Why: Prevents malformed input from causing DB errors, crashes, or bugs
// How: Validates and transforms request body/params before handler execution
//
// Usage:
//   export async function POST(request: NextRequest) {
//     const result = await validateRequest(request, CreateProjectSchema);
//     if (!result.success) return result.error;
//     const { name, email } = result.data; // Type-safe!
//     ...
//   }

// ============================================================================
// Common Field Schemas - Reusable Validation Rules
// ============================================================================

export const commonSchemas = {
  // Email validation with normalization
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .transform((s) => s.trim().toLowerCase()),

  // Non-empty trimmed string
  nonEmptyString: z
    .string()
    .min(1, 'This field is required')
    .transform((s) => s.trim()),

  // Optional trimmed string (null if empty)
  optionalString: z
    .string()
    .optional()
    .transform((s) => s?.trim() || null),

  // Positive integer (for amounts in cents, IDs, counts)
  positiveInt: z
    .number()
    .int('Must be an integer')
    .positive('Must be positive'),

  // Non-negative integer (for quantities, zero allowed)
  nonNegativeInt: z
    .number()
    .int('Must be an integer')
    .nonnegative('Must be non-negative'),

  // UUID validation
  uuid: z
    .string()
    .uuid('Invalid UUID format'),

  // ISO date string
  isoDate: z
    .string()
    .datetime('Invalid date format'),

  // Cart ID (Medusa cart IDs are prefixed strings)
  cartId: z
    .string()
    .min(1, 'Cart ID is required')
    .regex(/^cart_[a-zA-Z0-9]+$/, 'Invalid cart ID format'),

  // Reference number (uppercase alphanumeric)
  refNumber: z
    .string()
    .min(1, 'Reference number is required')
    .transform((s) => s.trim().toUpperCase()),

  // URL validation
  url: z
    .string()
    .url('Invalid URL format'),

  // Phone number (simple validation, adjust regex as needed)
  phone: z
    .string()
    .regex(/^[0-9+\s()-]+$/, 'Invalid phone number format')
    .transform((s) => s.trim()),

  // Slug (URL-safe string)
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Invalid slug format (lowercase letters, numbers, hyphens only)'),
};

// ============================================================================
// Validation Middleware Function
// ============================================================================

export interface ValidationSuccess<T> {
  success: true;
  data: T;
}

export interface ValidationFailure {
  success: false;
  error: NextResponse;
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

/**
 * Validate request body against a Zod schema
 *
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Validation result with type-safe data or error response
 */
export async function validateRequest<T extends ZodSchema>(
  request: NextRequest,
  schema: T
): Promise<ValidationResult<z.infer<T>>> {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      // Extract first error message for user-friendly response
      const firstError = parsed.error.issues[0];
      const message = firstError.path.length > 0
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
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: badRequest('Invalid JSON in request body'),
      };
    }

    // Unexpected error during validation
    console.error('Request validation error:', error);
    return {
      success: false,
      error: badRequest('Failed to validate request'),
    };
  }
}

/**
 * Validate URL search params against a Zod schema
 *
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Validation result with type-safe data or error response
 */
export function validateSearchParams<T extends ZodSchema>(
  request: NextRequest,
  schema: T
): ValidationResult<z.infer<T>> {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const parsed = schema.safeParse(params);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      const message = firstError.path.length > 0
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
    console.error('Search params validation error:', error);
    return {
      success: false,
      error: badRequest('Failed to validate search parameters'),
    };
  }
}

/**
 * Validate route params (e.g., [id]) against a Zod schema
 *
 * @param params - Route params object
 * @param schema - Zod schema to validate against
 * @returns Validation result with type-safe data or error response
 */
export function validateParams<T extends ZodSchema>(
  params: Record<string, string | string[]>,
  schema: T
): ValidationResult<z.infer<T>> {
  try {
    const parsed = schema.safeParse(params);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      const message = firstError.path.length > 0
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
    console.error('Params validation error:', error);
    return {
      success: false,
      error: badRequest('Failed to validate route parameters'),
    };
  }
}

// ============================================================================
// Common Request Schemas - Ready-to-Use Validators
// ============================================================================

export const ProjectSubmissionSchema = z.object({
  name: commonSchemas.nonEmptyString,
  email: commonSchemas.email,
  company: commonSchemas.optionalString,
  service: commonSchemas.optionalString,
  message: commonSchemas.nonEmptyString,
});

export const CreateQuoteSchema = z.object({
  customerName: commonSchemas.nonEmptyString,
  customerEmail: commonSchemas.email,
  projectId: commonSchemas.uuid.optional(),
  totalAmount: commonSchemas.positiveInt,
  notes: commonSchemas.optionalString,
});

export const AuthorizeQuoteSchema = z.object({
  quoteRef: commonSchemas.refNumber,
  email: commonSchemas.email,
});

export const CartIdParamSchema = z.object({
  id: commonSchemas.cartId,
});

export const PageSlugParamSchema = z.object({
  slug: commonSchemas.slug,
});

export const UpdatePageContentSchema = z.object({
  content: z.record(z.unknown()), // JSON object, structure validated by page-specific types
});

// ============================================================================
// Usage Examples
// ============================================================================
//
// Example 1: Validate POST request body
// ──────────────────────────────────────
// export async function POST(request: NextRequest) {
//   const result = await validateRequest(request, ProjectSubmissionSchema);
//   if (!result.success) return result.error;
//
//   const { name, email, message } = result.data; // Type-safe!
//   // ... use validated data
// }
//
// Example 2: Validate search params
// ──────────────────────────────────
// const CartParamsSchema = z.object({
//   id: commonSchemas.cartId,
// });
//
// export async function GET(request: NextRequest) {
//   const result = validateSearchParams(request, CartParamsSchema);
//   if (!result.success) return result.error;
//
//   const { id } = result.data; // Type-safe!
//   // ... fetch cart
// }
//
// Example 3: Validate route params
// ─────────────────────────────────
// export async function GET(
//   request: NextRequest,
//   { params }: { params: { slug: string } }
// ) {
//   const result = validateParams(params, PageSlugParamSchema);
//   if (!result.success) return result.error;
//
//   const { slug } = result.data; // Type-safe and validated!
//   // ... fetch page
// }
