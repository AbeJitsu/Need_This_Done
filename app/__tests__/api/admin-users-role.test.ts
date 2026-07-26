import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getSupabaseAdmin, verifyAdmin } = vi.hoisted(() => ({
  getSupabaseAdmin: vi.fn(),
  verifyAdmin: vi.fn(),
}));

vi.mock('@/lib/api-auth', () => ({ verifyAdmin }));
vi.mock('@/lib/supabase', () => ({ getSupabaseAdmin }));

import { GET, PATCH } from '@/app/api/admin/users/route';

const operator = { user: { id: '11111111-1111-1111-1111-111111111111' } };

describe('admin users operator roles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyAdmin.mockResolvedValue(operator);
  });

  it('shows operator access from user_roles rather than editable user metadata', async () => {
    const roleEq = vi.fn().mockResolvedValue({
      data: [{ user_id: '22222222-2222-2222-2222-222222222222' }],
      error: null,
    });
    const roleSelect = vi.fn(() => ({ eq: roleEq }));
    const listUsers = vi.fn().mockResolvedValue({
      data: {
        users: [
          {
            id: '11111111-1111-1111-1111-111111111111',
            email: 'metadata@example.com',
            created_at: '2026-07-25T00:00:00.000Z',
            last_sign_in_at: null,
            email_confirmed_at: null,
            user_metadata: { is_admin: true },
          },
          {
            id: '22222222-2222-2222-2222-222222222222',
            email: 'operator@example.com',
            created_at: '2026-07-25T00:00:00.000Z',
            last_sign_in_at: null,
            email_confirmed_at: null,
            user_metadata: { is_admin: false },
          },
        ],
      },
      error: null,
    });
    getSupabaseAdmin.mockReturnValue({
      auth: { admin: { listUsers } },
      from: vi.fn(() => ({ select: roleSelect })),
    });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({
      users: [
        expect.objectContaining({ email: 'metadata@example.com', is_admin: false }),
        expect.objectContaining({ email: 'operator@example.com', is_admin: true }),
      ],
    }));
    expect(roleEq).toHaveBeenCalledWith('role', 'admin');
  });

  it('rejects the retired metadata-based operator-role action before accessing Supabase', async () => {
    const request = new Request('http://localhost/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: '22222222-2222-2222-2222-222222222222',
        action: 'setAdmin',
        value: true,
      }),
    });

    const response = await PATCH(request as never);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({
      error: expect.stringContaining('user_roles'),
    }));
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });
});
