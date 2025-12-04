import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { verifyAdmin } from '@/lib/api-auth';

// ============================================================================
// All Projects API Route - /api/projects/all (Admin Only)
// ============================================================================
// GET: Returns all projects with optional filtering.
// Requires authentication and admin privileges.

export async function GET(request: NextRequest) {
  try {
    // ========================================================================
    // Verify Admin Access
    // ========================================================================

    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;

    // ========================================================================
    // Parse Query Parameters
    // ========================================================================

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const email = searchParams.get('email');

    // ========================================================================
    // Build Query with Filters
    // ========================================================================

    const supabase = await createSupabaseServerClient();

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
