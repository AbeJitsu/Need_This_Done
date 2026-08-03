import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import {
  createGoogleOAuthState,
  GOOGLE_OAUTH_STATE_COOKIE,
  verifyGoogleOAuthState,
} from '@/lib/google-oauth-state';

const { verifyAdmin, getAuthUrl, exchangeCodeForTokens, getGoogleEmail, storeTokens } = vi.hoisted(() => ({
  verifyAdmin: vi.fn(),
  getAuthUrl: vi.fn(),
  exchangeCodeForTokens: vi.fn(),
  getGoogleEmail: vi.fn(),
  storeTokens: vi.fn(),
}));

vi.mock('@/lib/api-auth', () => ({ verifyAdmin }));
vi.mock('@/lib/google-calendar', () => ({
  getAuthUrl,
  exchangeCodeForTokens,
  getGoogleEmail,
  storeTokens,
}));

import { GET as callback } from '@/app/api/google/callback/route';
import { GET as connect } from '@/app/api/google/connect/route';

function callbackRequest(state: string, nonce?: string) {
  const headers = new Headers();
  if (nonce) headers.set('cookie', `${GOOGLE_OAUTH_STATE_COOKIE}=${nonce}`);
  return new NextRequest(
    `http://localhost/api/google/callback?code=google-code&state=${encodeURIComponent(state)}`,
    { headers }
  );
}

describe('Google Calendar OAuth callback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('GOOGLE_OAUTH_STATE_SECRET', 'a-test-secret-that-is-at-least-32-characters');
    verifyAdmin.mockResolvedValue({ user: { id: 'abe' } });
    getAuthUrl.mockImplementation((state: string) => `https://accounts.google.test/auth?state=${state}`);
    exchangeCodeForTokens.mockResolvedValue({ access_token: 'access' });
    getGoogleEmail.mockResolvedValue('abe@example.com');
    storeTokens.mockResolvedValue(undefined);
  });

  it.each([
    ['forged state', (state: string) => `${state}x`, undefined],
    ['missing browser nonce', (state: string) => state, 'omit'],
  ])('rejects %s before exchanging or storing tokens', async (_label, alter, cookieMode) => {
    const { state, nonce } = createGoogleOAuthState('abe');
    const response = await callback(callbackRequest(alter(state), cookieMode === 'omit' ? undefined : nonce));

    expect(response.headers.get('location')).toContain('error=invalid_state');
    expect(exchangeCodeForTokens).not.toHaveBeenCalled();
    expect(storeTokens).not.toHaveBeenCalled();
  });

  it('rejects state created for a different authenticated user', async () => {
    const { state, nonce } = createGoogleOAuthState('andrea');
    const response = await callback(callbackRequest(state, nonce));

    expect(response.headers.get('location')).toContain('error=invalid_state');
    expect(exchangeCodeForTokens).not.toHaveBeenCalled();
  });

  it('stores tokens only for the authenticated user after complete state validation', async () => {
    const { state, nonce } = createGoogleOAuthState('abe');
    const response = await callback(callbackRequest(state, nonce));

    expect(exchangeCodeForTokens).toHaveBeenCalledWith('google-code');
    expect(storeTokens).toHaveBeenCalledWith('abe', { access_token: 'access' }, 'abe@example.com');
    expect(response.headers.get('location')).toContain('success=google_connected');
    expect(response.headers.get('set-cookie')).toContain(`${GOOGLE_OAUTH_STATE_COOKIE}=`);
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0');
  });

  it('starts OAuth with signed state and a protected matching browser nonce', async () => {
    const response = await connect(new NextRequest('http://localhost/api/google/connect'));
    const body = await response.json();
    const state = new URL(body.auth_url).searchParams.get('state');
    const cookie = response.cookies.get(GOOGLE_OAUTH_STATE_COOKIE);

    expect(state).toBeTruthy();
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe('lax');
    expect(cookie?.path).toBe('/api/google/callback');
    expect(() => verifyGoogleOAuthState(state!, cookie?.value, 'abe')).not.toThrow();
  });
});
