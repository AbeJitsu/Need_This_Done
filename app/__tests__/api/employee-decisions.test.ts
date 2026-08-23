import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';

const { createSupabaseServerClient, verifyAdmin } = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  verifyAdmin: vi.fn(),
}));

vi.mock('@/lib/supabase-server', () => ({ createSupabaseServerClient }));
vi.mock('@/lib/api-auth', () => ({ verifyAdmin }));

import { POST } from '@/app/api/employee/work-items/[id]/decision/route';

const itemId = '11111111-1111-4111-8111-111111111111';
const userId = '22222222-2222-4222-8222-222222222222';
const key = '33333333-3333-4333-8333-333333333333';

function request(body: unknown) {
  return new Request(`http://localhost/api/employee/work-items/${itemId}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('employee decision API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyAdmin.mockResolvedValue({ user: { id: userId } });
  });

  it('requires an authenticated operator', async () => {
    const rpc = vi.fn();
    verifyAdmin.mockResolvedValue({
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    });
    createSupabaseServerClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      rpc,
    });

    const response = await POST(request({ decision: 'approve', idempotencyKey: key }), { params: { id: itemId } });
    expect(response.status).toBe(401);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('records the decision through the atomic database function', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: { id: 'decision-1', decision: 'revise', duplicate: false },
      error: null,
    });
    createSupabaseServerClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: userId } } }) },
      rpc,
    });

    const response = await POST(request({
      decision: 'revise',
      instructions: 'Make the opening more direct.',
      idempotencyKey: key,
    }), { params: { id: itemId } });

    expect(response.status).toBe(201);
    expect(rpc).toHaveBeenCalledWith('record_ai_employee_decision', {
      target_work_item_id: itemId,
      target_decision: 'revise',
      target_instructions: 'Make the opening more direct.',
      target_idempotency_key: key,
      target_defer_date: null,
    });
  });

  it('returns an idempotent replay without creating another decision', async () => {
    createSupabaseServerClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: userId } } }) },
      rpc: vi.fn().mockResolvedValue({
        data: { id: 'decision-1', decision: 'approve', duplicate: true },
        error: null,
      }),
    });

    const response = await POST(request({ decision: 'approve', idempotencyKey: key }), { params: { id: itemId } });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ duplicate: true });
  });

  it('reports a conflicting or concurrent decision clearly', async () => {
    createSupabaseServerClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: userId } } }) },
      rpc: vi.fn().mockResolvedValue({ data: null, error: { code: '23505' } }),
    });

    const response = await POST(request({ decision: 'reject', idempotencyKey: key }), { params: { id: itemId } });
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ error: 'The idempotency key or work item conflicts with an existing decision.' });
  });

  it('requires a future date for deferral', async () => {
    const response = await POST(request({ decision: 'defer', idempotencyKey: key }), { params: { id: itemId } });
    expect(response.status).toBe(400);
    expect(createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it('distinguishes authorization and missing-function failures', async () => {
    const rpc = vi.fn()
      .mockResolvedValueOnce({ data: null, error: { code: '42501' } })
      .mockResolvedValueOnce({ data: null, error: { code: '42883' } });
    createSupabaseServerClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: userId } } }) },
      rpc,
    });

    const forbidden = await POST(request({ decision: 'approve', idempotencyKey: key }), { params: { id: itemId } });
    expect(forbidden.status).toBe(403);
    const missing = await POST(request({ decision: 'approve', idempotencyKey: key }), { params: { id: itemId } });
    expect(missing.status).toBe(503);
  });
});
