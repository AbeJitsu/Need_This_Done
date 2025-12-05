import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { verifyAuth } from '@/lib/api-auth';
import { serverError, handleApiError } from '@/lib/api-errors';

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
      return serverError('Failed to load projects');
    }

    // ====================================================================
    // Success Response
    // ====================================================================

    return NextResponse.json({
      projects: projects || [],
      count: projects?.length || 0,
    });

  } catch (error) {
    return handleApiError(error, 'Projects mine GET');
  }
}
