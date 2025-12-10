import { sendEmailWithRetry, EMAIL_CONFIG } from './email';
import AdminNotification, {
  type AdminNotificationProps,
} from '../emails/AdminNotification';
import ClientConfirmation, {
  type ClientConfirmationProps,
} from '../emails/ClientConfirmation';

// ============================================================================
// Email Service Functions
// ============================================================================
// What: High-level email operations for business workflows
// Why: Encapsulate email sending logic for project submissions
// How: Compose React Email templates + sending logic into reusable functions

// ============================================================================
// Project Submission Emails
// ============================================================================

/**
 * Send admin notification email for new project submission.
 * Includes all project details and links to admin dashboard.
 *
 * @param data - Project submission data
 * @returns Email ID if successful, null if failed
 */
export async function sendAdminNotification(
  data: AdminNotificationProps
): Promise<string | null> {
  if (!EMAIL_CONFIG.adminEmail) {
    console.warn('[Email] Admin email not configured, skipping notification');
    return null;
  }

  const subject = `🎯 New Project: ${data.name}${data.service ? ` - ${data.service}` : ''}`;

  return sendEmailWithRetry(
    EMAIL_CONFIG.adminEmail,
    subject,
    AdminNotification(data)
  );
}

/**
 * Send confirmation email to client after project submission.
 * Sets expectations for response time and next steps.
 *
 * @param to - Client email address
 * @param data - Client confirmation data
 * @returns Email ID if successful, null if failed
 */
export async function sendClientConfirmation(
  to: string,
  data: ClientConfirmationProps
): Promise<string | null> {
  const subject = '✨ We Got Your Message! (Response in 2 Business Days)';

  return sendEmailWithRetry(to, subject, ClientConfirmation(data));
}

/**
 * Send both admin notification and client confirmation emails.
 * Gracefully handles partial failures (e.g., admin succeeds, client fails).
 * Sends emails in parallel for faster response times.
 *
 * @param adminData - Data for admin notification
 * @param clientEmail - Client email address
 * @param clientData - Data for client confirmation
 * @returns Object with results for both emails
 */
export async function sendProjectSubmissionEmails(
  adminData: AdminNotificationProps,
  clientEmail: string,
  clientData: ClientConfirmationProps
): Promise<{ adminSent: boolean; clientSent: boolean }> {
  // Send both emails in parallel (don't wait for one to finish)
  const [adminResult, clientResult] = await Promise.allSettled([
    sendAdminNotification(adminData),
    sendClientConfirmation(clientEmail, clientData),
  ]);

  const adminSent =
    adminResult.status === 'fulfilled' && adminResult.value !== null;
  const clientSent =
    clientResult.status === 'fulfilled' && clientResult.value !== null;

  // Log results for debugging
  if (!adminSent) {
    console.error('[Email] Admin notification failed');
  }
  if (!clientSent) {
    console.error('[Email] Client confirmation failed');
  }

  return { adminSent, clientSent };
}
