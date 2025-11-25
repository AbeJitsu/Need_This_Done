import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ============================================================================
// Project Comments API Route - /api/projects/[id]/comments
// ============================================================================
// GET: Fetch comments for a project (non-internal if user, all if admin).
// POST: Add a new comment to a project.

export async function GET(
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
    // Check Authorization
    // ====================================================================
    // User can see comments on their project, admin can see all comments

    const isAdmin = (user.user_metadata as any)?.is_admin === true;

    // Get the project to verify user ownership
    const { data: project } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const isOwner = project.user_id === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Forbidden. No access to this project.' },
        { status: 403 }
      );
    }

    // ====================================================================
    // Fetch Comments
    // ====================================================================
    // Filter out internal comments for non-admin users

    let query = supabase
      .from('project_comments')
      .select(`
        id,
        content,
        is_internal,
        created_at,
        user_id,
        user:user_id(email)
      `)
      .eq('project_id', id)
      .order('created_at', { ascending: true });

    // Non-admin users should not see internal comments
    if (!isAdmin) {
      query = query.eq('is_internal', false);
    }

    const { data: comments, error: fetchError } = await query;

    if (fetchError) {
      console.error('Failed to fetch comments:', fetchError.message);

      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    // ====================================================================
    // Return Comments
    // ====================================================================

    return NextResponse.json({
      success: true,
      comments: comments || [],
    });
  } catch (error) {
    console.error('Comments GET error:', error);

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function POST(
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
    // Parse Request Body
    // ====================================================================

    const body = await request.json();
    const { content, is_internal } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // ====================================================================
    // Check Authorization
    // ====================================================================

    const isAdmin = (user.user_metadata as any)?.is_admin === true;

    // Get the project to verify ownership
    const { data: project } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const isOwner = project.user_id === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Forbidden. No access to this project.' },
        { status: 403 }
      );
    }

    // ====================================================================
    // Validate Internal Note Flag
    // ====================================================================
    // Only admins can create internal notes

    const isInternalNote = is_internal === true && isAdmin;

    // ====================================================================
    // Create Comment
    // ====================================================================

    const { data: comment, error: createError } = await supabase
      .from('project_comments')
      .insert({
        project_id: id,
        user_id: user.id,
        content,
        is_internal: isInternalNote,
      })
      .select()
      .single();

    if (createError) {
      console.error('Failed to create comment:', createError.message);

      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    // ====================================================================
    // Return Created Comment
    // ====================================================================

    return NextResponse.json({
      success: true,
      message: 'Comment created',
      comment,
    });
  } catch (error) {
    console.error('Comments POST error:', error);

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
