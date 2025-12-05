# Medusa Product Loading Issue - Investigation & Fix Guide

**Status**: Under Investigation
**Severity**: High (15 E2E tests failing)
**Date Discovered**: December 5, 2025

---

## Problem Summary

The shop page shows "No products available yet" even though:
- ✅ Medusa backend is running and healthy
- ✅ Medusa `/store/products` endpoint returns 3 sample products correctly
- ✅ Docker network communication works
- ❌ Frontend receives empty products array from `/api/shop/products`

**Failing Tests**: 15 E2E tests in `app/e2e/shop.spec.ts` all timeout waiting for products to display.

---

## What We Know

### Medusa Backend ✅ Working

Direct test from `nextjs_app` container:
```bash
docker exec nextjs_app node -e "fetch('http://medusa:9000/store/products')
  .then(r=>r.json())
  .then(d=>console.log(JSON.stringify(d,null,2)))"
```

**Result**: Returns all 3 products perfectly
```json
{
  "products": [
    {
      "id": "prod_1",
      "title": "Quick Task",
      "description": "Fast turnaround on small projects",
      "handle": "quick-task",
      "prices": [{ "amount": 5000, "currency_code": "USD" }],
      "images": [{ "url": "https://via.placeholder.com/300?text=Quick+Task" }]
    },
    // ... prod_2 and prod_3 ...
  ],
  "count": 3
}
```

### Frontend API Route ❌ Returns Empty

Test endpoint from localhost:
```bash
docker exec nextjs_app node -e "fetch('http://localhost:3000/api/shop/products')
  .then(r=>r.json())
  .then(d=>console.log(JSON.stringify(d,null,2)))"
```

**Result**: Empty products despite Medusa having data
```json
{
  "products": [],
  "count": 0,
  "cached": false,
  "source": "database"
}
```

---

## Suspected Root Causes

### 1. **Cache Layer Issue** (Most Likely)
**File**: `app/lib/cache.ts`

The `cache.wrap()` function shows `source: 'database'` which means:
- Cache miss occurred (expected on first request)
- Tried to call the fetcher function (`medusaClient.products.list()`)
- But got empty products back

**Possible issue**: The fetcher is failing silently or returning empty without throwing an error.

```typescript
// Line 76-103 in cache.ts
async function wrap<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<{ data: T; cached: boolean; source: 'cache' | 'database' }> {
  try {
    const cached = await get<T>(key);
    if (cached !== null) {
      return { data: cached, cached: true, source: 'cache' };
    }

    // Step 2: Cache miss - fetch from database
    const data = await fetcher();  // <-- What does medusaClient.products.list() return here?

    // Step 3: Store in cache
    await set(key, data, ttl).catch((error) => {
      console.error(`Failed to cache key ${key}:`, error);
    });

    return { data, cached: false, source: 'database' };
  } catch (error) {
    console.error(`Cache.wrap error for key ${key}:`, error);
    // Fallback: fetch data directly if cache.wrap fails
    return { data: await fetcher(), cached: false, source: 'database' };
  }
}
```

### 2. **Medusa Client Issue**
**File**: `app/lib/medusa-client.ts`

The `products.list()` function might not be correctly handling the response:

```typescript
// Line 103-107
list: async (): Promise<Product[]> => {
  const response = await fetchWithRetry(`${MEDUSA_URL}/store/products`);
  const data = await handleResponse<{ products: Product[] }>(response);
  return data.products || [];  // <-- Returns [] if data.products is undefined
},
```

**Potential issue**: The response might be in a different format than expected, or `handleResponse()` is failing.

### 3. **Network/Environment Issue**
**Files**: `docker-compose.yml`, `.env`

The `MEDUSA_BACKEND_URL` might not be resolving correctly from the Next.js container:
```typescript
// medusa-client.ts line 8
const MEDUSA_URL = process.env.MEDUSA_BACKEND_URL || "http://medusa:9000";
```

**Potential issue**: Environment variable not set, or Docker network DNS not resolving `medusa` hostname.

---

## Investigation Steps Already Completed

- ✅ Verified Medusa backend is running and returns products
- ✅ Verified Docker network communication works
- ✅ Added 3 sample products to Medusa in `medusa/src/index.ts`
- ✅ Verified medusa-client.ts configuration
- ✅ Verified cache.ts logic

