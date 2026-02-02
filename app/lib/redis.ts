import { createClient, RedisClientType } from 'redis';

// ============================================================================
// Redis Client Setup - Connection to the Fast Temporary Storage
// ============================================================================
// Redis is like a whiteboard in the kitchen - fast, temporary storage
// Perfect for:
// - Session data (who's logged in)
// - Caching API responses (don't recalculate the same data)
// - Rate limiting (track how many requests per user)
// - Real-time counters
//
// Configured via REDIS_URL environment variable (Upstash Redis in production)

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// During build, Redis isn't available. Skip connection attempts during build.
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

// ============================================================================
// Create Redis Client
// ============================================================================
// The client is created but not connected yet
// Connection happens lazily when we first use it

const redis: RedisClientType = createClient({
  url: redisUrl,

  // Socket options for reliability
  socket: {
    // Reconnect if connection drops (useful for network hiccups)
    reconnectStrategy: (retries: number) => {
      // CRITICAL: Limit reconnection attempts to prevent infinite loops
      if (retries > 10) {
        console.error('[Redis] Max reconnection attempts (10) reached, giving up');
        // Return Error to stop reconnecting
        return new Error('Max reconnection attempts reached');
      }

      // Exponential backoff with jitter to prevent thundering herd
      const baseDelay = Math.min(1000 * Math.pow(2, retries), 3000);
      const jitter = Math.random() * 500; // 0-500ms jitter
      const delay = baseDelay + jitter;

      console.warn(`[Redis] Reconnection attempt ${retries + 1}/10 in ${delay}ms`);
      return delay;
    },

    // During build, don't wait forever for connection
    connectTimeout: isBuildTime ? 100 : 5000,

    // Command timeout intentionally omitted; use guarded wrappers for operations to apply timeouts when needed
  },
});

// ============================================================================
// Connection State Tracking
// ============================================================================
// Track connection failures to prevent cascading errors

let connectionAttempts = 0;
let lastConnectionError: Date | null = null;
const MAX_CONNECTION_FAILURES = 3;
const CONNECTION_FAILURE_WINDOW_MS = 60000; // 1 minute

// ============================================================================
// Error Handling
// ============================================================================
// Handle connection errors gracefully
// If Redis goes down, the app should still work (just without caching)

redis.on('error', (error) => {
  console.error('[Redis] Error:', error);

  // Track connection failures
  if (error.message?.includes('connect') || error.message?.includes('ECONNREFUSED')) {
    connectionAttempts++;
    lastConnectionError = new Date();

    if (connectionAttempts >= MAX_CONNECTION_FAILURES) {
      console.error(`[Redis] ${MAX_CONNECTION_FAILURES} connection failures detected - circuit breaker engaged`);
    }
  }
});

redis.on('connect', () => {
  console.log('[Redis] Connected successfully');
  // Reset failure counter on successful connection
  connectionAttempts = 0;
  lastConnectionError = null;
});

redis.on('ready', () => {
  console.log('[Redis] Ready to accept commands');
});

redis.on('reconnecting', () => {
  console.warn('[Redis] Reconnecting...');
});

redis.on('end', () => {
  console.warn('[Redis] Connection closed');
});

// ============================================================================
// Ensure Connection Before Use
// ============================================================================
// This helper ensures the client is connected before performing operations
// Handles the async nature of Redis connections properly
// During build time, skip connection to avoid timeouts

/**
 * Ensures Redis connection is established before operations
 * Implements circuit breaker pattern to prevent cascading failures
 *
 * @throws Error if circuit breaker is open (too many recent failures)
 */
async function ensureConnected(): Promise<void> {
  // Skip Redis connection during build - pages will be static
  if (isBuildTime) {
    return;
  }

  // Circuit breaker: if too many failures recently, fail fast
  if (lastConnectionError) {
    const timeSinceLastError = Date.now() - lastConnectionError.getTime();
    if (
      connectionAttempts >= MAX_CONNECTION_FAILURES &&
      timeSinceLastError < CONNECTION_FAILURE_WINDOW_MS
    ) {
      throw new Error(
        `Redis circuit breaker open: ${connectionAttempts} failures in last ${CONNECTION_FAILURE_WINDOW_MS / 1000}s`
      );
    }

    // Reset if outside failure window
    if (timeSinceLastError >= CONNECTION_FAILURE_WINDOW_MS) {
      connectionAttempts = 0;
      lastConnectionError = null;
    }
  }

  if (!redis.isOpen) {
    try {
      await redis.connect();
    } catch (error) {
      console.error('[Redis] Failed to connect:', error);
      connectionAttempts++;
      lastConnectionError = new Date();
      // Don't throw - let the app continue without cache
      throw error;
    }
  }
}

// ============================================================================
// Wrapper for Safe Redis Operations
// ============================================================================
// Use this to ensure connection is established before any Redis operation

