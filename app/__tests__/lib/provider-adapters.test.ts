import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { calendarAdapter, invoiceAdapter, sha256, transactionalEmailAdapter, verifyWebhookSecret } from '@/lib/provider-adapters';

afterEach(() => vi.unstubAllEnvs());

describe('local provider adapter boundary', () => {
  it('verifies a matching raw-body signature without accepting mismatches', () => {
    const body = '{"event":"test"}';
    const signature = createHash('sha256').update(`secret.${body}`).digest('hex');
    expect(verifyWebhookSecret(body, signature, 'secret')).toBe(true);
    expect(verifyWebhookSecret(body, signature, 'other-secret')).toBe(false);
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
});
