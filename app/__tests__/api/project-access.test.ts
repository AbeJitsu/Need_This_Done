import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';

const { getSupabaseAdmin, verifyAdmin, invalidate, invalidatePattern } = vi.hoisted(() => ({
  getSupabaseAdmin: vi.fn(),
  verifyAdmin: vi.fn(),
  invalidate: vi.fn().mockResolvedValue(undefined),
  invalidatePattern: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/api-auth', () => ({ verifyAdmin }));
vi.mock('@/lib/supabase', () => ({ getSupabaseAdmin }));
vi.mock('@/lib/api-errors', () => ({
  handleApiError: vi.fn(() => NextResponse.json({ error: 'Server error' }, { status: 500 })),
}));
vi.mock('@/lib/cache', () => ({
  cache: { invalidate, invalidatePattern },
  CACHE_KEYS: {
    userProjects: (userId: string) => `user:projects:${userId}`,
    projectComments: (projectId: string, isAdmin: boolean) =>
      `project:comments:${projectId}${isAdmin ? ':admin' : ''}`,
  },
}));

import { PATCH } from '@/app/api/projects/[id]/access/route';

const params = Promise.resolve({ id: 'project-1' });

function request(action: unknown) {
  return new Request('http://localhost/api/projects/project-1/access', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });
}

function projectLookup(project: unknown, error: unknown = null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: project, error });
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  return { select, eq, maybeSingle };
}

function linkUpdate(result: unknown, error: unknown = null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: result, error });
  const select = vi.fn(() => ({ maybeSingle }));
  const is = vi.fn(() => ({ select }));
  const eq = vi.fn(() => ({ is }));
  const update = vi.fn(() => ({ eq }));
  return { update, eq, is, select, maybeSingle };
}

function unlinkUpdate(result: unknown, error: unknown = null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: result, error });
  const select = vi.fn(() => ({ maybeSingle }));
  const userEq = vi.fn(() => ({ select }));
  const idEq = vi.fn(() => ({ eq: userEq }));
  const update = vi.fn(() => ({ eq: idEq }));
  return { update, idEq, userEq, select, maybeSingle };
}

describe('project access API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyAdmin.mockResolvedValue({ user: { id: 'operator-1' } });
  });

  it('does not query projects when the operator check fails', async () => {
    verifyAdmin.mockResolvedValue({
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    });

    const response = await PATCH(request('link') as never, { params });

    expect(response.status).toBe(403);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it('links only an existing account with the same normalized email and invalidates access caches', async () => {
    const lookup = projectLookup({ id: 'project-1', email: ' Client@Example.com ', user_id: null });
    const update = linkUpdate({ id: 'project-1' });
    const listUsers = vi.fn().mockResolvedValue({
      data: { users: [{ id: 'client-1', email: 'client@example.com' }] },
      error: null,
    });
    const from = vi.fn(() => ({ select: lookup.select, update: update.update }));
    getSupabaseAdmin.mockReturnValue({ from, auth: { admin: { listUsers } } });

    const response = await PATCH(request('link') as never, { params });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      action: 'link',
      portalAccessEnabled: true,
      eligibleEmail: ' Client@Example.com ',
    });
    expect(listUsers).toHaveBeenCalledWith({ page: 1, perPage: 1000 });
    expect(update.update).toHaveBeenCalledWith({ user_id: 'client-1' });
    expect(update.eq).toHaveBeenCalledWith('id', 'project-1');
    expect(update.is).toHaveBeenCalledWith('user_id', null);
    expect(invalidate).toHaveBeenCalledWith('user:projects:client-1');
    expect(invalidate).toHaveBeenCalledWith('project:comments:project-1:admin');
    expect(invalidate).toHaveBeenCalledWith('project:comments:project-1');
    expect(invalidatePattern).toHaveBeenCalledWith('admin:projects:*');
  });

  it('does not reassign a project that is already linked', async () => {
    const lookup = projectLookup({ id: 'project-1', email: 'client@example.com', user_id: 'client-1' });
    const listUsers = vi.fn();
    getSupabaseAdmin.mockReturnValue({
      from: vi.fn(() => ({ select: lookup.select })),
      auth: { admin: { listUsers } },
    });

    const response = await PATCH(request('link') as never, { params });

    expect(response.status).toBe(409);
    expect(listUsers).not.toHaveBeenCalled();
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('does not link a project when no existing account has the exact email', async () => {
    const lookup = projectLookup({ id: 'project-1', email: 'client@example.com', user_id: null });
    const update = vi.fn();
    const listUsers = vi.fn().mockResolvedValue({
      data: { users: [{ id: 'other-client', email: 'other@example.com' }] },
      error: null,
    });
    getSupabaseAdmin.mockReturnValue({
      from: vi.fn(() => ({ select: lookup.select, update })),
      auth: { admin: { listUsers } },
    });

    const response = await PATCH(request('link') as never, { params });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining('No existing account matches'),
      eligibleEmail: 'client@example.com',
    });
    expect(update).not.toHaveBeenCalled();
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('removes a current link and invalidates the former client caches', async () => {
    const lookup = projectLookup({ id: 'project-1', email: 'client@example.com', user_id: 'client-1' });
    const update = unlinkUpdate({ id: 'project-1' });
    getSupabaseAdmin.mockReturnValue({
      from: vi.fn(() => ({ select: lookup.select, update: update.update })),
      auth: { admin: { listUsers: vi.fn() } },
    });

    const response = await PATCH(request('unlink') as never, { params });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      action: 'unlink',
      portalAccessEnabled: false,
    });
    expect(update.idEq).toHaveBeenCalledWith('id', 'project-1');
    expect(update.userEq).toHaveBeenCalledWith('user_id', 'client-1');
    expect(invalidate).toHaveBeenCalledWith('user:projects:client-1');
    expect(invalidatePattern).toHaveBeenCalledWith('admin:projects:*');
  });
});
