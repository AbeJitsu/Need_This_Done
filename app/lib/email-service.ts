import { sendEmailWithRetry, getEmailConfig, EmailAttachment } from "./email";

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
};

export type ClientConfirmationProps = {
  name: string;
  service?: string;
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

export type OrderConfirmationEmailProps = {
  orderId: string;
  orderDate: string;
  customerEmail: string;
  customerName?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    requiresAppointment?: boolean;
  }>;
  subtotal: number;
  tax?: number;
  total: number;
  requiresAppointment?: boolean;
};

export type AppointmentConfirmationEmailProps = {
  customerEmail: string;
  customerName?: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes: number;
  orderId: string;
  meetingLink?: string;
  notes?: string;
};

export type AppointmentRequestNotificationProps = {
  requestId: string;
  orderId: string;
  customerName: string | null;
  customerEmail: string;
  serviceName: string;
  durationMinutes: number;
  preferredDate: string;
  preferredTimeStart: string;
  preferredTimeEnd: string;
  alternateDate: string | null;
  alternateTimeStart: string | null;
  alternateTimeEnd: string | null;
  notes: string | null;
  submittedAt: string;
};

export type PurchaseReceiptEmailProps = {
  orderId: string;
  orderDate: string;
  customerEmail: string;
  customerName?: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentLast4?: string;
  billingAddress?: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
};

export type AbandonedCartEmailProps = {
  customerEmail: string;
  customerName?: string;
  cartId: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  cartUrl: string;
  discountCode?: string;
  discountAmount?: number;
};

export type OrderStatusUpdateEmailProps = {
  customerEmail: string;
  customerName?: string;
  orderId: string;
  previousStatus: string;
  newStatus: string;
  updatedAt: string;
};

export type AppointmentCancellationEmailProps = {
  customerEmail: string;
  customerName?: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceName: string;
  orderId: string;
  reason?: string;
};

export type AppointmentReminderEmailProps = {
  customerName?: string;
  customerEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes: number;
  serviceName: string;
  meetingLink?: string;
  orderId: string;
  hoursUntilAppointment: number;
};

export type DepositConfirmationEmailProps = {
  customerEmail: string;
  customerName: string;
  quoteReference: string;
  projectDescription?: string;
  depositAmount: number;
  totalAmount: number;
  balanceRemaining: number;
  paidAt: string;
};

export type QuoteEmailProps = {
  customerEmail: string;
  customerName: string;
  quoteReference: string;
  projectDescription?: string;
  totalAmount: number;
  depositAmount: number;
  expiresAt: string;
  paymentUrl: string;
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
  data: OrderConfirmationEmailProps,
): Promise<string | null> {
  // Dynamic import to prevent bundling during page prerendering
  const { default: OrderConfirmationEmail } = await import("../emails/OrderConfirmationEmail");

  const subject = data.requiresAppointment
    ? `✓ Order Confirmed! Schedule Your Appointment - #${data.orderId}`
    : `✓ Order Confirmed! - #${data.orderId}`;

  return sendEmailWithRetry(
    data.customerEmail,
    subject,
    OrderConfirmationEmail(data),
  );
}

/**
 * Send notification to admin when customer requests an appointment.
 * Includes customer info, preferred times, and link to admin dashboard.
 *
 * @param data - Appointment request data
 * @returns Email ID if successful, null if failed
 */
export async function sendAppointmentRequestNotification(
  data: AppointmentRequestNotificationProps,
): Promise<string | null> {
  const emailConfig = getEmailConfig();

  if (!emailConfig.adminEmail) {
    console.warn(
      "[Email] Admin email not configured, skipping appointment request notification",
    );
    return null;
  }

  // Dynamic import to prevent bundling during page prerendering
  const { default: AppointmentRequestNotificationEmail } = await import("../emails/AppointmentRequestNotificationEmail");

  const customerDisplay = data.customerName || data.customerEmail;
  const subject = `📅 New Appointment Request: ${customerDisplay} - ${data.serviceName}`;

  return sendEmailWithRetry(
    emailConfig.adminEmail,
    subject,
    AppointmentRequestNotificationEmail(data),
  );
}

/**
 * Send appointment confirmation email when admin approves.
 * Includes meeting details and calendar invite as ICS attachment.
 *
 * @param data - Appointment confirmation data
 * @param icsContent - Optional ICS calendar file content for attachment
 * @returns Email ID if successful, null if failed
 */
export async function sendAppointmentConfirmation(
  data: AppointmentConfirmationEmailProps,
  icsContent?: string,
): Promise<string | null> {
  // Dynamic import to prevent bundling during page prerendering
  const { default: AppointmentConfirmationEmail } = await import("../emails/AppointmentConfirmationEmail");

  const subject = `📅 Appointment Confirmed: ${data.serviceName} on ${data.appointmentDate}`;

  // Build attachments array if ICS content provided
  const attachments: EmailAttachment[] | undefined = icsContent
    ? [{
        filename: 'appointment.ics',
        content: icsContent,
        contentType: 'text/calendar',
      }]
    : undefined;

  return sendEmailWithRetry(
    data.customerEmail,
    subject,
    AppointmentConfirmationEmail(data),
    { attachments },
  );
}

