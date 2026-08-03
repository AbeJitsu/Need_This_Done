import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createGoogleOAuthState,
  GOOGLE_OAUTH_STATE_MAX_AGE_SECONDS,
  verifyGoogleOAuthState,
} from '@/lib/google-oauth-state';

describe('Google OAuth state', () => {
  beforeEach(() => {
    vi.stubEnv('GOOGLE_OAUTH_STATE_SECRET', 'a-test-secret-that-is-at-least-32-characters');
  });

  it('accepts a signed, current state bound to the same user and nonce', () => {
    const issuedAt = 1_000_000;
    const { state, nonce } = createGoogleOAuthState('abe', issuedAt);
    expect(verifyGoogleOAuthState(state, nonce, 'abe', issuedAt + 1_000).userId).toBe('abe');
  });

  it.each([
    ['forged signature', (state: string, nonce: string) => [`${state}x`, nonce, 'abe'] as const],
    ['missing state cookie', (state: string) => [state, undefined, 'abe'] as const],
    ['different browser nonce', (state: string) => [state, 'attacker-nonce', 'abe'] as const],
    ['different authenticated user', (state: string, nonce: string) => [state, nonce, 'andrea'] as const],
  ])('rejects %s', (_label, alter) => {
    const { state, nonce } = createGoogleOAuthState('abe', 1_000_000);
    expect(() => verifyGoogleOAuthState(...alter(state, nonce), 1_001_000)).toThrow();
  });

  it('rejects expired and future-issued states', () => {
    const issuedAt = 1_000_000;
    const { state, nonce } = createGoogleOAuthState('abe', issuedAt);
    expect(() => verifyGoogleOAuthState(
      state, nonce, 'abe', issuedAt + GOOGLE_OAUTH_STATE_MAX_AGE_SECONDS * 1000 + 1
    )).toThrow('state_expired');
    expect(() => verifyGoogleOAuthState(state, nonce, 'abe', issuedAt - 1)).toThrow('state_expired');
  });
});
