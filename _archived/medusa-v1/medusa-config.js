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
// On Railway, env vars are injected via the dashboard configuration
// This allows the same config to work both locally and in production

const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('✓ Loaded environment from .env.local');
} else {
  console.log('✓ Using environment variables from platform (Railway/Vercel)');
}

// ============================================================================
// Required Environment Variables
// ============================================================================
// These must be set in .env.local (local dev) or platform config (Railway)
// All secrets are required with no fallbacks for security

function requireEnv(name, fallbackName) {
  const value = process.env[name] || (fallbackName && process.env[fallbackName]);
  if (!value) {
    const availableVars = Object.keys(process.env)
      .filter(k => k.includes('SECRET') || k.includes('DATABASE') || k.includes('REDIS'))
      .join(', ');
    throw new Error(
      `${name} environment variable is required.\n` +
      `Available related vars: ${availableVars || 'none'}\n` +
      `Railway: Set ${name} in the Variables tab\n` +
      `Local: Ensure .env.local contains ${name} or ${fallbackName || name}`
    );
  }
  return value;
}

const REDIS_URL = requireEnv('REDIS_URL');
const DATABASE_URL = requireEnv('DATABASE_URL', 'MEDUSA_DATABASE_URL');
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
    // Using default public schema - connection poolers don't preserve schema settings
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
