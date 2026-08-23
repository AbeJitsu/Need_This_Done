import { afterEach, describe, expect, it, vi } from 'vitest';
import { Webhook } from 'svix';

vi.mock('server-only', () => ({}));

import { calendarAdapter, invoiceAdapter, sha256, transactionalEmailAdapter, verifyResendWebhook } from '@/lib/provider-adapters';

afterEach(() => vi.unstubAllEnvs());

describe('local provider adapter boundary', () => {
  it('requires complete native Svix headers and retains only a payload hash', () => {
    const body = '{"event":"test"}';
    expect(verifyResendWebhook(body, new Headers(), 'whsec_test')).toBe(false);
    expect(sha256(body)).toMatch(/^[a-f0-9]{64}$/);
  });

  it('accepts a current native Svix signature and rejects a stale one', () => {
    const secret = `whsec_${Buffer.from('needthisdone-transactional-webhook-test').toString('base64')}`;
    const webhook = new Webhook(secret);
    const body = '{"type":"email.delivered"}';
    const messageId = 'msg_transactional_test';
    const current = new Date();
    const currentHeaders = new Headers({
      'svix-id': messageId,
      'svix-timestamp': String(Math.floor(current.getTime() / 1000)),
      'svix-signature': webhook.sign(messageId, current, body),
    });
    expect(verifyResendWebhook(body, currentHeaders, secret)).toBe(true);

    const stale = new Date(Date.now() - 10 * 60 * 1000);
    const staleHeaders = new Headers({
      'svix-id': messageId,
      'svix-timestamp': String(Math.floor(stale.getTime() / 1000)),
      'svix-signature': webhook.sign(messageId, stale, body),
    });
    expect(verifyResendWebhook(body, staleHeaders, secret)).toBe(false);
  });

  it('keeps every adapter disabled when no explicit local fake mode is enabled', () => {
    vi.stubEnv('OFFLINE_ASSEMBLY_PROOF', 'false');
    vi.stubEnv('RESEND_API_KEY', '');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', '');
    vi.stubEnv('STRIPE_SECRET_KEY', '');
    expect(transactionalEmailAdapter()).toMatchObject({ mode: 'disabled', adapter: null });
    expect(calendarAdapter()).toMatchObject({ mode: 'disabled', adapter: null });
    expect(invoiceAdapter()).toMatchObject({ mode: 'disabled', adapter: null });
  });

  it('does not activate a real adapter merely because a credential exists', () => {
    vi.stubEnv('OFFLINE_ASSEMBLY_PROOF', 'false');
    vi.stubEnv('RESEND_API_KEY', 're_present_but_not_approved');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'present-but-not-approved');
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_present_but_not_approved');
    vi.stubEnv('TRANSACTIONAL_RESEND_PROVIDER', '');
    vi.stubEnv('CALENDAR_PROVIDER', '');
    vi.stubEnv('STRIPE_INVOICE_PROVIDER', '');
    expect(transactionalEmailAdapter()).toMatchObject({ mode: 'disabled', adapter: null });
    expect(calendarAdapter()).toMatchObject({ mode: 'disabled', adapter: null });
    expect(invoiceAdapter()).toMatchObject({ mode: 'disabled', adapter: null });
  });

  it('rejects a live-mode Stripe key even when the invoice adapter is explicitly enabled', () => {
    vi.stubEnv('STRIPE_INVOICE_PROVIDER', 'live');
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_live_must_never_be_used_here');
    expect(invoiceAdapter()).toMatchObject({ mode: 'disabled', adapter: null });
  });
});
