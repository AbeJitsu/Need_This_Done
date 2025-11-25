import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ============================================================================
// Project Status Update API Route - /api/projects/[id]/status
// ============================================================================
// PATCH: Updates a project's status and optionally creates a comment (admin only).

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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

    const isAdmin = (user.user_metadata as any)?.is_admin === true;

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    // ====================================================================
    // Parse Request Body
    // ====================================================================

    const body = await request.json();
    const { status, note } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // ====================================================================
    // Update Project Status
    // ====================================================================

    const { data: project, error: updateError } = await supabase
      .from('projects')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update project:', updateError.message);

      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      );
    }

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // ====================================================================
    // Create Comment if Note Provided
    // ====================================================================

    if (note) {
      const { error: commentError } = await supabase
        .from('project_comments')
        .insert({
          project_id: id,
          user_id: user.id,
          content: note,
          is_internal: false,
        });

      if (commentError) {
        console.error('Failed to create comment:', commentError.message);
        // Don't fail the entire request if comment creation fails
      }
    }

    // ====================================================================
    // Return Updated Project
    // ====================================================================

    return NextResponse.json({
      success: true,
      message: 'Project status updated',
      project,
    });
  } catch (error) {
    console.error('Projects status PATCH error:', error);

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
