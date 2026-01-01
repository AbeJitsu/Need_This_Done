# Redis Cache Invalidation Strategy

This document defines the caching strategy for NeedThisDone.com, ensuring data freshness while minimizing database load.

## Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CACHE ARCHITECTURE                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Request → Check Cache → Hit? → Return cached data                      │
│                ↓                                                        │
│               Miss? → Query DB → Store in cache → Return data           │
│                                                                         │
│  Mutation → Update DB → Invalidate related caches                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Files:**
- `lib/redis.ts` - Low-level Redis connection
- `lib/cache.ts` - High-level caching API with `wrap()`, `invalidate()`, `invalidatePattern()`

## TTL (Time To Live) Reference

| TTL | Duration | Use Case |
|-----|----------|----------|
| `STATIC` | 1 hour | Services, pricing, rarely-changing content |
| `LONG` | 5 minutes | User management, admin lists |
| `MEDIUM` | 1 minute | Dashboard data, project lists (default) |
| `SHORT` | 30 seconds | Frequently updated data |
| `REALTIME` | 10 seconds | Near real-time (minimal caching) |

## Cache Strategy by Feature

### 1. Pages (CMS)

**Cache Keys:**
- `page:{slug}` - Individual page content
- `admin:pages:all` - Admin page listing

**Operations:**
| Action | Cache Invalidation |
|--------|-------------------|
| GET /api/pages/[slug] | Cache with `MEDIUM` TTL |
| PUT /api/pages/[slug] | Invalidate `page:{slug}` + `admin:pages:all` |
| DELETE /api/pages/[slug] | Invalidate `page:{slug}` + `admin:pages:all` |
| POST /api/pages | Invalidate `admin:pages:all` |

**Rationale:** Pages change infrequently but when they do, updates should be visible quickly.

---

### 2. Page Content (Marketing Pages)

**Cache Keys:**
- `page-content:{slug}` - Editable content for marketing pages
- `admin:page-content:all` - Admin content listing

**Operations:**
| Action | Cache Invalidation |
|--------|-------------------|
| GET /api/page-content/[slug] | Cache with `STATIC` TTL (1 hour) |
| PUT /api/page-content/[slug] | Invalidate `page-content:{slug}` |

**Rationale:** Marketing content rarely changes; long TTL is acceptable.

---

### 3. Projects

**Cache Keys:**
- `user:projects:{userId}` - User's own projects
- `admin:projects:all` - All projects (admin view)
- `admin:projects:status:{status}` - Filtered by status
- `project:comments:{projectId}` - Project comments (separate admin/client views)

**Operations:**
| Action | Cache Invalidation |
|--------|-------------------|
| GET /api/projects/mine | Cache with `MEDIUM` TTL |
| GET /api/projects/all | Cache with `MEDIUM` TTL |
| POST /api/projects | Invalidate `user:projects:{userId}` + `admin:projects:*` pattern |
| PUT /api/projects/[id] | Invalidate `user:projects:{ownerId}` + `admin:projects:*` |
| DELETE /api/projects/[id] | Invalidate same as PUT |

**Comments:**
| Action | Cache Invalidation |
|--------|-------------------|
| GET /api/projects/[id]/comments | Cache with `SHORT` TTL |
| POST /api/projects/[id]/comments | Invalidate `project:comments:{id}:admin` + `project:comments:{id}` |

**Rationale:** Comments update frequently; short TTL ensures fresh data.

---

### 4. Shopping Cart (Medusa)

**Cache Keys:**
- `medusa:cart:{cartId}` - Cart contents

**Operations:**
| Action | Cache Invalidation |
|--------|-------------------|
| GET /api/cart | Cache with `SHORT` TTL |
| POST /api/cart/[cartId]/items | Invalidate `medusa:cart:{cartId}` |
| PUT /api/cart/[cartId]/items | Invalidate `medusa:cart:{cartId}` |
| DELETE /api/cart/[cartId]/items | Invalidate `medusa:cart:{cartId}` |

**Rationale:** Cart state changes often during checkout flow; aggressive invalidation needed.

---

### 5. Products (Medusa)

**Cache Keys:**
- `medusa:products:all` - Product catalog

**Operations:**
| Action | Cache Invalidation |
|--------|-------------------|
| GET /api/shop/products | Cache with `LONG` TTL |
| Admin product update | Invalidate `medusa:products:all` |

