import { NextResponse } from 'next/server';
import { medusaClient } from '@/lib/medusa-client';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import { handleApiError } from '@/lib/api-errors';

// ============================================================================
// Products API Route - /api/shop/products
// ============================================================================
// GET: Lists all products from Medusa with caching
//
// What: Fetches product catalog from Medusa ecommerce backend
// Why: Provides storefront with inventory data (pricing, images, availability)
// How: Calls Medusa store API, caches results, returns normalized response

// ============================================================================
// GET - List All Products (Public)
// ============================================================================

export async function GET() {
  try {
    const result = await cache.wrap(
      CACHE_KEYS.products(),
      async () => {
        const products = await medusaClient.products.list();
        return products;
      },
      CACHE_TTL.MEDIUM // 1 minute for storefront freshness
    );

    return NextResponse.json({
      products: result.data,
      count: result.data.length,
      cached: result.cached,
      source: result.source,
    });
  } catch (error) {
    return handleApiError(error, 'Products GET');
  }
}
