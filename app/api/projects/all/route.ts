import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ============================================================================
// Admin Projects API Route - /api/projects/all
// ============================================================================
// GET: Returns all projects with optional filters (admin view).
// Requires admin authentication via Supabase session.
// Filters: status, email, date_from, date_to

export async function GET(request: NextRequest) {
  try {
    // ====================================================================
    // Get User from Session
    // ====================================================================

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    // ====================================================================
    // Check Admin Status
    // ====================================================================
    // Only admins can view all projects

    const isAdmin = (user.user_metadata as any)?.is_admin === true;

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    // ====================================================================
    // Parse Query Parameters
    // ====================================================================

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const email = searchParams.get('email');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    // ====================================================================
    // Build Query
    // ====================================================================
    // Start with all projects, then apply filters

    let query = supabase
      .from('projects')
      .select('*, project_comments(count)', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters if provided
    if (status) {
      query = query.eq('status', status);
    }

    if (email) {
      query = query.ilike('email', `%${email}%`);
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    // ====================================================================
    // Execute Query
    // ====================================================================

    const { data: projects, error: queryError, count } = await query;

    if (queryError) {
      console.error('Failed to fetch projects:', queryError.message);

      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    // ====================================================================
    // Return Results
    // ====================================================================

    return NextResponse.json({
      success: true,
      projects: projects || [],
      count: count || 0,
    });
  } catch (error) {
    console.error('Projects all GET error:', error);

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
