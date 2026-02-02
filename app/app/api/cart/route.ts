import { NextRequest, NextResponse } from 'next/server';
import { medusaClient } from '@/lib/medusa-client';
import { badRequest, serverError, handleApiError } from '@/lib/api-errors';
import { cache, CACHE_KEYS } from '@/lib/cache';
import { withTimeout, TIMEOUT_LIMITS, TimeoutError } from '@/lib/api-timeout';

export const dynamic = 'force-dynamic';

// ============================================================================
// Cart API Route - /api/cart
// ============================================================================
// POST: Create new shopping cart
// GET: Fetch cart by ID
//
// What: Manages shopping cart lifecycle (create, retrieve, update items)
// Why: Enables add-to-cart flow, item quantity management, cart persistence
// How: Proxies requests to Medusa cart endpoints with cache invalidation

// ============================================================================
// POST - Create New Cart
// ============================================================================
// Creates a new empty cart in Medusa and returns cart ID

export async function POST(_request: NextRequest) {
  try {
    // Create new cart in Medusa with timeout protection
    const cart = await withTimeout(
      medusaClient.carts.create(),
      TIMEOUT_LIMITS.EXTERNAL_API,
      'Medusa cart creation'
    );

    if (!cart || !cart.id) {
      return serverError('Failed to create cart');
    }

    return NextResponse.json(
      {
        success: true,
        cart,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof TimeoutError) {
      console.error('[Cart API] Medusa cart creation timed out:', error);
      return serverError('Cart service is currently slow, please try again in a moment');
    }
    return handleApiError(error, 'Cart POST');
  }
}

// ============================================================================
// GET - Fetch Cart by ID
// ============================================================================
// Retrieves cart contents: items, subtotal, totals

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get('id');

    if (!cartId) {
      return badRequest('Cart ID is required');
    }

    const result = await cache.wrap(
      CACHE_KEYS.cart(cartId),
      async () => {
        // Wrap Medusa API call with timeout
        return await withTimeout(
          medusaClient.carts.get(cartId),
          TIMEOUT_LIMITS.EXTERNAL_API,
          'Medusa cart fetch'
        );
      },
      30 // 30 seconds - carts change frequently
    );

    return NextResponse.json({
      cart: result.data,
      cached: result.cached,
      source: result.source,
    });
  } catch (error) {
    if (error instanceof TimeoutError) {
      console.error('[Cart API] Medusa cart fetch timed out:', error);
      return serverError('Cart service is currently slow, please try again in a moment');
    }
    return handleApiError(error, 'Cart GET');
  }
}
