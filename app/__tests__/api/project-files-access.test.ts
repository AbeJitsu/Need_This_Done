import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';

const { getSupabaseAdmin, verifyAdmin } = vi.hoisted(() => ({
  getSupabaseAdmin: vi.fn(),
  verifyAdmin: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({ getSupabaseAdmin }));
vi.mock('@/lib/api-auth', () => ({ verifyAdmin }));

import { GET } from '@/app/api/files/[...path]/route';

function request() {
  return new Request('http://localhost/api/files/client/example.pdf');
}

describe('operator project file access API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyAdmin.mockResolvedValue({ user: { id: 'operator-1' } });
  });

  it.each([401, 403])('returns %s without resolving a file', async (status) => {
    verifyAdmin.mockResolvedValue({
      error: NextResponse.json({ error: status === 401 ? 'Unauthorized' : 'Forbidden' }, { status }),
    });

    const response = await GET(request() as never, {
      params: Promise.resolve({ path: ['client', 'example.pdf'] }),
    });

    expect(response.status).toBe(status);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it('signs a retained file for an operator only after resolving its project', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { id: 'project-1' }, error: null });
    const contains = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ contains }));
    const createSignedUrl = vi.fn().mockResolvedValue({
      data: { signedUrl: 'https://storage.example.com/signed-file' }, error: null,
    });
    getSupabaseAdmin.mockReturnValue({
      from: vi.fn(() => ({ select })),
      storage: { from: vi.fn(() => ({ createSignedUrl })) },
    });

    const response = await GET(request() as never, {
      params: Promise.resolve({ path: ['client', 'example.pdf'] }),
    });

    expect(response.status).toBe(307);
    expect(contains).toHaveBeenCalledWith('attachments', ['client/example.pdf']);
    expect(createSignedUrl).toHaveBeenCalledWith('client/example.pdf', 86400);
  });
});
