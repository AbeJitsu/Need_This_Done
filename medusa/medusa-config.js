const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

let ENV_FILE_NAME = ".env";
if (process.env.NODE_ENV === "production") {
  ENV_FILE_NAME = ".env.production";
}

// ============================================================================
// Environment Variable Loading Strategy
// ============================================================================
// Try to load from parent directory (root .env.local) for local development
// In Docker containers, env vars are injected via docker-compose env_file
// This allows the same config to work both locally and in containers

const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('✓ Loaded environment from .env.local');
} else {
  console.log('✓ Using environment variables from container (Docker env_file)');
}

// ============================================================================
// Required Environment Variables
// ============================================================================
// These must be set in .env.local - no fallbacks for security
// In Docker: docker-compose.yml maps MEDUSA_JWT_SECRET -> JWT_SECRET
// In Local: .env.local should contain JWT_SECRET directly

function requireEnv(name, fallbackName) {
  const value = process.env[name] || (fallbackName && process.env[fallbackName]);
  if (!value) {
    const availableVars = Object.keys(process.env)
      .filter(k => k.includes('SECRET') || k.includes('DATABASE') || k.includes('REDIS'))
      .join(', ');
    throw new Error(
      `${name} environment variable is required.\n` +
      `Available related vars: ${availableVars || 'none'}\n` +
      `Docker: Ensure docker-compose.yml passes ${name} from .env.local\n` +
      `Local: Ensure .env.local contains ${name} or ${fallbackName || name}`
    );
  }
  return value;
}

const REDIS_URL = requireEnv('REDIS_URL');
const DATABASE_URL = requireEnv('DATABASE_URL');
const JWT_SECRET = requireEnv('JWT_SECRET', 'MEDUSA_JWT_SECRET');
const COOKIE_SECRET = requireEnv('COOKIE_SECRET');

const modules = {
  eventBusModuleService: {
    resolve: "@medusajs/event-bus-redis",
    options: {
      redisUrl: REDIS_URL,
    },
  },
  cacheModuleService: {
    resolve: "@medusajs/cache-redis",
    options: {
      redisUrl: REDIS_URL,
    },
  },
};

/** @type {import('@medusajs/medusa').ConfigModule} */
module.exports = {
  projectConfig: {
    // ============================================================================
    // Database Configuration
    // ============================================================================
    // Medusa uses its own PostgreSQL database, separate from Supabase
    // This prevents migration conflicts and enables independent scaling
    database_url: DATABASE_URL,
    database_type: "postgres",
    redis_url: REDIS_URL,

    // ============================================================================
    // Server Configuration
    // ============================================================================
    http_compression: {
      enabled: true,
      level: 6,
    },

    // ============================================================================
    // API Configuration
    // ============================================================================
    jwt_secret: JWT_SECRET,
    cookie_secret: COOKIE_SECRET,

    // ============================================================================
    // CORS Configuration
    // ============================================================================
    // Admin CORS - Which origins can access the admin API
    // Must be set explicitly for security (no fallback)
    admin_cors: process.env.ADMIN_CORS,

    // Store CORS - Which origins can access the store API (storefront)
    // Required for the Next.js frontend to make API calls
    store_cors: process.env.STORE_CORS || process.env.ADMIN_CORS,
  },

  // ============================================================================
  // Plugins and Modules
  // ============================================================================
  modules,

  // ============================================================================
  // Plugins
  // ============================================================================
  // NOTE: Admin plugin removed temporarily to debug startup issues
  plugins: [
    {
      resolve: "medusa-fulfillment-manual",
      options: {},
    },
    {
      resolve: "medusa-payment-manual",
      options: {},
    },
  ],
};
