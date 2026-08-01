import { sendEmailWithRetry, getEmailConfig } from "./email";

// ============================================================================
// Email Service Functions
// ============================================================================
// What: High-level email operations for business workflows
// Why: Encapsulate email sending logic for project submissions
// How: Compose React Email templates + sending logic into reusable functions
//
// IMPORTANT: Email templates are dynamically imported to prevent Next.js from
// bundling react-email's Html component during page prerendering. Static imports
// cause build errors because Next.js confuses react-email's Html with next/document Html.

// ============================================================================
// Type Definitions (imported separately to avoid bundling components)
// ============================================================================

export type AdminNotificationProps = {
  projectId: string;
  name: string;
  email: string;
  company?: string;
  service?: string;
  message: string;
  attachmentCount: number;
  submittedAt: string;
  consultationType?: string;
  preferredConsultationAt?: string;
  alternateConsultationAt?: string;
};

export type ClientConfirmationProps = {
  name: string;
  service?: string;
};

export type ProjectGithubHandoffProps = {
  email: string;
  name: string;
  githubUrl: string;
  note?: string | null;
  portalUrl: string;
};

export type WelcomeEmailProps = {
  email: string;
  name?: string;
};

export type LoginNotificationEmailProps = {
  email: string;
  loginTime: string;
  ipAddress?: string;
  userAgent?: string;
};

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
  data: AdminNotificationProps,
): Promise<string | null> {
  const emailConfig = getEmailConfig();

  if (!emailConfig.adminEmail) {
    console.warn("[Email] Admin email not configured, skipping notification");
    return null;
  }

  // Dynamic import to prevent bundling during page prerendering
  const { default: AdminNotification } = await import("../emails/AdminNotification");

  const subject = `🎯 New Project: ${data.name}${data.service ? ` - ${data.service}` : ""}`;

  return sendEmailWithRetry(
    emailConfig.adminEmail,
    subject,
    AdminNotification(data),
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
  data: ClientConfirmationProps,
): Promise<string | null> {
  // Dynamic import to prevent bundling during page prerendering
  const { default: ClientConfirmation } = await import("../emails/ClientConfirmation");

  const subject = "✨ We Got Your Message! (Response in 2 Business Days)";

  return sendEmailWithRetry(to, subject, ClientConfirmation(data));
}

export async function sendProjectGithubHandoff(
  data: ProjectGithubHandoffProps,
): Promise<string | null> {
  const { default: ProjectGithubHandoffEmail } = await import('../emails/ProjectGithubHandoffEmail');

  return sendEmailWithRetry(
    data.email,
    'Your GitHub project handoff is ready',
    ProjectGithubHandoffEmail(data),
  );
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
  clientData: ClientConfirmationProps,
): Promise<{ adminSent: boolean; clientSent: boolean }> {
  // Send both emails in parallel (don't wait for one to finish)
  const [adminResult, clientResult] = await Promise.allSettled([
    sendAdminNotification(adminData),
    sendClientConfirmation(clientEmail, clientData),
  ]);

  const adminSent =
    adminResult.status === "fulfilled" && adminResult.value !== null;
  const clientSent =
    clientResult.status === "fulfilled" && clientResult.value !== null;

  // Log results for debugging
  if (!adminSent) {
    console.error("[Email] Admin notification failed");
  }
  if (!clientSent) {
    console.error("[Email] Client confirmation failed");
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
  data: WelcomeEmailProps,
): Promise<string | null> {
  // Dynamic import to prevent bundling during page prerendering
  const { default: WelcomeEmail } = await import("../emails/WelcomeEmail");

  const subject = "🎉 Welcome to NeedThisDone!";

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
  data: LoginNotificationEmailProps,
): Promise<string | null> {
  // Dynamic import to prevent bundling during page prerendering
  const { default: LoginNotificationEmail } = await import("../emails/LoginNotificationEmail");

  const subject = "🔐 New Sign-In to Your NeedThisDone Account";

  return sendEmailWithRetry(data.email, subject, LoginNotificationEmail(data));
}

// ============================================================================
// Site Analyzer Emails
// ============================================================================

export type SiteReportEmailProps = {
  email: string;
  url: string;
  score: number;
  grade: string;
  categories: { name: string; earned: number; possible: number; note: string }[];
  executiveSummary: string;
  reportUrl: string;
};

/**
 * Send site report email with score summary and link to full report.
 * Drives click-through to the report page with tiered CTAs.
 *
 * @param data - Report data (score, grade, categories, summary, report URL)
 * @returns Email ID if successful, null if failed
 */
export async function sendSiteReportEmail(
  data: SiteReportEmailProps,
): Promise<string | null> {
  const { default: SiteReportEmail } = await import('../emails/SiteReportEmail');

  const domain = new URL(data.url).hostname;
  const subject = `Your Site Report: ${domain} scored ${data.score}/100`;

  return sendEmailWithRetry(data.email, subject, SiteReportEmail(data));
}
