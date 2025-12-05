# Caching Strategy

## Overview

This project uses **Redis** for caching frequently accessed data to reduce database load and improve response times. When users request data, our caching system checks Redis first (~2ms), and only queries Supabase if the data isn't cached (~200-300ms on miss).

The cache-aside pattern is our primary strategy: check cache → fallback to database → store in cache → return data.

---

## Why Caching Matters

**Without caching**: Every user dashboard load queries the database
- 300+ users × 250ms per query = 75+ seconds of database time per minute
- Higher Supabase costs
- Slower response times

**With caching** (60s TTL): Most requests hit Redis
- 300+ users × 2ms cached response = 600ms total time per minute
- 60-80% reduction in database queries
- 15-50x faster response times on cache hits

---

## Cache Architecture

### Core Utility

The cache utility lives in `app/lib/cache.ts` and provides:

```typescript
// Cache-aside pattern with automatic JSON serialization
await cache.wrap(key, fetcher, ttl)

// Direct operations
await cache.get(key)
await cache.set(key, value, ttl)
await cache.invalidate(key)
await cache.invalidatePattern("pattern:*")
```

### Redis Connection

Redis is configured in `app/lib/redis.ts` with:
- **Automatic reconnection** with exponential backoff
- **Error resilience** - cache failures don't break the app
- **Environment variable** - `REDIS_URL` from docker-compose.yml

---

## Cache Keys

Cache keys use a namespaced pattern to avoid collisions and make debugging easier.

**Format**: `domain:type:identifier`

### Current Cache Keys

```
user:projects:{userId}           User's project list
admin:projects:all              All projects (no filters)
admin:projects:status:{status}  Projects filtered by status
project:comments:{projectId}    Project comments (client view)
project:comments:{projectId}:admin   Project comments (admin view)
admin:users:all                 User management list
static:services                 Service offerings (1 hour)
static:pricing                  Pricing tiers (1 hour)
```

### Naming Conventions

- Use snake_case for keys: `user:projects:{userId}`
- Separate concerns with colons: `domain:type:identifier`
- Include filters in key: `admin:projects:status:pending`
- Distinguish user views: `project:comments:{id}:admin`

---

## TTL (Time To Live) Values

How long different types of data stay cached before expiring:

| Data Type | TTL | Reasoning |
|-----------|-----|-----------|
| Static content | 3600s (1h) | Services, pricing - rarely change |
| User management | 300s (5m) | User roles, disable status - infrequent changes |
| Dashboard data | 60s (1m) | Project lists, user projects - balance freshness vs. performance |
| Comments | 60s (1m) | Moderately fresh - new comments appear within a minute |
| Frequently updated | 30s (30s) | Data that changes often |
| Near real-time | 10s (10s) | Minimal caching needed |

### Choosing TTL

**Shorter TTL** = Fresher data but more database queries
**Longer TTL** = Fewer queries but potentially stale data

Default is **CACHE_TTL.MEDIUM (60s)** - good for most dashboard data.

---

## Cache Invalidation Rules

When does data become invalid and need to be cleared?

### User Dashboard Cache (`user:projects:{userId}`)

**Invalidate when:**
- ✅ User submits new project (`POST /api/projects`)
- ✅ User updates their own project status (future PATCH endpoint)
- ❌ Admin updates a different user's project (admin caches only)

**Code location**: `app/api/projects/route.ts` (POST handler)

### Admin Dashboard Caches (`admin:projects:*`)

**Invalidate when:**
- ✅ New project submitted (`POST /api/projects`)
- ✅ Project status updated (future PATCH endpoint)
- ✅ Filter changes (different cache keys per status)

**Code location**: `app/api/projects/route.ts` (POST handler)

### Comments Caches (`project:comments:{id}*`)

**Invalidate when:**
- ✅ New comment added (`POST /api/projects/[id]/comments`)

**Code location**: `app/api/projects/[id]/comments/route.ts` (POST handler)

**Note:** Separate caches for admin and client views invalidate independently

### User Management Cache (`admin:users:all`)

