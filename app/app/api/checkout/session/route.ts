import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { medusaClient } from '@/lib/medusa-client';
import { badRequest, serverError, handleApiError } from '@/lib/api-errors';
import { verifyAuth } from '@/lib/api-auth';
import { cache, CACHE_KEYS } from '@/lib/cache';

// ============================================================================
// Checkout Session API Route - /api/checkout/session
// ============================================================================
// POST: Create checkout session from cart
//
// What: Converts shopping cart into an order
// Why: Initiates checkout flow, links order to user if authenticated
// How: Calls Medusa cart completion endpoint, optionally links to Supabase user

// ============================================================================
// POST - Create Checkout Session
// ============================================================================
// Converts cart to order. If user is logged in, links order to Supabase user.
// If guest, stores email for order tracking.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cart_id, email } = body;

    // Validate required fields
    if (!cart_id) {
      return badRequest('cart_id is required');
    }

    // Check if user is authenticated (optional - guest checkout supported)
    let userId: string | null = null;
    let isAuthenticated = false;

    try {
      const authResult = await verifyAuth();
      if (!authResult.error) {
        userId = authResult.user.id;
        isAuthenticated = true;
      }
    } catch {
      // Not authenticated - guest checkout
    }

    // If guest, require email
    if (!isAuthenticated && !email) {
      return badRequest('Email is required for guest checkout');
    }

    // Fetch cart to check for appointment-required products
    let cart;
    let requiresAppointment = false;
    try {
      cart = await medusaClient.carts.get(cart_id);
      // Check if any items require appointments
      requiresAppointment = cart.items?.some(
        (item) => item.product?.metadata?.requires_appointment === true
      ) || false;
    } catch (error) {
      console.error('Failed to fetch cart for appointment check:', error);
      // Continue checkout even if cart fetch fails
    }

    // Create order from cart in Medusa
    let order;
    try {
      order = await medusaClient.orders.create(cart_id);
    } catch (error) {
      return serverError('Failed to create order from cart');
    }

    if (!order || !order.id) {
      return serverError('Order creation failed');
    }

    // If authenticated, link order to Supabase user
    if (isAuthenticated && userId) {
      try {
        const supabase = await createSupabaseServerClient();
        const { error: dbError } = await supabase
          .from('orders')
          .insert({
            user_id: userId,
            medusa_order_id: order.id,
            total: order.total,
            status: order.status,
            email: order.email,
            requires_appointment: requiresAppointment,
          });

        if (dbError) {
          console.error('Failed to link order to user:', dbError);
          // Don't fail checkout - order exists in Medusa
        }

        // Invalidate user's order cache
        await cache.invalidate(CACHE_KEYS.userOrders(userId));
      } catch (error) {
        console.error('Failed to save order to Supabase:', error);
        // Don't fail checkout - order exists in Medusa
      }
    }

    // Invalidate cart cache since it's now converted to order
    await cache.invalidate(CACHE_KEYS.cart(cart_id));

    return NextResponse.json(
      {
        success: true,
        order,
        order_id: order.id,
        tracking_email: order.email,
        requires_appointment: requiresAppointment,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, 'Checkout Session POST');
  }
}
