import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';
import { handleApiError, notFound } from '@/lib/api-errors';
import { orders } from '@/lib/medusa-client';

export const dynamic = 'force-dynamic';

// ============================================================================
// Order Details API Route - /api/admin/orders/[id]/details
// ============================================================================
// GET: Fetch full order details from Medusa including line items
//
// What: Returns expanded order with products, line items, and totals
// Why: Admin needs to see what was purchased in each order
// How: Fetches order data from Medusa API with items expanded

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;

    const { id } = await context.params;

    // Fetch order from Medusa
    const order = await orders.get(id);

    if (!order) {
      return notFound('Order not found in Medusa');
    }

    return NextResponse.json({
      order,
    });
  } catch (error: any) {
    console.error('[Order Details GET] Error:', error);

    // Handle Medusa-specific errors
    if (error.status === 404) {
      return notFound('Order not found');
    }

    return handleApiError(error, 'Order Details GET');
  }
}
