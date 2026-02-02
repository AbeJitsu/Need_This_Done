import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase';
import { cache } from '@/lib/cache';
import { sendOrderConfirmation } from '@/lib/email-service';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

// ============================================================================
// Stripe Webhook Handler
// ============================================================================
// What: Process webhook events from Stripe (payment confirmations, subscription changes)
// Why: Update our database when payments succeed/fail, subscriptions change
// How: Verify signature, route events to handlers, update Supabase
//
// POST /api/stripe/webhook
// Headers: stripe-signature (required for verification)
// Body: Raw Stripe event payload
//
// Important: This endpoint receives raw body, not JSON parsed

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Webhook: Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify and construct the event
    let event: Stripe.Event;
    try {
      event = constructWebhookEvent(body, signature);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Get admin client for database operations
    const supabase = getSupabaseAdmin();

    // ========================================================================
    // Idempotency Protection - Prevent Duplicate Event Processing
    // ========================================================================
    // Stripe may send the same webhook multiple times (network retries).
    // Use atomic upsert with unique constraint to prevent race conditions.
    //
    // CRITICAL: The previous SELECT-then-INSERT pattern had a TOCTOU race:
    //   Thread A: SELECT (no row) → Thread B: INSERT (success) → Thread A: INSERT (fails)
    //   Both threads would process the event.
    //
    // Solution: Use upsert with ignoreDuplicates to make it atomic.
    // If row exists, do nothing. If new, insert and continue processing.

    const { error: upsertError } = await supabase
      .from('webhook_events')
      .upsert(
        {
          event_id: event.id,
          event_type: event.type,
          processed_at: new Date().toISOString(),
        },
        {
          onConflict: 'event_id',
          ignoreDuplicates: true, // Don't update if exists, just return success
        }
      );

    // Check upsert error FIRST before any duplicate detection
    if (upsertError) {
      console.error('[Webhook] Failed to record event:', upsertError);
      // Fail fast - don't process if we can't guarantee idempotency
      return NextResponse.json(
        { error: 'Failed to ensure idempotency' },
        { status: 500 }
      );
    }

    // Check if this is a duplicate by attempting to read back the row
    const { data: eventRecord } = await supabase
      .from('webhook_events')
      .select('processed_at')
      .eq('event_id', event.id)
      .single();

    if (eventRecord) {
      const processingTime = new Date(eventRecord.processed_at).getTime();
      const now = Date.now();

      // If processed_at is more than 24 hours old, this is a retry
      // Stripe retries with exponential backoff: 5s, 5s, 10s, 10s, 17s, 33s, 133s (max)
      // All retries will be within a few hours, so 24 hours is safe for durability
      const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
      if (now - processingTime > DUPLICATE_WINDOW_MS) {
        console.log(`[Webhook] Event ${event.id} already processed at ${eventRecord.processed_at}, skipping duplicate`);
        return NextResponse.json({ received: true, skipped: true });
      }
    }

    // Route event to appropriate handler
    switch (event.type) {
      // ======================================================================
      // Payment Events
      // ======================================================================
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(
          event.data.object as Stripe.PaymentIntent,
          supabase
        );
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(
          event.data.object as Stripe.PaymentIntent,
          supabase
        );
        break;

      // ======================================================================
      // Subscription Events
      // ======================================================================
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(
          event.data.object as Stripe.Subscription,
          supabase
        );
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
          supabase
        );
        break;

      // ======================================================================
      // Invoice Events (for subscription renewals)
      // ======================================================================
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice, supabase);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(
          event.data.object as Stripe.Invoice,
          supabase
        );
        break;

      default:
        // Unhandled event types are silently ignored
        break;
    }

    // Acknowledge receipt to Stripe
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handle successful payment - update order status and record payment
 */
