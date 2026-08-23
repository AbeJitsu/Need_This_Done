import 'server-only';

import { getEmailConfig } from '@/lib/email';
import { sendDurableTransactionalEmail } from '@/lib/transactional-email-service';

export type InboundEmailEvent = {
  type: 'email.received';
  created_at?: string;
  data: {
    email_id: string;
    created_at?: string;
    from: string;
    to?: string[];
    subject?: string;
  };
};

type ReceivedEmailContent = { html?: string; text?: string };

function escapeHtml(value: string) {
  const entities: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  };
  return value.replace(/[&<>"']/g, (character) => entities[character]);
}

async function fetchReceivedEmailContent(emailId: string): Promise<ReceivedEmailContent | null> {
  // Reading an inbound body is itself a provider call. A credential must never
  // activate it unless the transactional lane was explicitly reviewed as live.
  if (process.env.TRANSACTIONAL_RESEND_PROVIDER !== 'live') return null;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  try {
    const response = await fetch(`https://api.resend.com/emails/${encodeURIComponent(emailId)}`, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const data = await response.json() as ReceivedEmailContent;
    return { html: data.html, text: data.text };
  } catch {
    return null;
  }
}

function forwardedBodies(event: InboundEmailEvent, content: ReceivedEmailContent | null) {
  const sender = event.data.from;
  const recipients = event.data.to?.join(', ') || 'hello@needthisdone.com';
  const subject = event.data.subject || '(no subject)';
  const receivedAt = event.data.created_at || event.created_at || new Date().toISOString();
  const textHeader = [
    '---------- Forwarded message ----------',
    `From: ${sender}`,
    `To: ${recipients}`,
    `Subject: ${subject}`,
    `Received: ${receivedAt}`,
    '----------------------------------------',
    '',
  ].join('\n');
  const htmlHeader = `<div style="background:#f8f9fa;padding:16px;margin-bottom:20px;border-left:4px solid #166534">
    <p><strong>Forwarded message</strong> received via hello@needthisdone.com</p>
    <p><strong>From:</strong> ${escapeHtml(sender)}</p>
    <p><strong>To:</strong> ${escapeHtml(recipients)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
    <p><strong>Received:</strong> ${escapeHtml(receivedAt)}</p>
  </div>`;
  const fallbackHtml = content?.text
    ? `<pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(content.text)}</pre>`
    : '<p>No email body was available.</p>';
  return {
    subject: `[Forwarded] ${subject}`,
    text: textHeader + (content?.text || '[No plain text content available]'),
    html: htmlHeader + (content?.html || fallbackHtml),
  };
}

/** Forward one verified inbound event through the transactional operation lane. */
export async function forwardInboundEmail(
  event: InboundEmailEvent,
  operationKey: string,
): Promise<string | null> {
  if (!event.data.email_id || !event.data.from) throw new Error('Inbound email event is incomplete.');
  const destination = getEmailConfig().adminEmail;
  if (!destination) throw new Error('Inbound forwarding destination is not configured.');
  const content = await fetchReceivedEmailContent(event.data.email_id);
  const bodies = forwardedBodies(event, content);
  return sendDurableTransactionalEmail({
    to: destination,
    subject: bodies.subject,
    text: bodies.text,
    html: bodies.html,
    replyTo: event.data.from,
    operationKey,
    domainReference: `inbound-email:${event.data.email_id}:forward`,
  });
}
