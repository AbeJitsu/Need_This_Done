import { NextRequest, NextResponse } from 'next/server';
import { medusaClient, Product, PaginatedProducts } from '@/lib/medusa-client';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import { handleApiError } from '@/lib/api-errors';
import { withTimeout, TIMEOUT_LIMITS, TimeoutError } from '@/lib/api-timeout';

export const dynamic = 'force-dynamic';

// ============================================================================
// Products API Route - /api/shop/products
// ============================================================================
// GET: Lists products from Medusa with optional pagination and caching
//
// What: Fetches product catalog from Medusa ecommerce backend
// Why: Provides storefront with inventory data (pricing, images, availability)
// How: Calls Medusa store API, caches results, returns normalized response
//
// Query Parameters:
// - limit: Number of products to return (optional)
// - offset: Number of products to skip (optional)
//
// Examples:
// - /api/shop/products - All products (cached)
// - /api/shop/products?limit=10&offset=0 - First 10 products (paginated)

// ============================================================================
// GET - List Products (Public)
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Check if Medusa is configured
    if (!process.env.NEXT_PUBLIC_MEDUSA_URL && !process.env.MEDUSA_BACKEND_URL) {
      return NextResponse.json({
        products: [],
        count: 0,
        total: 0,
        cached: false,
        source: 'fallback',
        warning: 'Medusa backend not configured. Set NEXT_PUBLIC_MEDUSA_URL in .env.local',
      });
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    // Build pagination params if provided
    const paginationParams =
      limit !== null || offset !== null
        ? {
            ...(limit !== null && { limit: parseInt(limit, 10) }),
            ...(offset !== null && { offset: parseInt(offset, 10) }),
          }
        : undefined;

    // Use different cache key for paginated requests
    const cacheKey = paginationParams
      ? `${CACHE_KEYS.products()}:limit=${limit ?? 'all'}:offset=${offset ?? '0'}`
      : CACHE_KEYS.products();

    const result = await cache.wrap(
      cacheKey,
      async () => {
        // Add timeout protection for Medusa API call
        try {
          return await withTimeout(
            medusaClient.products.list(paginationParams),
            TIMEOUT_LIMITS.EXTERNAL,
            'Fetch products from Medusa'
          );
        } catch (timeoutErr) {
          if (timeoutErr instanceof TimeoutError) {
            console.error('[Products] Medusa timeout:', timeoutErr.message);
            throw new Error('Product service is responding slowly. Please try again.');
          }
          throw timeoutErr;
        }
      },
      CACHE_TTL.STATIC // 1 hour - products rarely change
    );

    // Handle both array (no pagination) and paginated response
    const productsArray: Product[] = Array.isArray(result.data)
      ? result.data
      : (result.data as PaginatedProducts).products;

    const totalCount = Array.isArray(result.data)
      ? result.data.length
      : (result.data as PaginatedProducts).count;

    // Sort by price ascending: green ($20) → blue ($35) → purple ($50)
    const sortedProducts = [...productsArray].sort((a, b) => {
      const priceA = a.variants?.[0]?.prices?.[0]?.amount ?? 0;
      const priceB = b.variants?.[0]?.prices?.[0]?.amount ?? 0;
      return priceA - priceB;
    });

    // Return with caching headers
    return NextResponse.json(
      {
        products: sortedProducts,
        count: sortedProducts.length,
        total: totalCount,
        cached: result.cached,
        source: result.source,
        ...(paginationParams && {
          pagination: {
            limit: paginationParams.limit,
            offset: paginationParams.offset ?? 0,
            hasMore: (paginationParams.offset ?? 0) + sortedProducts.length < totalCount,
          },
        }),
      },
      {
        headers: {
          // Cache for 1 hour, serve stale for 24 hours while revalidating
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error: unknown) {
    // Handle missing publishable API key gracefully
    const medusaError = error as { message?: string; status?: number };
    if (medusaError.message?.includes('Publishable API key required') || medusaError.status === 400) {
      return NextResponse.json({
        products: [],
        count: 0,
        total: 0,
        cached: false,
        source: 'fallback',
        warning: 'Medusa API key not configured. Set NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY in .env.local',
      });
    }
    return handleApiError(error, 'Products GET');
  }
}
