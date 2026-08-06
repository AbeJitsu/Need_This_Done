import { Resend } from 'resend';
import type { ApprovedOutboundMessage, OutboundSender, SenderEvent } from '@/lib/outbound-sender';

export type ProspectingSenderProvider = 'disabled' | 'fake' | 'resend';

export function getProspectingSenderProvider(): ProspectingSenderProvider {
  const configured = process.env.PROSPECTING_SENDER_PROVIDER;
  if (configured === 'fake' || configured === 'resend') return configured;
  if (process.env.OFFLINE_ASSEMBLY_PROOF === 'true') return 'fake';
  return 'disabled';
}

export function createProspectingSender(): OutboundSender | null {
  const provider = getProspectingSenderProvider();
  if (provider === 'fake') return new InMemoryProspectingSender();
  if (provider === 'resend') return new ResendProspectingSender();
  return null;
}

/** Local-only sender. The provider ID is deterministic so a retry after a
 * network failure cannot create a second fake delivery. */
export class InMemoryProspectingSender implements OutboundSender {
  async prepare(message: ApprovedOutboundMessage) { return message; }

  async send(message: ApprovedOutboundMessage) {
    if (!message.id || !message.senderEmail || !message.recipientEmail || !message.subject || !message.body) {
      throw new Error('approved message is incomplete');
    }
    return { providerMessageId: `fake-${message.idempotencyKey}` };
  }

  async receiveDeliveryEvent(_event: SenderEvent) { throw new Error('Provider events must enter through the signed sender webhook.'); }
  async receiveReply(_event: SenderEvent) { throw new Error('Provider replies must enter through the signed sender webhook.'); }
  async suppress(_address: string, _reason: 'unsubscribe' | 'bounce' | 'do_not_contact' | 'manual') { throw new Error('Suppression must be recorded by the sender-event boundary.'); }
}

/** Explicit real-provider adapter. It is never selected by RESEND_API_KEY;
 * it requires a separately approved prospecting key and provider mode. */
export class ResendProspectingSender implements OutboundSender {
  private readonly client: Resend;

  constructor(apiKey = process.env.PROSPECTING_RESEND_API_KEY) {
    if (!apiKey) throw new Error('PROSPECTING_RESEND_API_KEY is required for the prospecting Resend sender.');
    this.client = new Resend(apiKey);
  }

  async prepare(message: ApprovedOutboundMessage) { return message; }

  async send(message: ApprovedOutboundMessage) {
    if (!message.id || !message.senderEmail || !message.recipientEmail || !message.subject || !message.body) {
      throw new Error('approved message is incomplete');
    }
    const from = message.senderName ? `${message.senderName} <${message.senderEmail}>` : message.senderEmail;
    const { data, error } = await this.client.emails.send({
      from,
      to: [message.recipientEmail],
      subject: message.subject,
      text: message.body,
      reply_to: message.senderEmail,
      headers: { 'Idempotency-Key': message.idempotencyKey },
    });
    if (error) throw new Error(error.message || 'Prospecting sender rejected the message.');
    if (!data?.id) throw new Error('Prospecting sender returned no provider message ID.');
    return { providerMessageId: data.id };
  }

  async receiveDeliveryEvent(_event: SenderEvent) { throw new Error('Provider events must enter through the signed sender webhook.'); }
  async receiveReply(_event: SenderEvent) { throw new Error('Provider replies must enter through the signed sender webhook.'); }
  async suppress(_address: string, _reason: 'unsubscribe' | 'bounce' | 'do_not_contact' | 'manual') { throw new Error('Suppression must be recorded by the sender-event boundary.'); }
}
