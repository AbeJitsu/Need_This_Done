import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase';
import { badRequest, notFound, handleApiError } from '@/lib/api-errors';

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

interface AuthorizeRequest {
  quoteRef: string;
  email: string;
}

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
    const body: AuthorizeRequest = await request.json();
    const { quoteRef, email } = body;

    // Validate required fields
    if (!quoteRef || typeof quoteRef !== 'string') {
      return badRequest('Quote reference is required');
    }

    if (!email || typeof email !== 'string') {
      return badRequest('Email is required');
    }

    // Normalize inputs
    const normalizedRef = quoteRef.trim().toUpperCase();
    const normalizedEmail = email.trim().toLowerCase();

    // Look up the quote
    const supabase = getSupabaseAdmin();
    const { data: quote, error: fetchError } = await supabase
      .from('quotes')
      .select('*')
      .eq('reference_number', normalizedRef)
      .single<QuoteRecord>();

    if (fetchError || !quote) {
      return notFound('Quote not found. Please check your reference number.');
    }

    // Validate email matches
    if (quote.customer_email.toLowerCase() !== normalizedEmail) {
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
      const existingIntent = await getPaymentIntent(quote.stripe_payment_intent_id);

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

    // Create a new PaymentIntent for the deposit
    const paymentIntent = await createPaymentIntent(
      quote.deposit_amount,
      'usd',
      {
        quote_id: quote.id,
        quote_ref: quote.reference_number,
        customer_email: quote.customer_email,
        payment_type: 'deposit',
      }
    );

    // Update quote status to authorized and store payment intent ID
    const { error: updateError } = await supabase
      .from('quotes')
      .update({
        status: 'authorized',
        stripe_payment_intent_id: paymentIntent.id,
      })
      .eq('id', quote.id);

    if (updateError) {
      console.error('Failed to update quote status:', updateError);
      // Don't fail the request - payment intent was created successfully
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
    return handleApiError(error, 'Authorize Quote');
  }
}
