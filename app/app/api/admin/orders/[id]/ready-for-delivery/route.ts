import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';
import { badRequest, handleApiError } from '@/lib/api-errors';
import { cache, CACHE_KEYS } from '@/lib/cache';
import { verifyAdmin } from '@/lib/api-auth';
import { withWebhookRetry } from '@/lib/webhook-reliability';
import { TIMEOUT_LIMITS, withTimeout } from '@/lib/api-timeout';

// ============================================================================
// Ready for Delivery API - Final Payment Collection
// ============================================================================
// What: Charge saved card or record alternative payment when order ready
// Why: Collect remaining 50% balance when customer picks up
// How: Attempt Stripe charge, fall back to manual payment options
//
// POST /api/admin/orders/[id]/ready-for-delivery
// Body: { payment_method: 'card' | 'cash' | 'check' | 'other' }
// Returns: { success: true, charged: boolean, payment_method }

const FinalPaymentSchema = z.object({
  payment_method: z.enum(['card', 'cash', 'check', 'other']),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ========================================================================
    // Admin Authentication
    // ========================================================================
    const adminAuth = await verifyAdmin();
    if (adminAuth.error) {
      return adminAuth.error;
    }

    const { id: orderId } = await context.params;

    // Validate request body
    const parsed = FinalPaymentSchema.safeParse(await request.json());
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }
    const { payment_method } = parsed.data;

    const supabase = getSupabaseAdmin();

    // ========================================================================
    // Fetch Order
    // ========================================================================
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      console.error('[Ready for Delivery] Order not found:', { orderId, fetchError });
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // ========================================================================
    // Validate Order Status
    // ========================================================================
    if (order.final_payment_status !== 'pending') {
      return NextResponse.json(
        {
          error: `Final payment already processed (status: ${order.final_payment_status})`,
        },
        { status: 400 }
      );
    }

    if (!order.balance_remaining || order.balance_remaining <= 0) {
      return NextResponse.json(
        { error: 'No balance remaining to collect' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // ========================================================================
    // OPTION 1: Charge Saved Card
    // ========================================================================
    if (payment_method === 'card') {
      if (!order.stripe_payment_method_id) {
        return NextResponse.json(
          {
            error: 'No saved payment method found. Collect payment via alternative method.',
          },
          { status: 400 }
        );
      }

      try {
        // Attempt to charge the saved card
        // off_session=true: Customer not present at payment time
        // confirm=true: Immediately charge (no additional confirmation needed)
        const stripe = getStripe();
        const finalPaymentIntent = await stripe.paymentIntents.create({
          amount: order.balance_remaining,
          currency: 'usd',
          payment_method: order.stripe_payment_method_id,
          off_session: true,
          confirm: true,
          metadata: {
            order_id: order.medusa_order_id,
            payment_type: 'final_payment',
            original_deposit_pi: order.deposit_payment_intent_id,
          },
        });

        // Update order - charge succeeded
        const updateResult = await withWebhookRetry(
          async () => {
            const { error: updateError } = await supabase
              .from('orders')
              .update({
                final_payment_intent_id: finalPaymentIntent.id,
                final_payment_status: 'paid',
                final_payment_method: 'card',
                payment_status: 'paid',
                status: 'completed',
                ready_for_delivery_at: now,
                final_payment_completed_at: now,
              })
              .eq('id', orderId);

            if (updateError) {
              throw new Error(`Failed to update order: ${updateError.message}`);
            }
          },
          { operation: 'Update order after successful final payment' }
        );

        if (!updateResult.success) {
          return NextResponse.json(
            { error: 'Failed to update order status after charge' },
            { status: 500 }
          );
        }

        // Invalidate user's orders cache
        try {
          if (order.user_id) {
            await withTimeout(
              cache.invalidate(CACHE_KEYS.userOrders(order.user_id)),
              TIMEOUT_LIMITS.CACHE,
              'Invalidate user orders cache'
            );
          }
        } catch (err) {
          console.warn('[Ready for Delivery] Cache invalidation failed:', err);
        }

        console.log(
          '[Ready for Delivery] Card charge successful:',
          {
            orderId: order.medusa_order_id,
            amount: order.balance_remaining,
            paymentIntentId: finalPaymentIntent.id,
          }
        );

        return NextResponse.json({
          success: true,
          charged: true,
          payment_intent_id: finalPaymentIntent.id,
          message: 'Card charged successfully',
        });
      } catch (stripeError: any) {
        // Card was declined or other Stripe error
        console.error('[Ready for Delivery] Card charge failed:', {
          orderId: order.medusa_order_id,
          error: stripeError.message,
          code: stripeError.code,
        });

        // Mark payment as failed, but don't fail the API call
        // Admin can retry or collect alternative payment
        await withWebhookRetry(
          async () => {
            const { error: updateError } = await supabase
              .from('orders')
              .update({
                final_payment_status: 'failed',
                ready_for_delivery_at: now,
              })
              .eq('id', orderId);

            if (updateError) {
              console.error('[Ready for Delivery] Failed to mark payment as failed:', updateError);
            }
          },
          { operation: 'Update order after failed payment' }
        );

        // Return the error to admin
        return NextResponse.json(
          {
            error: 'Card declined. Please collect payment via alternative method.',
            stripe_error: stripeError.message,
          },
          { status: 402 } // 402 Payment Required
        );
      }
    }

    // ========================================================================
    // OPTION 2: Alternative Payment (Cash, Check, Other)
    // ========================================================================
    const updateResult = await withWebhookRetry(
      async () => {
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            final_payment_status: 'waived', // 'waived' means no card charge needed
            final_payment_method: payment_method,
            payment_status: 'paid',
            status: 'completed',
            ready_for_delivery_at: now,
            final_payment_completed_at: now,
          })
          .eq('id', orderId);

        if (updateError) {
          throw new Error(`Failed to update order: ${updateError.message}`);
        }
      },
      { operation: 'Update order after alternative payment' }
    );

    if (!updateResult.success) {
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      );
    }

    // Invalidate user's orders cache
    try {
      if (order.user_id) {
        await withTimeout(
          cache.invalidate(CACHE_KEYS.userOrders(order.user_id)),
          TIMEOUT_LIMITS.CACHE,
          'Invalidate user orders cache'
        );
      }
    } catch (err) {
      console.warn('[Ready for Delivery] Cache invalidation failed:', err);
    }

    console.log(
      '[Ready for Delivery] Alternative payment recorded:',
      {
        orderId: order.medusa_order_id,
        amount: order.balance_remaining,
        method: payment_method,
      }
    );

    return NextResponse.json({
      success: true,
      charged: false,
      payment_method,
      message: `Payment recorded via ${payment_method}`,
    });
  } catch (error) {
    console.error('[Ready for Delivery] Unexpected error:', error);
    return handleApiError(error, 'Ready for Delivery');
  }
}
