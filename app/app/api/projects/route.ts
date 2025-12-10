import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase';
import {
  isValidEmail,
  validateFiles,
  trimField,
} from '@/lib/validation';
import {
  badRequest,
  serverError,
  handleApiError,
} from '@/lib/api-errors';
import { cache, CACHE_KEYS } from '@/lib/cache';
import { sendProjectSubmissionEmails } from '@/lib/email-service';

// ============================================================================
// Projects API Route - /api/projects
// ============================================================================
// Handles project submissions from the contact form.
// POST: Creates a new project inquiry in the database with optional file attachments.
//
// Note: Uses supabaseAdmin for inserts because the contact form can be submitted
// by anonymous users. The admin client bypasses RLS to allow these inserts.

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

    if (!trimField(name)) {
      return badRequest('Name is required');
    }

    if (!trimField(email)) {
      return badRequest('Email is required');
    }

    if (!isValidEmail(email)) {
      return badRequest('Invalid email format');
    }

    if (!trimField(message)) {
      return badRequest('Project details are required');
    }

    // ====================================================================
    // Validate Files (if any)
    // ====================================================================

    const fileValidation = validateFiles(files);
    if (!fileValidation.valid) {
      return badRequest(fileValidation.error || 'File validation failed');
    }

    // ====================================================================
    // Check for Authenticated User (Optional)
    // ====================================================================
    // If user is logged in, link the project to their account

    const supabase = await createSupabaseServerClient();

    let userId: string | null = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    } catch {
      // User not logged in - that's OK, continue as guest
    }

    // ====================================================================
    // Get Admin Client
    // ====================================================================
    // Contact form submissions need the admin client to bypass RLS

    let supabaseAdmin;
    try {
      supabaseAdmin = getSupabaseAdmin();
    } catch (err) {
      return serverError('Server configuration error. Please contact support.');
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

        const { error: uploadError } = await supabaseAdmin.storage
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

    const { data: project, error } = await supabaseAdmin
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
      if (error.message.includes('does not exist')) {
        return serverError('Database not configured. Please run migrations.');
      }

      return serverError('Failed to submit project. Please try again.');
    }

    // ====================================================================
    // Send Email Notifications
    // ====================================================================
    // Send emails to both admin and client
    // Emails failing should not break the submission (already in database)

    try {
      const { adminSent, clientSent } = await sendProjectSubmissionEmails(
        // Admin notification data
        {
          projectId: project.id,
          name: project.name,
          email: project.email,
          company: project.company || undefined,
          service: project.service || undefined,
          message: project.message,
          attachmentCount: attachmentPaths.length,
          submittedAt: new Date(project.created_at).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }),
        },
        // Client confirmation
        project.email,
        {
          name: project.name,
          service: project.service || undefined,
        }
      );

      // Log email results (optional: store in database for tracking)
      if (adminSent) {
        console.log(
          `[Projects API] Admin notification sent for project ${project.id}`
        );
      }
      if (clientSent) {
        console.log(
          `[Projects API] Client confirmation sent to ${project.email}`
        );
      }
    } catch (emailError) {
      // Don't fail the submission if emails break
      console.error('[Projects API] Email notification error:', emailError);
    }

    // ====================================================================
    // Invalidate Caches
    // ====================================================================
    // New project submitted - invalidate dashboard and admin caches

    if (userId) {
      await cache.invalidate(CACHE_KEYS.userProjects(userId));
    }
    await cache.invalidatePattern('admin:projects:*');

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
    return handleApiError(error, 'Projects POST');
  }
}
