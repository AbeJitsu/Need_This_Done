import Stripe from 'stripe';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getSupabaseAdmin, sha256 } = vi.hoisted(() => ({
  getSupabaseAdmin: vi.fn(), sha256: vi.fn(() => 'd'.repeat(64)),
}));
vi.mock('@/lib/supabase', () => ({ getSupabaseAdmin }));
vi.mock('@/lib/provider-adapters', () => ({ sha256 }));

import { POST } from '@/app/api/webhooks/stripe/route';

const webhookSecret = 'whsec_website_fix_test';
const stripe = new Stripe('sk_test_placeholder');

function signedRequest(event: Record<string, unknown>, secret = webhookSecret) {
  const body = JSON.stringify(event);
  const signature = stripe.webhooks.generateTestHeaderString({ payload: body, secret });
  return new Request('http://localhost/api/webhooks/stripe', {
    method: 'POST', headers: { 'stripe-signature': signature }, body,
  });
}

function event(type: string, object: Record<string, unknown>, livemode = false) {
  return {
    id: `evt_${type.replaceAll('.', '_')}`, object: 'event', type, livemode,
    api_version: '2026-08-23', created: 1787460000, pending_webhooks: 1, request: null,
    data: { object },
  };
}

function adminWith(options: { known?: boolean; receiptError?: boolean; eventError?: boolean; duplicate?: boolean } = {}) {
  const builder = {
    select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn(),
  };
  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.maybeSingle.mockResolvedValue({
    data: options.known === false ? null : { id: 'reference-1', stripe_invoice_id: 'in_known' }, error: null,
  });
  const rpc = vi.fn(async (name: string) => {
    if (name === 'record_provider_webhook_receipt') return options.receiptError
      ? { data: null, error: { message: 'replay mismatch' } }
      : { data: { receipt: { id: 'receipt-1' }, duplicate: options.duplicate || false }, error: null };
    if (name === 'record_stripe_invoice_event') return options.eventError
      ? { data: null, error: { message: 'write failed' } }
      : { data: { id: 'reference-1' }, error: null };
    if (name === 'fail_provider_webhook_receipt') return { data: {}, error: null };
    throw new Error(`Unexpected RPC ${name}`);
  });
  getSupabaseAdmin.mockReturnValue({ from: vi.fn(() => builder), rpc });
  return rpc;
}

describe('test-only Stripe invoice webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', webhookSecret);
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_placeholder');
  });

  it.each([
    ['invoice.paid', { id: 'in_known', object: 'invoice', amount_paid: 25000, currency: 'usd' }, 'paid'],
    ['invoice.payment_failed', { id: 'in_known', object: 'invoice', amount_due: 25000, currency: 'usd' }, 'declined'],
    ['invoice.voided', { id: 'in_known', object: 'invoice', amount_due: 25000, currency: 'usd' }, 'void'],
    ['charge.refunded', { id: 'ch_known', object: 'charge', invoice: 'in_known', amount_refunded: 25000, currency: 'usd' }, 'refunded'],
  ])('accepts signed %s as %s', async (type, object, expectedStatus) => {
    const rpc = adminWith();
    const response = await POST(signedRequest(event(type, object)));
    expect(response.status).toBe(201);
    expect(rpc).toHaveBeenCalledWith('record_stripe_invoice_event', {
      target_receipt_id: 'receipt-1', target_stripe_invoice_id: 'in_known', target_status: expectedStatus,
    });
  });

  it('rejects bad signatures and live-mode events before database access', async () => {
    expect((await POST(signedRequest(event('invoice.paid', {
      id: 'in_known', amount_paid: 25000, currency: 'usd',
    }), 'whsec_wrong'))).status).toBe(401);
    expect((await POST(signedRequest(event('invoice.paid', {
      id: 'in_known', amount_paid: 25000, currency: 'usd',
    }, true)))).status).toBe(400);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it('rejects wrong amount, currency, and unknown invoices', async () => {
    expect((await POST(signedRequest(event('invoice.paid', {
      id: 'in_known', amount_paid: 50000, currency: 'usd',
    })))).status).toBe(400);
    expect((await POST(signedRequest(event('invoice.paid', {
      id: 'in_known', amount_paid: 25000, currency: 'eur',
    })))).status).toBe(400);
    adminWith({ known: false });
    expect((await POST(signedRequest(event('invoice.paid', {
      id: 'in_unknown', amount_paid: 25000, currency: 'usd',
    })))).status).toBe(404);
  });

  it('rejects mismatched replays and leaves failed persistence retryable', async () => {
    adminWith({ receiptError: true });
    expect((await POST(signedRequest(event('invoice.paid', {
      id: 'in_known', amount_paid: 25000, currency: 'usd',
    })))).status).toBe(503);

    const rpc = adminWith({ eventError: true });
    expect((await POST(signedRequest(event('invoice.paid', {
      id: 'in_known', amount_paid: 25000, currency: 'usd',
    })))).status).toBe(503);
    expect(rpc).toHaveBeenCalledWith('fail_provider_webhook_receipt', {
      target_receipt_id: 'receipt-1',
      target_failure_reason: 'Stripe invoice event persistence did not complete.',
      target_permanent: false,
    });
  });

  it('does not repeat a completed duplicate event', async () => {
    const rpc = adminWith({ duplicate: true });
    const response = await POST(signedRequest(event('invoice.paid', {
      id: 'in_known', amount_paid: 25000, currency: 'usd',
    })));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ duplicate: true });
    expect(rpc).toHaveBeenCalledTimes(1);
  });
});
