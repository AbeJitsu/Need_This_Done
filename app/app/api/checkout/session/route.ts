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
    // Wrap with timeout to prevent hanging on slow Medusa responses
    let cart;
    let requiresAppointment = false;
    try {
      cart = await withTimeout(
        medusaClient.carts.get(cart_id),
        TIMEOUT_LIMITS.EXTERNAL_API,
        'Medusa cart fetch'
      );
      // Check if any items require appointments
      // Note: Medusa v1 with expand=items.variant.product puts product at item.variant.product
      requiresAppointment =
        cart.items?.some((item) => {
          // Check both possible locations - Medusa v1 nests product under variant
          const metadata =
            (item.variant as { product?: { metadata?: Record<string, unknown> } })?.product
              ?.metadata || item.product?.metadata;
          const flag = metadata?.requires_appointment;
          // Handle both boolean true and string "true"
          return flag === true || flag === 'true';
        }) || false;
    } catch (error) {
      if (error instanceof TimeoutError) {
        console.error('[Checkout] Cart fetch timed out:', error.message);
        return serverError('Checkout service is currently slow. Please try again in a moment.');
      }
      console.error('Failed to fetch cart for appointment check:', error);
      // Continue checkout even if cart fetch fails
    }

    // Set customer email on cart (required for guest checkout)
    // Medusa requires a customer email before completing the cart
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

    // Initialize payment session on cart before completing
    // Medusa requires this even for manual payment processing
    try {
      // Step 1: Initialize payment sessions (discovers available providers)
      await withTimeout(
        medusaClient.carts.initializePaymentSessions(cart_id),
        TIMEOUT_LIMITS.EXTERNAL_API,
        'Medusa payment session init'
      );

      // Step 2: Select the manual payment provider
      // We use 'manual' because actual payment happens through Stripe separately
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

    // Create order from cart in Medusa
    // This is the critical operation - use longer timeout (15s instead of 8s)
    let order;
    try {
      order = await withTimeout(
        medusaClient.orders.create(cart_id),
        TIMEOUT_LIMITS.WEBHOOK, // 15 seconds for order creation
        'Medusa order creation'
      );
    } catch (error) {
      if (error instanceof TimeoutError) {
        console.error('[Checkout] Order creation timed out:', error.message);
        return serverError('Order processing is taking longer than expected. Please check your email for confirmation or contact support.');
      }
      console.error('Failed to create order from cart:', error);
      // Log the full error for debugging
      if (error && typeof error === 'object' && 'message' in error) {
        console.error('Medusa error details:', error);
      }
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
