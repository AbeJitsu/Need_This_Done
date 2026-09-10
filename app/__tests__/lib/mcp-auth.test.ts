import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getSupabaseAdmin } = vi.hoisted(() => ({
  getSupabaseAdmin: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@/lib/supabase', () => ({ getSupabaseAdmin }));

import { authenticateMcpRequest } from '@/lib/mcp-auth';
import { generateMcpAccessToken, hashMcpAccessToken } from '@/lib/mcp-token';

const ownerId = '00000000-0000-4000-8000-000000000001';
const credentialId = '00000000-0000-4000-8000-000000000002';

function request(token: string | null, headers: Record<string, string> = {}) {
  const requestHeaders = new Headers(headers);
  if (token) requestHeaders.set('authorization', `Bearer ${token}`);
  return new Request('https://mcp.example.test/api/mcp', { headers: requestHeaders });
}

function mockAdmin(
  row: Record<string, unknown> | null,
  lookupError: { code?: string; message: string } | null = null,
  touched: Record<string, unknown> | null = { id: credentialId },
  updateError: { code?: string; message: string } | null = null,
) {
  const lookupMaybeSingle = vi.fn().mockResolvedValue({ data: row, error: lookupError });
  const lookupEq = vi.fn(() => ({ maybeSingle: lookupMaybeSingle }));
  const lookupSelect = vi.fn(() => ({ eq: lookupEq }));
  const updateMaybeSingle = vi.fn().mockResolvedValue({ data: touched, error: updateError });
  const updateSelect = vi.fn(() => ({ maybeSingle: updateMaybeSingle }));
  const updateIs = vi.fn(() => ({ select: updateSelect }));
  const updateOwnerEq = vi.fn(() => ({ is: updateIs }));
  const updateIdEq = vi.fn(() => ({ eq: updateOwnerEq }));
  const update = vi.fn(() => ({ eq: updateIdEq }));
  const from = vi.fn(() => ({ select: lookupSelect, update }));
  getSupabaseAdmin.mockReturnValue({ from });
  return { from, lookupSelect, lookupEq, update, updateIdEq, updateOwnerEq, updateIs, updateSelect };
}

// These tests prove the server authentication decision and owner context,
// which matters because no MCP request may become a global owner operation.
// They do not prove PostgreSQL RLS or a real hosted session; the local RLS
// suite covers the table privileges separately.
describe('MCP account credential authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.MCP_BEARER_TOKEN;
    delete process.env.MCP_BEARER_TOKEN_OWNER_ID;
    delete process.env.MCP_ALLOWED_ORIGINS;
  });

  it('binds the temporary bootstrap bearer value to its configured owner', async () => {
    process.env.MCP_BEARER_TOKEN = 'bootstrap-secret-that-is-at-least-32-chars';
    process.env.MCP_BEARER_TOKEN_OWNER_ID = ownerId;

    const result = await authenticateMcpRequest(request(process.env.MCP_BEARER_TOKEN));

    expect(result).toEqual({
      ok: true,
      context: { ownerId, credentialId: null, authMethod: 'bootstrap' },
    });
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it('rejects an unbound bootstrap value instead of granting a global owner', async () => {
    process.env.MCP_BEARER_TOKEN = 'bootstrap-secret-that-is-at-least-32-chars';

    const result = await authenticateMcpRequest(request(process.env.MCP_BEARER_TOKEN));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(503);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it.each([
    ['missing', null],
    ['malformed', 'not-an-ntd-credential'],
  ])('rejects a %s credential before database lookup', async (_label, token) => {
    const result = await authenticateMcpRequest(request(token));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(401);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it('authenticates a live database credential, returns owner context, and records last use', async () => {
    const token = generateMcpAccessToken();
    const admin = mockAdmin({
      id: credentialId,
      owner_id: ownerId,
      token_hash: hashMcpAccessToken(token),
      revoked_at: null,
      expires_at: null,
    });

    const result = await authenticateMcpRequest(request(token));

    expect(result).toEqual({
      ok: true,
      context: { ownerId, credentialId, authMethod: 'database' },
    });
    expect(admin.lookupEq).toHaveBeenCalledWith('token_hash', hashMcpAccessToken(token));
    expect(admin.update).toHaveBeenCalledWith({ last_used_at: expect.any(String) });
    expect(admin.updateIdEq).toHaveBeenCalledWith('id', credentialId);
    expect(admin.updateOwnerEq).toHaveBeenCalledWith('owner_id', ownerId);
    expect(admin.updateIs).toHaveBeenCalledWith('revoked_at', null);
  });

  it.each([
    ['revoked', { revoked_at: new Date().toISOString(), expires_at: null }],
    ['expired', { revoked_at: null, expires_at: new Date(Date.now() - 60_000).toISOString() }],
  ])('rejects a %s database credential without recording last use', async (_label, state) => {
    const token = generateMcpAccessToken();
    const admin = mockAdmin({
      id: credentialId,
      owner_id: ownerId,
      token_hash: hashMcpAccessToken(token),
      ...state,
    });

    const result = await authenticateMcpRequest(request(token));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(401);
    expect(admin.update).not.toHaveBeenCalled();
  });

  it('fails closed when credential storage cannot be read or updated', async () => {
    const token = generateMcpAccessToken();
    mockAdmin(null, { code: '08006', message: 'database unavailable' });

    const lookupResult = await authenticateMcpRequest(request(token));
    expect(lookupResult.ok).toBe(false);
    if (!lookupResult.ok) expect(lookupResult.response.status).toBe(503);

    mockAdmin({ id: credentialId, owner_id: ownerId, token_hash: hashMcpAccessToken(token), revoked_at: null, expires_at: null }, null, null, { code: '08006', message: 'database unavailable' });
    const updateResult = await authenticateMcpRequest(request(token));
    expect(updateResult.ok).toBe(false);
    if (!updateResult.ok) expect(updateResult.response.status).toBe(503);
  });

  it('rejects a credential whose stored owner binding is not a UUID', async () => {
    const token = generateMcpAccessToken();
    const admin = mockAdmin({
      id: credentialId,
      owner_id: 'not-an-owner',
      token_hash: hashMcpAccessToken(token),
      revoked_at: null,
      expires_at: null,
    });

    const result = await authenticateMcpRequest(request(token));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(401);
    expect(admin.update).not.toHaveBeenCalled();
  });

  it('applies the configured origin allowlist before credential lookup', async () => {
    process.env.MCP_ALLOWED_ORIGINS = 'https://chatgpt.com';
    const result = await authenticateMcpRequest(request(null, { origin: 'https://evil.example' }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(403);
      await expect(result.response.json()).resolves.toEqual({ error: 'MCP origin is not allowed.' });
    }
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it('fails closed when a browser origin is present without an origin policy', async () => {
    const result = await authenticateMcpRequest(request(null, { origin: 'https://chatgpt.com' }));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(503);
  });
});
