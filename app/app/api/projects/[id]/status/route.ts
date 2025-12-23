import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/api-auth';
import { handleApiError } from '@/lib/api-errors';
import { cache, CACHE_KEYS } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// ============================================================================
// Project Status API Route - /api/projects/[id]/status
// ============================================================================
// PATCH: Update project status (admin only).
// Creates a status change comment to track the change history.

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ========================================================================
    // Verify Admin Access
    // ========================================================================
    // verifyAdmin() returns the user object on success

    const adminResult = await verifyAdmin();
    if (adminResult.error) return adminResult.error;
    const user = adminResult.user;

    // Validate user has an ID (required for comment creation)
    if (!user.id) {
      console.error('[Status update] User has no ID - this is a bug in verifyAdmin/verifyAuth');
      // Continue without creating a comment - status update can still proceed
    }

    // ========================================================================
    // Parse Request Body
    // ========================================================================

    const body = await request.json();
    const { status, note } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status values
    const validStatuses = ['submitted', 'in_review', 'scheduled', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // ========================================================================
    // Update Project Status
    // ========================================================================

    const supabaseAdmin = getSupabaseAdmin();

    // Get current status for the change message
    const { data: currentProject, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('status, user_id')
      .eq('id', id)
      .single();

    if (fetchError || !currentProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Update project status
    const { data: updatedProject, error: updateError } = await supabaseAdmin
      .from('projects')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[Status update] Error:', updateError);
      throw new Error(`Failed to update project status: ${updateError.message}`);
    }

    // ========================================================================
    // Create Status Change Comment
    // ========================================================================
    // Record the status change as a comment for audit trail

    const statusLabels: Record<string, string> = {
      submitted: 'Submitted',
      in_review: 'In Review',
      scheduled: 'Scheduled',
      in_progress: 'In Progress',
      completed: 'Completed',
    };

    const commentContent = note
      ? `Status changed to ${statusLabels[status]}. Note: ${note}`
      : `Status changed to ${statusLabels[status]}.`;

    // Only create comment if we have a valid user ID
    if (user.id) {
      const { error: commentError } = await supabaseAdmin
        .from('project_comments')
        .insert({
          project_id: id,
          user_id: user.id,
          content: commentContent,
          is_internal: false,
        });

      if (commentError) {
        // Log but don't fail the request - status was already updated
        console.error('[Status update] Failed to create comment:', commentError);
      }
    } else {
      console.warn('[Status update] Skipping comment creation - no user ID');
    }

    // ========================================================================
    // Invalidate Caches
    // ========================================================================

    // Clear project-related caches
    await cache.invalidatePattern('admin:projects:*');
    await cache.invalidate(CACHE_KEYS.userProjects(currentProject.user_id));
    await cache.invalidate(CACHE_KEYS.projectComments(id, true));
    await cache.invalidate(CACHE_KEYS.projectComments(id, false));

    // ========================================================================
    // Return Updated Project
    // ========================================================================

    return NextResponse.json({
      success: true,
      message: 'Status updated',
      project: updatedProject,
    });
  } catch (error) {
    return handleApiError(error, 'Project Status PATCH');
  }
}
