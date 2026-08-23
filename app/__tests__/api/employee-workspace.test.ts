import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';

const { createSupabaseServerClient, verifyAdmin } = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  verifyAdmin: vi.fn(),
}));

vi.mock('@/lib/supabase-server', () => ({ createSupabaseServerClient }));
vi.mock('@/lib/api-auth', () => ({ verifyAdmin }));

import { GET } from '@/app/api/employee/workspace/route';

describe('employee workspace API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyAdmin.mockResolvedValue({ user: { id: 'operator-1' } });
  });

  it.each([401, 403])('returns %s before querying customer data', async (status) => {
    const from = vi.fn();
    verifyAdmin.mockResolvedValue({
      error: NextResponse.json({ error: status === 401 ? 'Unauthorized' : 'Forbidden' }, { status }),
    });
    createSupabaseServerClient.mockResolvedValue({ from });

    const response = await GET(new Request('http://localhost/api/employee/workspace'));
    expect(response.status).toBe(status);
    expect(from).not.toHaveBeenCalled();
  });

  it('returns a truthful empty state when no private customer exists', async () => {
    const order = vi.fn().mockResolvedValue({ data: [], error: null });
    const select = vi.fn(() => ({ order }));
    const from = vi.fn(() => ({ select }));
    createSupabaseServerClient.mockResolvedValue({ from });

    const response = await GET(new Request('http://localhost/api/employee/workspace'));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ workspace: null, reason: 'no_customer' });
    expect(from).toHaveBeenCalledWith('customer_accounts');
  });

  it('does not disguise a missing migration as an empty workspace', async () => {
    const order = vi.fn().mockResolvedValue({ data: null, error: { code: '42P01' } });
    const select = vi.fn(() => ({ order }));
    createSupabaseServerClient.mockResolvedValue({ from: vi.fn(() => ({ select })) });

    const response = await GET(new Request('http://localhost/api/employee/workspace'));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: 'Employee workspace is not configured yet.' });
  });

  it('returns 404 for an unknown operator-selected customer', async () => {
    const order = vi.fn().mockResolvedValue({
      data: [{ id: 'customer-1', name: 'Customer One' }], error: null,
    });
    const select = vi.fn(() => ({ order }));
    createSupabaseServerClient.mockResolvedValue({ from: vi.fn(() => ({ select })) });

    const response = await GET(new Request('http://localhost/api/employee/workspace?customerId=customer-3'));
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'Customer workspace not found.' });
  });
});