async function ping(): Promise<string> {
  await ensureConnected();
  return redis.ping();
}

async function get(key: string): Promise<string | null> {
  try {
    await ensureConnected();
    return await redis.get(key);
  } catch (error) {
    console.error(`[Redis] GET ${key} failed:`, error);
    return null; // Graceful degradation
  }
}

async function set(key: string, value: string, options?: { EX?: number }): Promise<string | null> {
  try {
    await ensureConnected();
    return await redis.set(key, value, options);
  } catch (error) {
    console.error(`[Redis] SET ${key} failed:`, error);
    return null; // Graceful degradation
  }
}

async function setEx(key: string, seconds: number, value: string): Promise<string> {
  try {
    await ensureConnected();
    return await redis.setEx(key, seconds, value);
  } catch (error) {
    console.error(`[Redis] SETEX ${key} failed:`, error);
    throw error; // Caller handles failure
  }
}

async function del(...keys: string[]): Promise<number> {
  try {
    await ensureConnected();
    return await redis.del(keys);
  } catch (error) {
    console.error(`[Redis] DEL ${keys.join(', ')} failed:`, error);
    return 0; // Graceful degradation
  }
}

async function quit(): Promise<string> {
  if (redis.isOpen) {
    return redis.quit();
  }
  return 'OK';
}

// Additional methods used by integration tests
async function keys(pattern: string): Promise<string[]> {
  try {
    await ensureConnected();
    return await redis.keys(pattern);
  } catch (error) {
    console.error(`[Redis] KEYS ${pattern} failed:`, error);
    return []; // Graceful degradation
  }
}

async function setex(key: string, seconds: number, value: string): Promise<string> {
  try {
    await ensureConnected();
    return await redis.setEx(key, seconds, value);
  } catch (error) {
    console.error(`[Redis] SETEX ${key} failed:`, error);
    throw error; // Caller handles failure
  }
}

async function incr(key: string): Promise<number> {
  try {
    await ensureConnected();
    return await redis.incr(key);
  } catch (error) {
    console.error(`[Redis] INCR ${key} failed:`, error);
    throw error; // Counters should fail loudly
  }
}

async function rpush(key: string, ...values: string[]): Promise<number> {
  try {
    await ensureConnected();
    return await redis.rPush(key, values);
  } catch (error) {
    console.error(`[Redis] RPUSH ${key} failed:`, error);
    throw error; // List operations should fail loudly
  }
}

async function lrange(key: string, start: number, stop: number): Promise<string[]> {
  try {
    await ensureConnected();
    return await redis.lRange(key, start, stop);
  } catch (error) {
    console.error(`[Redis] LRANGE ${key} failed:`, error);
    return []; // Graceful degradation
  }
}

// ============================================================================
// Graceful Shutdown Handling
// ============================================================================
// Ensure Redis connection is properly closed when process exits
// Prevents connection leaks and ensures clean shutdown

let isShuttingDown = false;

async function gracefulShutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    return; // Already shutting down
  }

  isShuttingDown = true;
  console.log(`[Redis] Received ${signal}, closing connection...`);

  try {
    if (redis.isOpen) {
      await redis.quit();
      console.log('[Redis] Connection closed successfully');
    }
  } catch (error) {
    console.error('[Redis] Error during shutdown:', error);
  }
}

// Register shutdown handlers for all common exit scenarios
// SIGTERM: Docker/Kubernetes graceful shutdown
// SIGINT: Ctrl+C in terminal
// beforeExit: Node.js event loop is about to exit
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('beforeExit', () => gracefulShutdown('beforeExit'));

  // Handle uncaught errors that would crash the process
  process.on('uncaughtException', async (error) => {
    console.error('[Redis] Uncaught exception, closing connection:', error);
    await gracefulShutdown('uncaughtException');
    process.exit(1);
  });

  process.on('unhandledRejection', async (reason) => {
    console.error('[Redis] Unhandled rejection, closing connection:', reason);
    await gracefulShutdown('unhandledRejection');
    process.exit(1);
  });
}

// Export a wrapper object with connection-safe methods
const safeRedis = {
  ping,
  get,
  set,
  setEx,
  del,
  quit,
  keys,
  setex,
  incr,
  rpush,
  lrange,
  // Expose raw client for advanced use cases
  raw: redis,
};

export { safeRedis as redis };

// ============================================================================
// Usage Examples
// ============================================================================
// Store a value:
// await redis.set('user:123:name', 'John', { EX: 3600 }); // expires in 1 hour
//
// Retrieve a value:
// const name = await redis.get('user:123:name');
//
// Cache API response:
// const cacheKey = `api:users:${userId}`;
// let userData = await redis.get(cacheKey);
// if (!userData) {
//   userData = await fetchFromDatabase();
//   await redis.setEx(cacheKey, 3600, JSON.stringify(userData));
// }
