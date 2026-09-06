import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createSupabaseServerClient, hasAdminRole, redirect } = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  hasAdminRole: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('@/lib/supabase-server', () => ({ createSupabaseServerClient }));
vi.mock('@/lib/api-auth', () => ({ hasAdminRole }));
vi.mock('next/navigation', () => ({ redirect }));

import { requireOperator } from '@/lib/operator-access';

describe('requireOperator', () => {
  const user = { id: '11111111-1111-1111-1111-111111111111' };

  beforeEach(() => {
    vi.clearAllMocks();
    redirect.mockImplementation(() => { throw new Error('NEXT_REDIRECT'); });
  });

  it('redirects an anonymous browser request before a role lookup', async () => {
    createSupabaseServerClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    });

    await expect(requireOperator()).rejects.toThrow('NEXT_REDIRECT');
    expect(hasAdminRole).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('redirects an authenticated non-operator browser request', async () => {
    createSupabaseServerClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
    });
    hasAdminRole.mockResolvedValue(false);

    await expect(requireOperator()).rejects.toThrow('NEXT_REDIRECT');
    expect(hasAdminRole).toHaveBeenCalledWith(user.id);
    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('allows the database-backed operator through', async () => {
    createSupabaseServerClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
    });
    hasAdminRole.mockResolvedValue(true);

    await expect(requireOperator()).resolves.toEqual(user);
    expect(redirect).not.toHaveBeenCalled();
  });
});
