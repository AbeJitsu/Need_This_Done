import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ============================================================================
// Project Details API Route - /api/projects/[id]
// ============================================================================
// PATCH: Update project details (user on own, admin on any).
// DELETE: Delete a project (admin only).

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
    // Parse Request Body
    // ====================================================================

    const body = await request.json();
    const { name, email, company, service, message } = body;

    // Build update object with only provided fields
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (company !== undefined) updates.company = company;
    if (service !== undefined) updates.service = service;
    if (message !== undefined) updates.message = message;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
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
    // Update Project
    // ====================================================================

    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update(updates)
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

    // ====================================================================
    // Return Updated Project
    // ====================================================================

    return NextResponse.json({
      success: true,
      message: 'Project updated',
      project: updatedProject,
    });
  } catch (error) {
    console.error('Projects PATCH error:', error);

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
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
    // Delete Project (cascade deletes comments)
    // ====================================================================

    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Failed to delete project:', deleteError.message);

      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500 }
      );
    }

    // ====================================================================
    // Return Success
    // ====================================================================

    return NextResponse.json({
      success: true,
      message: 'Project deleted',
    });
  } catch (error) {
    console.error('Projects DELETE error:', error);

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
