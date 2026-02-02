import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// ============================================================================
// Product Analytics API - GET /api/admin/product-analytics
// ============================================================================
// What: Provides product interaction analytics and trending data
// Why: Admins need visibility into product popularity and user behavior
// How: Queries product_interactions table and precomputed views

/**
 * GET /api/admin/product-analytics
 *
 * Query parameters:
 * - days: Number of days to analyze (default: 7)
 *
 * Returns:
 * - popularProducts: Top products by interaction count
 * - trendingProducts: Products with increasing interest
 * - interactionsByType: Breakdown of view/cart/purchase interactions
 * - recentActivity: Latest product interactions
 */
export async function GET(request: Request) {
  try {
    // Verify admin authentication
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    const supabase = getSupabaseAdmin();

    // ========================================================================
    // Fetch popular products (from precomputed view)
    // ========================================================================
    const { data: popularProducts, error: popularError } = await supabase
      .from('popular_products')
      .select('*')
      .limit(10);

    if (popularError) {
      console.error('Error fetching popular products:', popularError);
      // Continue without popular products rather than failing
    }

    // ========================================================================
    // Fetch trending products (from precomputed view)
    // ========================================================================
    const { data: trendingProducts, error: trendingError } = await supabase
      .from('trending_products')
      .select('*')
      .limit(10);

    if (trendingError) {
      console.error('Error fetching trending products:', trendingError);
    }

    // ========================================================================
    // Fetch interaction breakdown by type
    // ========================================================================
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: interactionStats, error: statsError } = await supabase
      .from('product_interactions')
      .select('interaction_type')
      .gte('created_at', startDate.toISOString());

    if (statsError) {
      console.error('Error fetching interaction stats:', statsError);
    }

    // Count interactions by type
    const interactionsByType = {
      view: 0,
      cart_add: 0,
      purchase: 0,
      wishlist: 0,
    };

    if (interactionStats) {
      interactionStats.forEach((interaction: { interaction_type: keyof typeof interactionsByType }) => {
        if (interaction.interaction_type in interactionsByType) {
          interactionsByType[interaction.interaction_type]++;
        }
      });
    }

    // ========================================================================
    // Fetch recent activity (last 50 interactions)
    // ========================================================================
    const { data: recentActivity, error: activityError } = await supabase
      .from('product_interactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (activityError) {
      console.error('Error fetching recent activity:', activityError);
    }

    // ========================================================================
    // Fetch product interaction trends over time (daily)
    // ========================================================================
    const { data: dailyTrends, error: trendsError } = await supabase
      .from('product_interactions')
      .select('created_at, interaction_type')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (trendsError) {
      console.error('Error fetching daily trends:', trendsError);
    }

    // Group interactions by day
    const trendsByDay: Record<string, { views: number; carts: number; purchases: number }> = {};
    if (dailyTrends) {
      dailyTrends.forEach((interaction: { created_at: string; interaction_type: string }) => {
        const date = new Date(interaction.created_at).toISOString().split('T')[0];
        if (!trendsByDay[date]) {
          trendsByDay[date] = { views: 0, carts: 0, purchases: 0 };
        }
        if (interaction.interaction_type === 'view') trendsByDay[date].views++;
        if (interaction.interaction_type === 'cart_add') trendsByDay[date].carts++;
        if (interaction.interaction_type === 'purchase') trendsByDay[date].purchases++;
      });
    }

    // Convert to array for charting
    const trends = Object.entries(trendsByDay).map(([date, counts]) => ({
      date,
      ...counts,
    }));

    // ========================================================================
    // Return analytics data
    // ========================================================================
    return NextResponse.json({
      popularProducts: popularProducts || [],
      trendingProducts: trendingProducts || [],
      interactionsByType,
      recentActivity: recentActivity || [],
      trends,
      dateRange: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        days,
      },
    });
  } catch (error) {
    console.error('Product analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product analytics' },
      { status: 500 }
    );
  }
}
