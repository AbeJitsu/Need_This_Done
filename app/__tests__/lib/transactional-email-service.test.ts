import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getSupabaseAdmin, transactionalEmailAdapter } = vi.hoisted(() => ({
  getSupabaseAdmin: vi.fn(),
  transactionalEmailAdapter: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@/lib/supabase', () => ({ getSupabaseAdmin }));
vi.mock('@/lib/provider-adapters', () => ({ transactionalEmailAdapter }));

import {
  sendDurableGithubHandoffEmail,
  sendDurableTransactionalEmail,
} from '@/lib/transactional-email-service';

function operationLookup(data: unknown) {
  const maybeSingle = vi.fn().mockResolvedValue({ data, error: null });
  const secondEq = vi.fn(() => ({ maybeSingle }));
  const firstEq = vi.fn(() => ({ eq: secondEq }));
  const select = vi.fn(() => ({ eq: firstEq }));
  return { select };
}

describe('durable transactional email service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv('RESEND_FROM_EMAIL', 'sender@example.test');
  });

  it('requires the caller to create the logical operation key', async () => {
    await expect(sendDurableTransactionalEmail({
      to: 'recipient@example.test',
      subject: 'Required operation key',
      text: 'Body',
      domainReference: 'project:project-1:confirmation',
    } as never)).rejects.toThrow('Transactional email operation key is required.');
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it('uses the exact caller key and persists only safe request metadata', async () => {
    const send = vi.fn().mockResolvedValue({ providerMessageId: 'resend-message-1' });
    const rpc = vi.fn(async (name: string, args: Record<string, unknown>) => {
      if (name === 'upsert_provider_operation') return { data: { id: 'operation-1', status: args.target_status }, error: null };
      if (name === 'accept_resend_transactional_operation') return { data: { id: 'message-1' }, error: null };
      throw new Error(`Unexpected RPC ${name}`);
    });
    getSupabaseAdmin.mockReturnValue({ from: vi.fn(() => operationLookup(null)), rpc });
    transactionalEmailAdapter.mockReturnValue({ mode: 'fake', adapter: { send } });

    await expect(sendDurableTransactionalEmail({
      to: 'recipient@example.test',
      subject: 'Safe subject',
      text: 'Private body must not be persisted.',
      html: '<p>Private body must not be persisted.</p>',
      operationKey: 'project:project-1:confirmation',
      domainReference: 'project:project-1:confirmation',
      projectId: 'project-1',
    })).resolves.toBe('resend-message-1');

    expect(send).toHaveBeenCalledWith(expect.objectContaining({
      idempotencyKey: 'project:project-1:confirmation',
      to: 'recipient@example.test',
    }));
    const create = rpc.mock.calls.find(([name]) => name === 'upsert_provider_operation');
    expect(create?.[1]).toMatchObject({
      target_provider: 'resend_transactional',
      target_operation_type: 'send_email',
      target_idempotency_key: 'project:project-1:confirmation',
      target_request_metadata: {
        domain_reference: 'project:project-1:confirmation',
        recipient_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
        subject: 'Safe subject',
      },
    });
    expect(JSON.stringify(create?.[1])).not.toContain('recipient@example.test');
    expect(JSON.stringify(create?.[1])).not.toContain('Private body');
  });

  it('records disabled mode durably without contacting a provider', async () => {
    const rpc = vi.fn(async (name: string, args: Record<string, unknown>) => {
      if (name === 'upsert_provider_operation') return { data: { id: 'operation-disabled', status: args.target_status }, error: null };
      throw new Error(`Unexpected RPC ${name}`);
    });
    getSupabaseAdmin.mockReturnValue({ from: vi.fn(() => operationLookup(null)), rpc });
    transactionalEmailAdapter.mockReturnValue({ mode: 'disabled', adapter: null });

    await expect(sendDurableTransactionalEmail({
      to: 'recipient@example.test', subject: 'Disabled', text: 'Body',
      operationKey: 'disabled-operation', domainReference: 'disabled-operation',
    })).resolves.toBeNull();
    expect(rpc).toHaveBeenLastCalledWith('upsert_provider_operation', expect.objectContaining({
      target_idempotency_key: 'disabled-operation',
      target_status: 'failed_retryable',
      target_error: 'Transactional Resend provider is disabled.',
    }));
  });

  it('marks acceptance unknown when Resend accepts before the database transition fails', async () => {
    const send = vi.fn().mockResolvedValue({ providerMessageId: 'resend-accepted-before-db-failure' });
    const rpc = vi.fn(async (name: string, args: Record<string, unknown>) => {
      if (name === 'upsert_provider_operation') return { data: { id: 'operation-unknown', status: args.target_status }, error: null };
      if (name === 'accept_resend_transactional_operation') return { data: null, error: { message: 'database unavailable' } };
      if (name === 'mark_resend_acceptance_unknown') return { data: { id: 'operation-unknown', status: 'acceptance_unknown' }, error: null };
      throw new Error(`Unexpected RPC ${name}`);
    });
    getSupabaseAdmin.mockReturnValue({ from: vi.fn(() => operationLookup(null)), rpc });
    transactionalEmailAdapter.mockReturnValue({ mode: 'fake', adapter: { send } });

    await expect(sendDurableTransactionalEmail({
      to: 'recipient@example.test', subject: 'Unknown acceptance', text: 'Body',
      operationKey: 'unknown-operation', domainReference: 'unknown-operation',
    })).rejects.toThrow('durable reconciliation is required');
    expect(rpc).toHaveBeenCalledWith('mark_resend_acceptance_unknown', expect.objectContaining({
      target_operation_id: 'operation-unknown',
    }));
    expect(rpc.mock.calls.filter(([name]) => name === 'upsert_provider_operation')).toHaveLength(1);
  });

  it('reuses the handoff operation and commits its acceptance with the handoff', async () => {
    const send = vi.fn().mockResolvedValue({ providerMessageId: 'resend-handoff-1' });
    const rpc = vi.fn(async (name: string) => {
      if (name === 'assert_provider_operation_retryable') return { data: { retryable: true }, error: null };
      if (name === 'upsert_provider_operation') return { data: { id: 'handoff-operation-1', status: 'pending' }, error: null };
      if (name === 'accept_github_handoff_operation') return { data: { id: 'handoff-1', notification_status: 'sent' }, error: null };
      throw new Error(`Unexpected RPC ${name}`);
    });
    getSupabaseAdmin.mockReturnValue({ rpc });
    transactionalEmailAdapter.mockReturnValue({ mode: 'fake', adapter: { send } });

    const result = await sendDurableGithubHandoffEmail({
      to: 'recipient@example.test',
      subject: 'Your GitHub handoff is ready',
      text: 'Handoff body',
      operationKey: 'handoff-key-1',
      operationId: 'handoff-operation-1',
      handoffId: 'handoff-1',
      projectId: 'project-1',
    });
    expect(result).toMatchObject({
      providerMessageId: 'resend-handoff-1',
      handoff: { id: 'handoff-1', notification_status: 'sent' },
    });
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ idempotencyKey: 'handoff-key-1' }));
    expect(rpc).toHaveBeenCalledWith('accept_github_handoff_operation', expect.objectContaining({
      target_operation_id: 'handoff-operation-1',
      target_handoff_id: 'handoff-1',
    }));
  });
});
