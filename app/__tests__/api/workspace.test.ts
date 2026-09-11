import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';

const { createSupabaseServerClient, loadWorkspace, verifyAuth } = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  loadWorkspace: vi.fn(),
  verifyAuth: vi.fn(),
}));

vi.mock('@/lib/supabase-server', () => ({ createSupabaseServerClient }));
vi.mock('@/lib/workspace', () => ({
  loadWorkspace,
  WorkspaceUnavailableError: class WorkspaceUnavailableError extends Error {
    constructor() {
      super('The authenticated workspace is not configured yet.');
    }
  },
}));
vi.mock('@/lib/api-auth', () => ({ verifyAuth }));

import { GET } from '@/app/api/workspace/route';

const ownerId = '00000000-0000-4000-8000-000000000001';

describe('authenticated workspace API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyAuth.mockResolvedValue({ user: { id: ownerId } });
    createSupabaseServerClient.mockResolvedValue({});
    loadWorkspace.mockResolvedValue({
      configured: true,
      workflows: [],
      counts: { active: 0, needsAttention: 0, completed: 0 },
    });
  });

  it('returns the auth boundary before touching durable workspace data', async () => {
    const from = vi.fn();
    verifyAuth.mockResolvedValue({
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    });
    createSupabaseServerClient.mockResolvedValue({ from });

    const response = await GET();

    expect(response.status).toBe(401);
    expect(createSupabaseServerClient).not.toHaveBeenCalled();
    expect(loadWorkspace).not.toHaveBeenCalled();
  });

  it('loads only the authenticated owner workspace and disables caching', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ configured: true, workflows: [] });
    expect(loadWorkspace).toHaveBeenCalledWith({}, ownerId);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('reports missing workflow schema as a configuration gap', async () => {
    const { WorkspaceUnavailableError } = await import('@/lib/workspace');
    loadWorkspace.mockRejectedValue(new WorkspaceUnavailableError());

    const response = await GET();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: 'The authenticated workspace is not configured yet.',
      code: 'WORKSPACE_NOT_CONFIGURED',
    });
  });
});
