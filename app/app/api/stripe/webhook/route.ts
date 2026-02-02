import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase';
import { cache } from '@/lib/cache';
import { sendOrderConfirmation } from '@/lib/email-service';
import { withWebhookRetry, validateWebhookData, getWebhookStatusCode, type WebhookHandlerResult } from '@/lib/webhook-reliability';
import { validateRequestSize, SIZE_LIMITS } from '@/lib/request-size-limit';
import { withTimeout, TIMEOUT_LIMITS } from '@/lib/api-timeout';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

// ============================================================================
// Stripe Webhook Handler
// ============================================================================
// What: Process webhook events from Stripe (payment confirmations, subscription changes)
// Why: Update our database when payments succeed/fail, subscriptions change
// How: Verify signature, route events to handlers, update Supabase with retries
//
// POST /api/stripe/webhook
// Headers: stripe-signature (required for verification)
// Body: Raw Stripe event payload
//
// RELIABILITY IMPROVEMENTS:
// - All database operations retry on transient failures
// - Webhook returns appropriate status codes (500 for transient, 200 for permanent)
// - Validates critical event data before processing
// - Size-limits payloads to prevent memory exhaustion
// - Timeout-protects cache operations to prevent response hangs

export async function POST(request: NextRequest) {
  try {
    // ====================================================================
    // Validate Request Size FIRST - Prevent DoS via oversized payloads
    // ====================================================================
    const sizeError = validateRequestSize(
      request,
      SIZE_LIMITS.JSON_PAYLOAD,
      'Stripe webhook'
    );
    if (sizeError) return sizeError;

    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('[Webhook] Missing stripe-signature header');
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
      console.error('[Webhook] Signature verification failed:', err);
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
    // CRITICAL: Use atomic transaction to ensure exactly-once semantics.
    // Separate insert attempt (to detect if duplicate) from processing logic.

    // Validate event ID exists - this is our idempotency key
    if (!event.id || typeof event.id !== 'string') {
      console.error('[Webhook] Invalid event ID from Stripe:', event.id);
      return NextResponse.json(
        { error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
    let isDuplicate = false;
    let isDuplicateRecentlyProcessed = false;

    // Atomically insert the event record - this will fail if event_id already exists
    // This is our idempotency key: first insert wins
    const recordEventResult = await withWebhookRetry(
      async () => {
        const now = new Date().toISOString();
        const { error: insertError } = await supabase
          .from('webhook_events')
          .insert({
            event_id: event.id,
            event_type: event.type,
            processed_at: now,
            first_seen_at: now,
          })
          .select('processed_at, first_seen_at')
          .single();

        // If insert fails with constraint error, this is a duplicate
        if (insertError) {
          if (insertError.message?.includes('duplicate') || insertError.code === '23505') {
            // This is a duplicate event - fetch its first processing time
            const { data: existingEvent } = await supabase
              .from('webhook_events')
              .select('first_seen_at')
              .eq('event_id', event.id)
              .single();

            if (existingEvent) {
              const firstSeenTime = new Date(
                (existingEvent as Record<string, unknown>).first_seen_at as string
              ).getTime();
              isDuplicateRecentlyProcessed = Date.now() - firstSeenTime < DUPLICATE_WINDOW_MS;
              isDuplicate = true;
              console.log(
                `[Webhook] Event ${event.id} is a duplicate (first seen: ${new Date(firstSeenTime).toISOString()}, recent: ${isDuplicateRecentlyProcessed})`
              );
              return; // Exit early for duplicates
            }
          }
          throw new Error(`Failed to record event: ${insertError.message}`);
        }
      },
      { operation: 'Record webhook event for idempotency' }
    );

    if (!recordEventResult.success) {
      const statusCode = getWebhookStatusCode(recordEventResult);
      console.error(
        `[Webhook] Failed to ensure idempotency:`,
        recordEventResult.error?.message
      );
      return NextResponse.json(
        { error: 'Failed to ensure idempotency', details: recordEventResult.error?.message },
        { status: statusCode }
      );
    }

    // If this is a recently-processed duplicate, skip processing but return success
    if (isDuplicate && isDuplicateRecentlyProcessed) {
      console.log(`[Webhook] Event ${event.id} already processed recently, skipping duplicate`);
      return NextResponse.json({ received: true, skipped: true });
    }

    // ====================================================================
    // Route event to appropriate handler with error tracking
    // ====================================================================
    let handlerResult: WebhookHandlerResult = { success: true };

    try {
      switch (event.type) {
        // ======================================================================
        // Payment Events
        // ======================================================================
        case 'payment_intent.succeeded':
          handlerResult = await handlePaymentSuccess(
            event.data.object as Stripe.PaymentIntent,
            supabase
          );
          break;

        case 'payment_intent.payment_failed':
          handlerResult = await handlePaymentFailed(
            event.data.object as Stripe.PaymentIntent,
            supabase
          );
          break;

        // ======================================================================
        // Subscription Events
        // ======================================================================
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          handlerResult = await handleSubscriptionUpdate(
            event.data.object as Stripe.Subscription,
            supabase
          );
          break;

        case 'customer.subscription.deleted':
          handlerResult = await handleSubscriptionDeleted(
            event.data.object as Stripe.Subscription,
            supabase
          );
          break;

        // ======================================================================
        // Invoice Events (for subscription renewals)
        // ======================================================================
        case 'invoice.paid':
          handlerResult = await handleInvoicePaid(
            event.data.object as Stripe.Invoice,
            supabase
          );
          break;

        case 'invoice.payment_failed':
          handlerResult = await handleInvoicePaymentFailed(
            event.data.object as Stripe.Invoice,
            supabase
          );
          break;

        default:
          // Unhandled event types are silently ignored but still acknowledged
          break;
      }
    } catch (error) {
      console.error(
        `[Webhook] Unexpected error in event handler (${event.type}):`,
        error
      );
      handlerResult = {
        success: false,
        error: {
          message: String(error),
          code: 'PERMANENT',
          retriesAttempted: 0,
        },
      };
    }

    // Return appropriate status code based on handler result
    const statusCode = getWebhookStatusCode(handlerResult);
    return NextResponse.json(
      {
        received: true,
        ...(handlerResult.error && { warning: handlerResult.error.message }),
      },
      { status: statusCode }
    );
  } catch (error) {
    console.error('[Webhook] Fatal error in webhook handler:', error);
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
 * Returns operation result to determine webhook response status code
 */
async function handlePaymentSuccess(
  paymentIntent: Stripe.PaymentIntent,
  supabase: ReturnType<typeof getSupabaseAdmin>
): Promise<WebhookHandlerResult> {
  // Validate required metadata
  const validationError = validateWebhookData(
    paymentIntent.metadata || {},
    ['order_id'],
    'PaymentIntent'
  );
  if (validationError) {
    console.warn(`[Webhook] ${validationError}`);
    // Don't fail - process with available data
  }

  const orderId = paymentIntent.metadata?.order_id;
  const email = paymentIntent.metadata?.email;

  // Update order status if we have an order ID
  if (orderId) {
    const updateResult = await withWebhookRetry(
      async () => {
        const { error: orderError } = await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            stripe_payment_intent_id: paymentIntent.id,
            status: 'completed',
          })
          .eq('medusa_order_id', orderId);

        if (orderError) {
          throw new Error(`Failed to update order: ${orderError.message}`);
        }
      },
      { operation: 'Update order payment status' }
    );

    if (!updateResult.success) {
      return updateResult;
    }

    // Invalidate order cache with timeout protection
    try {
      await withTimeout(
        cache.invalidate(`order:${orderId}`),
        TIMEOUT_LIMITS.CACHE,
        'Cache invalidation for order'
      );
    } catch (err) {
      console.warn('[Webhook] Cache invalidation failed (non-blocking):', err);
      // Don't fail - cache invalidation is best-effort
    }
  }

  // Record the payment
  const recordResult = await withWebhookRetry(
    async () => {
      const { error: paymentError } = await supabase.from('payments').insert({
        stripe_payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: 'succeeded',
        email: email || null,
      });

      if (paymentError) {
        throw new Error(`Failed to record payment: ${paymentError.message}`);
      }
    },
    { operation: 'Record payment transaction' }
  );

  if (!recordResult.success) {
    return recordResult;
  }

  // Send order confirmation email (fire and forget - don't block webhook response)
  if (email && orderId) {
    // Fetch order details for the email (best-effort, don't fail if this fails)
    // Wrap with timeout to prevent hanging webhook if database is slow
    let orderDetails: Record<string, unknown> | null = null;
    try {
      // Execute the Supabase query with timeout protection
      const result = await withTimeout(
        (async () => {
          return await supabase
            .from('orders')
            .select('id, medusa_order_id, total, requires_appointment, customer_name, items')
            .eq('medusa_order_id', orderId)
            .single();
        })(),
        TIMEOUT_LIMITS.DATABASE,
        'Fetch order details for confirmation email'
      );
      if (result && typeof result === 'object' && 'data' in result) {
        const data = (result as unknown as Record<string, unknown>).data;
        if (data && typeof data === 'object') {
          orderDetails = data as Record<string, unknown>;
        }
      }
    } catch (err) {
      console.warn('[Webhook] Failed to fetch order details for email (timeout or error):', err);
      // Continue - send email with minimal data
    }

    if (orderDetails) {
      const orderItems = Array.isArray(orderDetails.items) ? orderDetails.items : [];
      const shortOrderId = String(orderDetails.medusa_order_id || orderId).slice(0, 8);

      // CRITICAL: Attach error handler to prevent unhandled rejections
      sendOrderConfirmation({
        orderId: shortOrderId,
        orderDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        customerEmail: email,
        customerName: (orderDetails.customer_name as string) || undefined,
        items: orderItems.map((item: Record<string, unknown>) => ({
          name: (item.name as string) || 'Item',
          quantity: (item.quantity as number) || 1,
          price: (item.price as number) || 0,
          requiresAppointment: (item.requires_appointment as boolean) || false,
        })),
        subtotal: paymentIntent.amount,
        total: paymentIntent.amount,
        requiresAppointment: (orderDetails.requires_appointment as boolean) || false,
      }).then(() => {
        console.log('[Webhook] Order confirmation email task completed');
      }).catch((err: unknown) => {
        console.error('[Webhook] Failed to send order confirmation email:', err);
        // Log failed email attempt to database for manual follow-up (don't block webhook)
        // Fire-and-forget - don't await
        const failureOrderId = String(orderDetails?.medusa_order_id || orderId).slice(0, 8);
        (async () => {
          try {
            await supabase
              .from('email_failures')
              .insert({
                type: 'order_confirmation',
                recipient_email: email,
                subject: `Order Confirmation: ${failureOrderId}`,
                order_id: (orderDetails?.id as string) || orderId,
                error_message: err instanceof Error ? err.message : 'Unknown error',
                created_at: new Date().toISOString(),
              });
          } catch (logErr) {
            console.error('[Webhook] Failed to log order confirmation email failure:', logErr);
          }
        })();
      });
    }
  }

  return { success: true };
}

/**
 * Handle failed payment - update order status
 */
async function handlePaymentFailed(
  paymentIntent: Stripe.PaymentIntent,
  supabase: ReturnType<typeof getSupabaseAdmin>
): Promise<WebhookHandlerResult> {
  const orderId = paymentIntent.metadata?.order_id;

  if (!orderId) {
    return { success: true }; // No order to update
  }

  return withWebhookRetry(
    async () => {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('medusa_order_id', orderId);

      if (error) {
        throw new Error(`Failed to update order status: ${error.message}`);
      }
    },
    { operation: 'Update order payment failed status' }
  );
}

/**
 * Handle subscription creation or update - sync to our database
 */
async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof getSupabaseAdmin>
): Promise<WebhookHandlerResult> {
  return withWebhookRetry(
    async () => {
      // Find user by Stripe customer ID
      const { data: customer, error: customerError } = await supabase
        .from('stripe_customers')
        .select('user_id')
        .eq('stripe_customer_id', subscription.customer as string)
        .single();

      if (customerError || !customer) {
        // This is a critical error - we can't update subscription without knowing the user
        // Throw so withWebhookRetry can handle it appropriately
        throw new Error(
          `Failed to find user for Stripe customer ${subscription.customer}: ${customerError?.message || 'Not found'}`
        );
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
        throw new Error(`Failed to upsert subscription: ${error.message}`);
      }

      // Invalidate user's subscription cache with timeout protection
      try {
        await withTimeout(
          cache.invalidate(`subscription:${customer.user_id}`),
          TIMEOUT_LIMITS.CACHE,
          'Cache invalidation for subscription'
        );
      } catch (err) {
        console.warn('[Webhook] Cache invalidation failed (non-blocking):', err);
      }
    },
    { operation: 'Update subscription information' }
  );
}

/**
 * Handle subscription deletion - mark as canceled
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof getSupabaseAdmin>
): Promise<WebhookHandlerResult> {
  return withWebhookRetry(
    async () => {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', subscription.id);

      if (error) {
        throw new Error(`Failed to mark subscription as canceled: ${error.message}`);
      }
    },
    { operation: 'Mark subscription as canceled' }
  );
}

/**
 * Handle successful invoice payment (for subscription renewals)
 */
async function handleInvoicePaid(
  _invoice: Stripe.Invoice,
  _supabase: ReturnType<typeof getSupabaseAdmin>
): Promise<WebhookHandlerResult> {
  // For subscription invoices, the subscription status is updated via
  // customer.subscription.updated event, so no action needed here
  return { success: true };
}

/**
 * Handle failed invoice payment - subscription may go past_due
 */
async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
  _supabase: ReturnType<typeof getSupabaseAdmin>
): Promise<WebhookHandlerResult> {
  // The subscription status change will be handled by customer.subscription.updated
  // Log as warning for alerting purposes
  const invoiceData = invoice as any;
  if (invoiceData.subscription) {
    console.warn(
      `[Webhook] Subscription ${invoiceData.subscription} invoice payment failed`
    );
    // Here you might want to send an email notification to the user
  }
  return { success: true };
}
