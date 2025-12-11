import { Resend } from 'resend';
import { randomUUID } from 'crypto';

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

export const EMAIL_CONFIG = {
  from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
  adminEmail: process.env.RESEND_ADMIN_EMAIL,
  replyTo: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
} as const;

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
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns Email ID from Resend or null if failed
 */
export async function sendEmailWithRetry(
  to: string | string[],
  subject: string,
  react: React.ReactElement,
  maxRetries: number = 3
): Promise<string | null> {
  const resend = getResend();
  const idempotencyKey = randomUUID();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data, error } = await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to,
        subject,
        react,
        reply_to: EMAIL_CONFIG.replyTo,
        // Idempotency key prevents duplicate sends on retry
        // If this request fails and we retry with the same key,
        // Resend will return the original response without sending again
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
      });

      if (!error && data) {
        if (attempt > 1) {
          console.log(`[Email] Sent successfully on attempt ${attempt}`);
        }
        return data.id;
      }

      // Handle specific error types from Resend API
      if (error && isResendError(error)) {
        // Validation errors - don't retry, these won't succeed
        if (
          error.name === 'validation_error' ||
          error.name === 'missing_required_field'
        ) {
          console.error(
            `[Email] Validation error - not retrying:`,
            error.message
          );
          return null;
        }

        // Application errors - retry with backoff
        if (error.name === 'application_error' && attempt < maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
          console.log(
            `[Email] Attempt ${attempt} failed (application_error), retrying in ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        console.error(`[Email] Send failed:`, error);
        return null;
      }

      // Unknown error format
      console.error(`[Email] Unexpected error format:`, error);
      return null;
    } catch (error) {
      // Network or unexpected errors - retry with backoff
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
        console.error(
          `[Email] Attempt ${attempt}/${maxRetries} failed (${error instanceof Error ? error.message : 'unknown error'}), retrying in ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      console.error(`[Email] All retry attempts failed:`, error);
      return null;
    }
  }

  console.error(`[Email] Max retries (${maxRetries}) exceeded`);
  return null;
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
    const resend = getResend();

    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to,
      subject,
      html,
      text,
      reply_to: EMAIL_CONFIG.replyTo,
    });

    if (error) {
      console.error('[Email] Send failed:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('[Email] Unexpected error:', error);
    return null;
  }
}