**Invalidate when:**
- ✅ User role changed (setAdmin action in `PATCH /api/admin/users`)
- ✅ User account disabled/enabled (disable action)
- ❌ Password reset (doesn't change user list)

**Code location**: `app/api/admin/users/route.ts` (PATCH handler)

---

## Adding Caching to New Routes

### Step 1: Import Cache Utilities

```typescript
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
```

### Step 2: Define Cache Key (if new)

Add to `CACHE_KEYS` object in `app/lib/cache.ts`:

```typescript
// In app/lib/cache.ts
export const CACHE_KEYS = {
  myNewData: (userId: string) => `my:data:${userId}`,
  // ...
}
```

### Step 3: Wrap Your Database Query

```typescript
const result = await cache.wrap(
  CACHE_KEYS.myNewData(userId),
  async () => {
    const { data, error } = await supabase
      .from('my_table')
      .select('*')
      .eq('user_id', userId);

    if (error) throw new Error('Failed to load data');
    return data;
  },
  CACHE_TTL.MEDIUM  // 60 seconds
);

// Return with cache metadata for transparency
return NextResponse.json({
  data: result.data,
  cached: result.cached,
  source: result.source,  // 'cache' or 'database'
});
```

### Step 4: Invalidate After Mutations

In any POST/PATCH/DELETE endpoint that modifies the cached data:

```typescript
// After successful database write
await cache.invalidate(CACHE_KEYS.myNewData(userId));

// Or invalidate patterns for multiple related caches
await cache.invalidatePattern('my:data:*');
```

---

## Monitoring Cache Performance

### Check Cache Hit Rate (Manual)

1. Monitor response times in browser DevTools
2. Check `source` field in API responses
3. Log to see actual Redis operations

### Future Metrics (Not Yet Implemented)

- Cache hit/miss rate per endpoint
- Cache eviction rate
- Redis memory usage
- TTL distribution across keys

---

## Troubleshooting

### Issue: Data Not Updating After Mutation

**Symptom**: After creating/updating, old data still shows

**Causes**:
1. Cache invalidation code not reached (check error handling)
2. Wrong cache key in invalidation (check key naming)
3. Cache TTL too long (user waiting for expiry)

**Fix**:
1. Verify cache invalidation code exists in mutation endpoint
2. Check cache key matches exactly
3. Consider shortening TTL for this specific data

### Issue: Redis Connection Errors

**Symptom**: Errors in logs: "Redis error: connect ECONNREFUSED"

**Causes**:
1. Docker Redis container not running
2. Network/port issue

**Fix**:
```bash
# Restart Redis container
docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart redis

# Or run `/docker` slash command in Claude Code
```

### Issue: Memory Usage Growing

**Symptom**: Redis using lots of memory

**Causes**:
1. TTLs too long (data not expiring)
2. Many cache keys for similar data
3. Large objects being cached

**Fix**:
1. Check TTL values - reduce if needed
2. Consolidate related caches with patterns
3. Cache only essential data

### Issue: Stale Data Showing

**Symptom**: Old data persists longer than expected

**Causes**:
1. TTL too long for this data type
2. Invalidation not running (check logs)
3. Multiple instances invalidating differently

**Fix**:
1. Reduce TTL value
2. Add debugging to invalidation code
3. Ensure all invalidations use same keys

---

## Cache vs Optimization

**Good use cases for caching**:
- ✅ Expensive queries (joins, aggregations)
- ✅ Frequently accessed data
- ✅ Data that changes infrequently
- ✅ API responses from external services

**Poor use cases** (consider other approaches):
- ❌ User authentication tokens (use sessions instead)
- ❌ Real-time data (skip caching or use very short TTL)
- ❌ Data that changes every request (no benefit)
- ❌ Large objects (Redis memory usage)

---

## Future Enhancements

Planned improvements not yet implemented:

- **Cache Warming**: Pre-load popular data on startup
- **Cache Versioning**: Handle breaking schema changes
- **Distributed Invalidation**: Multi-server deployments
- **Cache Metrics**: Track hit rates, evictions, memory usage
- **Compression**: Compress large cached objects
- **Layered Caching**: Browser cache + CDN + Redis

---

## Questions?

- Check existing usage in `app/api/demo/` routes
- Review `app/lib/cache.ts` for implementation details
- Refer to [Redis documentation](https://redis.io/docs/) for advanced patterns
