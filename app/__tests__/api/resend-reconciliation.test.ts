import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';

const { verifyAdmin, getSupabaseAdmin, transactionalEmailAdapter } = vi.hoisted(() => ({
  verifyAdmin: vi.fn(),
  getSupabaseAdmin: vi.fn(),
  transactionalEmailAdapter: vi.fn(),
}));

vi.mock('@/lib/api-auth', () => ({ verifyAdmin }));
vi.mock('@/lib/supabase', () => ({ getSupabaseAdmin }));
vi.mock('@/lib/provider-adapters', () => ({ transactionalEmailAdapter }));

import { POST } from '@/app/api/admin/resend/reconciliation/route';

describe('operator Resend reconciliation route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyAdmin.mockResolvedValue({ user: { id: 'operator-1' } });
  });

  it.each([401, 403])('returns %s before reading provider state', async (status) => {
    verifyAdmin.mockResolvedValue({
      error: NextResponse.json({ error: status === 401 ? 'Unauthorized' : 'Forbidden' }, { status }),
    });
    const response = await POST(new Request('http://localhost', { method: 'POST', body: '{}' }));
    expect(response.status).toBe(status);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it('records confirmed non-acceptance without constructing or calling a provider', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: { id: 'operation-1', status: 'failed_retryable' }, error: null });
    getSupabaseAdmin.mockReturnValue({ rpc });
    const response = await POST(new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operationId: '00000000-0000-4000-8000-000000000106', resolution: 'confirmed_not_accepted' }),
    }));
    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith('reconcile_resend_provider_operation', {
      target_operation_id: '00000000-0000-4000-8000-000000000106',
      target_resolution: 'confirmed_not_accepted',
      target_provider_message_id: null,
    });
    expect(transactionalEmailAdapter).not.toHaveBeenCalled();
  });

  it('requires a provider message ID only for confirmed acceptance', async () => {
    const response = await POST(new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operationId: '00000000-0000-4000-8000-000000000106', resolution: 'confirmed_accepted' }),
    }));
    expect(response.status).toBe(400);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });
});
