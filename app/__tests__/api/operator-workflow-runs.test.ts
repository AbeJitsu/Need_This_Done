import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';

const { getSupabaseAdmin, verifyAdmin } = vi.hoisted(() => ({
  getSupabaseAdmin: vi.fn(),
  verifyAdmin: vi.fn(),
}));

vi.mock('@/lib/api-auth', () => ({ verifyAdmin }));
vi.mock('@/lib/supabase', () => ({ getSupabaseAdmin }));

import { GET, PATCH } from '@/app/api/admin/workflow-runs/route';

const admin = { user: { id: '11111111-1111-1111-1111-111111111111' } };

function jsonRequest(body: unknown) {
  return new Request('http://localhost/api/admin/workflow-runs', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('operator workflow-runs API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyAdmin.mockResolvedValue(admin);
  });

  it('does not query the queue when the operator check fails', async () => {
    verifyAdmin.mockResolvedValue({
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    });

    const response = await GET();

    expect(response.status).toBe(403);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it('returns site-audit workflow records with their source reports', async () => {
    const order = vi.fn().mockResolvedValue({
      data: [{
        id: 'run-1',
        workflow_type: 'site_audit',
        status: 'pending_review',
        source_id: 'report-1',
        input: {},
        outcome: null,
        created_at: '2026-07-25T12:00:00.000Z',
        decided_at: null,
      }],
      error: null,
    });
    const workflowEq = vi.fn(() => ({ order }));
    const workflowSelect = vi.fn(() => ({ eq: workflowEq }));
    const reportIn = vi.fn().mockResolvedValue({
      data: [{
        id: 'report-1',
        url: 'https://example.com',
        score: 82,
        grade: 'B',
        executive_summary: 'Solid foundation with fixes available.',
      }],
      error: null,
    });
    const reportSelect = vi.fn(() => ({ in: reportIn }));
    const from = vi.fn((table: string) => {
      if (table === 'workflow_runs') return { select: workflowSelect };
      return { select: reportSelect };
    });
    getSupabaseAdmin.mockReturnValue({ from });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      runs: [expect.objectContaining({
        id: 'run-1',
        report: expect.objectContaining({ id: 'report-1', score: 82 }),
      })],
    });
    expect(workflowEq).toHaveBeenCalledWith('workflow_type', 'site_audit');
    expect(reportIn).toHaveBeenCalledWith('id', ['report-1']);
  });

  it('records an approved decision only while the workflow is pending', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'run-1',
        status: 'approved',
        decided_at: '2026-07-25T12:00:00.000Z',
        outcome: { decision_note: 'Review before contacting.' },
      },
      error: null,
    });
    const select = vi.fn(() => ({ maybeSingle }));
    const pendingEq = vi.fn(() => ({ select }));
    const idEq = vi.fn(() => ({ eq: pendingEq }));
    const update = vi.fn(() => ({ eq: idEq }));
    getSupabaseAdmin.mockReturnValue({ from: vi.fn(() => ({ update })) });

    const response = await PATCH(jsonRequest({
      id: 'run-1',
      status: 'approved',
      note: 'Review before contacting.',
    }) as never);

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      status: 'approved',
      decided_by: admin.user.id,
      outcome: { decision_note: 'Review before contacting.' },
    }));
    expect(idEq).toHaveBeenCalledWith('id', 'run-1');
    expect(pendingEq).toHaveBeenCalledWith('status', 'pending_review');
  });

  it('does not overwrite an already-decided workflow record', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const select = vi.fn(() => ({ maybeSingle }));
    const pendingEq = vi.fn(() => ({ select }));
    const idEq = vi.fn(() => ({ eq: pendingEq }));
    const update = vi.fn(() => ({ eq: idEq }));
    getSupabaseAdmin.mockReturnValue({ from: vi.fn(() => ({ update })) });

    const response = await PATCH(jsonRequest({ id: 'run-1', status: 'rejected' }) as never);

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ error: 'This item was already decided.' });
  });
});
