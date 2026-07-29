import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createSupabaseServerClient } = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock('@/lib/supabase-server', () => ({ createSupabaseServerClient }));

import { GET } from '@/app/api/employee/workspace/route';

describe('employee workspace API', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does not query customer data without authentication', async () => {
    const from = vi.fn();
    createSupabaseServerClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from,
    });

    const response = await GET();
    expect(response.status).toBe(401);
    expect(from).not.toHaveBeenCalled();
  });

  it('returns a truthful empty state when the user has no customer membership', async () => {
    const limit = vi.fn().mockResolvedValue({ data: [], error: null });
    const order = vi.fn(() => ({ limit }));
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ select }));
    createSupabaseServerClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      from,
    });

    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ workspace: null, reason: 'no_membership' });
    expect(from).toHaveBeenCalledWith('customer_memberships');
    expect(eq).toHaveBeenCalledWith('user_id', 'user-1');
  });

  it('does not disguise a missing migration as an empty customer account', async () => {
    const limit = vi.fn().mockResolvedValue({ data: null, error: { code: '42P01' } });
    const order = vi.fn(() => ({ limit }));
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    createSupabaseServerClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      from: vi.fn(() => ({ select })),
    });

    const response = await GET();
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: 'Employee workspace is not configured yet.' });
  });

  it('fails clearly instead of selecting one of multiple customer memberships', async () => {
    const limit = vi.fn().mockResolvedValue({
      data: [
        { customer_id: 'customer-1', role: 'owner' },
        { customer_id: 'customer-2', role: 'manager' },
      ],
      error: null,
    });
    const order = vi.fn(() => ({ limit }));
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    createSupabaseServerClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      from: vi.fn(() => ({ select })),
    });

    const response = await GET();
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({ workspace: null, reason: 'multiple_memberships' });
  });
});
