import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getSupabaseAdmin, recordProspectingWebhookEvent, sha256, verifyResendWebhook } = vi.hoisted(() => ({
  getSupabaseAdmin: vi.fn(),
  recordProspectingWebhookEvent: vi.fn(),
  sha256: vi.fn(() => 'b'.repeat(64)),
  verifyResendWebhook: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({ getSupabaseAdmin }));
vi.mock('@/lib/prospecting-webhook-service', () => ({ recordProspectingWebhookEvent }));
vi.mock('@/lib/provider-adapters', () => ({ sha256, verifyResendWebhook }));

import { POST } from '@/app/api/webhooks/resend/prospecting/route';

const headers = {
  'svix-id': 'prospecting-event-1',
  'svix-timestamp': '1787460000',
  'svix-signature': 'v1,test-signature',
};

function request(body: string) {
  return new Request('http://localhost/api/webhooks/resend/prospecting', { method: 'POST', headers, body });
}

function adminWith(options: { duplicate?: boolean; completeError?: boolean } = {}) {
  const rpc = vi.fn(async (name: string) => {
    if (name === 'record_provider_webhook_receipt') {
      return { data: { receipt: { id: 'receipt-1' }, duplicate: options.duplicate || false }, error: null };
    }
    if (name === 'complete_provider_webhook_receipt') {
      return options.completeError ? { data: null, error: { message: 'complete failed' } } : { data: {}, error: null };
    }
    if (name === 'fail_provider_webhook_receipt') return { data: {}, error: null };
    throw new Error(`Unexpected RPC ${name}`);
  });
  getSupabaseAdmin.mockReturnValue({ rpc });
  return rpc;
}

describe('prospecting Resend webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv('PROSPECTING_RESEND_WEBHOOK_SECRET', 'whsec_prospecting');
  });

  it('rejects an invalid signature before any database access', async () => {
    verifyResendWebhook.mockReturnValue(false);
    const response = await POST(request('{"type":"email.bounced"}'));
    expect(response.status).toBe(401);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it('persists a signed sender event through the isolated service lane', async () => {
    verifyResendWebhook.mockReturnValue(true);
    recordProspectingWebhookEvent.mockResolvedValue({ duplicate: false });
    adminWith();
    const body = JSON.stringify({
      type: 'email.bounced',
      data: { email_id: 'prospecting-message-1', to: ['suppressed@example.test'] },
    });
    const response = await POST(request(body));
    expect(response.status).toBe(201);
    expect(verifyResendWebhook).toHaveBeenCalledWith(body, expect.any(Headers), 'whsec_prospecting');
    expect(recordProspectingWebhookEvent).toHaveBeenCalledWith(expect.objectContaining({
      providerEventId: 'prospecting-event-1',
      eventType: 'bounced',
      providerMessageId: 'prospecting-message-1',
      address: 'suppressed@example.test',
      payloadSha256: 'b'.repeat(64),
    }));
  });

  it('marks receipt persistence retryable when domain recording fails', async () => {
    verifyResendWebhook.mockReturnValue(true);
    recordProspectingWebhookEvent.mockRejectedValue(new Error('database unavailable'));
    const rpc = adminWith();
    const response = await POST(request('{"type":"email.delivered","data":{"email_id":"message-1"}}'));
    expect(response.status).toBe(503);
    expect(rpc).toHaveBeenCalledWith('fail_provider_webhook_receipt', {
      target_receipt_id: 'receipt-1',
      target_failure_reason: 'Prospecting event persistence did not complete.',
      target_permanent: false,
    });
  });

  it('does not replay a terminal duplicate receipt', async () => {
    verifyResendWebhook.mockReturnValue(true);
    adminWith({ duplicate: true });
    const response = await POST(request('{"type":"email.bounced"}'));
    expect(response.status).toBe(200);
    expect(recordProspectingWebhookEvent).not.toHaveBeenCalled();
  });
});