---

## Next Steps to Fix (Priority Order)

### 1. Add Logging to Diagnose the Issue
**File**: `app/api/shop/products/route.ts`

Add detailed logging before returning the response:
```typescript
export async function GET() {
  try {
    const result = await cache.wrap(
      CACHE_KEYS.products(),
      async () => {
        console.log('🔵 Fetching products from medusaClient...');
        const products = await medusaClient.products.list();
        console.log('🟢 Products received:', { count: products.length, products });
        return products;
      },
      CACHE_TTL.MEDIUM
    );

    console.log('📦 Cache result:', {
      dataLength: result.data?.length,
      cached: result.cached,
      source: result.source
    });

    return NextResponse.json({
      products: result.data,
      count: result.data.length,
      cached: result.cached,
      source: result.source,
    });
  } catch (error) {
    console.error('❌ Error in GET /api/shop/products:', error);
    return handleApiError(error, 'Products GET');
  }
}
```

Then check Docker logs:
```bash
docker logs nextjs_app 2>&1 | grep -E "🔵|🟢|📦|❌"
```

### 2. Add Logging to Medusa Client
**File**: `app/lib/medusa-client.ts`

Add logging in `handleResponse()` and `products.list()`:
```typescript
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  console.log(`📡 handleResponse for ${response.url}:`, {
    status: response.status,
    ok: response.ok,
    dataKeys: data ? Object.keys(data) : null,
  });

  if (!response.ok) {
    const error: MedusaError = {
      message: data?.message || `HTTP ${response.status}`,
      code: data?.code,
      status: response.status,
    };
    throw error;
  }

  return data as T;
}

list: async (): Promise<Product[]> => {
  console.log(`🔗 Calling ${MEDUSA_URL}/store/products`);
  const response = await fetchWithRetry(`${MEDUSA_URL}/store/products`);
  const data = await handleResponse<{ products: Product[] }>(response);
  console.log('📊 Medusa response:', {
    productsKey: !!data.products,
    length: data.products?.length,
    data
  });
  return data.products || [];
},
```

### 3. Verify Redis is Working
**Command**:
```bash
docker exec redis redis-cli ping
docker exec redis redis-cli keys "medusa:*"
```

### 4. Check Environment Variables in Container
**Command**:
```bash
docker exec nextjs_app env | grep -i medusa
```

### 5. Manual Test the API Route
**Command**:
```bash
# From your localhost
curl -s http://localhost:3000/api/shop/products | jq .

# From inside container
docker exec nextjs_app curl -s http://localhost:3000/api/shop/products
```

---

## Files to Monitor During Fix

| File | Purpose | Issue Area |
|------|---------|-----------|
| `app/api/shop/products/route.ts` | API endpoint | Response handling, caching |
| `app/lib/medusa-client.ts` | Medusa API wrapper | Product fetching, response parsing |
| `app/lib/cache.ts` | Cache layer | Data caching, TTL management |
| `app/shop/page.tsx` | Frontend display | Data usage, error handling |
| `.env` or `docker-compose.yml` | Environment | URL configuration |

---

## Prevention

Once fixed, add:
1. **Unit tests** for `medusaClient.products.list()`
2. **Integration tests** for `/api/shop/products` endpoint
3. **Monitoring/logging** to catch similar issues early
4. **Health check** endpoint to verify Medusa connectivity from Next.js

---

## References

- [Medusa Client](app/lib/medusa-client.ts) - Line 103-107 (products.list)
- [Cache Wrapper](app/lib/cache.ts) - Line 76-103 (wrap function)
- [API Route](app/api/shop/products/route.ts) - Full implementation
- [Docker Compose](docker-compose.yml) - Service configuration
- [Shop Page](app/shop/page.tsx) - Frontend data usage

---

## Quick Commit Message When Fixed

```
Fix: Product loading in shop (medusa-client → API bridge)

The /api/shop/products endpoint was returning empty products despite Medusa having data.
Issue was in [SPECIFIC COMPONENT]. Added logging to diagnose, verified [FIX], and all 15 tests now pass.

- [Changed what]: [Why]
- [Added what]: [Why]
- Verified: [15 tests passing]
```
