import 'server-only';

import { createHash, randomUUID } from 'node:crypto';
import { Resend } from 'resend';
import Stripe from 'stripe';
import { Webhook } from 'svix';
import { getValidAccessToken } from '@/lib/google-calendar';

export type ProviderMode = 'disabled' | 'fake' | 'live';

function mode(name: string, key?: string): ProviderMode {
  const configured = process.env[name];
  if (configured === 'fake' && process.env.OFFLINE_ASSEMBLY_PROOF === 'true') return 'fake';
  // A credential is capability, not activation. Real adapters require both a
  // reviewed explicit mode and their dedicated credential.
  if (configured === 'live' && key) return 'live';
  return 'disabled';
}

export function sha256(value: string) { return createHash('sha256').update(value).digest('hex'); }

export function verifyResendWebhook(value: string, headers: Headers, secret?: string) {
  const id = headers.get('svix-id');
  const timestamp = headers.get('svix-timestamp');
  const signature = headers.get('svix-signature');
  if (!secret || !id || !timestamp || !signature) return false;
  try {
    new Webhook(secret).verify(value, {
      'svix-id': id,
      'svix-timestamp': timestamp,
      'svix-signature': signature,
    });
    return true;
  } catch {
    return false;
  }
}

export type TransactionalSend = { from: string; to: string; subject: string; text: string; html?: string; replyTo?: string; attachments?: { filename: string; content: Buffer | string; contentType?: string }[]; idempotencyKey: string };
export interface TransactionalEmailAdapter { send(input: TransactionalSend): Promise<{ providerMessageId: string }>; }

export function transactionalEmailAdapter(): { mode: ProviderMode; adapter: TransactionalEmailAdapter | null } {
  const providerMode = mode('TRANSACTIONAL_RESEND_PROVIDER', process.env.RESEND_API_KEY);
  if (providerMode === 'disabled') return { mode: providerMode, adapter: null };
  if (providerMode === 'fake') return { mode: providerMode, adapter: { send: async (input) => ({ providerMessageId: `fake-resend-${input.idempotencyKey}` }) } };
  const client = new Resend(process.env.RESEND_API_KEY);
  return { mode: providerMode, adapter: { send: async (input) => {
    const { data, error } = await client.emails.send({ from: input.from, to: [input.to], subject: input.subject, text: input.text, html: input.html, reply_to: input.replyTo, attachments: input.attachments, headers: { 'Idempotency-Key': input.idempotencyKey } });
    if (error || !data?.id) throw new Error(error?.message || 'Resend did not return a message ID.');
    return { providerMessageId: data.id };
  } } };
}

export type CalendarInput = {
  idempotencyKey: string;
  calendarUserId: string;
  calendarId: string;
  externalEventId?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  summary?: string | null;
  cleanupReason?: 'test_or_accidental' | null;
};
export interface CalendarAdapter { execute(action: 'create' | 'update' | 'cancel' | 'delete', input: CalendarInput): Promise<{ externalEventId: string }>; }

/** Google Calendar accepts lower-case base32hex IDs. Derive one from the
 * durable operation key so retries address the same provider event. */
export function calendarEventId(operationKey: string) {
  const alphabet = '0123456789abcdefghijklmnopqrstuv';
  const bytes = createHash('sha256').update(operationKey).digest();
  let bits = 0;
  let accumulator = 0;
  let encoded = '';
  for (const byte of bytes) {
    accumulator = (accumulator << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      encoded += alphabet[(accumulator >>> bits) & 31];
    }
  }
  if (bits > 0) encoded += alphabet[(accumulator << (5 - bits)) & 31];
  return `ntd${encoded.slice(0, 32)}`;
}

