import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { medusaClient } from '@/lib/medusa-client';
import { badRequest, serverError, handleApiError } from '@/lib/api-errors';
import { verifyAuth } from '@/lib/api-auth';
import { cache, CACHE_KEYS } from '@/lib/cache';
import { withTimeout, TIMEOUT_LIMITS, TimeoutError } from '@/lib/api-timeout';

export const dynamic = 'force-dynamic';

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
    const { cart_id, email, order_notes } = body;

    // Validate: need a Medusa cart
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

    // ====================================================================
    // Process Medusa cart
    // ====================================================================
    let requiresAppointment = false;

    // Fetch cart to check for appointment-required products
    let cart;
    try {
      cart = await withTimeout(
        medusaClient.carts.get(cart_id),
        TIMEOUT_LIMITS.EXTERNAL_API,
        'Medusa cart fetch'
      );
      requiresAppointment =
        cart.items?.some((item) => {
          const metadata =
            (item.variant as { product?: { metadata?: Record<string, unknown> } })?.product
              ?.metadata || item.product?.metadata;
          const flag = metadata?.requires_appointment;
          return flag === true || flag === 'true';
        }) || false;
    } catch (error) {
      if (error instanceof TimeoutError) {
        console.error('[Checkout] Cart fetch timed out:', error.message);
        return serverError('Checkout service is currently slow. Please try again in a moment.');
      }
      console.error('Failed to fetch cart for appointment check:', error);
      return serverError('Failed to fetch cart');
    }

    // Set customer email on cart
    if (email) {
      try {
        await withTimeout(
          medusaClient.carts.update(cart_id, { email }),
          TIMEOUT_LIMITS.EXTERNAL_API,
          'Medusa cart update'
        );
      } catch (error) {
        if (error instanceof TimeoutError) {
          console.error('[Checkout] Cart update timed out:', error.message);
          return serverError('Checkout service is currently slow. Please try again.');
        }
        console.error('Failed to set customer email on cart:', error);
        return serverError('Failed to update cart with customer information');
      }
    }

    // Initialize payment session and create Medusa order
    try {
      await withTimeout(
        medusaClient.carts.initializePaymentSessions(cart_id),
        TIMEOUT_LIMITS.EXTERNAL_API,
        'Medusa payment session init'
      );
      await withTimeout(
        medusaClient.carts.selectPaymentSession(cart_id, 'manual'),
        TIMEOUT_LIMITS.EXTERNAL_API,
        'Medusa payment session select'
      );
    } catch (error) {
      if (error instanceof TimeoutError) {
        console.error('[Checkout] Payment session setup timed out:', error.message);
        return serverError('Checkout service is currently slow. Please try again.');
      }
      console.error('Failed to initialize payment session:', error);
      return serverError('Failed to prepare checkout. Please try again.');
    }

    let order: { id: string; total: number; status: string; email: string };
    try {
      order = await withTimeout(
        medusaClient.orders.create(cart_id),
        TIMEOUT_LIMITS.WEBHOOK,
        'Medusa order creation'
      );
    } catch (error) {
      if (error instanceof TimeoutError) {
        console.error('[Checkout] Order creation timed out:', error.message);
        return serverError('Order processing is taking longer than expected. Please check your email for confirmation or contact support.');
      }
      console.error('Failed to create order from cart:', error);
      return serverError('Failed to create order from cart');
    }

    if (!order || !order.id) {
      return serverError('Order creation failed');
    }

    // Invalidate cart cache
    await cache.invalidate(CACHE_KEYS.cart(cart_id));

    // ====================================================================
    // Save order to Supabase
    // ====================================================================
    if (isAuthenticated && userId) {
      try {
        const supabase = await createSupabaseServerClient();

        const { error: dbError } = await supabase
          .from('orders')
          .insert({
            user_id: userId,
            medusa_order_id: order.id,
            total: order.total,
            status: order.status || 'pending',
            email: order.email || email,
            requires_appointment: requiresAppointment,
            ...(order_notes ? { notes: order_notes } : {}),
          });

        if (dbError) {
          console.error('Failed to link order to user:', dbError);
        }

        await cache.invalidate(CACHE_KEYS.userOrders(userId));
      } catch (error) {
        console.error('Failed to save order to Supabase:', error);
      }
    }

    return NextResponse.json(
      {
        success: true,
        order,
        order_id: order.id,
        tracking_email: order.email || email,
        requires_appointment: requiresAppointment,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, 'Checkout Session POST');
  }
}
