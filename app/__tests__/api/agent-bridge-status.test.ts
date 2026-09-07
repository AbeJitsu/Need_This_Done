import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/agent-bridge/status/route';

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

function query(data: unknown, error: unknown = null) {
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    maybeSingle: vi.fn(async () => ({ data, error })),
  };
  return chain;
}

describe('signed Mac worker status route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifySigned.mockResolvedValue({
      body: JSON.stringify({
        ownerId: '00000000-0000-4000-8000-000000000001',
        workerId: 'macbook-pro-hermes-rehearsal',
      }),
      nonce: 'status-nonce',
    });
    consumeNonce.mockResolvedValue(null);
  });

  it('returns only durable heartbeat and current-task status', async () => {
    const heartbeat = {
      worker_id: 'macbook-pro-hermes-rehearsal',
      owner_id: '00000000-0000-4000-8000-000000000001',
      status: 'online',
      version: 'bridge',
      capabilities: ['research_public_web'],
      last_seen_at: '2026-09-07T00:00:00.000Z',
      last_error: null,
      active_task_id: '00000000-0000-4000-8000-000000000002',
      updated_at: '2026-09-07T00:00:00.000Z',
    };
    const task = {
      id: heartbeat.active_task_id,
      run_id: '00000000-0000-4000-8000-000000000003',
      task_key: 'researcher',
      agent_role: 'public_web_researcher',
      agent_provider: 'openclaw',
      model_id: 'openai/gpt-5.6-luna',
      task_type: 'research_public_web',
      status: 'running',
      progress: 40,
      last_error: null,
      started_at: '2026-09-07T00:00:00.000Z',
      completed_at: null,
      updated_at: '2026-09-07T00:01:00.000Z',
      lease_expires_at: '2026-09-07T00:05:00.000Z',
      input: { secret: 'must-not-be-returned' },
    };
    const heartbeatQuery = query(heartbeat);
    const safeTask = Object.fromEntries(Object.entries(task).filter(([key]) => key !== 'input'));
    const taskQuery = query(safeTask);
    getSupabaseAdmin.mockReturnValue({
      from: vi.fn((table: string) => table === 'worker_heartbeats' ? heartbeatQuery : taskQuery),
    });

    const response = await POST(new Request('http://localhost/api/agent-bridge/status', { method: 'POST' }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.workerId).toBe('macbook-pro-hermes-rehearsal');
    expect(body.heartbeat).toEqual(heartbeat);
    expect(body.currentTask).toEqual(safeTask);
    expect(JSON.stringify(body)).not.toContain('must-not-be-returned');
    expect(consumeNonce).toHaveBeenCalledWith('status-nonce');
  });

  it('returns a not-seen worker without attempting to read a task', async () => {
    const heartbeatQuery = query(null);
    const from = vi.fn(() => heartbeatQuery);
    getSupabaseAdmin.mockReturnValue({ from });

    const response = await POST(new Request('http://localhost/api/agent-bridge/status', { method: 'POST' }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.heartbeat).toBeNull();
    expect(body.currentTask).toBeNull();
    expect(from).toHaveBeenCalledTimes(1);
  });

  it('validates the signed request body before consuming its nonce', async () => {
    verifySigned.mockResolvedValue({ body: JSON.stringify({ workerId: 'missing-owner' }), nonce: 'bad-nonce' });

    const response = await POST(new Request('http://localhost/api/agent-bridge/status', { method: 'POST' }));

    expect(response.status).toBe(400);
    expect(consumeNonce).not.toHaveBeenCalled();
  });
});
