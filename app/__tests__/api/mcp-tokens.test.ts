import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';

const { verifyAdmin, getSupabaseAdmin } = vi.hoisted(() => ({
  verifyAdmin: vi.fn(),
  getSupabaseAdmin: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@/lib/api-auth', () => ({ verifyAdmin }));
vi.mock('@/lib/supabase', () => ({ getSupabaseAdmin }));

import { GET, POST } from '@/app/api/mcp/tokens/route';
import { DELETE } from '@/app/api/mcp/tokens/[id]/route';

const ownerId = '00000000-0000-4000-8000-000000000001';
const otherOwnerId = '00000000-0000-4000-8000-000000000003';
const credentialId = '00000000-0000-4000-8000-000000000002';
const row = {
  id: credentialId,
  name: 'ChatGPT desktop',
  token_prefix: 'ntd_mcp_AAAAAAAA',
  created_at: '2026-09-10T12:00:00.000Z',
  last_used_at: null,
  revoked_at: null,
  expires_at: null,
};

function jsonRequest(method: string, body?: unknown, headers: Record<string, string> = {}) {
  return new Request('https://needthisdone.example/api/mcp/tokens', {
    method,
    headers: { 'content-type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function listAdmin(result: { data: unknown[] | null; error: { code?: string; message: string } | null }) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn().mockResolvedValue(result),
  };
  const from = vi.fn(() => builder);
  getSupabaseAdmin.mockReturnValue({ from });
  return { from, builder };
}

function createAdmin(result: { data: unknown; error: { code?: string; message: string } | null }) {
  const single = vi.fn().mockResolvedValue(result);
  const select = vi.fn(() => ({ single }));
  const insert = vi.fn(() => ({ select }));
  const from = vi.fn(() => ({ insert }));
  getSupabaseAdmin.mockReturnValue({ from });
  return { from, insert, select, single };
}

function revokeAdmin(
  existing: { data: unknown; error: { code?: string; message: string } | null },
  revoked: { data: unknown; error: { code?: string; message: string } | null },
) {
  const existingMaybeSingle = vi.fn().mockResolvedValue(existing);
  const existingSecondEq = vi.fn(() => ({ maybeSingle: existingMaybeSingle }));
  const existingFirstEq = vi.fn(() => ({ eq: existingSecondEq }));
  const existingSelect = vi.fn(() => ({ eq: existingFirstEq }));

  const revokedMaybeSingle = vi.fn().mockResolvedValue(revoked);
  const revokedSelect = vi.fn(() => ({ maybeSingle: revokedMaybeSingle }));
  const revokedIs = vi.fn(() => ({ select: revokedSelect }));
  const revokedSecondEq = vi.fn(() => ({ is: revokedIs }));
  const revokedFirstEq = vi.fn(() => ({ eq: revokedSecondEq }));
  const update = vi.fn(() => ({ eq: revokedFirstEq }));

  const from = vi.fn(() => ({ select: existingSelect, update }));
  getSupabaseAdmin.mockReturnValue({ from });
  return {
    from,
    existingSelect,
    existingFirstEq,
    existingSecondEq,
    update,
    revokedFirstEq,
    revokedSecondEq,
    revokedIs,
  };
}

// These route tests prove the account API's redaction, owner scoping, origin,
// cache, and safe-error contract, which matters because the raw bearer value
// must never become a reusable list response. They do not prove real browser
// sessions or PostgreSQL RLS; those boundaries are covered separately.
describe('MCP account credential API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyAdmin.mockResolvedValue({ user: { id: ownerId } });
  });

  it('returns authentication errors privately without touching credential storage', async () => {
    verifyAdmin.mockResolvedValue({
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    });

    const response = await GET();

    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toBe('no-store, private');
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it('rejects cross-origin creation before authentication or storage', async () => {
    const response = await POST(jsonRequest('POST', { name: 'attacker' }, {
      origin: 'https://evil.example',
    }));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: 'Invalid request origin.' });
    expect(verifyAdmin).not.toHaveBeenCalled();
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it('creates an owner-scoped credential and returns its raw value only in the creation response', async () => {
    const createdRow = { ...row, expires_at: '2026-12-31T23:59:59.000Z' };
    const admin = createAdmin({ data: createdRow, error: null });

    const response = await POST(jsonRequest('POST', {
      name: '  ChatGPT desktop  ',
      expiresAt: '2026-12-31T23:59:59.000Z',
    }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.token).toMatch(/^ntd_mcp_[A-Za-z0-9_-]{43}$/);
    expect(body.credential).toEqual({
      id: credentialId,
      name: 'ChatGPT desktop',
      tokenPrefix: 'ntd_mcp_AAAAAAAA…',
      createdAt: row.created_at,
      lastUsedAt: null,
      revokedAt: null,
      expiresAt: createdRow.expires_at,
    });
    expect(JSON.stringify(body)).not.toContain('token_hash');
    expect(admin.insert).toHaveBeenCalledWith(expect.objectContaining({
      owner_id: ownerId,
      name: 'ChatGPT desktop',
      expires_at: '2026-12-31T23:59:59.000Z',
      token_hash: expect.stringMatching(/^[0-9a-f]{64}$/),
      token_prefix: expect.stringMatching(/^ntd_mcp_[A-Za-z0-9_-]{8}$/),
    }));
    expect(response.headers.get('cache-control')).toBe('no-store, private');
  });

  it('rejects invalid or already expired creation input before storage', async () => {
    const invalidName = await POST(jsonRequest('POST', { name: ' ' }));
    expect(invalidName.status).toBe(400);

    const expired = await POST(jsonRequest('POST', {
      name: 'old credential',
      expiresAt: '2020-01-01T00:00:00.000Z',
    }));
    expect(expired.status).toBe(400);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it('lists only redacted credentials for the authenticated owner', async () => {
    const admin = listAdmin({ data: [row], error: null });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ tokens: [{
      id: credentialId,
      name: row.name,
      tokenPrefix: 'ntd_mcp_AAAAAAAA…',
      createdAt: row.created_at,
      lastUsedAt: null,
      revokedAt: null,
      expiresAt: null,
    }] });
    expect(JSON.stringify(body)).not.toContain('token_hash');
    expect(admin.builder.eq).toHaveBeenCalledWith('owner_id', ownerId);
    expect(admin.builder.limit).toHaveBeenCalledWith(100);
  });

  it('scopes revocation to the current owner and never returns a raw token', async () => {
    const admin = revokeAdmin(
      { data: row, error: null },
      { data: { ...row, revoked_at: '2026-09-10T12:05:00.000Z' }, error: null },
    );

    const response = await DELETE(jsonRequest('DELETE'), { params: Promise.resolve({ id: credentialId }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.revoked).toBe(true);
    expect(body.credential).toMatchObject({ id: credentialId, revokedAt: '2026-09-10T12:05:00.000Z' });
    expect(JSON.stringify(body)).not.toContain('token_hash');
    expect(admin.existingFirstEq).toHaveBeenCalledWith('id', credentialId);
    expect(admin.existingSecondEq).toHaveBeenCalledWith('owner_id', ownerId);
    expect(admin.revokedFirstEq).toHaveBeenCalledWith('id', credentialId);
    expect(admin.revokedSecondEq).toHaveBeenCalledWith('owner_id', ownerId);
    expect(admin.revokedIs).toHaveBeenCalledWith('revoked_at', null);
  });

  it('does not reveal whether another owner has a credential', async () => {
    revokeAdmin({ data: null, error: null }, { data: null, error: null });

    const response = await DELETE(jsonRequest('DELETE'), {
      params: Promise.resolve({ id: credentialId }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'MCP credential not found.' });
  });

  it('reports storage failures safely and keeps responses private', async () => {
    listAdmin({ data: null, error: { code: '08006', message: 'database unavailable' } });

    const response = await GET();

    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store, private');
    await expect(response.json()).resolves.toEqual({ error: 'MCP credentials could not be loaded.' });
  });
});
