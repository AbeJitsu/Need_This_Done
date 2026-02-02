// ============================================================================
// Error Recovery Helper - Intelligent Error Classification & Recovery
// ============================================================================
// What: Analyzes errors to determine root cause and suggest recovery actions
// Why: Different errors need different handling (retry, fail, log, alert)
// How: Classify error by type/code, suggest action, prevent silent failures
//
// PROBLEMS BEING SOLVED:
// - Swallowing all errors with generic "server error" messages
// - No distinction between transient vs permanent failures
// - Retrying errors that will never succeed (bad data, permissions)
// - Missing alerts for errors that need immediate attention
// - Unclear logs make debugging production issues difficult

import { PostgrestError } from '@supabase/supabase-js';

// ============================================================================
// Error Classification
// ============================================================================

export type ErrorSeverity = 'transient' | 'permanent' | 'critical';

export interface ErrorClassification {
  severity: ErrorSeverity;
  code: string;
  message: string;
  retriable: boolean;
  shouldLog: boolean;
  shouldAlert: boolean;
  userMessage: string;
  debugInfo: Record<string, unknown>;
}

/**
 * Comprehensive error classification for database operations
 *
 * Classification rules:
 * - TRANSIENT: Retry will likely succeed (network, pool, temporary unavailability)
 * - PERMANENT: Retry will never succeed (data validation, permissions, schema errors)
 * - CRITICAL: Permanent but indicates serious problem (corruption, unauthorized access)
 *
 * @param error - Any error object from any source
 * @param context - Operation that was being performed
 * @returns Classification with severity, recoverability, and recommended actions
 */
export function classifyError(
  error: unknown,
  context: string = 'Database operation'
): ErrorClassification {
  // Default classification (unknown error)
  const defaultClass: ErrorClassification = {
    severity: 'permanent',
    code: 'UNKNOWN_ERROR',
    message: String(error),
    retriable: false,
    shouldLog: true,
    shouldAlert: true,
    userMessage: 'An unexpected error occurred. Please try again.',
    debugInfo: { context, originalError: String(error) },
  };

  if (!error) {
    return defaultClass;
  }

  // Handle Supabase PostgrestError
  if (isPgError(error)) {
    return classifyPostgresError(error, context);
  }

  // Handle timeout errors
  if (isTimeoutError(error)) {
    return {
      severity: 'transient',
      code: 'TIMEOUT',
      message: 'Operation timed out',
      retriable: true,
      shouldLog: false, // Timeouts are expected in production
      shouldAlert: false,
      userMessage: 'Service is responding slowly. Please try again.',
      debugInfo: { context, timeout: (error as any).timeoutMs },
    };
  }

  // Handle network errors
  if (isNetworkError(error)) {
    return {
      severity: 'transient',
      code: 'NETWORK_ERROR',
      message: String(error),
      retriable: true,
      shouldLog: false,
      shouldAlert: false,
      userMessage: 'Network connection issue. Please check your connection and try again.',
      debugInfo: { context },
    };
  }

  // Handle validation/type errors
  if (isValidationError(error)) {
    return {
      severity: 'permanent',
      code: 'VALIDATION_ERROR',
      message: String(error),
      retriable: false,
      shouldLog: true,
      shouldAlert: false,
      userMessage: 'The provided data is invalid. Please check your input and try again.',
      debugInfo: { context, errorMessage: (error as Error).message },
    };
  }

  // Handle memory/resource errors
  if (isResourceError(error)) {
    return {
      severity: 'critical',
      code: 'RESOURCE_ERROR',
      message: String(error),
      retriable: false,
      shouldLog: true,
      shouldAlert: true,
      userMessage: 'The service is under heavy load. Please try again in a moment.',
      debugInfo: { context },
    };
  }

  return defaultClass;
}

// ============================================================================
// Error Type Detection
// ============================================================================

function isPgError(error: unknown): error is PostgrestError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error &&
    typeof (error as any).code === 'string'
  );
}

function isTimeoutError(error: unknown): boolean {
  if (!error) return false;
  const msg = String(error).toLowerCase();
  return (
    msg.includes('timeout') ||
    msg.includes('timed out') ||
    msg.includes('exceeded')
  );
}

