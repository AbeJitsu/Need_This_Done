import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkRateLimit } from '@/lib/rate-limit';

describe('provider-free rate limiting', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('enforces an in-process limit without Redis when cache is disabled', async () => {
    vi.stubEnv('SKIP_CACHE', 'true');
    const identifier = `local-proof-${crypto.randomUUID()}`;
    const limit = { maxAttempts: 2, windowSeconds: 60 };

    await expect(checkRateLimit(identifier, limit, 'local proof')).resolves.toMatchObject({
      allowed: true,
      remaining: 1,
    });
    await expect(checkRateLimit(identifier, limit, 'local proof')).resolves.toMatchObject({
      allowed: true,
      remaining: 0,
    });
    await expect(checkRateLimit(identifier, limit, 'local proof')).resolves.toMatchObject({
      allowed: false,
      remaining: 0,
    });
  });
});