export function calendarAdapter(): { mode: ProviderMode; adapter: CalendarAdapter | null } {
  const providerMode = mode('CALENDAR_PROVIDER', process.env.GOOGLE_CLIENT_SECRET);
  if (providerMode === 'fake') return { mode: providerMode, adapter: { execute: async (action, input) => {
    if ((action === 'create' || action === 'update') && (!input.startsAt || !input.endsAt || !input.summary)) {
      throw new Error('Calendar create/update requires start, end, and summary.');
    }
    if (action === 'delete' && input.cleanupReason !== 'test_or_accidental') {
      throw new Error('Calendar delete requires cleanup reason test_or_accidental.');
    }
    const externalEventId = action === 'create' ? calendarEventId(input.idempotencyKey) : input.externalEventId;
    if (!externalEventId) throw new Error(`Calendar ${action} requires the stored project event reference.`);
    return { externalEventId };
  } } };
  if (providerMode === 'disabled') return { mode: providerMode, adapter: null };
  return { mode: providerMode, adapter: { execute: async (action, input) => {
    const accessToken = await getValidAccessToken(input.calendarUserId);
    const eventId = action === 'create' ? calendarEventId(input.idempotencyKey) : input.externalEventId;
    if (!eventId) throw new Error(`Calendar ${action} requires the stored project event reference.`);
    const base = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(input.calendarId)}/events/${encodeURIComponent(eventId)}`;
    const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
    let response: Response;
    if (action === 'delete') {
      if (input.cleanupReason !== 'test_or_accidental') {
        throw new Error('Calendar delete requires cleanup reason test_or_accidental.');
      }
      response = await fetch(`${base}?sendUpdates=none`, { method: 'DELETE', headers });
    } else if (action === 'cancel') {
      response = await fetch(`${base}?sendUpdates=all`, { method: 'PATCH', headers, body: JSON.stringify({ status: 'cancelled' }) });
    } else {
      if (!input.startsAt || !input.endsAt || !input.summary) throw new Error('Calendar create/update requires start, end, and summary.');
      response = await fetch(`${base}?sendUpdates=${action === 'create' ? 'none' : 'all'}`, {
        method: 'PUT', headers,
        body: JSON.stringify({ id: eventId, summary: input.summary, start: { dateTime: input.startsAt }, end: { dateTime: input.endsAt } }),
      });
    }
    if (!response.ok) throw new Error(`Google Calendar rejected ${action} (${response.status}).`);
    if (action === 'delete') return { externalEventId: eventId };
    const event = await response.json() as { id?: string };
    if (!event.id) throw new Error('Google Calendar did not return an event ID.');
    return { externalEventId: event.id };
  } } };
}

export interface InvoiceAdapter { createStartInvoice(input: { idempotencyKey: string; projectId: string }): Promise<{ invoiceId: string }>; }
export function invoiceAdapter(): { mode: ProviderMode; adapter: InvoiceAdapter | null } {
  const providerMode = mode('STRIPE_INVOICE_PROVIDER', process.env.STRIPE_SECRET_KEY);
  if (providerMode === 'disabled') return { mode: providerMode, adapter: null };
  if (providerMode === 'fake') return { mode: providerMode, adapter: { createStartInvoice: async (input) => ({ invoiceId: `in_fake_${input.idempotencyKey}` }) } };
  const key = process.env.STRIPE_SECRET_KEY!;
  if (!key.startsWith('sk_test_')) return { mode: 'disabled', adapter: null };
  const client = new Stripe(key);
  return { mode: providerMode, adapter: { createStartInvoice: async (input) => {
    const customer = await client.customers.create({ metadata: { needthisdone_project_id: input.projectId } }, { idempotencyKey: `${input.idempotencyKey}:customer` });
    await client.invoiceItems.create({ customer: customer.id, currency: 'usd', amount: 25000, description: 'Website Fix start invoice' }, { idempotencyKey: `${input.idempotencyKey}:item` });
    const invoice = await client.invoices.create({ customer: customer.id, collection_method: 'send_invoice', days_until_due: 30, metadata: { needthisdone_project_id: input.projectId, idempotency_key: input.idempotencyKey } }, { idempotencyKey: `${input.idempotencyKey}:invoice` });
    return { invoiceId: invoice.id };
  } } };
}

export function newOperationKey() { return randomUUID(); }