**Rationale:** Product catalog changes less frequently; longer TTL acceptable.

---

### 6. Orders

**Cache Keys:**
- `medusa:orders:user:{userId}` - User's order history
- `medusa:order:{orderId}` - Single order details

**Operations:**
| Action | Cache Invalidation |
|--------|-------------------|
| GET /api/user/orders | Cache with `MEDIUM` TTL |
| Checkout completion | Invalidate `medusa:orders:user:{userId}` |
| Admin status update | Invalidate `medusa:order:{orderId}` + `medusa:orders:user:{userId}` |

**Rationale:** Orders are important; balance freshness with performance.

---

### 7. Blog Posts

**Cache Keys:**
- `blog:post:{slug}` - Individual post
- `blog:posts:all` - All published posts
- `blog:posts:status:{status}` - Filtered posts
- `admin:blog:all` - Admin blog listing

**Operations:**
| Action | Cache Invalidation |
|--------|-------------------|
| GET /api/blog/[slug] | Cache with `STATIC` TTL |
| GET /api/blog | Cache with `LONG` TTL |
| PUT /api/blog/[slug] | Invalidate `blog:post:{slug}` + `blog:posts:*` + `admin:blog:all` |
| DELETE /api/blog/[slug] | Same as PUT |

**Rationale:** Blog content changes infrequently; static TTL appropriate.

---

### 8. Users (Admin)

**Cache Keys:**
- `admin:users:all` - All users listing

**Operations:**
| Action | Cache Invalidation |
|--------|-------------------|
| GET /api/admin/users | Cache with `LONG` TTL |
| Role change | Invalidate `admin:users:all` |

---

## Invalidation Patterns

### Single Key Invalidation
```typescript
await cache.invalidate(CACHE_KEYS.page(slug));
```

### Pattern-Based Invalidation
```typescript
// Invalidate all admin project caches
await cache.invalidatePattern('admin:projects:*');
```

### Related Cache Invalidation
When updating data that affects multiple views:
```typescript
// After creating a new project
await cache.invalidate(CACHE_KEYS.userProjects(userId));  // User's list
await cache.invalidatePattern('admin:projects:*');         // Admin lists
```

---

## Best Practices

### 1. Always Invalidate on Mutation
Every CREATE, UPDATE, DELETE should invalidate related caches:
```typescript
export async function PUT(request: Request) {
  // ... update logic ...

  // ALWAYS invalidate after mutation
  await cache.invalidate(CACHE_KEYS.resource(id));
  await cache.invalidatePattern('related:*');
}
```

### 2. Over-Invalidate Rather Than Under-Invalidate
When in doubt, invalidate more caches. Stale data is worse than cache misses.

### 3. Use Pattern Invalidation for Admin Views
Admin views often aggregate data. Use `invalidatePattern()` to clear all variations:
```typescript
await cache.invalidatePattern('admin:projects:*');
// Clears: admin:projects:all, admin:projects:status:pending, etc.
```

### 4. Don't Cache User-Specific Data Aggressively
User-specific data (their projects, their orders) should have shorter TTLs since updates affect only them.

### 5. Use SKIP_CACHE for Development
Set `SKIP_CACHE=true` in development to avoid cache-related debugging issues.

---

## Monitoring Checklist

- [ ] Track cache hit/miss ratios per endpoint
- [ ] Monitor Redis memory usage
- [ ] Alert on high miss rates (may indicate invalidation issues)
- [ ] Log slow database queries (candidates for caching)

---

## Adding New Cache Keys

When adding a new cached endpoint:

1. **Define the cache key** in `lib/cache.ts`:
   ```typescript
   export const CACHE_KEYS = {
     // ...existing keys...
     newResource: (id: string) => `domain:resource:${id}`,
   };
   ```

2. **Choose appropriate TTL** based on data volatility

3. **Implement cache.wrap()** in GET handler:
   ```typescript
   const result = await cache.wrap(
     CACHE_KEYS.newResource(id),
     async () => { /* fetch from DB */ },
     CACHE_TTL.MEDIUM
   );
   ```

4. **Add invalidation** to all mutation handlers

5. **Document** the strategy in this file

---

*Last Updated: December 30, 2025*
