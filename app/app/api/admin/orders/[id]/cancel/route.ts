import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';
import { badRequest, handleApiError } from '@/lib/api-errors';
import { verifyAdmin } from '@/lib/api-auth';
import { withWebhookRetry } from '@/lib/webhook-reliability';
import { sendOrderCanceledEmail } from '@/lib/email-service';

// ============================================================================
// Order Cancellation API - Cancel Order with Refund
// ============================================================================
// What: Cancel an order and refund deposit if payment is still pending
// Why: Allow admin to cancel orders and process refunds automatically
// How: Verify auth, fetch order, refund deposit via Stripe, update status, send email
//
// POST /api/admin/orders/[id]/cancel
// Body: { reason: string, notes?: string }
// Returns: { success: true, refunded: boolean, refund_amount, refund_id, order, canceled_at }

const CancelOrderSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required'),
  notes: z.string().optional(),
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
    const parsed = CancelOrderSchema.safeParse(await request.json());
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }
    const { reason, notes } = parsed.data;

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
      console.error('[Order Cancellation] Order not found:', { orderId, fetchError });
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // ========================================================================
    // Check If Order Already Completed/Refunded
    // ========================================================================
    if (order.status === 'canceled') {
      return NextResponse.json(
        { error: 'Order is already canceled' },
        { status: 400 }
      );
    }

    // If final payment was already collected, cannot auto-refund
    // (would require manual refund of full order, not just deposit)
    if (order.final_payment_status === 'paid' || order.status === 'completed') {
      return NextResponse.json(
        {
          error: 'Cannot cancel orders that have already paid the final payment. This requires manual refund processing.',
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    let refunded = false;
    let refundAmount = 0;
    let refundId: string | null = null;

    // ========================================================================
    // OPTION 1: Refund Deposit if Available
    // ========================================================================
    if (order.deposit_payment_intent_id && order.deposit_amount > 0) {
      try {
        const stripe = getStripe();

        // Attempt to refund the deposit
        const refund = await stripe.refunds.create({
          payment_intent: order.deposit_payment_intent_id,
          amount: order.deposit_amount,
          metadata: {
            order_id: order.medusa_order_id,
            reason: 'order_cancellation',
            cancel_reason: reason,
          },
        });

        refunded = true;
        refundAmount = order.deposit_amount;
        refundId = refund.id;

        console.log(
          '[Order Cancellation] Deposit refunded:',
          {
            orderId: order.medusa_order_id,
            amount: refundAmount,
            refundId: refund.id,
          }
        );
      } catch (stripeError: any) {
        console.error('[Order Cancellation] Refund failed:', {
          orderId: order.medusa_order_id,
          error: stripeError.message,
        });

        // Log the failure but don't prevent order cancellation
        // (manual refund can be processed later)
        refunded = false;
      }
    }

    // ========================================================================
    // Update Order Status to Canceled
    // ========================================================================
    const updateResult = await withWebhookRetry(
      async () => {
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'canceled',
            payment_status: 'canceled',
            final_payment_status: 'waived', // No payment needed since canceled
            canceled_at: now,
            cancel_reason: reason,
            admin_notes: notes || null,
          })
          .eq('id', orderId);

        if (updateError) {
          throw new Error(`Failed to update order: ${updateError.message}`);
        }
      },
      { operation: 'Update order after cancellation' }
    );

    if (!updateResult.success) {
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      );
    }

    // ========================================================================
    // Send Cancellation Email to Customer
    // ========================================================================
    let emailSent = false;
    try {
      if (order.user_id) {
        // Fetch customer email from auth.users
        const { data: customer } = await supabase
          .from('customers')
          .select('email, name')
          .eq('user_id', order.user_id)
          .single();

        if (customer?.email) {
          emailSent =
            (await sendOrderCanceledEmail({
              customerEmail: customer.email,
              customerName: customer.name || 'Valued Customer',
              orderId: order.medusa_order_id || orderId.substring(0, 8),
              reason,
              refunded,
              refundAmount,
            })) !== null;
        }
      }
    } catch (err) {
      console.warn('[Order Cancellation] Failed to send email:', err);
      // Don't fail the API call if email fails
    }

    // Fetch updated order
    const { data: updatedOrder } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    return NextResponse.json({
      success: true,
      refunded,
      refund_amount: refundAmount,
      refund_id: refundId,
      order: updatedOrder,
      canceled_at: now,
      email_sent: emailSent,
      email_to: order.user_id ? 'customer@example.com' : undefined,
    });
  } catch (error) {
    console.error('[Order Cancellation] Unexpected error:', error);
    return handleApiError(error, 'Order Cancellation');
  }
}
