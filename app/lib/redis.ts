import { createClient } from 'redis';

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
// Environment variable comes from docker-compose.yml
// redis://redis:6379 = container name:port inside Docker

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// ============================================================================
// Create and Connect Redis Client
// ============================================================================
// The client is created but not connected yet
// Connection happens when we call client.connect()

const redis = createClient({
  url: redisUrl,

  // Socket options for reliability
  socket: {
    // Reconnect if connection drops (useful for network hiccups)
    reconnectStrategy: (retries: number) => {
      if (retries > 10) {
        // Give up after 10 failed reconnection attempts
        return new Error('Max reconnection attempts reached');
      }
      // Wait 1 second before retrying
      return Math.min(1000 * Math.pow(2, retries), 3000);
    },
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
// Connect to Redis
// ============================================================================
// Establish the connection
// This happens once when the app starts

redis.connect().catch((error) => {
  console.error('Failed to connect to Redis:', error);
  // Don't throw - the app can still work without caching
  // Just log it and continue
});

export { redis };

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
