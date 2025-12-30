import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// ============================================================================
// All Page Views API - /api/page-views/all (Admin Only)
// ============================================================================
// What: Returns aggregated view stats for all pages
// Why: Admin dashboard needs overview of all page performance
// How: Queries page_view_stats view ordered by total views

// ============================================================================
// GET - Get All Page View Stats (Admin Only)
// ============================================================================

export async function GET() {
  try {
    // Verify admin access
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createSupabaseServerClient();

    // Query all page stats from aggregation view
    const { data, error } = await supabase
      .from('page_view_stats')
      .select('*')
      .order('total_views', { ascending: false });

    if (error) {
      console.error('Failed to fetch all page view stats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch page view stats' },
        { status: 500 }
      );
    }

    // Calculate totals
    const totalViews = data?.reduce((sum, page) => sum + page.total_views, 0) || 0;
    const totalPages = data?.length || 0;

    return NextResponse.json({
      pages: data || [],
      summary: {
        total_views: totalViews,
        total_pages: totalPages,
      },
    });
  } catch (error) {
    console.error('All page views GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page view stats' },
      { status: 500 }
    );
  }
}
