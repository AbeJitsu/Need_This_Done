import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { verifyAuth } from '@/lib/api-auth';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import { handleApiError } from '@/lib/api-errors';

export const dynamic = 'force-dynamic';

// ============================================================================
// User Orders API Route - /api/user/orders
// ============================================================================
// GET: Fetch authenticated user's orders
//
// What: Returns orders linked to the authenticated user
// Why: Users need to see their order history in dashboard
// How: Queries Supabase orders table with RLS filtering

// ============================================================================
// GET - Fetch User's Orders (Authenticated Only)
// ============================================================================

export async function GET() {
  try {
    const authResult = await verifyAuth();
    if (authResult.error) return authResult.error;

    const userId = authResult.user.id;
    const supabase = await createSupabaseServerClient();

    const result = await cache.wrap(
      CACHE_KEYS.userOrders(userId),
      async () => {
        // Fetch orders for this user
        const { data: orders, error } = await supabase
          .from('orders')
          .select('id, medusa_order_id, total, status, email, created_at, updated_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Failed to fetch user orders:', error);
          throw new Error('Failed to load orders');
        }

        // Fetch order items for each order from Medusa API
        const ordersWithItems = await Promise.all(
          (orders || []).map(async (order) => {
            try {
              const medusaResponse = await fetch(
                `${process.env.NEXT_PUBLIC_MEDUSA_URL}/admin/orders/${order.medusa_order_id}`,
                {
                  headers: {
                    Authorization: `Bearer ${process.env.MEDUSA_ADMIN_TOKEN}`,
                  },
                }
              );

              if (medusaResponse.ok) {
                const medusaOrder = await medusaResponse.json();
                const items = (medusaOrder.order?.items || []).map((item: any) => ({
                  id: item.id,
                  title: item.title,
                  quantity: item.quantity,
                  unit_price: item.unit_price,
                  variant_id: item.variant_id,
                  thumbnail: item.thumbnail,
                }));
                return { ...order, items };
              }
              return { ...order, items: [] };
            } catch (err) {
              console.error('Failed to fetch items for order:', order.medusa_order_id, err);
              return { ...order, items: [] };
            }
          })
        );

        return ordersWithItems;
      },
      CACHE_TTL.MEDIUM // 1 minute - orders change frequently
    );

    return NextResponse.json({
      orders: result.data,
      count: result.data.length,
      cached: result.cached,
      source: result.source,
    });
  } catch (error) {
    return handleApiError(error, 'User Orders GET');
  }
}
