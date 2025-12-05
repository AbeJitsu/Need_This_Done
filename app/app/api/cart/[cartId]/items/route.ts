import { NextRequest, NextResponse } from 'next/server';
import { medusaClient } from '@/lib/medusa-client';
import { badRequest, serverError, handleApiError } from '@/lib/api-errors';
import { cache, CACHE_KEYS } from '@/lib/cache';

// ============================================================================
// Cart Line Items API Route - /api/cart/[cartId]/items
// ============================================================================
// POST: Add item to cart
// PATCH: Update item quantity
// DELETE: Remove item from cart
//
// What: Manages individual items within a shopping cart
// Why: Core ecommerce operations (add to cart, change quantity, remove)
// How: Calls Medusa cart endpoints, invalidates cart cache on changes

// ============================================================================
// POST - Add Item to Cart
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { cartId: string } }
) {
  try {
    const { cartId } = params;
    const body = await request.json();
    const { variant_id, quantity } = body;

    // Validate required fields
    if (!variant_id || !quantity) {
      return badRequest('variant_id and quantity are required');
    }

    if (quantity < 1 || !Number.isInteger(quantity)) {
      return badRequest('quantity must be a positive integer');
    }

    const cart = await medusaClient.carts.addItem(cartId, variant_id, quantity);

    // Invalidate cart cache so next fetch gets fresh data
    await cache.invalidate(CACHE_KEYS.cart(cartId));

    return NextResponse.json(
      {
        success: true,
        cart,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, 'Cart AddItem POST');
  }
}

// ============================================================================
// PATCH - Update Item Quantity
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { cartId: string } }
) {
  try {
    const { cartId } = params;
    const body = await request.json();
    const { line_item_id, quantity } = body;

    // Validate required fields
    if (!line_item_id || quantity === undefined) {
      return badRequest('line_item_id and quantity are required');
    }

    if (quantity < 1 || !Number.isInteger(quantity)) {
      return badRequest('quantity must be a positive integer');
    }

    const cart = await medusaClient.carts.updateItem(cartId, line_item_id, quantity);

    // Invalidate cart cache
    await cache.invalidate(CACHE_KEYS.cart(cartId));

    return NextResponse.json({
      success: true,
      cart,
    });
  } catch (error) {
    return handleApiError(error, 'Cart UpdateItem PATCH');
  }
}

// ============================================================================
// DELETE - Remove Item from Cart
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { cartId: string } }
) {
  try {
    const { cartId } = params;
    const { searchParams } = new URL(request.url);
    const lineItemId = searchParams.get('line_item_id');

    if (!lineItemId) {
      return badRequest('line_item_id is required');
    }

    const cart = await medusaClient.carts.removeItem(cartId, lineItemId);

    // Invalidate cart cache
    await cache.invalidate(CACHE_KEYS.cart(cartId));

    return NextResponse.json({
      success: true,
      cart,
    });
  } catch (error) {
    return handleApiError(error, 'Cart RemoveItem DELETE');
  }
}
