import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

export const GOOGLE_OAUTH_STATE_COOKIE = 'needthisdone_google_oauth_state';
export const GOOGLE_OAUTH_STATE_MAX_AGE_SECONDS = 15 * 60;

type OAuthStatePayload = {
  userId: string;
  nonce: string;
  issuedAt: number;
};

function getSigningSecret(): string {
  const secret = process.env.GOOGLE_OAUTH_STATE_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('Google OAuth state signing secret must be configured with at least 32 characters.');
  }
  return secret;
}

function sign(encodedPayload: string): string {
  return createHmac('sha256', getSigningSecret()).update(encodedPayload).digest('base64url');
}

export function createGoogleOAuthState(userId: string, now = Date.now()): {
  state: string;
  nonce: string;
} {
  const nonce = randomBytes(32).toString('base64url');
  const payload: OAuthStatePayload = { userId, nonce, issuedAt: now };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return { state: `${encodedPayload}.${sign(encodedPayload)}`, nonce };
}

export function verifyGoogleOAuthState(
  state: string,
  expectedNonce: string | undefined,
  authenticatedUserId: string,
  now = Date.now()
): OAuthStatePayload {
  if (!expectedNonce) throw new Error('missing_state_cookie');

  const [encodedPayload, providedSignature, extra] = state.split('.');
  if (!encodedPayload || !providedSignature || extra) throw new Error('invalid_state');

  const expectedSignature = sign(encodedPayload);
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    throw new Error('invalid_state');
  }

  let payload: OAuthStatePayload;
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
  } catch {
    throw new Error('invalid_state');
  }

  if (
    typeof payload.userId !== 'string' ||
    typeof payload.nonce !== 'string' ||
    typeof payload.issuedAt !== 'number' ||
    payload.userId !== authenticatedUserId ||
    payload.nonce !== expectedNonce
  ) {
    throw new Error('invalid_state');
  }

  const age = now - payload.issuedAt;
  if (age < 0 || age > GOOGLE_OAUTH_STATE_MAX_AGE_SECONDS * 1000) {
    throw new Error('state_expired');
  }

  return payload;
}
