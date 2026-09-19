import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/agent-bridge/workflow-scheduler/tick/route';

const { consumeNonce, getSupabaseAdmin, verifySigned } = vi.hoisted(() => ({
  consumeNonce: vi.fn(),
  getSupabaseAdmin: vi.fn(),
  verifySigned: vi.fn(),
}));

vi.mock('@/lib/agent-bridge-auth', () => ({
  consumeAgentBridgeNonce: consumeNonce,
  isSignedAgentBridgeFailure: (value: unknown) => value instanceof Response,
  verifySignedAgentBridgeRequest: verifySigned,
}));
vi.mock('@/lib/supabase', () => ({ getSupabaseAdmin }));

describe('signed workflow scheduler tick route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifySigned.mockResolvedValue({
      body: JSON.stringify({ ownerId: '00000000-0000-4000-8000-000000000001', workerId: 'mac-mini-workflow', limit: 10 }),
      nonce: 'scheduler-nonce',
    });
    consumeNonce.mockResolvedValue(null);
  });

  it('materializes only approval-required runs through the durable RPC', async () => {
    const rpc = vi.fn(async () => ({ data: [{
      schedule_run_id: '00000000-0000-4000-8000-000000000010',
      schedule_id: '00000000-0000-4000-8000-000000000011',
      scheduled_for: '2026-09-18T09:00:00.000Z',
    }], error: null }));
    getSupabaseAdmin.mockReturnValue({ rpc });

    const response = await POST(new Request('http://localhost/api/agent-bridge/workflow-scheduler/tick', { method: 'POST' }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith('materialize_due_hermes_schedule_runs', {
      target_owner_id: '00000000-0000-4000-8000-000000000001', target_limit: 10,
    });
    expect(body).toMatchObject({ materialized: 1, runs: [{ status: 'awaiting_approval' }] });
    expect(JSON.stringify(body)).not.toContain('openclaw');
  });

  it('rejects invalid bodies before consuming the nonce', async () => {
    verifySigned.mockResolvedValue({ body: JSON.stringify({ workerId: 'mac-mini-workflow' }), nonce: 'bad-nonce' });
    const response = await POST(new Request('http://localhost/api/agent-bridge/workflow-scheduler/tick', { method: 'POST' }));
    expect(response.status).toBe(400);
    expect(consumeNonce).not.toHaveBeenCalled();
  });
});
