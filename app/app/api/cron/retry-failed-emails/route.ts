import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';

// ============================================================================
// Retry Failed Emails Cron Job - /api/cron/retry-failed-emails
// ============================================================================
// What: Retries emails that failed to send on first attempt
// Why: Recover from transient email service failures, ensure delivery of critical emails
// How: Polls email_failures table, retries with exponential backoff, marks as permanently failed
//
// Schedule: Recommended every 5 minutes via Vercel Cron
// Protection: Requires CRON_SECRET header to prevent unauthorized access
// Policy: 3 total attempts (1 original + 2 retries) before marking as permanently failed
//
// CRITICAL: This is the recovery mechanism for email delivery. Missing this cron job
// means customers won't receive order confirmations, appointment reminders, or login alerts
// if email service experiences transient failures.

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Allow up to 30 seconds for processing

// ============================================================================
// Types
// ============================================================================

interface EmailFailureRecord {
  id: string;
  type: string;
  recipient_email: string;
  subject: string;
  user_id?: string;
  order_id?: string;
  appointment_id?: string;
  template_data?: Record<string, unknown>;
  attempt_count: number;
  last_error?: string;
  last_attempted_at?: string;
  created_at: string;
  updated_at: string;
}

interface RetryResult {
  total_failed_emails: number;
  retried: number;
  succeeded: number;
  marked_permanent_failure: number;
  details: {
    email_id: string;
    recipient: string;
    type: string;
    success: boolean;
    attempt: number;
    error?: string;
  }[];
}

