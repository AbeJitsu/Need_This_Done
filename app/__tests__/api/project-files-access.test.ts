import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';

const { getSupabaseAdmin, verifyAuth, verifyProjectAccess } = vi.hoisted(() => ({
  getSupabaseAdmin: vi.fn(),
  verifyAuth: vi.fn(),
  verifyProjectAccess: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({ getSupabaseAdmin }));
vi.mock('@/lib/api-auth', () => ({ verifyAuth, verifyProjectAccess }));

import { GET } from '@/app/api/files/[...path]/route';

function request() {
  return new Request('http://localhost/api/files/client/example.pdf');
}

describe('project file access API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyAuth.mockResolvedValue({ user: { id: 'client-1' } });
  });

  it('does not resolve a file when the requester is not authenticated', async () => {
    verifyAuth.mockResolvedValue({
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    });

    const response = await GET(request() as never, {
      params: Promise.resolve({ path: ['client', 'example.pdf'] }),
    });

    expect(response.status).toBe(401);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it('requires project access before creating a signed attachment URL', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { id: 'project-1' }, error: null });
    const contains = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ contains }));
    const createSignedUrl = vi.fn();
    getSupabaseAdmin.mockReturnValue({
      from: vi.fn(() => ({ select })),
      storage: { from: vi.fn(() => ({ createSignedUrl })) },
    });
    verifyProjectAccess.mockResolvedValue({
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    });

    const response = await GET(request() as never, {
      params: Promise.resolve({ path: ['client', 'example.pdf'] }),
    });

    expect(response.status).toBe(403);
    expect(contains).toHaveBeenCalledWith('attachments', ['client/example.pdf']);
    expect(verifyProjectAccess).toHaveBeenCalledWith('project-1');
    expect(createSignedUrl).not.toHaveBeenCalled();
  });

  it('signs a file only after project access is confirmed', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { id: 'project-1' }, error: null });
    const contains = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ contains }));
    const createSignedUrl = vi.fn().mockResolvedValue({
      data: { signedUrl: 'https://storage.example.com/signed-file' },
      error: null,
    });
    getSupabaseAdmin.mockReturnValue({
      from: vi.fn(() => ({ select })),
      storage: { from: vi.fn(() => ({ createSignedUrl })) },
    });
    verifyProjectAccess.mockResolvedValue({ hasAccess: true, isAdmin: false, isOwner: true });

    const response = await GET(request() as never, {
      params: Promise.resolve({ path: ['client', 'example.pdf'] }),
    });

    expect(response.status).toBe(307);
    expect(createSignedUrl).toHaveBeenCalledWith('client/example.pdf', 86400);
  });
});
