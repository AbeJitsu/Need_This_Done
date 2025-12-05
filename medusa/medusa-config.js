const dotenv = require("dotenv");

let ENV_FILE_NAME = ".env";
if (process.env.NODE_ENV === "production") {
  ENV_FILE_NAME = ".env.production";
}

dotenv.config({ path: process.cwd().includes("medusa") ? "../.env.local" : ".env.local" });

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://medusa:password@localhost:5432/medusa";

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
    jwt_secret: process.env.JWT_SECRET || "your-jwt-secret",
    cookie_secret: process.env.COOKIE_SECRET || "your-cookie-secret",

    // ============================================================================
    // Admin Configuration
    // ============================================================================
    admin_cors: process.env.ADMIN_CORS || "http://localhost:3000",
  },

  // ============================================================================
  // Plugins and Modules
  // ============================================================================
  modules,

  // ============================================================================
  // Authentication
  // ============================================================================
  plugins: [
    {
      resolve: "@medusajs/admin",
      options: {
        autoRebuild: true,
        develop: process.env.NODE_ENV === "development",
      },
    },
  ],
};
