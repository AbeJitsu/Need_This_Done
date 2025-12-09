import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase';
import { cache } from '@/lib/cache';
import Stripe from 'stripe';

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
        // Log unhandled events for monitoring
        console.log(`Unhandled Stripe event type: ${event.type}`);
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

  console.log(`Payment succeeded: ${paymentIntent.id}, order: ${orderId}`);

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
      await cache.delete(`order:${orderId}`);
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
}

/**
 * Handle failed payment - update order status
 */
async function handlePaymentFailed(
  paymentIntent: Stripe.PaymentIntent,
  supabase: ReturnType<typeof getSupabaseAdmin>
) {
  const orderId = paymentIntent.metadata.order_id;

  console.log(`Payment failed: ${paymentIntent.id}, order: ${orderId}`);

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
  console.log(`Subscription updated: ${subscription.id}, status: ${subscription.status}`);

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
  const { error } = await supabase.from('subscriptions').upsert(
    {
      user_id: customer.user_id,
      stripe_subscription_id: subscription.id,
      stripe_price_id: subscription.items.data[0]?.price.id || '',
      status: subscription.status,
      current_period_start: new Date(
        subscription.current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    },
    { onConflict: 'stripe_subscription_id' }
  );

  if (error) {
    console.error('Failed to upsert subscription:', error);
  }

  // Invalidate user's subscription cache
  try {
    await cache.delete(`subscription:${customer.user_id}`);
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
  console.log(`Subscription deleted: ${subscription.id}`);

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
  invoice: Stripe.Invoice,
  supabase: ReturnType<typeof getSupabaseAdmin>
) {
  console.log(`Invoice paid: ${invoice.id}`);

  // For subscription invoices, the subscription status is updated via
  // customer.subscription.updated event, so we just log here
  if (invoice.subscription) {
    console.log(`Subscription ${invoice.subscription} invoice paid`);
  }
}

/**
 * Handle failed invoice payment - subscription may go past_due
 */
async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: ReturnType<typeof getSupabaseAdmin>
) {
  console.log(`Invoice payment failed: ${invoice.id}`);

  // The subscription status change will be handled by customer.subscription.updated
  // This is just for logging/alerting purposes
  if (invoice.subscription) {
    console.warn(
      `Subscription ${invoice.subscription} invoice payment failed`
    );
    // Here you might want to send an email notification to the user
  }
}
