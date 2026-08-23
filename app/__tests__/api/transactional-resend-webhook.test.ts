import { beforeEach, describe, expect, it, vi } from 'vitest';

const { forwardInboundEmail, getSupabaseAdmin, sha256, verifyResendWebhook } = vi.hoisted(() => ({
  forwardInboundEmail: vi.fn(),
  getSupabaseAdmin: vi.fn(),
  sha256: vi.fn(() => 'a'.repeat(64)),
  verifyResendWebhook: vi.fn(),
}));

vi.mock('@/lib/inbound-email-forwarding', () => ({ forwardInboundEmail }));
vi.mock('@/lib/supabase', () => ({ getSupabaseAdmin }));
vi.mock('@/lib/provider-adapters', () => ({ sha256, verifyResendWebhook }));

import { POST } from '@/app/api/webhooks/resend/transactional/route';

const headers = {
  'svix-id': 'event-transactional-1',
  'svix-timestamp': '1787460000',
  'svix-signature': 'v1,test-signature',
};

function request(body: string) {
  return new Request('http://localhost/api/webhooks/resend/transactional', {
    method: 'POST', headers, body,
  });
}

function adminWith(overrides: { eventError?: boolean; duplicate?: boolean } = {}) {
  const rpc = vi.fn(async (name: string) => {
    if (name === 'record_provider_webhook_receipt') {
      return { data: { receipt: { id: 'receipt-1' }, duplicate: overrides.duplicate || false }, error: null };
    }
    if (name === 'record_resend_transactional_event') {
      return overrides.eventError ? { data: null, error: { message: 'write failed' } } : { data: { id: 'event-1' }, error: null };
    }
    if (name === 'fail_provider_webhook_receipt') return { data: { id: 'receipt-1', status: 'failed_retryable' }, error: null };
    throw new Error(`Unexpected RPC ${name}`);
  });
  getSupabaseAdmin.mockReturnValue({ rpc });
  return rpc;
}

describe('transactional Resend webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv('TRANSACTIONAL_RESEND_WEBHOOK_SECRET', 'whsec_transactional');
  });

  it('verifies the unchanged raw body with the transactional secret', async () => {
    const body = '{ "type": "email.delivered", "data": { "email_id": "email-1" } }';
    verifyResendWebhook.mockReturnValue(true);
    adminWith();
    const response = await POST(request(body));
    expect(response.status).toBe(201);
    expect(verifyResendWebhook).toHaveBeenCalledWith(body, expect.any(Headers), 'whsec_transactional');
    expect(sha256).toHaveBeenCalledWith(body);
  });

  it('rejects an invalid signature before database access', async () => {
    verifyResendWebhook.mockReturnValue(false);
    const response = await POST(request('{"type":"email.delivered"}'));
    expect(response.status).toBe(401);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it('forwards inbound mail through the same receipt and operation lane', async () => {
    verifyResendWebhook.mockReturnValue(true);
    forwardInboundEmail.mockResolvedValue('forwarded-message-1');
    adminWith();
    const body = JSON.stringify({
      type: 'email.received',
      data: { email_id: 'inbound-email-1', from: 'sender@example.test', subject: 'Hello' },
    });
    const response = await POST(request(body));
    expect(response.status).toBe(201);
    expect(forwardInboundEmail).toHaveBeenCalledWith(expect.objectContaining({ type: 'email.received' }),
      'inbound-email:inbound-email-1:forward');
  });

  it('leaves a failed event persistence receipt retryable', async () => {
    verifyResendWebhook.mockReturnValue(true);
    const rpc = adminWith({ eventError: true });
    const response = await POST(request('{"type":"email.delivered","data":{"email_id":"email-1"}}'));
    expect(response.status).toBe(503);
    expect(rpc).toHaveBeenCalledWith('fail_provider_webhook_receipt', {
      target_receipt_id: 'receipt-1',
      target_failure_reason: 'Transactional event persistence did not complete.',
      target_permanent: false,
    });
  });

  it('does not repeat a completed duplicate receipt', async () => {
    verifyResendWebhook.mockReturnValue(true);
    const rpc = adminWith({ duplicate: true });
    const response = await POST(request('{"type":"email.received","data":{"email_id":"inbound-1"}}'));
    expect(response.status).toBe(200);
    expect(forwardInboundEmail).not.toHaveBeenCalled();
    expect(rpc).toHaveBeenCalledTimes(1);
  });
});
