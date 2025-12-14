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
      CACHE_TTL.STATIC // 1 hour - products rarely change (only 3 consultation tiers)
    );

    // Sort by price ascending: green ($20) → blue ($35) → purple ($50)
    const sortedProducts = [...result.data].sort((a, b) => {
      const priceA = a.variants?.[0]?.prices?.[0]?.amount ?? 0;
      const priceB = b.variants?.[0]?.prices?.[0]?.amount ?? 0;
      return priceA - priceB;
    });

    // Return with aggressive caching headers for fast navigation
    return NextResponse.json(
      {
        products: sortedProducts,
        count: sortedProducts.length,
        cached: result.cached,
        source: result.source,
      },
      {
        headers: {
          // Cache for 1 hour, serve stale for 24 hours while revalidating
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    return handleApiError(error, 'Products GET');
  }
}
