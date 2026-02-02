import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';
import { handleApiError, badRequest, notFound } from '@/lib/api-errors';
import { sendQuoteEmail } from '@/lib/email-service';
import { cache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// ============================================================================
// Send Quote API Route - /api/admin/quotes/[id]/send
// ============================================================================
// POST: Send quote email to customer and update status to 'sent'
//
// What: Emails the quote to the customer with payment link
// Why: Customer needs to receive their quote to pay the deposit
// How: Generates payment URL, sends email, updates quote status

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;

    const { id } = await context.params;

    const { createSupabaseServerClient } = await import('@/lib/supabase-server');
    const supabase = await createSupabaseServerClient();

    // Get the quote
    const { data: quote, error: fetchError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !quote) {
      return notFound('Quote not found');
    }

    // Only allow sending draft or previously sent quotes
    if (!['draft', 'sent'].includes(quote.status)) {
      return badRequest(`Cannot send quote with status '${quote.status}'`);
    }

    // Build the payment URL - directs customer to their quote authorization page
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com';
    const paymentUrl = `${siteUrl}/quotes/${quote.reference_number}`;

    // Send the quote email
    const emailResult = await sendQuoteEmail({
      customerEmail: quote.customer_email,
      customerName: quote.customer_name,
      quoteReference: quote.reference_number,
      projectDescription: quote.notes || undefined,
      totalAmount: quote.total_amount,
      depositAmount: quote.deposit_amount,
      expiresAt: quote.expires_at,
      paymentUrl,
    });

    if (!emailResult) {
      return badRequest('Failed to send quote email. Please try again.');
    }

    // Update quote status to 'sent'
    const { error: updateError } = await supabase
      .from('quotes')
      .update({ status: 'sent' })
      .eq('id', id);

    if (updateError) {
      console.error('[Send Quote] Status update error:', updateError);
      // Don't fail - email was sent successfully
    }

    // Invalidate cache
    await cache.invalidate('admin:quotes:all');

    return NextResponse.json({
      success: true,
      message: 'Quote sent successfully',
      emailId: emailResult,
    });
  } catch (error) {
    return handleApiError(error, 'Send Quote POST');
  }
}
