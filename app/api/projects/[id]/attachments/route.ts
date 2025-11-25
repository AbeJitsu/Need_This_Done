import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ============================================================================
// Project Attachments API Route - /api/projects/[id]/attachments
// ============================================================================
// POST: Upload additional files to an existing project (user on own, admin on any).

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 3;

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
    // Check Authorization
    // ====================================================================

    const isAdmin = (user.user_metadata as any)?.is_admin === true;

    // Get the project to verify ownership
    const { data: project } = await supabase
      .from('projects')
      .select('user_id, email, attachments')
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
    // Parse FormData
    // ====================================================================

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // ====================================================================
    // Validate Files
    // ====================================================================

    const existingCount = project.attachments ? project.attachments.length : 0;
    const totalFiles = existingCount + files.length;

    if (totalFiles > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} files allowed total. Current: ${existingCount}, Attempting to add: ${files.length}` },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `${file.name}: File type not allowed` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `${file.name}: File too large. Maximum size is 5MB.` },
          { status: 400 }
        );
      }
    }

    // ====================================================================
    // Upload Files to Supabase Storage
    // ====================================================================

    const attachmentPaths: string[] = [];

    const timestamp = Date.now();
    const sanitizedEmail = project.email
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');

    for (const file of files) {
      const ext = file.name.split('.').pop();
      const randomId = Math.random().toString(36).substring(2, 8);
      const fileName = `${sanitizedEmail}/${timestamp}_${randomId}.${ext}`;

      const { data, error: uploadError } = await supabase.storage
        .from('project-attachments')
        .upload(fileName, file);

      if (uploadError) {
        console.error(`Failed to upload ${file.name}:`, uploadError.message);

        return NextResponse.json(
          { error: `Failed to upload ${file.name}` },
          { status: 500 }
        );
      }

      if (data) {
        attachmentPaths.push(data.path);
      }
    }

    // ====================================================================
    // Update Project with New Attachments
    // ====================================================================

    const updatedAttachments = [
      ...(project.attachments || []),
      ...attachmentPaths,
    ];

    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({ attachments: updatedAttachments })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update project attachments:', updateError.message);

      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      );
    }

    // ====================================================================
    // Return Success
    // ====================================================================

    return NextResponse.json({
      success: true,
      message: 'Files uploaded successfully',
      filesUploaded: attachmentPaths.length,
      project: updatedProject,
    });
  } catch (error) {
    console.error('Attachments POST error:', error);

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
