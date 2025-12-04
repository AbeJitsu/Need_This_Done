import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { verifyAuth } from '@/lib/api-auth';

// ============================================================================
// User's Projects API Route - /api/projects/mine
// ============================================================================
// GET: Returns all projects belonging to the authenticated user.
// Requires authentication via Supabase session.

export async function GET() {
  try {
    // ====================================================================
    // Verify Authentication
    // ====================================================================

    const authResult = await verifyAuth();
    if (authResult.error) return authResult.error;
    const user = authResult.user;

    // ====================================================================
    // Fetch User's Projects
    // ====================================================================

    const supabase = await createSupabaseServerClient();
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch projects:', error.message);
      return NextResponse.json(
        { error: 'Failed to load projects' },
        { status: 500 }
      );
    }

    // ====================================================================
    // Success Response
    // ====================================================================

    return NextResponse.json({
      projects: projects || [],
      count: projects?.length || 0,
    });

  } catch (error) {
    console.error('Projects mine GET error:', error);

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
