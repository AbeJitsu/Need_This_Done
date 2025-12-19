// ============================================================================
// Integration Test Setup
// ============================================================================
// This setup file is used for integration tests that connect to REAL services
// (Redis via Upstash, Supabase cloud).
//
// Unlike unit tests (vitest.setup.ts), we do NOT use MSW here.
// We want actual HTTP calls and real service connections.

import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'node:url'
import { beforeAll, afterEach, afterAll } from 'vitest'

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

// Read environment variables from .env.test if available
dotenv.config({
  path: path.resolve(dirname, '.env.test'),
})

// Also try loading from root .env.local
dotenv.config({
  path: path.resolve(dirname, '../.env.local'),
})

// ============================================================================
// Environment Validation
// ============================================================================
// Validate that required environment variables are set

if (!process.env.REDIS_URL) {
  console.warn('⚠️ REDIS_URL not set - some integration tests may be skipped')
}

// Set defaults for Supabase if not provided
process.env.NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key'

console.log('✅ Integration test setup complete')

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
