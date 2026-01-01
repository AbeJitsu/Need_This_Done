import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getPaymentIntent } from '@/lib/stripe';
import { badRequest, handleApiError } from '@/lib/api-errors';
import { sendDepositConfirmation } from '@/lib/email-service';

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

interface DepositConfirmedRequest {
  quoteId: string;
  paymentIntentId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: DepositConfirmedRequest = await request.json();
    const { quoteId, paymentIntentId } = body;

    // Validate required fields
    if (!quoteId || typeof quoteId !== 'string') {
      return badRequest('Quote ID is required');
    }

    if (!paymentIntentId || typeof paymentIntentId !== 'string') {
      return badRequest('Payment Intent ID is required');
    }

    // Verify the payment was successful with Stripe
    const paymentIntent = await getPaymentIntent(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return badRequest(`Payment not completed. Status: ${paymentIntent.status}`);
    }

    // Verify the payment intent is for this quote
    if (paymentIntent.metadata.quote_id !== quoteId) {
      return badRequest('Payment does not match this quote');
    }

    const supabase = getSupabaseAdmin();

    // Get the quote
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .single();

    if (quoteError || !quote) {
      return badRequest('Quote not found');
    }

    // Update quote status to deposit_paid
    const { error: updateError } = await supabase
      .from('quotes')
      .update({
        status: 'deposit_paid',
      })
      .eq('id', quoteId);

    if (updateError) {
      console.error('Failed to update quote status:', updateError);
      // Continue - we still want to create the order
    }

    // Create an order record linked to this quote
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        quote_id: quoteId,
        medusa_order_id: `quote-${quote.reference_number}`, // Use quote ref as order ID
        total: quote.deposit_amount, // Deposit amount paid
        status: 'pending',
        email: quote.customer_email,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Failed to create order:', orderError);
      // Don't fail - the payment was successful
    }

    // Send confirmation email to customer
    try {
      const paidAt = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      await sendDepositConfirmation({
        customerEmail: quote.customer_email,
        customerName: quote.customer_name,
        quoteReference: quote.reference_number,
        projectDescription: quote.notes || undefined,
        depositAmount: quote.deposit_amount,
        totalAmount: quote.total_amount,
        balanceRemaining: quote.total_amount - quote.deposit_amount,
        paidAt,
      });
    } catch (emailError) {
      console.error('Failed to send deposit confirmation email:', emailError);
      // Don't fail the request - payment was successful
    }

    return NextResponse.json({
      success: true,
      orderId: order?.id || null,
      quoteStatus: 'deposit_paid',
    });
  } catch (error) {
    return handleApiError(error, 'Quote Deposit Confirmed');
  }
}
