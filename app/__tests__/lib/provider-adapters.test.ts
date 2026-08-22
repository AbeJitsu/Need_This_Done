import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { calendarAdapter, invoiceAdapter, sha256, transactionalEmailAdapter, verifyResendWebhook } from '@/lib/provider-adapters';

afterEach(() => vi.unstubAllEnvs());

describe('local provider adapter boundary', () => {
  it('requires complete native Svix headers and retains only a payload hash', () => {
    const body = '{"event":"test"}';
    expect(verifyResendWebhook(body, new Headers(), 'whsec_test')).toBe(false);
    expect(sha256(body)).toMatch(/^[a-f0-9]{64}$/);
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
});
