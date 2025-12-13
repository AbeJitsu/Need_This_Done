const dotenv = require("dotenv");
const path = require("path");

let ENV_FILE_NAME = ".env";
if (process.env.NODE_ENV === "production") {
  ENV_FILE_NAME = ".env.production";
}

// Always load from parent directory (root .env.local)
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// ============================================================================
// Required Environment Variables
// ============================================================================
// These must be set in .env.local - no fallbacks for security

const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) {
  throw new Error('REDIS_URL environment variable is required');
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const COOKIE_SECRET = process.env.COOKIE_SECRET;
if (!COOKIE_SECRET) {
  throw new Error('COOKIE_SECRET environment variable is required');
}

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
