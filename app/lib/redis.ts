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
      if (retries > 10) {
        // Give up after 10 failed reconnection attempts
        return new Error('Max reconnection attempts reached');
      }
      // Wait progressively longer between retries (max 3 seconds)
      return Math.min(1000 * Math.pow(2, retries), 3000);
    },

    // During build, don't wait forever for connection
    connectTimeout: isBuildTime ? 100 : 5000,
  },
});

// ============================================================================
// Error Handling
// ============================================================================
// Handle connection errors gracefully
// If Redis goes down, the app should still work (just without caching)

redis.on('error', (error) => {
  console.error('Redis error:', error);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('ready', () => {
  console.log('Redis is ready');
});

// ============================================================================
// Ensure Connection Before Use
// ============================================================================
// This helper ensures the client is connected before performing operations
// Handles the async nature of Redis connections properly
// During build time, skip connection to avoid timeouts

async function ensureConnected(): Promise<void> {
  // Skip Redis connection during build - pages will be static
  if (isBuildTime) {
    return;
  }

  if (!redis.isOpen) {
    try {
      await redis.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      // Don't throw - let the app continue without cache
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
  await ensureConnected();
  return redis.get(key);
}

async function set(key: string, value: string, options?: { EX?: number }): Promise<string | null> {
  await ensureConnected();
  return redis.set(key, value, options);
}

async function setEx(key: string, seconds: number, value: string): Promise<string> {
  await ensureConnected();
  return redis.setEx(key, seconds, value);
}

async function del(...keys: string[]): Promise<number> {
  await ensureConnected();
  return redis.del(keys);
}

async function quit(): Promise<string> {
  if (redis.isOpen) {
    return redis.quit();
  }
  return 'OK';
}

// Additional methods used by integration tests
async function keys(pattern: string): Promise<string[]> {
  await ensureConnected();
  return redis.keys(pattern);
}

async function setex(key: string, seconds: number, value: string): Promise<string> {
  await ensureConnected();
  return redis.setEx(key, seconds, value);
}

async function incr(key: string): Promise<number> {
  await ensureConnected();
  return redis.incr(key);
}

async function rpush(key: string, ...values: string[]): Promise<number> {
  await ensureConnected();
  return redis.rPush(key, values);
}

async function lrange(key: string, start: number, stop: number): Promise<string[]> {
  await ensureConnected();
  return redis.lRange(key, start, stop);
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
