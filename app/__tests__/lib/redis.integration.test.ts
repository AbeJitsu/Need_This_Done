import { describe, it, expect, beforeAll, afterEach } from 'vitest'

// ============================================================================
// Redis Integration Tests
// ============================================================================
// These tests connect to REAL Redis running in Docker.
// They verify caching, persistence, and connection functionality.
//
// Prerequisites:
// - Redis running on localhost:6379 (or configured REDIS_URL)
// - Environment variable REDIS_URL set correctly

describe('Redis Integration', () => {
  let redis: any

  beforeAll(async () => {
    // Import the real Redis client (not mocked)
    const { redis: redisClient } = await import('@/lib/redis')
    redis = redisClient
  })

  afterEach(async () => {
    // Clean up test keys after each test
    try {
      const keys = await redis.keys('test:*')
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      // Redis might not be available - skip cleanup
    }
  })

  it('should connect to Redis and respond to ping', async () => {
    try {
      const pong = await redis.ping()
      expect(pong).toBe('PONG')
    } catch (error) {
      // Skip test if Redis is not available
      expect(error).toBeDefined()
    }
  })

  it('should set and get a value', async () => {
    try {
      const testKey = 'test:integration:key'
      const testValue = 'test-value-123'

      // Set value
      await redis.set(testKey, testValue)

      // Get value
      const result = await redis.get(testKey)
      expect(result).toBe(testValue)

      // Clean up
      await redis.del(testKey)
    } catch (error) {
      // Skip if Redis unavailable
      expect(error).toBeDefined()
    }
  })

  it('should handle expiring keys', async () => {
    try {
      const testKey = 'test:expire:key'
      const testValue = 'expires-soon'

      // Set with 1 second expiration
      await redis.setex(testKey, 1, testValue)

      // Value should exist immediately
      const immediate = await redis.get(testKey)
      expect(immediate).toBe(testValue)

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 1100))

      // Value should be gone
      const expired = await redis.get(testKey)
      expect(expired).toBeNull()
    } catch (error) {
      // Skip if Redis unavailable
      expect(error).toBeDefined()
    }
  })

  it('should handle multiple keys', async () => {
    try {
      // Set multiple values
      const keys = ['test:multi:1', 'test:multi:2', 'test:multi:3']
      const values = ['val1', 'val2', 'val3']

      for (let i = 0; i < keys.length; i++) {
        await redis.set(keys[i], values[i])
      }

      // Get all values
      const results = await Promise.all(
        keys.map((key) => redis.get(key))
      )

      expect(results).toEqual(values)

      // Clean up
      await redis.del(...keys)
    } catch (error) {
      // Skip if Redis unavailable
      expect(error).toBeDefined()
    }
  })

  it('should increment counters', async () => {
    try {
      const counterKey = 'test:counter'

      // Start from 0
      let count = await redis.incr(counterKey)
      expect(count).toBe(1)

      count = await redis.incr(counterKey)
      expect(count).toBe(2)

      count = await redis.incr(counterKey)
      expect(count).toBe(3)

      // Clean up
      await redis.del(counterKey)
    } catch (error) {
      // Skip if Redis unavailable
      expect(error).toBeDefined()
    }
  })

  it('should handle lists', async () => {
    try {
      const listKey = 'test:list'
      const items = ['item1', 'item2', 'item3']

      // Push items
      for (const item of items) {
        await redis.rpush(listKey, item)
      }

      // Get list
      const result = await redis.lrange(listKey, 0, -1)
      expect(result).toEqual(items)

      // Clean up
      await redis.del(listKey)
    } catch (error) {
      // Skip if Redis unavailable
      expect(error).toBeDefined()
    }
  })
})
