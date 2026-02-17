import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendOrderStatusUpdate } from '@/lib/email-service';
import { emitWorkflowEvent } from '@/lib/workflow-events';

export const dynamic = 'force-dynamic';

// ============================================================================
// Update Order Status API - PATCH /api/admin/orders/[id]/status
// ============================================================================
// What: Updates the status of an order
// Why: Admins need to track order progress (pending, processing, shipped, delivered, canceled)
// How: Validates status, updates order in Supabase, invalidates cache

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled';

const VALID_STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'canceled'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ========================================================================
    // AUTHORIZATION: Use centralized verifyAdmin() helper
    // ========================================================================
    // This ensures consistent auth logic across all admin endpoints.
    // If auth fails, returns appropriate 401/403 error response.
    const auth = await verifyAdmin();
    if (auth.error) {
      return auth.error;
    }

    // Use singleton admin client
    const supabase = getSupabaseAdmin();

    // Get and validate the new status from request body
    const body = await request.json();
    const { status: newStatus } = body;

    if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Fetch the order to ensure it exists
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('[Update Order Status] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      );
    }

    // Invalidate the orders cache
    try {
      const { cache } = await import('@/lib/cache');
      await cache.invalidate('admin:orders:all');
    } catch (cacheError) {
      console.error('[Update Order Status] Cache invalidation failed:', cacheError);
      // Continue - cache invalidation failure shouldn't block the response
    }

    // Emit workflow events for automation triggers (non-blocking)
    try {
      if (newStatus === 'shipped') {
        emitWorkflowEvent('order.fulfilled', {
          orderId: order.medusa_order_id || id,
          customerId: order.customer_id || '',
          customerEmail: order.email || '',
          trackingNumber: order.tracking_number || undefined,
          shippingCarrier: order.shipping_carrier || undefined,
          timestamp: Date.now(),
        });
      } else if (newStatus === 'canceled') {
        emitWorkflowEvent('order.cancelled', {
          orderId: order.medusa_order_id || id,
          customerId: order.customer_id || '',
          customerEmail: order.email || '',
          reason: 'Admin status change',
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      console.warn('[Update Order Status] Workflow event emission failed (non-blocking):', err);
    }

    // Send status update email to customer
    let emailSent = false;
    if (order.email) {
      try {
        const emailResult = await sendOrderStatusUpdate({
          customerEmail: order.email,
          orderId: order.medusa_order_id || id,
          previousStatus: order.status,
          newStatus,
          updatedAt: new Date().toISOString(),
        });
        emailSent = emailResult !== null;
      } catch (emailError) {
        console.error('[Update Order Status] Email failed:', emailError);
        // Continue - email failure shouldn't block the response
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      order_id: id,
      new_status: newStatus,
      email_sent: emailSent,
    });

  } catch (error) {
    console.error('[Update Order Status] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
