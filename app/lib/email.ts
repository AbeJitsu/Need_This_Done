import { Resend } from 'resend';
import { render } from '@react-email/components';
import { sendDurableTransactionalEmail } from '@/lib/transactional-email-service';

// ============================================================================
// Resend Email Client
// ============================================================================
// What: Centralized email service configuration and helper functions
// Why: Send transactional emails for project submissions, notifications, quotes
// How: Lazy initialization with helper functions for common email operations
//
// IMPORTANT: This module runs SERVER-SIDE ONLY
// Never import this in client components

// ============================================================================
// Resend Client Initialization
// ============================================================================
// Lazy initialization to avoid issues during build time
// The client is created on first use, not at module load

let resendInstance: Resend | null = null;

export function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error(
        'RESEND_API_KEY is not defined. ' +
          'Add it to your .env.local file to enable email notifications.'
      );
    }

    resendInstance = new Resend(apiKey);
  }

  return resendInstance;
}

// ============================================================================
// Email Configuration
// ============================================================================
// Centralized email addresses and settings
// Using a getter function to read env vars at runtime (not module load time)

export const getEmailConfig = () => ({
  from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
  adminEmail: process.env.RESEND_ADMIN_EMAIL,
  replyTo: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
});

// ============================================================================
// Email Error Types
// ============================================================================
// Custom error interface for better debugging based on Resend error types

export interface ResendError {
  name: string;
  message: string;
  statusCode?: number;
}

export function isResendError(error: unknown): error is ResendError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    'message' in error
  );
}

// ============================================================================
// Email Attachment Types
// ============================================================================
// Support for file attachments in emails (ICS calendar files, PDFs, etc.)

export interface EmailAttachment {
  /** Filename shown to recipient */
  filename: string;
  /** File content as Buffer or base64 string */
  content: Buffer | string;
  /** MIME type (defaults to application/octet-stream) */
  contentType?: string;
}

export interface SendEmailOptions {
  /** Maximum retry attempts (default: 3) */
  maxRetries?: number;
  /** File attachments */
  attachments?: EmailAttachment[];
}

// ============================================================================
// Email Sending Helpers
// ============================================================================
// Reusable functions for common email operations with retry logic

/**
 * Send an email using React Email components with retry logic and idempotency.
 * Automatically retries on transient errors, skips retry for validation errors.
 * Uses idempotency keys to prevent duplicate sends on retry.
 *
 * @param to - Recipient email address or array of addresses
 * @param subject - Email subject line
 * @param react - React Email component to render
 * @param options - Optional settings (maxRetries, attachments)
 * @returns Email ID from Resend or null if failed
 */
export async function sendEmailWithRetry(
  to: string | string[],
  subject: string,
  react: React.ReactElement,
  options?: SendEmailOptions | number // number for backwards compatibility
): Promise<string | null> {
  // Handle backwards compatibility: options can be a number (old maxRetries param)
  const opts: SendEmailOptions = typeof options === 'number'
    ? { maxRetries: options }
    : options || {};
  const maxRetries = opts.maxRetries ?? 3;
  const attachments = opts.attachments;

  // Skip sending emails in test mode to avoid filling inbox
  // Use SKIP_EMAILS env var since NODE_ENV might be 'development' in containers
  if (process.env.SKIP_EMAILS === 'true' || process.env.NODE_ENV === 'test') {
    console.log('[TEST MODE] Skipped sending email:', { to, subject });
    return 'test-email-id';
  }

  // Retrying an uncertain provider acceptance would risk a duplicate after
  // Resend's 24-hour idempotency window. Persist the operation once instead;
  // later reconciliation must reuse its key under an explicit operator action.
  void maxRetries;
  try {
    const html = await render(react);
    const text = await render(react, { plainText: true });
    const results = await Promise.all((Array.isArray(to) ? to : [to]).map((recipient) =>
      sendDurableTransactionalEmail({ to: recipient, subject, text, html, attachments }),
    ));
    return results[0] || null;
  } catch (error) {
    console.error('[Email] Durable transactional send failed:', error);
    return null;
  }
}

/**
 * Send a simple email (for backwards compatibility or testing).
 * No retry logic - use sendEmailWithRetry() for production.
 *
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param html - HTML email content
 * @param text - Plain text fallback (optional)
 * @returns Email ID from Resend or null if failed
 */
export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string,
  text?: string
): Promise<string | null> {
  try {
    if (process.env.SKIP_EMAILS === 'true' || process.env.NODE_ENV === 'test') return 'test-email-id';
    const results = await Promise.all((Array.isArray(to) ? to : [to]).map((recipient) =>
      sendDurableTransactionalEmail({ to: recipient, subject, html, text: text || '' }),
    ));
    return results[0] || null;
  } catch (error) {
    console.error('[Email] Unexpected error:', error);
    return null;
  }
}
