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
// STRICT: Docker-Only with nginx-Only HTTP Enforcement
// ============================================================================
// Integration tests MUST run in Docker with ALL HTTP through nginx
// This enforces production-like testing with no shortcuts or bypasses

// Validate that required environment variables are set by docker-compose.test.yml
if (!process.env.APP_URL || !process.env.REDIS_URL) {
  throw new Error(
    '❌ Integration tests must run in Docker.\n' +
    'Use: npm run test:docker\n' +
    'Required: APP_URL=https://nginx and REDIS_URL=redis://redis:6379'
  )
}

// Validate that APP_URL uses nginx (not direct app access)
if (!process.env.APP_URL.includes('nginx')) {
  throw new Error(
    `❌ APP_URL must use nginx reverse proxy (got: ${process.env.APP_URL})\n` +
    'Docker compose should set: APP_URL=https://nginx\n' +
    'Direct app access (http://app:3000) bypasses nginx and violates architecture'
  )
}

console.log('✅ Integration tests running through nginx:', process.env.APP_URL)

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
