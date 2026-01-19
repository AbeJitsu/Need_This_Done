import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { getResend, getEmailConfig } from '@/lib/email';

// ============================================================================
// Email Forwarding Webhook
// ============================================================================
// What: Receives inbound emails from Resend and forwards them to personal Gmail
// Why: Allows hello@needthisdone.com to receive emails and route them to Gmail
// How: Verifies webhook signature with Svix, fetches email content, forwards via Resend
//
// Setup required:
// 1. Create webhook in Resend dashboard pointing to /api/email-forward
// 2. Subscribe to 'email.received' event
// 3. Set RESEND_WEBHOOK_SECRET env var with the signing secret (whsec_...)
// 4. RESEND_ADMIN_EMAIL env var is the forward destination

// ============================================================================
// Type Definitions
// ============================================================================

interface EmailReceivedPayload {
  type: 'email.received';
  created_at: string;
  data: {
    email_id: string;
    created_at: string;
    from: string;
    to: string[];
    bcc?: string[];
    cc?: string[];
    message_id?: string;
    subject: string;
    attachments?: Array<{
      id: string;
      filename: string;
      content_type: string;
      content_disposition: string;
      content_id?: string;
    }>;
  };
}

interface ReceivedEmailContent {
  html?: string;
  text?: string;
  headers?: Record<string, string>;
}

// ============================================================================
// Webhook Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Get raw payload for signature verification
    const payload = await request.text();

    // Get signature headers
    const svixId = request.headers.get('svix-id');
    const svixTimestamp = request.headers.get('svix-timestamp');
    const svixSignature = request.headers.get('svix-signature');

    // Verify all required headers are present
    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error('[Email Forward] Missing Svix headers');
      return NextResponse.json(
        { error: 'Missing webhook signature headers' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[Email Forward] RESEND_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature using Svix
    const wh = new Webhook(webhookSecret);
    let event: EmailReceivedPayload;

    try {
      event = wh.verify(payload, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as EmailReceivedPayload;
    } catch (verifyError) {
      console.error('[Email Forward] Signature verification failed:', verifyError);
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    // Only process email.received events
    if (event.type !== 'email.received') {
      return NextResponse.json({ status: 'ignored', type: event.type });
    }

    const { email_id, from, to, subject } = event.data;

    // Fetch the full email content (body not included in webhook payload)
    const emailContent = await fetchReceivedEmailContent(email_id);

    // Get email config (forward destination is RESEND_ADMIN_EMAIL)
    const emailConfig = getEmailConfig();

    if (!emailConfig.adminEmail) {
      console.error('[Email Forward] RESEND_ADMIN_EMAIL not configured');
      return NextResponse.json(
        { error: 'Forward destination not configured' },
        { status: 500 }
      );
    }

    // Build the forwarded email
    const forwardedSubject = `[Forwarded] ${subject}`;

    // Create HTML body with original sender info
    const htmlBody = buildForwardedHtml({
      originalFrom: from,
      originalTo: to,
      originalSubject: subject,
      htmlContent: emailContent?.html,
      textContent: emailContent?.text,
      receivedAt: event.data.created_at,
    });

    // Create plain text fallback
    const textBody = buildForwardedText({
      originalFrom: from,
      originalTo: to,
      originalSubject: subject,
      textContent: emailContent?.text,
      receivedAt: event.data.created_at,
    });

    // Send the forwarded email using Resend
    const resend = getResend();
    const { data: sendResult, error: sendError } = await resend.emails.send({
      from: emailConfig.from,
      to: emailConfig.adminEmail,
      subject: forwardedSubject,
      html: htmlBody,
      text: textBody,
      reply_to: from, // Allow replying directly to original sender
    });

    if (sendError) {
      console.error('[Email Forward] Failed to forward email:', sendError);
      return NextResponse.json(
        { error: 'Failed to forward email', details: sendError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'forwarded',
      originalEmailId: email_id,
      forwardedEmailId: sendResult?.id,
    });

  } catch (error) {
    console.error('[Email Forward] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// API Helpers
// ============================================================================

/**
 * Fetch full email content from Resend API.
 * The webhook payload doesn't include the email body - we need to fetch it separately.
 */
async function fetchReceivedEmailContent(emailId: string): Promise<ReceivedEmailContent | null> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[Email Forward] RESEND_API_KEY not configured');
    return null;
  }

  try {
    const response = await fetch(`https://api.resend.com/emails/${emailId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[Email Forward] Failed to fetch email content:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    return {
      html: data.html,
      text: data.text,
      headers: data.headers,
    };
  } catch (error) {
    console.error('[Email Forward] Error fetching email content:', error);
    return null;
  }
}

// ============================================================================
// Email Formatting Helpers
// ============================================================================

interface ForwardedEmailData {
  originalFrom: string;
  originalTo: string[];
  originalSubject: string;
  htmlContent?: string;
  textContent?: string;
  receivedAt: string;
}

/**
 * Build HTML body for forwarded email with original sender info header
 */
function buildForwardedHtml(data: ForwardedEmailData): string {
  const receivedDate = new Date(data.receivedAt).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const header = `
    <div style="background: #f8f9fa; padding: 16px; margin-bottom: 20px; border-left: 4px solid #0066cc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
        <strong>Forwarded message</strong> received via hello@needthisdone.com
      </p>
      <p style="margin: 0 0 4px 0; color: #333; font-size: 14px;">
        <strong>From:</strong> ${escapeHtml(data.originalFrom)}
      </p>
      <p style="margin: 0 0 4px 0; color: #333; font-size: 14px;">
        <strong>To:</strong> ${escapeHtml(data.originalTo.join(', '))}
      </p>
      <p style="margin: 0 0 4px 0; color: #333; font-size: 14px;">
        <strong>Subject:</strong> ${escapeHtml(data.originalSubject)}
      </p>
      <p style="margin: 0; color: #333; font-size: 14px;">
        <strong>Received:</strong> ${receivedDate}
      </p>
    </div>
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
  `;

  // Use HTML content if available, otherwise wrap text content
  const body = data.htmlContent
    ? data.htmlContent
    : data.textContent
      ? `<pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(data.textContent)}</pre>`
      : '<p style="color: #999; font-style: italic;">No email content available</p>';

  return header + body;
}

/**
 * Build plain text body for forwarded email
 */
function buildForwardedText(data: ForwardedEmailData): string {
  const receivedDate = new Date(data.receivedAt).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const header = `
---------- Forwarded message ----------
From: ${data.originalFrom}
To: ${data.originalTo.join(', ')}
Subject: ${data.originalSubject}
Received: ${receivedDate}
----------------------------------------

`;

  const body = data.textContent || '[No plain text content available]';

  return header + body;
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