/**
 * Send purchase receipt email after successful payment.
 * Includes itemized order, payment details, and totals.
 *
 * @param data - Purchase receipt data
 * @returns Email ID if successful, null if failed
 */
export async function sendPurchaseReceipt(
  data: PurchaseReceiptEmailProps,
): Promise<string | null> {
  // Dynamic import to prevent bundling during page prerendering
  const { default: PurchaseReceiptEmail } = await import("../emails/PurchaseReceiptEmail");

  const subject = `Receipt for Order #${data.orderId}`;

  return sendEmailWithRetry(
    data.customerEmail,
    subject,
    PurchaseReceiptEmail(data),
  );
}

/**
 * Send abandoned cart recovery email to customers who left items in their cart.
 * Includes cart items, optional discount code, and friendly CTA to complete order.
 *
 * @param data - Abandoned cart data (items, totals, discount, cart URL)
 * @returns Email ID if successful, null if failed
 */
export async function sendAbandonedCartEmail(
  data: AbandonedCartEmailProps,
): Promise<string | null> {
  // Dynamic import to prevent bundling during page prerendering
  const { default: AbandonedCartEmail } = await import("../emails/AbandonedCartEmail");

  const customerDisplay = data.customerName || data.customerEmail;
  const subject = data.discountCode
    ? `${customerDisplay}, your cart is waiting (+ special discount inside!)`
    : `${customerDisplay}, you left something in your cart`;

  return sendEmailWithRetry(
    data.customerEmail,
    subject,
    AbandonedCartEmail(data),
  );
}

/**
 * Send order status update email when order status changes.
 * Keeps customers informed throughout the fulfillment process.
 *
 * @param data - Order status update data (customer info, order ID, status change)
 * @returns Email ID if successful, null if failed
 */
export async function sendOrderStatusUpdate(
  data: OrderStatusUpdateEmailProps,
): Promise<string | null> {
  // Dynamic import to prevent bundling during page prerendering
  const { default: OrderStatusUpdateEmail } = await import("../emails/OrderStatusUpdateEmail");

  // Status-specific subject lines for better open rates
  const subjectMap: Record<string, string> = {
    pending: `⏳ Order #${data.orderId} Received`,
    processing: `⚙️ Order #${data.orderId} is Being Processed`,
    shipped: `📦 Order #${data.orderId} Has Shipped!`,
    delivered: `✓ Order #${data.orderId} Delivered`,
    canceled: `Order #${data.orderId} Canceled`,
  };

  const subject = subjectMap[data.newStatus] || `Order #${data.orderId} Status Update`;

  return sendEmailWithRetry(
    data.customerEmail,
    subject,
    OrderStatusUpdateEmail(data),
  );
}

/**
 * Send appointment cancellation email when admin cancels.
 * Notifies customer and provides rebooking options.
 *
 * @param data - Appointment cancellation data
 * @returns Email ID if successful, null if failed
 */
export async function sendAppointmentCancellation(
  data: AppointmentCancellationEmailProps,
): Promise<string | null> {
  // Dynamic import to prevent bundling during page prerendering
  const { default: AppointmentCancellationEmail } = await import("../emails/AppointmentCancellationEmail");

  const subject = `Appointment Canceled: ${data.serviceName} on ${data.appointmentDate}`;

  return sendEmailWithRetry(
    data.customerEmail,
    subject,
    AppointmentCancellationEmail(data),
  );
}

// ============================================================================
// Quote System Emails
// ============================================================================

/**
 * Send deposit confirmation email after customer pays quote deposit.
 * Includes receipt, project timeline, and next steps.
 *
 * @param data - Deposit confirmation data (quote details, amounts)
 * @returns Email ID if successful, null if failed
 */
export async function sendDepositConfirmation(
  data: DepositConfirmationEmailProps,
): Promise<string | null> {
  // Dynamic import to prevent bundling during page prerendering
  const { default: DepositConfirmationEmail } = await import("../emails/DepositConfirmationEmail");

  const subject = `🎉 Deposit Received - Project ${data.quoteReference}`;

  return sendEmailWithRetry(
    data.customerEmail,
    subject,
    DepositConfirmationEmail(data),
  );
}

/**
 * Send quote email to customer with pricing and payment link.
 * This is sent when admin marks quote as 'sent'.
 *
 * @param data - Quote data (customer info, amounts, payment URL)
 * @returns Email ID if successful, null if failed
 */
export async function sendQuoteEmail(
  data: QuoteEmailProps,
): Promise<string | null> {
  // Dynamic import to prevent bundling during page prerendering
  const { default: QuoteEmail } = await import("../emails/QuoteEmail");

  const firstName = data.customerName.split(' ')[0];
  const depositFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(data.depositAmount / 100);

  const subject = `📝 ${firstName}, your quote is ready - ${depositFormatted} to get started`;

  return sendEmailWithRetry(
    data.customerEmail,
    subject,
    QuoteEmail(data),
  );
}
