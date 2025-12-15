import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';
import { handleApiError } from '@/lib/api-errors';
import { cache, CACHE_TTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// ============================================================================
// Admin Orders API Route - /api/admin/orders
// ============================================================================
// GET: List all orders (admin only)
//
// What: Admin endpoint for viewing all orders
// Why: Admins need to track and manage orders
// How: Fetches orders from Medusa admin API with caching

// ============================================================================
// GET - List All Orders (Admin Only)
// ============================================================================

export async function GET() {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;

    const result = await cache.wrap(
      'admin:orders:all',
      async () => {
        // Import Supabase server client
        const { createSupabaseServerClient } = await import('@/lib/supabase-server');
        const supabase = await createSupabaseServerClient();

        // Fetch all orders from Supabase
        const { data: orders, error: fetchError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error('[Admin Orders] Fetch error:', fetchError);
          throw new Error('Failed to fetch orders');
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
    return handleApiError(error, 'Admin Orders GET');
  }
}
