import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

// ============================================================================
// All Projects API Route - /api/projects/all (Admin Only)
// ============================================================================
// GET: Returns all projects with optional filtering.
// Requires authentication and admin privileges.

export async function GET(request: NextRequest) {
  try {
    // ========================================================================
    // Create Server Client and Get User from Session
    // ========================================================================

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    // ========================================================================
    // Verify Admin Status
    // ========================================================================

    const isAdmin = user.user_metadata?.is_admin === true;

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    // ========================================================================
    // Parse Query Parameters
    // ========================================================================

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const email = searchParams.get('email');

    // ========================================================================
    // Build Query with Filters
    // ========================================================================

    let query = supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (email) {
      query = query.ilike('email', `%${email}%`);
    }

    // ========================================================================
    // Execute Query
    // ========================================================================

    const { data: projects, error } = await query;

    if (error) {
      console.error('Failed to fetch all projects:', error.message);
      return NextResponse.json(
        { error: 'Failed to load projects' },
        { status: 500 }
      );
    }

    // ========================================================================
    // Success Response
    // ========================================================================

    return NextResponse.json({
      projects: projects || [],
      count: projects?.length || 0,
    });
  } catch (error) {
    console.error('Projects all GET error:', error);

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
