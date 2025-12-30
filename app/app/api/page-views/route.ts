import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// ============================================================================
// Page Views API - /api/page-views
// ============================================================================
// What: Tracks and retrieves page view analytics for Puck CMS pages
// Why: Provides visibility into which pages are most visited
// How: Stores view events in Supabase, aggregates stats on read
//
// Endpoints:
// - POST: Track a page view (anonymous)
// - GET: Get stats for a specific page by slug

// ============================================================================
// Types
// ============================================================================

interface PageViewInput {
  page_slug: string;
  page_id?: string;
  referrer?: string;
  session_id?: string;
}

interface PageViewStats {
  page_slug: string;
  total_views: number;
  unique_sessions: number;
  authenticated_views: number;
  last_viewed_at: string | null;
  first_viewed_at: string | null;
}

// ============================================================================
// POST - Track a Page View (Public)
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<PageViewInput>;

    // Validate required fields
    if (!body.page_slug) {
      return NextResponse.json(
        { error: 'page_slug is required' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Get user if authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get user agent from request
    const userAgent = request.headers.get('user-agent') || undefined;

    // Generate or use session ID for anonymous tracking
    const sessionId =
      body.session_id || request.cookies.get('session_id')?.value || undefined;

    // Insert page view
    const { error } = await supabase.from('page_views').insert({
      page_slug: body.page_slug,
      page_id: body.page_id || null,
      user_id: user?.id || null,
      session_id: sessionId,
      referrer: body.referrer || null,
      user_agent: userAgent,
    });

    if (error) {
      console.error('Failed to track page view:', error);
      return NextResponse.json(
        { error: 'Failed to track page view' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        page_slug: body.page_slug,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Page views POST error:', error);
    return NextResponse.json(
      { error: 'Failed to track page view' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET - Get Page View Stats (Public for single page)
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSlug = searchParams.get('page_slug');

    if (!pageSlug) {
      return NextResponse.json(
        { error: 'page_slug query parameter is required' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Query the aggregation view for stats
    const { data, error } = await supabase
      .from('page_view_stats')
      .select('*')
      .eq('page_slug', pageSlug)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Failed to fetch page view stats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch page view stats' },
        { status: 500 }
      );
    }

    // Return stats or defaults for new pages
    const stats: PageViewStats = data || {
      page_slug: pageSlug,
      total_views: 0,
      unique_sessions: 0,
      authenticated_views: 0,
      last_viewed_at: null,
      first_viewed_at: null,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Page views GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page view stats' },
      { status: 500 }
    );
  }
}
