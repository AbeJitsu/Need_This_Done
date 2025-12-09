import { NextRequest, NextResponse } from 'next/server';
import { medusaClient } from '@/lib/medusa-client';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import { handleApiError } from '@/lib/api-errors';

// ============================================================================
// Product Detail API Route - /api/shop/products/[productId]
// ============================================================================
// GET: Fetch single product by ID
//
// What: Fetches product details from Medusa
// Why: Product detail page and admin editors need product data
// How: Calls Medusa product API, caches result

// ============================================================================
// GET - Fetch Product by ID
// ============================================================================

export async function GET(
  _request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;

    const result = await cache.wrap(
      CACHE_KEYS.page(`product:${productId}`),
      async () => {
        return await medusaClient.products.get(productId);
      },
      CACHE_TTL.LONG // 5 minutes
    );

    return NextResponse.json({
      product: result.data,
      cached: result.cached,
      source: result.source,
    });
  } catch (error) {
    return handleApiError(error, 'Product GET');
  }
}
