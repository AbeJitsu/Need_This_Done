import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';

const { verifySignedDailyDeskWorkerRequest, isSignedWorkerFailure, getSupabaseAdmin } = vi.hoisted(() => ({
  verifySignedDailyDeskWorkerRequest: vi.fn(),
  isSignedWorkerFailure: vi.fn(),
  getSupabaseAdmin: vi.fn(),
}));

vi.mock('@/lib/private-worker-auth', () => ({ verifySignedDailyDeskWorkerRequest, isSignedWorkerFailure, consumeWorkerNonce: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ getSupabaseAdmin }));

import { POST } from '@/app/api/daily-desk/worker/route/route';

describe('Daily Desk signed-worker API boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const failure = NextResponse.json({ error: 'Invalid Daily Desk worker signature.' }, { status: 401 });
    verifySignedDailyDeskWorkerRequest.mockResolvedValue(failure);
    isSignedWorkerFailure.mockReturnValue(true);
  });

  it('rejects an unsigned internet request before it can read routing evidence or provider credentials', async () => {
    const response = await POST(new Request('https://app.example/api/daily-desk/worker/route', { method: 'POST', body: '{}' }));

    expect(response.status).toBe(401);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });
});
