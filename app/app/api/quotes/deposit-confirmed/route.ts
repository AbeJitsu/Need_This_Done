import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getPaymentIntent } from '@/lib/stripe';
import { badRequest, handleApiError } from '@/lib/api-errors';
import { sendDepositConfirmation } from '@/lib/email-service';
import { withTimeout, TIMEOUT_LIMITS } from '@/lib/api-timeout';
import { withSupabaseRetry } from '@/lib/supabase-retry';
import { checkAndMarkRequest, createRequestFingerprint } from '@/lib/request-dedup';

// Schema validates deposit confirmation payload
const DepositConfirmedSchema = z.object({
  quoteId: z.string().min(1, 'Quote ID is required').transform((s: string) => s.trim()),
  paymentIntentId: z.string().min(1, 'Payment Intent ID is required').transform((s: string) => s.trim()),
});

export const dynamic = 'force-dynamic';

// ============================================================================
// Quote Deposit Confirmed API Route
// ============================================================================
// What: Updates quote status after successful deposit payment
// Why: Marks quote as deposit_paid and creates an order record
// How: Verifies payment with Stripe, updates quote, creates order
//
// POST /api/quotes/deposit-confirmed
// Body: { quoteId: string, paymentIntentId: string }
// Returns: { success: true, orderId: string }

export async function POST(request: NextRequest) {
  try {
    // Validate input with Zod schema
    const parsed = DepositConfirmedSchema.safeParse(await request.json());
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }
    const { quoteId, paymentIntentId } = parsed.data;

    // ========================================================================
    // Idempotency Protection - Prevent Duplicate Order Creation
    // ========================================================================
    // Stripe may retry webhook delivery. Multiple requests for same
    // paymentIntentId could create duplicate orders. Use deduplication to
    // ensure exactly-once order creation semantics.

    const fingerprint = createRequestFingerprint({ quoteId, paymentIntentId });
    const isNewRequest = await checkAndMarkRequest(fingerprint, 'Quote deposit confirmation');

    if (!isNewRequest) {
      console.info(`[Quotes] Duplicate deposit confirmation for quote ${quoteId}, skipping`);
      // Return success - the duplicate was already processed
      return NextResponse.json({
        success: true,
        orderId: null,
        quoteStatus: 'deposit_paid',
        note: 'This request was already processed',
      });
    }

    // ========================================================================
    // Fetch Payment Intent with Timeout Protection
    // ========================================================================
    // If Stripe API hangs, fail fast rather than blocking the request.
    // Webhook will retry automatically.

    let paymentIntent: Awaited<ReturnType<typeof getPaymentIntent>>;
    try {
      paymentIntent = await withTimeout(
        getPaymentIntent(paymentIntentId),
        TIMEOUT_LIMITS.EXTERNAL_API,
        'Stripe payment intent fetch'
      );
    } catch (error) {
      console.error('[Quotes] Stripe API timeout or error:', error);
      return badRequest('Unable to verify payment with Stripe. Please try again.');
    }

    if (paymentIntent.status !== 'succeeded') {
      return badRequest(`Payment not completed. Status: ${paymentIntent.status}`);
    }

    // Verify the payment intent is for this quote
    if (paymentIntent.metadata.quote_id !== quoteId) {
      return badRequest('Payment does not match this quote');
    }

    const supabase = getSupabaseAdmin();

    // ========================================================================
    // Get Quote with Retry Logic
    // ========================================================================
    // Transient database errors (timeouts, connection pool exhaustion) should
    // be retried. Only fail if quote genuinely doesn't exist.

    let quote;
    try {
      quote = await withSupabaseRetry(
        async () => {
          const { data, error } = await supabase
            .from('quotes')
            .select('*')
            .eq('id', quoteId)
            .single();

          if (error) throw error;
          return data;
        },
        { operation: 'Fetch quote for deposit confirmation' }
      );

      if (!quote) {
        return badRequest('Quote not found');
      }
    } catch (error) {
      console.error('[Quotes] Failed to fetch quote after retries:', error);
      return badRequest('Unable to fetch quote. Please try again.');
    }

    // ========================================================================
    // Update Quote Status with Retry Logic
    // ========================================================================
    // Ensure quote status reaches the database even if transient errors occur.

    try {
      await withSupabaseRetry(
        async () => {
          const { error } = await supabase
            .from('quotes')
            .update({ status: 'deposit_paid' })
            .eq('id', quoteId);

          if (error) throw error;
        },
        { operation: 'Update quote status to deposit_paid' }
      );
    } catch (error) {
      console.error('[Quotes] Failed to update quote status after retries:', error);
      // Continue - we still want to create the order, status update can be retried
    }

    // ========================================================================
    // Create Order Record with Idempotency
    // ========================================================================
    // Use upsert with conflict detection to prevent duplicate order records.
    // If order already exists for this quote, that's OK - just return success.

    let orderId: string | null = null;
    try {
      const orderData = {
        quote_id: quoteId,
        medusa_order_id: `quote-${quote.reference_number}`,
        total: quote.deposit_amount,
        status: 'pending',
        email: quote.customer_email,
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .upsert(orderData, { onConflict: 'quote_id' })
        .select()
        .single();

      if (orderError) {
        // Only log - don't fail. Payment was successful.
        console.error('[Quotes] Failed to create order record:', orderError);
      } else {
        orderId = order?.id || null;
      }
    } catch (error) {
      console.error('[Quotes] Unexpected error creating order:', error);
      // Don't fail - the payment was successful
    }

    // ========================================================================
    // Send Confirmation Email (Fire-and-Forget with Error Logging)
    // ========================================================================
    // Don't block response on email sending, but do log errors for monitoring.

    sendDepositConfirmation({
      customerEmail: quote.customer_email,
      customerName: quote.customer_name,
      quoteReference: quote.reference_number,
      projectDescription: quote.notes || undefined,
      depositAmount: quote.deposit_amount,
      totalAmount: quote.total_amount,
      balanceRemaining: quote.total_amount - quote.deposit_amount,
      paidAt: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    }).catch((emailError) => {
      console.error('[Quotes] Failed to send deposit confirmation email:', emailError);
    });

    return NextResponse.json({
      success: true,
      orderId,
      quoteStatus: 'deposit_paid',
    });
  } catch (error) {
    return handleApiError(error, 'Quote Deposit Confirmed');
  }
}
