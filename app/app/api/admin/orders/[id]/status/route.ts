import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendOrderStatusUpdate } from '@/lib/email-service';

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

    // Create Supabase client with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const isAdmin = user.user_metadata?.is_admin === true;
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

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
        if (emailSent) {
          console.log(`[Update Order Status] Email sent to ${order.email} for order ${id}`);
        }
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
