import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { verifyAuth } from '@/lib/api-auth';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import { handleApiError } from '@/lib/api-errors';

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

        return orders || [];
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
