import { redis } from './redis';

// ============================================================================
// Cache Utility - High-Level Caching with Automatic JSON Serialization
// ============================================================================
// What: Provides simple cache.wrap(), cache.get(), cache.set() functions
// Why: Reduces boilerplate for caching patterns, handles JSON serialization
// How: Wraps the redis client with type-safe generics and smart defaults
//
// Development Mode: Set SKIP_CACHE=true to bypass Redis entirely for faster
// frontend development without Redis connection loops

const skipCache = process.env.SKIP_CACHE === 'true';

// ============================================================================
// TTL (Time To Live) Constants
// ============================================================================
// Define how long different types of data should be cached
// Shorter TTL = fresher data but more database queries
// Longer TTL = fewer queries but potentially stale data

export const CACHE_TTL = {
  STATIC: 3600, // 1 hour - Static content (services, pricing)
  LONG: 300, // 5 minutes - User management, infrequently changing data
  MEDIUM: 60, // 1 minute - Dashboard data, project lists (default)
  SHORT: 30, // 30 seconds - Frequently updated data
  REALTIME: 10, // 10 seconds - Near real-time data (minimal caching)
} as const;

// ============================================================================
// Cache Key Patterns
// ============================================================================
// Namespaced cache keys to avoid collisions and make debugging easier
// Format: domain:type:identifier (e.g., user:projects:123, admin:projects:all)

export const CACHE_KEYS = {
  // User data
  userProjects: (userId: string) => `user:projects:${userId}`,

  // Admin data
  adminProjects: (status?: string) =>
    status ? `admin:projects:status:${status}` : 'admin:projects:all',
  adminUsers: () => 'admin:users:all',
  adminPages: () => 'admin:pages:all',

  // Project data
  projectComments: (projectId: string, isAdmin: boolean) =>
    `project:comments:${projectId}${isAdmin ? ':admin' : ''}`,

  // Page data
  page: (slug: string) => `page:${slug}`,

  // Page content (editable marketing page content)
  pageContent: (slug: string) => `page-content:${slug}`,
  adminPageContent: () => 'admin:page-content:all',

  // Blog posts
  blogPost: (slug: string) => `blog:post:${slug}`,
  blogPosts: (status?: string) =>
    status ? `blog:posts:status:${status}` : 'blog:posts:all',
  adminBlogPosts: () => 'admin:blog:all',

  // Static content
  services: () => 'static:services',
  pricing: () => 'static:pricing',

  // Medusa ecommerce
  products: () => 'medusa:products:all',
  cart: (cartId: string) => `medusa:cart:${cartId}`,
  order: (orderId: string) => `medusa:order:${orderId}`,
  userOrders: (userId: string) => `medusa:orders:user:${userId}`,
} as const;

// ============================================================================
// Cache Wrapper Object
// ============================================================================
// Main API for caching operations

/**
 * Cache-aside pattern implementation
 *
 * What: Check cache first, fallback to fetcher function, store result
 * Why: Optimized for read-heavy scenarios (dashboard, listings)
 * How: Returns both data and metadata about where it came from
 *
 * @param key - Cache key identifier
 * @param fetcher - Async function to fetch data if cache miss
 * @param ttl - Time to live in seconds (defaults to CACHE_TTL.MEDIUM)
 * @returns Object with data, cached status, and source indicator
 */
async function wrap<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<{ data: T; cached: boolean; source: 'cache' | 'database' }> {
  // Development mode: skip caching entirely
  if (skipCache) {
    const data = await fetcher();
    return { data, cached: false, source: 'database' };
  }

  try {
    // Step 1: Try to get from cache
    const cached = await get<T>(key);
    if (cached !== null) {
      return { data: cached, cached: true, source: 'cache' };
    }

    // Step 2: Cache miss - fetch from database
    const data = await fetcher();

    // Step 3: Store in cache for next time (don't block on failure)
    await set(key, data, ttl).catch((error) => {
      console.error(`Failed to cache key ${key}:`, error);
      // Don't throw - cache failures shouldn't break the app
    });

    return { data, cached: false, source: 'database' };
  } catch (error) {
    console.error(`Cache.wrap error for key ${key}:`, error);
    // Fallback: fetch data directly if cache.wrap fails
    return { data: await fetcher(), cached: false, source: 'database' };
  }
}

/**
 * Get cached value with automatic JSON deserialization
 *
 * @param key - Cache key
 * @returns Parsed value or null if not found or error
 */
async function get<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Failed to get cache key ${key}:`, error);
    return null; // Graceful degradation on cache read errors
  }
}

/**
 * Set cached value with automatic JSON serialization
 *
 * @param key - Cache key
 * @param value - Value to cache (will be JSON stringified)
 * @param ttl - Time to live in seconds (defaults to CACHE_TTL.MEDIUM)
 */
async function set<T>(
  key: string,
  value: T,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<void> {
  try {
    const serialized = JSON.stringify(value);
    await redis.setEx(key, ttl, serialized);
  } catch (error) {
    console.error(`Failed to set cache key ${key}:`, error);
    // Graceful degradation - don't throw on cache write errors
  }
}

/**
 * Invalidate a single cache key (delete it)
 *
 * What: Remove a specific key from cache
 * Why: Keep data fresh after mutations (create, update, delete)
 * How: Deleted keys will cause next .wrap() to fetch fresh data
 *
 * @param key - Cache key to delete
 */
async function invalidate(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error(`Failed to invalidate cache key ${key}:`, error);
    // Graceful degradation - invalidation failures shouldn't break the app
  }
}

/**
 * Invalidate multiple keys matching a pattern
 *
 * What: Remove all keys matching a Redis pattern
 * Why: Invalidate related caches efficiently (e.g., all user project caches)
 * How: Uses Redis KEYS pattern matching (e.g., "user:projects:*")
 *
 * @param pattern - Redis pattern (e.g., "user:projects:*", "admin:projects:*")
 */
async function invalidatePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error(`Failed to invalidate pattern ${pattern}:`, error);
    // Graceful degradation
  }
}

// ============================================================================
// Export Public Cache API
// ============================================================================

export const cache = {
  wrap,
  get,
  set,
  invalidate,
  invalidatePattern,
};

// ============================================================================
// Usage Examples
// ============================================================================
//
// Example 1: Cache-aside pattern for GET request
// ──────────────────────────────────────────────────
// import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
//
// const result = await cache.wrap(
//   CACHE_KEYS.userProjects(userId),
//   async () => {
//     const { data } = await supabase
//       .from('projects')
//       .select('*')
//       .eq('user_id', userId);
//     return data;
//   },
//   CACHE_TTL.MEDIUM
// );
//
// // result.data = the projects (from cache or database)
// // result.cached = boolean indicating if from cache
// // result.source = 'cache' or 'database'
//
// Example 2: Invalidate cache after mutation
// ───────────────────────────────────────────
// import { cache, CACHE_KEYS } from '@/lib/cache';
//
// // After creating a new project
// await cache.invalidate(CACHE_KEYS.userProjects(userId));
// await cache.invalidatePattern('admin:projects:*');
//
// Example 3: Invalidate all related caches
// ─────────────────────────────────────────
// import { cache, CACHE_KEYS } from '@/lib/cache';
//
// // After admin updates project
// await cache.invalidate(CACHE_KEYS.userProjects(project.user_id));
// await cache.invalidatePattern('admin:projects:*');
// await cache.invalidate(CACHE_KEYS.projectComments(projectId, true));
// await cache.invalidate(CACHE_KEYS.projectComments(projectId, false));
