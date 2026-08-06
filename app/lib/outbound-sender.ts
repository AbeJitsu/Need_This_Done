export interface ApprovedOutboundMessage {
  id: string;
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  body: string;
  idempotencyKey: string;
}

export interface SenderEvent {
  providerEventId: string;
  eventType: 'delivered' | 'bounced' | 'replied' | 'unsubscribed';
  providerMessageId?: string;
  address?: string;
  payload?: Record<string, unknown>;
  occurredAt?: string;
}

export interface OutboundSender {
  prepare(message: ApprovedOutboundMessage): Promise<ApprovedOutboundMessage>;
  send(message: ApprovedOutboundMessage): Promise<{ providerMessageId: string }>;
  receiveDeliveryEvent(event: SenderEvent): Promise<void>;
  receiveReply(event: SenderEvent): Promise<void>;
  suppress(address: string, reason: 'unsubscribe' | 'bounce' | 'do_not_contact' | 'manual'): Promise<void>;
}

/** Deterministic test double. It refuses unapproved/malformed records by only
 * accepting the narrow approved-message shape supplied by the caller. */
export class InMemoryOutboundSender implements OutboundSender {
  readonly sent = new Map<string, { providerMessageId: string; message: ApprovedOutboundMessage }>();
  readonly events: SenderEvent[] = [];
  readonly suppressed = new Map<string, string>();

  async prepare(message: ApprovedOutboundMessage) { return message; }

  async send(message: ApprovedOutboundMessage) {
    if (!message.id || !message.senderEmail || !message.recipientEmail || !message.subject || !message.body) throw new Error('approved message is incomplete');
    const existing = this.sent.get(message.idempotencyKey);
    if (existing) return { providerMessageId: existing.providerMessageId };
    const providerMessageId = `fake-${this.sent.size + 1}`;
    this.sent.set(message.idempotencyKey, { providerMessageId, message });
    return { providerMessageId };
  }

  async receiveDeliveryEvent(event: SenderEvent) { this.events.push(event); }
  async receiveReply(event: SenderEvent) { this.events.push({ ...event, eventType: 'replied' }); }
  async suppress(address: string, reason: 'unsubscribe' | 'bounce' | 'do_not_contact' | 'manual') { this.suppressed.set(address.trim().toLowerCase(), reason); }
}
