import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ============================================================================
// Projects API Route - /api/projects
// ============================================================================
// Handles project submissions from the contact form.
// POST: Creates a new project inquiry in the database with optional file attachments.

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 3;
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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // ====================================================================
    // Extract Form Fields
    // ====================================================================

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const company = formData.get('company') as string;
    const service = formData.get('service') as string;
    const message = formData.get('message') as string;
    const files = formData.getAll('files') as File[];

    // ====================================================================
    // Validate Required Fields
    // ====================================================================

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!email || email.trim().length === 0) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Project details are required' },
        { status: 400 }
      );
    }

    // ====================================================================
    // Validate Files (if any)
    // ====================================================================

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} files allowed` },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 5MB limit` },
          { status: 400 }
        );
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `File type not allowed: ${file.name}` },
          { status: 400 }
        );
      }
    }

    // ====================================================================
    // Check for Authenticated User (Optional)
    // ====================================================================
    // If user is logged in, link the project to their account

    let userId: string | null = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    } catch (err) {
      // User not logged in - that's OK, continue as guest
    }

    // ====================================================================
    // Upload Files to Supabase Storage
    // ====================================================================

    const attachmentPaths: string[] = [];

    if (files.length > 0) {
      const timestamp = Date.now();
      const sanitizedEmail = email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${sanitizedEmail}/${timestamp}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('project-attachments')
          .upload(fileName, file);

        if (uploadError) {
          console.error('File upload error:', uploadError.message);
          // Continue without failing - files are optional
        } else {
          attachmentPaths.push(fileName);
        }
      }
    }

    // ====================================================================
    // Insert into Database
    // ====================================================================

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: company?.trim() || null,
        service: service?.trim() || null,
        message: message.trim(),
        status: 'submitted',
        attachments: attachmentPaths.length > 0 ? attachmentPaths : null,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to insert project:', error.message);

      if (error.message.includes('does not exist')) {
        return NextResponse.json(
          { error: 'Database not configured. Please run migrations.' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to submit project. Please try again.' },
        { status: 500 }
      );
    }

    // ====================================================================
    // Success Response
    // ====================================================================

    return NextResponse.json({
      success: true,
      message: 'Project submitted successfully',
      projectId: project.id,
      filesUploaded: attachmentPaths.length,
    });

  } catch (error) {
    console.error('Projects POST error:', error);

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
