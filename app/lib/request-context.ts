// ============================================================================
// Request Context - Correlation IDs for Distributed Tracing
// ============================================================================
// What: Adds unique correlation IDs to all API requests for logging/debugging
// Why: Correlates logs across multiple services for end-to-end tracing
// How: Stores correlation ID in AsyncLocalStorage, accessible in all downstream calls

import { AsyncLocalStorage } from 'async_hooks';
import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';

// ============================================================================
// AsyncLocalStorage for Request Context
// ============================================================================
// Stores request-specific data (correlation ID) that persists through async calls
// without being passed as function parameters

interface RequestContext {
  correlationId: string;
  startTime: number;
  userId?: string;
}

const requestContext = new AsyncLocalStorage<RequestContext>();

// ============================================================================
// Context Management
// ============================================================================

/**
 * Initialize request context with correlation ID
 * Call this at the very start of each API route
 *
 * @param request - NextRequest
 * @param userId - Optional user ID for request
 * @returns Correlation ID
 */
export function initializeRequestContext(
  request: NextRequest,
  userId?: string
): string {
  // Check if request already has correlation ID header
  const incomingCorrelationId = request.headers.get('x-correlation-id');

  const correlationId = incomingCorrelationId || randomUUID();

  // Store context for use in downstream calls
  requestContext.run(
    {
      correlationId,
      startTime: Date.now(),
      userId,
    },
    () => {
      // Empty - just establish the context
    }
  );

  return correlationId;
}

/**
 * Get the current request correlation ID
 * Returns a unique ID if not in request context (for edge cases)
 */
export function getCorrelationId(): string {
  return requestContext.getStore()?.correlationId || randomUUID();
}

/**
 * Get the current request context
 */
export function getRequestContext(): RequestContext | undefined {
  return requestContext.getStore();
}

/**
 * Run a function within a request context
 * Useful for async operations that need context access
 */
export function runInContext<T>(
  context: RequestContext,
  fn: () => Promise<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    requestContext.run(context, async () => {
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  });
}

// ============================================================================
// Structured Logger with Correlation ID
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  correlationId: string;
  message: string;
  metadata?: Record<string, unknown>;
  error?: { message: string; stack?: string };
}

/**
 * Structured logging function that includes correlation ID
 */
export function logStructured(
  level: LogLevel,
  message: string,
  metadata?: Record<string, unknown>,
  error?: Error
): void {
  const context = getRequestContext();
  const correlationId = context?.correlationId || 'no-context';

  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    correlationId,
    message,
    metadata,
    error: error ? { message: error.message, stack: error.stack } : undefined,
  };

  // Use console with structured format
  if (level === 'error') {
    console.error(JSON.stringify(logEntry));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}

// Convenience functions
export const logger = {
  debug: (message: string, metadata?: Record<string, unknown>) =>
    logStructured('debug', message, metadata),
  info: (message: string, metadata?: Record<string, unknown>) =>
    logStructured('info', message, metadata),
  warn: (message: string, metadata?: Record<string, unknown>) =>
    logStructured('warn', message, metadata),
  error: (message: string, error?: Error, metadata?: Record<string, unknown>) =>
    logStructured('error', message, metadata, error),
};

// ============================================================================
// Response Headers
// ============================================================================

/**
 * Create response headers that include correlation ID
 * Add to NextResponse.json() second parameter
 */
export function createResponseHeaders(): Record<string, string> {
  const correlationId = getCorrelationId();
  return {
    'X-Correlation-Id': correlationId,
    'X-Request-Timestamp': new Date().toISOString(),
  };
}

// ============================================================================
// Usage Examples
// ============================================================================
//
// Example 1: Initialize context and use logger
// ──────────────────────────────────────────
// import { initializeRequestContext, logger, createResponseHeaders } from '@/lib/request-context';
//
// export async function POST(request: NextRequest) {
//   const { data } = await supabase.auth.getUser();
//   initializeRequestContext(request, data?.user?.id);
//
//   try {
//     logger.info('Processing order', { orderId: '123' });
//     // ... do work
//     return NextResponse.json({ success: true }, {
//       headers: createResponseHeaders()
//     });
//   } catch (error) {
//     logger.error('Order failed', error, { orderId: '123' });
//     return NextResponse.json({ error: 'Failed' }, {
//       status: 500,
//       headers: createResponseHeaders()
//     });
//   }
// }
//
// Example 2: Downstream function with context
// ──────────────────────────────────────────
// // In any async function called from the route handler:
// import { getCorrelationId, logger } from '@/lib/request-context';
//
// async function processOrder(orderId: string) {
//   const correlationId = getCorrelationId();
//   logger.info('Processing order', { orderId, correlationId });
//   // Do work - logs will automatically include correlationId
// }
//
// Example 3: Response with correlation ID header
// ──────────────────────────────────────────────
// return NextResponse.json(data, {
//   headers: createResponseHeaders()
// });
// Client can extract X-Correlation-Id header for error reporting
