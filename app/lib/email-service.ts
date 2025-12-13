import { sendEmailWithRetry, getEmailConfig } from './email';
import AdminNotification, {
  type AdminNotificationProps,
} from '../emails/AdminNotification';
import ClientConfirmation, {
  type ClientConfirmationProps,
} from '../emails/ClientConfirmation';
import WelcomeEmail, {
  type WelcomeEmailProps,
} from '../emails/WelcomeEmail';
import LoginNotificationEmail, {
  type LoginNotificationEmailProps,
} from '../emails/LoginNotificationEmail';
import OrderConfirmationEmail, {
  type OrderConfirmationEmailProps,
} from '../emails/OrderConfirmationEmail';
import AppointmentConfirmationEmail, {
  type AppointmentConfirmationEmailProps,
} from '../emails/AppointmentConfirmationEmail';

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
  const emailConfig = getEmailConfig();

  if (!emailConfig.adminEmail) {
    console.warn('[Email] Admin email not configured, skipping notification');
    return null;
  }

  const subject = `🎯 New Project: ${data.name}${data.service ? ` - ${data.service}` : ''}`;

  return sendEmailWithRetry(
    emailConfig.adminEmail,
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

// ============================================================================
// Authentication Emails
// ============================================================================

/**
 * Send welcome email to new users after account creation.
 * Provides helpful getting-started links and sets expectations.
 *
 * @param data - User data (email, optional name)
 * @returns Email ID if successful, null if failed
 */
export async function sendWelcomeEmail(
  data: WelcomeEmailProps
): Promise<string | null> {
  const subject = '🎉 Welcome to NeedThisDone!';

  return sendEmailWithRetry(data.email, subject, WelcomeEmail(data));
}

/**
 * Send login notification email for security awareness.
 * Alerts user to new sign-in and provides reset option if suspicious.
 *
 * @param data - Login details (email, time, IP, user agent)
 * @returns Email ID if successful, null if failed
 */
export async function sendLoginNotification(
  data: LoginNotificationEmailProps
): Promise<string | null> {
  const subject = '🔐 New Sign-In to Your NeedThisDone Account';

  return sendEmailWithRetry(data.email, subject, LoginNotificationEmail(data));
}

// ============================================================================
// E-commerce Emails
// ============================================================================

/**
 * Send order confirmation email after successful checkout.
 * Includes order details and appointment scheduling CTA if needed.
 *
 * @param data - Order confirmation data
 * @returns Email ID if successful, null if failed
 */
export async function sendOrderConfirmation(
  data: OrderConfirmationEmailProps
): Promise<string | null> {
  const subject = data.requiresAppointment
    ? `✓ Order Confirmed! Schedule Your Appointment - #${data.orderId}`
    : `✓ Order Confirmed! - #${data.orderId}`;

  return sendEmailWithRetry(
    data.customerEmail,
    subject,
    OrderConfirmationEmail(data)
  );
}

/**
 * Send appointment confirmation email when admin approves.
 * Includes meeting details and calendar invite.
 *
 * @param data - Appointment confirmation data
 * @param icsContent - Optional ICS calendar file content for attachment
 * @returns Email ID if successful, null if failed
 */
export async function sendAppointmentConfirmation(
  data: AppointmentConfirmationEmailProps,
  _icsContent?: string // TODO: Implement ICS attachment support
): Promise<string | null> {
  const subject = `📅 Appointment Confirmed: ${data.serviceName} on ${data.appointmentDate}`;

  // Note: ICS attachment would require updating sendEmailWithRetry to support attachments
  // For now, we include the .ics generation link in the email itself
  return sendEmailWithRetry(
    data.customerEmail,
    subject,
    AppointmentConfirmationEmail(data)
  );
}

// Re-export types for convenience
export type {
  AdminNotificationProps,
  ClientConfirmationProps,
  WelcomeEmailProps,
  LoginNotificationEmailProps,
  OrderConfirmationEmailProps,
  AppointmentConfirmationEmailProps,
};
