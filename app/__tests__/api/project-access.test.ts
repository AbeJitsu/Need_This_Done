import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';

const { verifyAdmin } = vi.hoisted(() => ({ verifyAdmin: vi.fn() }));
vi.mock('@/lib/api-auth', () => ({ verifyAdmin }));

import { PATCH } from '@/app/api/projects/[id]/access/route';

const params = Promise.resolve({ id: 'project-1' });

function request() {
  return new Request('http://localhost/api/projects/project-1/access', { method: 'PATCH' });
}

describe('retired project access API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyAdmin.mockResolvedValue({ user: { id: 'operator-1' } });
  });

  it.each([401, 403])('preserves the %s operator boundary', async (status) => {
    verifyAdmin.mockResolvedValue({
      error: NextResponse.json({ error: status === 401 ? 'Unauthorized' : 'Forbidden' }, { status }),
    });
    const response = await PATCH(request() as never, { params });
    expect(response.status).toBe(status);
  });

  it('returns 410 without changing historical links', async () => {
    const response = await PATCH(request() as never, { params });
    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toEqual({ error: 'Project client-access management is retired.' });
  });
});
