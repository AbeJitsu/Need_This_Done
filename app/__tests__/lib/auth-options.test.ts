import { describe, expect, it } from 'vitest';
import { authOptions } from '@/lib/auth-options';

describe('hardened NextAuth Google transport', () => {
  it('rejects sign-in when Google did not return an ID token or email', async () => {
    const signIn = authOptions.callbacks?.signIn;
    expect(signIn).toBeTypeOf('function');

    await expect(signIn!({
      user: { id: 'google-id', email: 'user@example.com' },
      account: { provider: 'google', type: 'oauth', providerAccountId: 'google-id' },
      profile: undefined,
      credentials: undefined,
    })).resolves.toBe(false);
  });

  it('retains the short-lived Google assertion only in the encrypted server JWT', async () => {
    const jwt = authOptions.callbacks?.jwt;
    expect(jwt).toBeTypeOf('function');

    const token = await jwt!({
      token: { sub: 'user-id' },
      user: { id: 'user-id' },
      account: {
        provider: 'google',
        type: 'oauth',
        providerAccountId: 'google-id',
        id_token: 'signed-id-token',
        expires_at: 123,
      },
      profile: undefined,
      trigger: 'signIn',
      isNewUser: false,
      session: undefined,
    });

    expect(token).toMatchObject({
      provider: 'google',
      googleIdToken: 'signed-id-token',
      googleIdTokenExpiresAt: 123,
    });
  });
});
