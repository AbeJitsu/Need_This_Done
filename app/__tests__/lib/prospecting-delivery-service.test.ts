import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createProspectingSender, getSupabaseAdmin } = vi.hoisted(() => ({
  createProspectingSender: vi.fn(),
  getSupabaseAdmin: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@/lib/prospecting-sender', () => ({ createProspectingSender }));
vi.mock('@/lib/supabase', () => ({ getSupabaseAdmin }));

import { sendApprovedProspectingMessage } from '@/lib/prospecting-delivery-service';

const message = {
  id: 'message-1',
  profileId: 'profile-1',
  prospectId: 'prospect-1',
  senderName: 'Operator',
  senderEmail: 'operator@example.test',
  recipientEmail: 'prospect@example.test',
  subject: 'One useful idea',
  body: 'Reviewed body',
  idempotencyKey: 'original-message-key',
  operationId: 'operation-1',
};

function adminWith(options: { acceptError?: boolean; retryable?: boolean } = {}) {
  const rpc = vi.fn(async (name: string, args: Record<string, unknown>) => {
    if (name === 'assert_provider_operation_retryable') {
      return { data: { retryable: options.retryable ?? true }, error: null };
    }
    if (name === 'upsert_provider_operation') {
      return { data: { id: 'operation-1', status: args.target_status }, error: null };
    }
    if (name === 'accept_resend_prospecting_operation') {
      return options.acceptError
        ? { data: null, error: { message: 'database unavailable' } }
        : { data: { id: 'message-1', approval_status: 'sent', provider_message_id: 'resend-prospecting-1' }, error: null };
    }
    if (name === 'mark_resend_acceptance_unknown') {
      return { data: { id: 'operation-1', status: 'acceptance_unknown' }, error: null };
    }
    throw new Error(`Unexpected RPC ${name}`);
  });
  getSupabaseAdmin.mockReturnValue({ rpc });
  return rpc;
}

describe('durable prospecting delivery service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reuses the original message key and atomically accepts the outreach transition', async () => {
    const send = vi.fn().mockResolvedValue({ providerMessageId: 'resend-prospecting-1' });
    createProspectingSender.mockReturnValue({ prepare: vi.fn(async (input) => input), send });
    const rpc = adminWith();

    const result = await sendApprovedProspectingMessage(message);

    expect(result).toMatchObject({ approval_status: 'sent', provider_message_id: 'resend-prospecting-1' });
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ idempotencyKey: 'original-message-key' }));
    expect(rpc).toHaveBeenCalledWith('upsert_provider_operation', {
      target_provider: 'resend_prospecting',
      target_operation_type: 'send_outreach_message',
      target_idempotency_key: 'original-message-key',
      target_status: 'pending',
      target_request_metadata: {
        message_id: 'message-1',
        profile_id: 'profile-1',
        prospect_id: 'prospect-1',
      },
    });
    expect(rpc).toHaveBeenCalledWith('accept_resend_prospecting_operation', {
      target_operation_id: 'operation-1',
      target_message_id: 'message-1',
      target_provider_message_id: 'resend-prospecting-1',
    });
  });

  it('records disabled and fake/provider failures as retryable with the same key', async () => {
    createProspectingSender.mockReturnValue(null);
    const disabledRpc = adminWith();
    await expect(sendApprovedProspectingMessage(message)).resolves.toBeNull();
    expect(disabledRpc).toHaveBeenLastCalledWith('upsert_provider_operation', expect.objectContaining({
      target_idempotency_key: 'original-message-key',
      target_status: 'failed_retryable',
    }));

    const failure = new Error('deterministic fake failure');
    createProspectingSender.mockReturnValue({
      prepare: vi.fn(async (input) => input),
      send: vi.fn().mockRejectedValue(failure),
    });
    const failedRpc = adminWith();
    await expect(sendApprovedProspectingMessage(message)).rejects.toThrow('deterministic fake failure');
    expect(failedRpc).toHaveBeenLastCalledWith('upsert_provider_operation', expect.objectContaining({
      target_idempotency_key: 'original-message-key',
      target_status: 'failed_retryable',
      target_error: 'deterministic fake failure',
    }));
  });

  it('marks acceptance unknown instead of retrying after provider/database disagreement', async () => {
    createProspectingSender.mockReturnValue({
      prepare: vi.fn(async (input) => input),
      send: vi.fn().mockResolvedValue({ providerMessageId: 'resend-prospecting-1' }),
    });
    const rpc = adminWith({ acceptError: true });

    await expect(sendApprovedProspectingMessage(message)).rejects.toThrow('reconciliation is required');
    expect(rpc).toHaveBeenCalledWith('mark_resend_acceptance_unknown', expect.objectContaining({
      target_operation_id: 'operation-1',
    }));
  });

  it('fails closed when the stored operation is not retryable', async () => {
    createProspectingSender.mockReturnValue({ prepare: vi.fn(), send: vi.fn() });
    adminWith({ retryable: false });
    await expect(sendApprovedProspectingMessage(message)).rejects.toThrow('requires reconciliation');
  });
});
