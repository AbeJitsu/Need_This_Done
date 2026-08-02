import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getSupabaseAdmin, createSupabaseServerClient } = vi.hoisted(() => ({
  getSupabaseAdmin: vi.fn(),
  createSupabaseServerClient: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({ getSupabaseAdmin }));
vi.mock('@/lib/supabase-server', () => ({ createSupabaseServerClient }));

import { hasAdminRole, verifyAdmin } from '@/lib/api-auth';

function roleQuery(result: { data: { role: string } | null; error: unknown }) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const secondEq = vi.fn(() => ({ maybeSingle }));
  const firstEq = vi.fn(() => ({ eq: secondEq }));
  const select = vi.fn(() => ({ eq: firstEq }));
  const from = vi.fn(() => ({ select }));
  return { from, firstEq, secondEq, maybeSingle };
}

describe('hasAdminRole', () => {
  beforeEach(() => vi.clearAllMocks());

  it('allows only a database-backed admin role', async () => {
    const query = roleQuery({ data: { role: 'admin' }, error: null });
    getSupabaseAdmin.mockReturnValue({ from: query.from });

    await expect(hasAdminRole('11111111-1111-1111-1111-111111111111')).resolves.toBe(true);
    expect(query.from).toHaveBeenCalledWith('user_roles');
    expect(query.firstEq).toHaveBeenCalledWith('user_id', '11111111-1111-1111-1111-111111111111');
    expect(query.secondEq).toHaveBeenCalledWith('role', 'admin');
  });

  it('fails closed when no admin role exists', async () => {
    const query = roleQuery({ data: null, error: null });
    getSupabaseAdmin.mockReturnValue({ from: query.from });

    await expect(hasAdminRole('11111111-1111-1111-1111-111111111111')).resolves.toBe(false);
  });

  it('fails closed when the role lookup fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const query = roleQuery({ data: null, error: { message: 'database unavailable' } });
    getSupabaseAdmin.mockReturnValue({ from: query.from });

    await expect(hasAdminRole('11111111-1111-1111-1111-111111111111')).resolves.toBe(false);
    expect(consoleError).toHaveBeenCalledWith(
      '[hasAdminRole] Failed to check operator role:',
      { message: 'database unavailable' },
    );
    consoleError.mockRestore();
  });
});

describe('verifyAdmin authentication boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createSupabaseServerClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    });
  });

  it('fails closed even when the removed development bypass variable is present', async () => {
    vi.stubEnv('NEXT_PUBLIC_E2E_ADMIN_BYPASS', 'true');
    vi.stubEnv('NODE_ENV', 'development');

    const result = await verifyAdmin();

    expect(result.user).toBeUndefined();
    expect(result.error?.status).toBe(401);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();

    vi.unstubAllEnvs();
  });
});
