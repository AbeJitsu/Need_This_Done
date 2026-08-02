import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const { createClient, getToken, signInWithIdToken } = vi.hoisted(() => ({
  createClient: vi.fn(),
  getToken: vi.fn(),
  signInWithIdToken: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({ createClient }));
vi.mock('next-auth/jwt', () => ({ getToken }));

import { POST } from '@/app/api/auth/supabase-bridge/route';

function request(origin = 'http://localhost') {
  return new NextRequest('http://localhost/api/auth/supabase-bridge', {
    method: 'POST',
    headers: { origin },
  });
}

describe('NextAuth to Supabase session bridge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:54321');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'local-anon-key-for-tests');
    vi.stubEnv('NEXTAUTH_SECRET', 'nextauth-test-secret');
    createClient.mockReturnValue({ auth: { signInWithIdToken } });
  });

  it('rejects cross-origin bridge requests before reading a session', async () => {
    const response = await POST(request('https://attacker.example'));

    expect(response.status).toBe(403);
    expect(getToken).not.toHaveBeenCalled();
  });

  it('fails closed without a current Google ID token', async () => {
    getToken.mockResolvedValue({ provider: 'google', googleIdToken: 'id-token', googleIdTokenExpiresAt: 1 });

    const response = await POST(request());

    expect(response.status).toBe(401);
    expect(signInWithIdToken).not.toHaveBeenCalled();
  });

  it('returns a Supabase session only after Supabase verifies the Google token', async () => {
    getToken.mockResolvedValue({
      provider: 'google',
      googleIdToken: 'signed-google-id-token',
      googleIdTokenExpiresAt: Math.floor(Date.now() / 1000) + 300,
    });
    signInWithIdToken.mockResolvedValue({
      data: {
        session: { access_token: 'access', refresh_token: 'refresh', expires_at: 123 },
      },
      error: null,
    });

    const response = await POST(request());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(signInWithIdToken).toHaveBeenCalledWith({
      provider: 'google',
      token: 'signed-google-id-token',
    });
    expect(body.session).toEqual({ access_token: 'access', refresh_token: 'refresh', expires_at: 123 });
  });

  it('does not create an application session when Supabase rejects the token', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    getToken.mockResolvedValue({
      provider: 'google',
      googleIdToken: 'invalid-token',
      googleIdTokenExpiresAt: Math.floor(Date.now() / 1000) + 300,
    });
    signInWithIdToken.mockResolvedValue({ data: { session: null }, error: { message: 'invalid token' } });

    const response = await POST(request());

    expect(response.status).toBe(401);
    consoleError.mockRestore();
  });
});