function isNetworkError(error: unknown): boolean {
  if (!error) return false;
  const msg = String(error).toLowerCase();
  const networkCodes = [
    'econnrefused',
    'econnreset',
    'econnaborted',
    'etimedout',
    'enetunreach',
    'ehostunreach',
    'enotfound',
    'eai_again',
  ];
  return networkCodes.some(code => msg.includes(code));
}

function isValidationError(error: unknown): boolean {
  if (!error) return false;
  const msg = String(error).toLowerCase();
  const validationPatterns = [
    'syntaxerror',
    'typeerror',
    'invalid',
    'malformed',
    'unexpected',
    'bad request',
  ];
  return validationPatterns.some(p => msg.includes(p));
}

function isResourceError(error: unknown): boolean {
  if (!error) return false;
  const msg = String(error).toLowerCase();
  const resourcePatterns = [
    'out of memory',
    'enomem',
    'emfile',
    'too many',
    'exhausted',
    'circuit breaker',
  ];
  return resourcePatterns.some(p => msg.includes(p));
}

// ============================================================================
// PostgreSQL Error Classification
// ============================================================================

/**
 * Classifies PostgreSQL error codes to determine action
 * Reference: https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
function classifyPostgresError(
  error: PostgrestError,
  context: string
): ErrorClassification {
  const code = error.code || 'UNKNOWN';
  const message = error.message || String(error);

  // Connection errors (Class 08) - TRANSIENT
  if (code.startsWith('08')) {
    return {
      severity: 'transient',
      code: `PG_${code}`,
      message,
      retriable: true,
      shouldLog: false,
      shouldAlert: false,
      userMessage: 'Database connection issue. Please try again.',
      debugInfo: { context, pgCode: code },
    };
  }

  // Integrity constraint violations (Class 23) - PERMANENT
  if (code === '23505') {
    // Unique constraint violation
    return {
      severity: 'permanent',
      code: 'DUPLICATE_KEY',
      message: 'This record already exists',
      retriable: false,
      shouldLog: false,
      shouldAlert: false,
      userMessage: 'This record already exists. Please check your data.',
      debugInfo: { context, pgCode: code, detail: error.details },
    };
  }

  if (code === '23503') {
    // Foreign key constraint violation
    return {
      severity: 'permanent',
      code: 'FOREIGN_KEY_VIOLATION',
      message: 'Referenced record not found',
      retriable: false,
      shouldLog: true,
      shouldAlert: false,
      userMessage: 'The referenced record does not exist.',
      debugInfo: { context, pgCode: code, detail: error.details },
    };
  }

  if (code === '23502') {
    // Not null constraint violation
    return {
      severity: 'permanent',
      code: 'NOT_NULL_VIOLATION',
      message: 'Required field is missing',
      retriable: false,
      shouldLog: true,
      shouldAlert: false,
      userMessage: 'Required information is missing.',
      debugInfo: { context, pgCode: code, detail: error.details },
    };
  }

  // Permission errors (Class 42) - PERMANENT/CRITICAL
  if (code === '42P01') {
    // Table doesn't exist - indicates schema mismatch
    return {
      severity: 'critical',
      code: 'TABLE_NOT_FOUND',
      message: 'Database schema mismatch',
      retriable: false,
      shouldLog: true,
      shouldAlert: true,
      userMessage: 'Service misconfiguration. Please contact support.',
      debugInfo: { context, pgCode: code, detail: error.details },
    };
  }

  if (code === '42703') {
    // Column doesn't exist - indicates schema mismatch
    return {
      severity: 'critical',
      code: 'COLUMN_NOT_FOUND',
      message: 'Database schema mismatch',
      retriable: false,
      shouldLog: true,
      shouldAlert: true,
      userMessage: 'Service misconfiguration. Please contact support.',
      debugInfo: { context, pgCode: code, detail: error.details },
    };
  }

  // Query syntax errors (Class 42) - PERMANENT
  if (code.startsWith('42')) {
    return {
      severity: 'permanent',
      code: `PG_SYNTAX_${code}`,
      message: 'Invalid query executed',
      retriable: false,
      shouldLog: true,
      shouldAlert: false,
      userMessage: 'An unexpected error occurred. Please contact support.',
      debugInfo: { context, pgCode: code, detail: error.details },
    };
  }

  // Insufficient privilege (Class 42000) - CRITICAL
  if (code === '42000') {
    return {
      severity: 'critical',
      code: 'PERMISSION_DENIED',
      message: 'Insufficient permissions for operation',
      retriable: false,
      shouldLog: true,
      shouldAlert: true,
      userMessage: 'You do not have permission for this operation.',
      debugInfo: { context, pgCode: code },
    };
  }

  // Pool errors (Class 53) - TRANSIENT
  if (code === '53300') {
    // Too many connections
    return {
      severity: 'transient',
      code: 'TOO_MANY_CONNECTIONS',
      message: 'Database connection pool exhausted',
      retriable: true,
      shouldLog: false,
      shouldAlert: false,
      userMessage: 'Service is experiencing high load. Please try again.',
      debugInfo: { context, pgCode: code },
    };
  }

  if (code === '53400') {
    // Configuration limit exceeded
    return {
      severity: 'transient',
      code: 'CONFIG_LIMIT_EXCEEDED',
      message: 'Database configuration limit exceeded',
      retriable: true,
      shouldLog: false,
      shouldAlert: false,
      userMessage: 'Service is experiencing high load. Please try again.',
      debugInfo: { context, pgCode: code },
    };
  }

  // System errors (Class 58) - TRANSIENT (usually temporary)
  if (code.startsWith('58')) {
    return {
      severity: 'transient',
      code: `PG_SYSTEM_${code}`,
      message: 'System error on database server',
      retriable: true,
      shouldLog: false,
      shouldAlert: false,
      userMessage: 'The database server is experiencing issues. Please try again.',
      debugInfo: { context, pgCode: code },
    };
  }

  // Default classification for unknown postgres errors
  return {
    severity: 'permanent',
    code: `PG_${code}`,
    message,
    retriable: false,
    shouldLog: true,
    shouldAlert: false,
    userMessage: 'An unexpected database error occurred.',
    debugInfo: { context, pgCode: code, detail: error.details },
  };
}

// ============================================================================
// Error Logging Utilities
// ============================================================================

/**
 * Logs an error with appropriate severity based on classification
 * Prevents log spam from transient errors and ensures critical issues are flagged
 *
 * @param error - Error to log
 * @param context - Operation context
 * @param classification - Pre-classified error (optional, will classify if not provided)
 */
