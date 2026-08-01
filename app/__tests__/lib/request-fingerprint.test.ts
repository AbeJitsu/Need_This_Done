import { describe, expect, it } from 'vitest';
import { createRequestFingerprint } from '@/lib/request-dedup';

describe('request fingerprints', () => {
  const request = { email: 'test@example.com', name: 'Test User', action: 'submit-form' };

  it('is stable for identical input', () => {
    expect(createRequestFingerprint(request)).toBe(createRequestFingerprint(request));
  });

  it('changes when request data changes', () => {
    expect(createRequestFingerprint(request)).not.toBe(
      createRequestFingerprint({ ...request, email: 'other@example.com' }),
    );
  });

  it('isolates different users', () => {
    expect(createRequestFingerprint(request, 'user-1')).not.toBe(
      createRequestFingerprint(request, 'user-2'),
    );
  });
});
