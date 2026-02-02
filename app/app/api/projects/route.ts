import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase';
import {
  validateFiles,
  trimField,
  sanitizeEmail,
  sanitizeFilename,
  validateStringLength,
} from '@/lib/validation';
import {
  badRequest,
  serverError,
  handleApiError,
} from '@/lib/api-errors';
import { cache, CACHE_KEYS } from '@/lib/cache';
import { sendProjectSubmissionEmails } from '@/lib/email-service';
import { withSupabaseRetry, isUniqueViolation } from '@/lib/supabase-retry';
import {
  createRequestFingerprint,
  checkAndMarkRequest,
} from '@/lib/request-dedup';
import { withTimeout } from '@/lib/api-timeout';

export const dynamic = 'force-dynamic';

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
    // Parse form data with timeout protection to prevent large upload hangs
    // If parsing takes > 30 seconds (e.g., 100MB file upload), fail fast
    const formData = await withTimeout(
      request.formData(),
      30000, // 30 seconds - reasonable for large file uploads
      'Parse form data with file attachments'
    );

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

    // Sanitize and validate email
    let sanitizedEmail: string;
    try {
      sanitizedEmail = sanitizeEmail(email);
    } catch (err) {
      return badRequest(err instanceof Error ? err.message : 'Invalid email format');
    }

    if (!trimField(message)) {
      return badRequest('Project details are required');
    }

    // Validate string lengths to prevent database overflow and DoS
    try {
      validateStringLength(name.trim(), 200, 'Name');
      validateStringLength(message.trim(), 5000, 'Project details');
      if (company) validateStringLength(company.trim(), 200, 'Company');
      if (service) validateStringLength(service.trim(), 100, 'Service');
    } catch (err) {
      return badRequest(err instanceof Error ? err.message : 'Input validation failed');
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
    // Validate configuration before creating client

    let supabaseAdmin;
    try {
      supabaseAdmin = getSupabaseAdmin();
    } catch (err) {
      console.error('[Projects] Failed to initialize Supabase admin client:', err);
      return serverError('Server configuration error. Please contact support.');
    }

    // ====================================================================
    // Upload Files to Supabase Storage
    // ====================================================================

    const attachmentPaths: string[] = [];

    if (files.length > 0) {
      const timestamp = Date.now();
      const sanitizedEmailForPath = sanitizedEmail.replace(/[^a-z0-9]/g, '_');

      for (const file of files) {
        // Sanitize filename to prevent path traversal and injection
        let safeFilename: string;
        try {
          safeFilename = sanitizeFilename(file.name);
        } catch (err) {
          console.error(`File upload error: invalid filename "${file.name}"`, err);
          return badRequest(`Invalid filename: ${file.name}`);
        }

        const fileExt = safeFilename.split('.').pop() || 'bin';
        const fileName = `${sanitizedEmailForPath}/${timestamp}_${Math.random().toString(36).substring(7)}.${fileExt}`;

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
    // Request Deduplication - Prevent Double Submissions
    // ====================================================================
    // Create fingerprint from core form data (excludes files for performance)
    const requestFingerprint = createRequestFingerprint({
      email: sanitizedEmail,
      name: name.trim(),
      message: message.trim(),
      service: service?.trim() || '',
    }, userId || undefined);

    const isNewRequest = await checkAndMarkRequest(requestFingerprint, 'project submission');
    if (!isNewRequest) {
      return NextResponse.json(
        { error: 'Duplicate submission detected. Please wait a moment before submitting again.' },
        { status: 429 }
      );
    }

    // ====================================================================
    // Insert into Database with Retry Logic
    // ====================================================================

    const insertResult = await withSupabaseRetry(
      async () => {
        const res = await supabaseAdmin
          .from('projects')
          .insert({
            name: name.trim(),
            email: sanitizedEmail,
            company: company?.trim() || null,
            service: service?.trim() || null,
            message: message.trim(),
            status: 'submitted',
            attachments: attachmentPaths.length > 0 ? attachmentPaths : null,
            user_id: userId,
          })
          .select()
          .single();
        return res;
      },
      { operation: 'Insert project', maxRetries: 3 }
    );

    const { data: project, error } = insertResult;

    if (error) {
      // Check for unique constraint violation (shouldn't happen with dedup, but defensive)
      if (isUniqueViolation(error)) {
        console.warn('[Projects] Unique violation despite deduplication:', error);
        return NextResponse.json(
          { error: 'Duplicate submission detected.' },
          { status: 409 }
        );
      }

      if (error.message.includes('does not exist')) {
        return serverError('Database not configured. Please run migrations.');
      }

      console.error('[Projects] Insert failed after retries:', error);
      return serverError('Failed to submit project. Please try again.');
    }

    // ====================================================================
    // Send Email Notifications
    // ====================================================================
    // Send emails to both admin and client
    // Emails failing should not break the submission (already in database)

    try {
      await sendProjectSubmissionEmails(
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