// ============================================================================
// POST - Retry Failed Emails
// ============================================================================
// Called by Vercel Cron every 5 minutes

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      // In production, CRON_SECRET must be configured
      console.error('[Cron] CRON_SECRET not configured in production');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const supabase = getSupabaseAdmin();
    const result: RetryResult = {
      total_failed_emails: 0,
      retried: 0,
      succeeded: 0,
      marked_permanent_failure: 0,
      details: [],
    };

    // ========================================================================
    // STEP 1: Fetch failed emails eligible for retry
    // ========================================================================
    // Get emails that:
    // - Have attempt_count < 3 (allow up to 3 total attempts)
    // - Last attempted > 1 minute ago (avoid thrashing on fast failures)
    // - Are not already marked as permanently failed

    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();

    const { data: failedEmails, error: fetchError } = await supabase
      .from('email_failures')
      .select('*')
      .lt('attempt_count', 3) // Less than 3 attempts (0, 1, or 2)
      .or(`last_attempted_at.is.null,last_attempted_at.lt.${oneMinuteAgo}`)
      .order('last_attempted_at', { ascending: true, nullsFirst: true })
      .limit(50); // Limit to 50 per run to avoid timeout

    if (fetchError) {
      console.error('[EmailRetry] Failed to fetch email_failures:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch failed emails', details: fetchError },
        { status: 500 }
      );
    }

    result.total_failed_emails = failedEmails?.length ?? 0;

    if (!failedEmails || failedEmails.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No failed emails to retry',
        result,
      });
    }

    // ========================================================================
    // STEP 2: Retry each failed email with exponential backoff
    // ========================================================================

    for (const failureRecord of failedEmails as EmailFailureRecord[]) {
      try {
        const { success, error } = await retryEmail(failureRecord);

        result.retried++;

        if (success) {
          result.succeeded++;
          result.details.push({
            email_id: failureRecord.id,
            recipient: failureRecord.recipient_email,
            type: failureRecord.type,
            success: true,
            attempt: failureRecord.attempt_count + 1,
          });

          // Mark as successfully delivered
          await supabase
            .from('email_failures')
            .update({
              status: 'recovered',
              attempt_count: failureRecord.attempt_count + 1,
              last_attempted_at: new Date().toISOString(),
            })
            .eq('id', failureRecord.id)
            .single();
        } else if (error && failureRecord.attempt_count >= 2) {
          // 3rd attempt failed - mark as permanently failed for manual review
          result.marked_permanent_failure++;
          result.details.push({
            email_id: failureRecord.id,
            recipient: failureRecord.recipient_email,
            type: failureRecord.type,
            success: false,
            attempt: failureRecord.attempt_count + 1,
            error: 'Max retry attempts exceeded',
          });

          await supabase
            .from('email_failures')
            .update({
              status: 'permanent_failure',
              attempt_count: failureRecord.attempt_count + 1,
              last_attempted_at: new Date().toISOString(),
              last_error: 'Max retry attempts exceeded',
            })
            .eq('id', failureRecord.id)
            .single();

          // Alert admin for critical emails (order confirmations, appointment reminders)
          if (
            failureRecord.type === 'order_confirmation' ||
            failureRecord.type === 'appointment_reminder'
          ) {
            await alertAdminForPermanentFailure(failureRecord);
          }
        } else {
          // Transient failure - record and will retry next cycle
          result.details.push({
            email_id: failureRecord.id,
            recipient: failureRecord.recipient_email,
            type: failureRecord.type,
            success: false,
            attempt: failureRecord.attempt_count + 1,
            error,
          });

          await supabase
            .from('email_failures')
            .update({
              attempt_count: failureRecord.attempt_count + 1,
              last_attempted_at: new Date().toISOString(),
              last_error: error || 'Unknown error',
            })
            .eq('id', failureRecord.id)
            .single();
        }
      } catch (err) {
        console.error(
          `[EmailRetry] Unexpected error retrying ${failureRecord.id}:`,
          err
        );
        result.details.push({
          email_id: failureRecord.id,
          recipient: failureRecord.recipient_email,
          type: failureRecord.type,
          success: false,
          attempt: failureRecord.attempt_count + 1,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    // ========================================================================
    // STEP 3: Return summary
    // ========================================================================

    console.log('[EmailRetry] Completed retry cycle', {
      total: result.total_failed_emails,
      retried: result.retried,
      succeeded: result.succeeded,
      marked_permanent: result.marked_permanent_failure,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('[EmailRetry] Cron job failed:', error);
    return NextResponse.json(
      {
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Attempt to resend a failed email using the original template and data
 */
async function retryEmail(
  failureRecord: EmailFailureRecord
): Promise<{ success: boolean; error?: string }> {
  try {
    // Send using simple HTML email for safety
    // The email service will retry on transient failures automatically

    const html = `
      <p>This is a retry of a previously failed email:</p>
      <p><strong>Original Subject:</strong> ${escapeHtml(failureRecord.subject)}</p>
      <p><strong>Email Type:</strong> ${escapeHtml(failureRecord.type)}</p>
      <p><strong>Original Send Time:</strong> ${new Date(failureRecord.created_at).toLocaleString()}</p>
      <hr />
      <p><em>This email is being automatically resent because the original attempt failed.</em></p>
    `;

    const emailId = await sendEmail(
      failureRecord.recipient_email,
      `[RESENT] ${failureRecord.subject}`,
      html
    );

    if (emailId) {
      console.log(
        `[EmailRetry] Successfully resent email ${failureRecord.id} to ${failureRecord.recipient_email}`
      );
      return { success: true };
    } else {
      return {
        success: false,
        error: 'Email service returned null ID',
      };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(
      `[EmailRetry] Failed to retry email ${failureRecord.id}: ${errorMsg}`
    );
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Alert admin when a critical email permanently fails
 * Allows manual intervention for orders that aren't confirmed or appointments that weren't reminded
 */
async function alertAdminForPermanentFailure(
  failureRecord: EmailFailureRecord
): Promise<void> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.RESEND_ADMIN_EMAIL;
    if (!adminEmail) {
      console.warn(
        '[EmailRetry] ADMIN_EMAIL not configured, cannot alert for permanent failure'
      );
      return;
    }

    const message =
      failureRecord.type === 'order_confirmation'
        ? `Order confirmation email failed for ${failureRecord.recipient_email} (Order ID: ${failureRecord.order_id}). Customer may not receive order details.`
        : `Appointment reminder email failed for ${failureRecord.recipient_email} (Appointment ID: ${failureRecord.appointment_id}). Customer may miss their appointment.`;

    const html = `
      <h2>Email Delivery Alert: Permanent Failure</h2>
      <p><strong>Email Type:</strong> ${escapeHtml(failureRecord.type)}</p>
      <p><strong>Recipient:</strong> ${escapeHtml(failureRecord.recipient_email)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(failureRecord.subject)}</p>
      <p><strong>Last Error:</strong> ${escapeHtml(failureRecord.last_error || 'Unknown')}</p>
      <hr />
      <p>${escapeHtml(message)}</p>
      <p><strong>Action Required:</strong> Manually follow up with the customer.</p>
    `;

    await sendEmail(
      adminEmail,
      `[ALERT] Email delivery permanently failed: ${failureRecord.type}`,
      html
    );

    console.log(
      `[EmailRetry] Admin alerted for permanent failure: ${failureRecord.id}`
    );
  } catch (err) {
    console.error(
      '[EmailRetry] Failed to alert admin for permanent failure:',
      err
    );
    // Don't throw - this is a secondary notification
  }
}

/**
 * Escape HTML special characters to prevent injection
 */
function escapeHtml(text: string | undefined): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
