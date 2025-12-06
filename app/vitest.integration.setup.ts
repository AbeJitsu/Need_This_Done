// ============================================================================
// Integration Test Setup - Docker Network Aware
// ============================================================================
// This setup file is used for integration tests that connect to REAL services
// (Redis, Supabase) running in Docker.
//
// Unlike unit tests (vitest.setup.ts), we do NOT use MSW here.
// We want actual HTTP calls and real service connections.
//
// This setup detects whether tests are running INSIDE Docker or from the HOST
// and adjusts connection strings accordingly:
// - Inside Docker: Uses service names (redis://redis:6379, http://app:3000)
// - From Host: Uses localhost (redis://localhost:6379, http://localhost:3000)

import dotenv from 'dotenv'
import path from 'path'
import { beforeAll, afterEach, afterAll } from 'vitest'

// Read environment variables from .env.test if available
dotenv.config({
  path: path.resolve(__dirname, '.env.test'),
})

// ============================================================================
// Environment Detection - Docker vs Host
// ============================================================================
// Check if we're running inside Docker by looking for Docker-specific env vars
// These are set by docker-compose.test.yml
const isRunningInDocker =
  process.env.APP_URL !== undefined || process.env.NODE_ENV === 'test'

// Set up real service connections based on environment
if (isRunningInDocker) {
  // ========================================================================
  // DOCKER ENVIRONMENT (inside container)
  // ========================================================================
  // Services communicate using Docker service names on the app_network
  // - redis service is accessible at redis://redis:6379
  // - app service is accessible at http://app:3000

  process.env.REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379'
  process.env.APP_URL = process.env.APP_URL || 'http://app:3000'

  console.log(
    '📦 Running integration tests in Docker network (production-like environment)'
  )
} else {
  // ========================================================================
  // HOST ENVIRONMENT (from your laptop)
  // ========================================================================
  // Services are accessed via exposed ports on localhost
  // - redis is exposed at localhost:6379
  // - app is exposed at localhost:3000

  process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'
  process.env.APP_URL = process.env.APP_URL || 'http://localhost:3000'

  console.log('💻 Running integration tests from host machine (localhost)')
}

// ============================================================================
// Supabase Configuration (same for both Docker and Host)
// ============================================================================
process.env.NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key'

// ============================================================================
// Global Test Hooks
// ============================================================================

beforeAll(async () => {
  // Optional: Verify Redis is accessible
  try {
    await import('@/lib/redis')
    // Verify connection by attempting to ping
    // Note: redis client may connect lazily, so we don't force connection here
  } catch (error) {
    // Redis might not be available - that's ok for development
    console.warn('Note: Redis may not be accessible for integration tests')
  }
})

afterEach(async () => {
  // Optional: Clean up test data in Redis
  // You can add cleanup logic here after each test
})

afterAll(async () => {
  // Optional: Close connections
  try {
    const { redis } = await import('@/lib/redis')
    await redis.quit()
  } catch (error) {
    // Connection may not have been established
  }
})