export function logError(
  error: unknown,
  context: string,
  classification?: ErrorClassification
): ErrorClassification {
  const classified = classification || classifyError(error, context);

  if (!classified.shouldLog) {
    return classified;
  }

  const logLevel =
    classified.severity === 'critical'
      ? 'error'
      : classified.severity === 'permanent'
        ? 'warn'
        : 'debug';

  console[logLevel as keyof typeof console](
    `[${classified.code}] ${context}:`,
    classified.message,
    classified.debugInfo
  );

  // TODO: Send critical errors to error tracking service (Sentry, etc.)
  if (classified.shouldAlert && classified.severity === 'critical') {
    // sendErrorAlert(classified);
  }

  return classified;
}

// ============================================================================
// Usage Example
// ============================================================================
//
// import { classifyError, logError } from '@/lib/error-recovery';
//
// export async function POST(request: NextRequest) {
//   try {
//     const { data, error } = await supabase.from('orders').insert(orderData);
//
//     if (error) {
//       const classified = classifyError(error, 'Create order');
//       logError(error, 'Create order', classified);
//
//       if (classified.retriable) {
//         return NextResponse.json(
//           { error: classified.userMessage },
//           { status: 503 } // Service Unavailable - can retry
//         );
//       } else {
//         return NextResponse.json(
//           { error: classified.userMessage },
//           { status: 400 } // Bad Request - don't retry
//         );
//       }
//     }
//
//     return NextResponse.json(data);
//   } catch (error) {
//     const classified = logError(error, 'Create order');
//     return NextResponse.json(
//       { error: classified.userMessage },
//       { status: classified.retriable ? 503 : 400 }
//     );
//   }
// }
