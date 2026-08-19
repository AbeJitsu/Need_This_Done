import 'server-only';

import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { Resend } from 'resend';
import Stripe from 'stripe';

export type ProviderMode = 'disabled' | 'fake' | 'live';

function mode(name: string, key?: string): ProviderMode {
  if (process.env[name] === 'fake' && process.env.OFFLINE_ASSEMBLY_PROOF === 'true') return 'fake';
  return key ? 'live' : 'disabled';
}

export function sha256(value: string) { return createHash('sha256').update(value).digest('hex'); }

export function verifyWebhookSecret(value: string, signature: string | null, secret?: string) {
  if (!secret || !signature) return false;
  const expected = Buffer.from(sha256(`${secret}.${value}`), 'hex');
  const received = Buffer.from(signature.replace(/^sha256=/, ''), 'hex');
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export type TransactionalSend = { from: string; to: string; subject: string; text: string; idempotencyKey: string };
export interface TransactionalEmailAdapter { send(input: TransactionalSend): Promise<{ providerMessageId: string }>; }

export function transactionalEmailAdapter(): { mode: ProviderMode; adapter: TransactionalEmailAdapter | null } {
  const providerMode = mode('TRANSACTIONAL_RESEND_PROVIDER', process.env.RESEND_API_KEY);
  if (providerMode === 'disabled') return { mode: providerMode, adapter: null };
  if (providerMode === 'fake') return { mode: providerMode, adapter: { send: async (input) => ({ providerMessageId: `fake-resend-${input.idempotencyKey}` }) } };
  const client = new Resend(process.env.RESEND_API_KEY);
  return { mode: providerMode, adapter: { send: async (input) => {
    const { data, error } = await client.emails.send({ from: input.from, to: [input.to], subject: input.subject, text: input.text, headers: { 'Idempotency-Key': input.idempotencyKey } });
    if (error || !data?.id) throw new Error(error?.message || 'Resend did not return a message ID.');
    return { providerMessageId: data.id };
  } } };
}

export type CalendarInput = { idempotencyKey: string; externalEventId?: string | null; startsAt?: string | null; endsAt?: string | null; summary?: string | null };
export interface CalendarAdapter { execute(action: 'create' | 'update' | 'cancel' | 'delete', input: CalendarInput): Promise<{ externalEventId: string }>; }
export function calendarAdapter(): { mode: ProviderMode; adapter: CalendarAdapter | null } {
  const providerMode = mode('CALENDAR_PROVIDER', process.env.GOOGLE_CLIENT_SECRET);
  if (providerMode === 'fake') return { mode: providerMode, adapter: { execute: async (_action, input) => ({ externalEventId: input.externalEventId || `fake-calendar-${input.idempotencyKey}` }) } };
  // Google OAuth use is intentionally unavailable until a separately reviewed
  // server adapter is configured; credentials alone never activate it.
  return { mode: 'disabled', adapter: null };
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
    await client.invoiceItems.create({ customer: customer.id, currency: 'usd', amount: 25000, description: 'Website Improvement start invoice' }, { idempotencyKey: `${input.idempotencyKey}:item` });
    const invoice = await client.invoices.create({ customer: customer.id, collection_method: 'send_invoice', days_until_due: 30, metadata: { needthisdone_project_id: input.projectId, idempotency_key: input.idempotencyKey } }, { idempotencyKey: `${input.idempotencyKey}:invoice` });
    return { invoiceId: invoice.id };
  } } };
}

export function newOperationKey() { return randomUUID(); }
