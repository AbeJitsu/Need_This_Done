import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { verifyProjectAccess, verifyAuth } from '@/lib/api-auth';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

// ============================================================================
// Project Comments API Route - /api/projects/[id]/comments
// ============================================================================
// GET: Fetch comments for a project (non-internal if user, all if admin).
// POST: Add a new comment to a project.

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ====================================================================
    // Verify Project Access
    // ====================================================================

    const accessResult = await verifyProjectAccess(id);
    if (accessResult.error) return accessResult.error;

    const isAdmin = accessResult.isAdmin;

    // ====================================================================
    // Fetch Comments (with Caching)
    // ====================================================================
    // Cache separately for admin vs client views (admins see internal notes)
    // TTL: 60 seconds

    const supabase = await createSupabaseServerClient();

    const result = await cache.wrap(
      CACHE_KEYS.projectComments(id, isAdmin),
      async () => {
        let query = supabase
          .from('project_comments')
          .select(`
            id,
            content,
            is_internal,
            created_at,
            user_id
          `)
          .eq('project_id', id)
          .order('created_at', { ascending: true });

        // Non-admin users should not see internal comments
        if (!isAdmin) {
          query = query.eq('is_internal', false);
        }

        const { data: comments, error: fetchError } = await query;

        if (fetchError) {
          throw new Error(`Failed to fetch comments: ${fetchError.message}`);
        }

        return comments || [];
      },
      CACHE_TTL.MEDIUM
    );

    // ====================================================================
    // Return Comments
    // ====================================================================

    const commentsWithUser = result.data.map(c => ({
      ...c,
      user: { email: 'user' }
    }));

    return NextResponse.json({
      success: true,
      comments: commentsWithUser,
      cached: result.cached,
      source: result.source,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ====================================================================
    // Verify Project Access
    // ====================================================================

    const accessResult = await verifyProjectAccess(id);
    if (accessResult.error) return accessResult.error;

    const isAdmin = accessResult.isAdmin;

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
    // Get User for Comment Creation
    // ====================================================================

    const authResult = await verifyAuth();
    if (authResult.error) return authResult.error;
    const user = authResult.user;

    // ====================================================================
    // Validate Internal Note Flag
    // ====================================================================
    // Only admins can create internal notes

    const isInternalNote = is_internal === true && isAdmin;

    // ====================================================================
    // Create Comment
    // ====================================================================

    const supabase = await createSupabaseServerClient();

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
    // Invalidate Comment Cache
    // ====================================================================
    // Clear cache for both admin and client views so next fetch is fresh
    
    await cache.invalidate(CACHE_KEYS.projectComments(id, true));  // Admin view
    await cache.invalidate(CACHE_KEYS.projectComments(id, false)); // Client view

    // ====================================================================
    // Return Created Comment
    // ====================================================================

    return NextResponse.json({
      success: true,
      message: 'Comment created',
      comment: {
        ...comment,
        user: { email: user.email || 'unknown' }
      },
    });
  } catch (error) {
    console.error('Comments POST error:', error);

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
