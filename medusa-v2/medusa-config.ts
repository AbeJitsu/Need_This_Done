import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

// Load from root .env.local (same pattern as v1)
const envPath = path.resolve(__dirname, '../.env.local')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
  console.log('✓ Loaded environment from root .env.local')
} else {
  // Fallback to local .env for Railway/production
  loadEnv(process.env.NODE_ENV || 'development', process.cwd())
  console.log('✓ Using local .env or platform variables')
}

// Construct DATABASE_URL from Supabase vars if not explicitly set
function getDatabaseUrl() {
  // Use explicit DATABASE_URL if available
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL
  if (process.env.MEDUSA_DATABASE_URL) return process.env.MEDUSA_DATABASE_URL

  // Construct from NEXT_PUBLIC_SUPABASE_URL and MEDUSA_DB_PASSWORD
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const dbPassword = process.env.MEDUSA_DB_PASSWORD

  if (supabaseUrl && dbPassword) {
    // Extract project ref from https://xxxx.supabase.co
    const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)
    if (match) {
      const projectRef = match[1]
      // Use direct connection with SSL required
      const constructed = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`
      console.log('✓ Constructed DATABASE_URL from Supabase vars')
      console.log(`  Host: db.${projectRef}.supabase.co:5432`)
      return constructed
    }
  }

  return undefined
}

const DATABASE_URL = getDatabaseUrl()
const JWT_SECRET = process.env.JWT_SECRET || process.env.MEDUSA_JWT_SECRET

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS || process.env.ADMIN_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS || process.env.ADMIN_CORS!,
      jwtSecret: JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  }
})
