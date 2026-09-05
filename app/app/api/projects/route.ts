import { PROJECT_MESSAGE_MAX_LENGTH } from '@/lib/validation';
import { NextResponse } from 'next/server';
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
import { cache } from '@/lib/cache';
import { sendProjectSubmissionEmails } from '@/lib/email-service';
import { withSupabaseRetry, isUniqueViolation } from '@/lib/supabase-retry';
import {
  createRequestFingerprint,
  checkAndMarkRequest,
} from '@/lib/request-dedup';
import { withTimeout } from '@/lib/api-timeout';
import { parseConsultationRequestDetails } from '@/lib/consultation-request';
import { parseVisionIntake, visionIntakeMessage, type VisionIntakeV1 } from '@/lib/vision-intake';

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
    const messageValue = formData.get('message');
    const intakeContextValue = formData.get('intakeContext');
    const files = formData.getAll('files') as File[];
    const consultationTypeValue = formData.get('consultationType');
    const preferredTimeValue = formData.get('preferredTime');
    const alternateTimeValue = formData.get('alternateTime');

    const consultationType = typeof consultationTypeValue === 'string' ? consultationTypeValue : null;
    const preferredTime = typeof preferredTimeValue === 'string' ? preferredTimeValue : null;
    const alternateTime = typeof alternateTimeValue === 'string' ? alternateTimeValue : null;

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

    let intakeContext: VisionIntakeV1 | null = null;
    if (typeof intakeContextValue === 'string' && intakeContextValue.trim()) {
      try { intakeContext = parseVisionIntake(intakeContextValue); }
      catch (err) { return badRequest(err instanceof Error ? err.message : 'Invalid intake context'); }
    }
    const message = intakeContext
      ? visionIntakeMessage(intakeContext)
      : typeof messageValue === 'string' ? messageValue : '';

    if (!trimField(message)) {
      return badRequest('Project details are required');
    }

    // Validate string lengths to prevent database overflow and DoS
    try {
      validateStringLength(name.trim(), 200, 'Name');
      validateStringLength(message.trim(), PROJECT_MESSAGE_MAX_LENGTH, 'Project details');
      if (company) validateStringLength(company.trim(), 200, 'Company');
      if (service) validateStringLength(service.trim(), 100, 'Service');
    } catch (err) {
      return badRequest(err instanceof Error ? err.message : 'Input validation failed');
    }

    let consultationDetails;
    try {
      consultationDetails = parseConsultationRequestDetails({
        consultationType,
        preferredTime,
        alternateTime,
      });
    } catch (err) {
      return badRequest(err instanceof Error ? err.message : 'Invalid consultation details');
    }

    // ====================================================================
    // Validate Files (if any)
    // ====================================================================

    const fileValidation = validateFiles(files);
    if (!fileValidation.valid) {
      return badRequest(fileValidation.error || 'File validation failed');
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
    });

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
            user_id: null,
            consultation_type: consultationDetails.consultationType,
            preferred_consultation_at: consultationDetails.preferredConsultationAt,
            alternate_consultation_at: consultationDetails.alternateConsultationAt,
            intake_context: intakeContext,
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
          consultationType: project.consultation_type || undefined,
          preferredConsultationAt: project.preferred_consultation_at || undefined,
          alternateConsultationAt: project.alternate_consultation_at || undefined,
        },
        // Client confirmation
        project.email,
        {
          name: project.name,
          service: project.service || undefined,
        },
        {
          admin: {
            operationKey: `project:${project.id}:admin-notification`,
            domainReference: `project:${project.id}:admin-notification`,
            projectId: project.id,
          },
          client: {
            operationKey: `project:${project.id}:requester-confirmation`,
            domainReference: `project:${project.id}:requester-confirmation`,
            projectId: project.id,
          },
        },
      );
    } catch (emailError) {
      // Don't fail the submission if emails break
      console.error('[Projects API] Email notification error:', emailError);
    }

    // ====================================================================
    // Invalidate Caches
    // ====================================================================
    // New project submitted - invalidate dashboard and admin caches

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
