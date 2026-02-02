import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createPaymentIntent } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase';
import { badRequest, notFound, handleApiError } from '@/lib/api-errors';
import { withTimeout, TIMEOUT_LIMITS, TimeoutError } from '@/lib/api-timeout';
import { withSupabaseRetry } from '@/lib/supabase-retry';

// Schema validates and transforms input in one step
const AuthorizeSchema = z.object({
  quoteRef: z.string().min(1, 'Quote reference is required').transform((s: string) => s.trim().toUpperCase()),
  email: z.string().email('Valid email is required').transform((s: string) => s.trim().toLowerCase()),
});

export const dynamic = 'force-dynamic';

// ============================================================================
// Authorize Quote API Route
// ============================================================================
// What: Validate a quote and create a Stripe PaymentIntent for deposit payment
// Why: Customers pay a 50% deposit to authorize project work
// How: Lookup quote by reference + email, validate, create payment intent
//
// POST /api/quotes/authorize
// Body: { quoteRef: string, email: string }
// Returns: { clientSecret: string, paymentIntentId: string, quote: {...} }

interface QuoteRecord {
  id: string;
  reference_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  deposit_amount: number;
  status: string;
  expires_at: string;
  notes: string | null;
  line_items: Array<{ description: string; amount: number }>;
  stripe_payment_intent_id: string | null;
}

export async function POST(request: NextRequest) {
  try {
    // Validate and transform input with Zod
    const parsed = AuthorizeSchema.safeParse(await request.json());
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }
    const { quoteRef, email } = parsed.data; // Already normalized by schema transforms

    // Look up the quote with retry logic (critical for payment flow)
    const supabase = getSupabaseAdmin();
    const quoteResult = await withSupabaseRetry(
      () => supabase
        .from('quotes')
        .select('*')
        .eq('reference_number', quoteRef)
        .single<QuoteRecord>(),
      { operation: 'Fetch quote', maxRetries: 3 }
    );

    const { data: quote, error: fetchError } = quoteResult;

    if (fetchError || !quote) {
      return notFound('Quote not found. Please check your reference number.');
    }

    // Validate email matches
    if (quote.customer_email.toLowerCase() !== email) {
      return badRequest('Email does not match the quote. Please use the email the quote was sent to.');
    }

    // Check quote status
    const validStatuses = ['sent', 'authorized'];
    if (!validStatuses.includes(quote.status)) {
      if (quote.status === 'draft') {
        return badRequest('This quote has not been sent yet. Please contact us for assistance.');
      }
      if (quote.status === 'deposit_paid') {
        return badRequest('Deposit has already been paid for this quote.');
      }
      if (quote.status === 'expired' || quote.status === 'cancelled') {
        return badRequest('This quote is no longer valid. Please contact us for a new quote.');
      }
      return badRequest('This quote cannot be authorized at this time.');
    }

    // Check expiration
    const expiresAt = new Date(quote.expires_at);
    if (expiresAt < new Date()) {
      // Mark quote as expired
      await supabase
        .from('quotes')
        .update({ status: 'expired' })
        .eq('id', quote.id);

      return badRequest('This quote has expired. Please contact us for a new quote.');
    }

    // If already authorized with a payment intent, return the existing one
    if (quote.status === 'authorized' && quote.stripe_payment_intent_id) {
      // Retrieve the existing payment intent to get the client secret
      const { getPaymentIntent } = await import('@/lib/stripe');
      const existingIntent = await withTimeout(
        getPaymentIntent(quote.stripe_payment_intent_id),
        TIMEOUT_LIMITS.EXTERNAL_API,
        'Stripe payment intent retrieval'
      );

      return NextResponse.json({
        clientSecret: existingIntent.client_secret,
        paymentIntentId: existingIntent.id,
        quote: {
          id: quote.id,
          referenceNumber: quote.reference_number,
          customerName: quote.customer_name,
          totalAmount: quote.total_amount,
          depositAmount: quote.deposit_amount,
          lineItems: quote.line_items,
          expiresAt: quote.expires_at,
        },
      });
    }

    // Create a new PaymentIntent for the deposit with timeout protection
    const paymentIntent = await withTimeout(
      createPaymentIntent(
        quote.deposit_amount,
        'usd',
        {
          quote_id: quote.id,
          quote_ref: quote.reference_number,
          customer_email: quote.customer_email,
          payment_type: 'deposit',
        }
      ),
      TIMEOUT_LIMITS.EXTERNAL_API,
      'Stripe payment intent creation'
    );

    // Update quote status to authorized and store payment intent ID with retry
    const updateResult = await withSupabaseRetry(
      () => supabase
        .from('quotes')
        .update({
          status: 'authorized',
          stripe_payment_intent_id: paymentIntent.id,
        })
        .eq('id', quote.id),
      { operation: 'Update quote status', maxRetries: 3 }
    );

    if (updateResult.error) {
      console.error('Failed to update quote status after retries:', updateResult.error);
      // Don't fail the request - payment intent was created successfully
      // The quote can be manually updated if needed
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      quote: {
        id: quote.id,
        referenceNumber: quote.reference_number,
        customerName: quote.customer_name,
        totalAmount: quote.total_amount,
        depositAmount: quote.deposit_amount,
        lineItems: quote.line_items,
        expiresAt: quote.expires_at,
      },
    });
  } catch (error) {
    if (error instanceof TimeoutError) {
      console.error('[Authorize Quote] External API timeout:', error);
      return badRequest('Payment service is currently slow, please try again in a moment');
    }
    return handleApiError(error, 'Authorize Quote');
  }
}
