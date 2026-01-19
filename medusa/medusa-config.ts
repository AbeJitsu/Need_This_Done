import { defineConfig } from '@medusajs/framework/utils'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

// ============================================================================
// Environment Variable Loading Strategy
// ============================================================================
// Try to load from parent directory (root .env.local) for local development
// On Railway, env vars are injected via the dashboard configuration

const envPath = path.resolve(__dirname, '../.env.local')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
  console.log('✓ Loaded environment from root .env.local')
} else {
  console.log('✓ Using environment variables from platform (Railway)')
}

// Helper to get env var with fallback names
function getEnv(name: string, fallbackName?: string): string | undefined {
  return process.env[name] || (fallbackName ? process.env[fallbackName] : undefined)
}

// ============================================================================
// Configuration
// ============================================================================

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: getEnv('DATABASE_URL', 'MEDUSA_DATABASE_URL'),
    redisUrl: getEnv('REDIS_URL'),
    http: {
      storeCors: getEnv('STORE_CORS', 'ADMIN_CORS') || 'http://localhost:3000',
      adminCors: getEnv('ADMIN_CORS') || 'http://localhost:3000',
      authCors: getEnv('AUTH_CORS', 'ADMIN_CORS') || 'http://localhost:3000',
      jwtSecret: getEnv('JWT_SECRET', 'MEDUSA_JWT_SECRET') || 'supersecret',
      cookieSecret: getEnv('COOKIE_SECRET') || 'supersecret',
    }
  }
})