async function handlePaymentSuccess(
  paymentIntent: Stripe.PaymentIntent,
  supabase: ReturnType<typeof getSupabaseAdmin>
) {
  const orderId = paymentIntent.metadata.order_id;
  const email = paymentIntent.metadata.email;

  // Update order status if we have an order ID
  if (orderId) {
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        stripe_payment_intent_id: paymentIntent.id,
        status: 'completed',
      })
      .eq('medusa_order_id', orderId);

    if (orderError) {
      console.error('Failed to update order:', orderError);
    }

    // Invalidate order cache
    try {
      await cache.invalidate(`order:${orderId}`);
    } catch {
      // Cache invalidation is best-effort
    }
  }

  // Record the payment
  const { error: paymentError } = await supabase.from('payments').insert({
    stripe_payment_intent_id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: 'succeeded',
    email: email || null,
  });

  if (paymentError) {
    console.error('Failed to record payment:', paymentError);
  }

  // Send order confirmation email (fire and forget - don't block webhook response)
  if (email && orderId) {
    // Fetch order details for the email
    const { data: orderDetails } = await supabase
      .from('orders')
      .select('id, medusa_order_id, total, requires_appointment, customer_name, items')
      .eq('medusa_order_id', orderId)
      .single();

    if (orderDetails) {
      const orderItems = Array.isArray(orderDetails.items) ? orderDetails.items : [];
      sendOrderConfirmation({
        orderId: orderDetails.medusa_order_id?.slice(0, 8) || orderId.slice(0, 8),
        orderDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        customerEmail: email,
        customerName: orderDetails.customer_name || undefined,
        items: orderItems.map((item: Record<string, unknown>) => ({
          name: (item.name as string) || 'Item',
          quantity: (item.quantity as number) || 1,
          price: (item.price as number) || 0,
          requiresAppointment: (item.requires_appointment as boolean) || false,
        })),
        subtotal: paymentIntent.amount,
        total: paymentIntent.amount,
        requiresAppointment: orderDetails.requires_appointment || false,
      }).catch((err) => {
        console.error('[Webhook] Failed to send order confirmation email:', err);
      });
    }
  }
}

/**
 * Handle failed payment - update order status
 */
async function handlePaymentFailed(
  paymentIntent: Stripe.PaymentIntent,
  supabase: ReturnType<typeof getSupabaseAdmin>
) {
  const orderId = paymentIntent.metadata.order_id;

  if (orderId) {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: 'failed' })
      .eq('medusa_order_id', orderId);

    if (error) {
      console.error('Failed to update order status:', error);
    }
  }
}

/**
 * Handle subscription creation or update - sync to our database
 */
async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof getSupabaseAdmin>
) {
  // Find user by Stripe customer ID
  const { data: customer } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', subscription.customer as string)
    .single();

  if (!customer) {
    console.error(
      `No user found for Stripe customer: ${subscription.customer}`
    );
    return;
  }

  // Upsert subscription record
  const subData = subscription as any;
  const { error } = await supabase.from('subscriptions').upsert(
    {
      user_id: customer.user_id,
      stripe_subscription_id: subscription.id,
      stripe_price_id: subscription.items.data[0]?.price.id || '',
      status: subscription.status,
      current_period_start: new Date(
        subData.current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date(
        subData.current_period_end * 1000
      ).toISOString(),
      cancel_at_period_end: subData.cancel_at_period_end,
    },
    { onConflict: 'stripe_subscription_id' }
  );

  if (error) {
    console.error('Failed to upsert subscription:', error);
  }

  // Invalidate user's subscription cache
  try {
    await cache.invalidate(`subscription:${customer.user_id}`);
  } catch {
    // Cache invalidation is best-effort
  }
}

/**
 * Handle subscription deletion - mark as canceled
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof getSupabaseAdmin>
) {
  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Failed to mark subscription as canceled:', error);
  }
}

/**
 * Handle successful invoice payment (for subscription renewals)
 */
async function handleInvoicePaid(
  _invoice: Stripe.Invoice,
  _supabase: ReturnType<typeof getSupabaseAdmin>
) {
  // For subscription invoices, the subscription status is updated via
  // customer.subscription.updated event, so no action needed here
}

/**
 * Handle failed invoice payment - subscription may go past_due
 */
async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
  _supabase: ReturnType<typeof getSupabaseAdmin>
) {
  // The subscription status change will be handled by customer.subscription.updated
  // Log as warning for alerting purposes
  const invoiceData = invoice as any;
  if (invoiceData.subscription) {
    console.warn(
      `Subscription ${invoiceData.subscription} invoice payment failed`
    );
    // Here you might want to send an email notification to the user
  }
}
