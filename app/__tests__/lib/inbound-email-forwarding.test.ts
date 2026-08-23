import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getEmailConfig, sendDurableTransactionalEmail } = vi.hoisted(() => ({
  getEmailConfig: vi.fn(() => ({ adminEmail: 'operator@example.test' })),
  sendDurableTransactionalEmail: vi.fn().mockResolvedValue('forwarded-message-1'),
}));

vi.mock('server-only', () => ({}));
vi.mock('@/lib/email', () => ({ getEmailConfig }));
vi.mock('@/lib/transactional-email-service', () => ({ sendDurableTransactionalEmail }));

import { forwardInboundEmail } from '@/lib/inbound-email-forwarding';

const event = {
  type: 'email.received' as const,
  data: {
    email_id: 'received-1',
    from: 'sender@example.test',
    to: ['hello@example.test'],
    subject: 'A private inbound message',
  },
};

describe('inbound transactional forwarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('does not contact Resend in fake mode even when a credential is present', async () => {
    vi.stubEnv('TRANSACTIONAL_RESEND_PROVIDER', 'fake');
    vi.stubEnv('RESEND_API_KEY', 're_present_but_not_live');
    const providerFetch = vi.fn();
    vi.stubGlobal('fetch', providerFetch);

    await forwardInboundEmail(event, 'inbound-email:received-1:forward');

    expect(providerFetch).not.toHaveBeenCalled();
    expect(sendDurableTransactionalEmail).toHaveBeenCalledWith(expect.objectContaining({
      operationKey: 'inbound-email:received-1:forward',
      domainReference: 'inbound-email:received-1:forward',
      to: 'operator@example.test',
    }));
  });

  it('fetches the verified inbound content only in explicit live mode', async () => {
    vi.stubEnv('TRANSACTIONAL_RESEND_PROVIDER', 'live');
    vi.stubEnv('RESEND_API_KEY', 're_explicit_live');
    const providerFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ text: 'Private body from the provider.' }),
    });
    vi.stubGlobal('fetch', providerFetch);

    await forwardInboundEmail(event, 'inbound-email:received-1:forward');

    expect(providerFetch).toHaveBeenCalledOnce();
    expect(sendDurableTransactionalEmail).toHaveBeenCalledWith(expect.objectContaining({
      text: expect.stringContaining('Private body from the provider.'),
    }));
  });
});
