// ============================================================================
// Request Deduplication - Concurrency & Atomicity Tests
// ============================================================================
// What: Verify request deduplication works correctly under concurrent load
// Why: Race conditions in dedup can allow concurrent identical requests to slip through
// How: Send concurrent identical requests and verify only one is processed
//
// CRITICAL: This test validates that Redis SET NX + EX atomicity prevents the race condition
// where concurrent requests both check-for-existence-then-set, allowing duplicates through.

import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest';
import {
  createRequestFingerprint,
  checkAndMarkRequest,
  clearRequestFingerprint,
} from '@/lib/request-dedup';
import { redis } from '@/lib/redis';

// ============================================================================
// Request Deduplication - Concurrency & Atomicity Tests
// ============================================================================
// These tests require a live Redis connection (Upstash in production).
// Tests are skipped gracefully when Redis is unavailable.

describe('Request Deduplication - Atomicity & Concurrency', () => {
  // Test data
  const testData = {
    email: 'test@example.com',
    name: 'Test User',
    action: 'submit-form',
  };

  // Track if Redis is available
  let redisAvailable = false;

  beforeAll(async () => {
    // Check if Redis is available before running tests (with 2s timeout)
    try {
      const pingPromise = redis.ping();
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Redis ping timeout')), 2000)
      );
      await Promise.race([pingPromise, timeoutPromise]);
      redisAvailable = true;
    } catch {
      console.warn('[Test] Redis unavailable - skipping Redis-dependent tests');
      redisAvailable = false;
    }
  }, 5000); // 5s hook timeout

  beforeEach(async () => {
    if (!redisAvailable) return;

    // Clear Redis before each test to ensure clean state
    const pattern = 'dedup:*';
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  });

  afterEach(async () => {
    if (!redisAvailable) return;

    // Clean up after each test
    const pattern = 'dedup:*';
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  });

  // Helper to skip tests when Redis unavailable
  const itWithRedis = (name: string, fn: () => Promise<void>) => {
    it(name, async () => {
      if (!redisAvailable) {
        console.log(`[Skipped] ${name} - Redis unavailable`);
        return;
      }
      await fn();
    });
  };

  // ========================================================================
  // Pure unit tests (no Redis needed)
  // ========================================================================

  it('should create consistent fingerprint for identical data', () => {
    const fp1 = createRequestFingerprint(testData);
    const fp2 = createRequestFingerprint(testData);
    expect(fp1).toBe(fp2);
  });

  it('should create different fingerprints for different data', () => {
    const fp1 = createRequestFingerprint(testData);
    const fp2 = createRequestFingerprint({ ...testData, email: 'other@example.com' });
    expect(fp1).not.toBe(fp2);
  });

  it('should create different fingerprints for different user IDs', () => {
    const fp1 = createRequestFingerprint(testData, 'user-1');
    const fp2 = createRequestFingerprint(testData, 'user-2');
    expect(fp1).not.toBe(fp2);
  });

  // ========================================================================
  // Redis-dependent tests (skipped when Redis unavailable)
  // ========================================================================

  itWithRedis('should mark a new request as allowed (not duplicate)', async () => {
    const fingerprint = createRequestFingerprint(testData);
    const isNew = await checkAndMarkRequest(fingerprint, 'test-operation');
    expect(isNew).toBe(true);
  });

  itWithRedis('should mark a second request with same fingerprint as duplicate', async () => {
    const fingerprint = createRequestFingerprint(testData);

    // First request
    const isNew1 = await checkAndMarkRequest(fingerprint, 'test-operation');
    expect(isNew1).toBe(true);

    // Second request (duplicate)
    const isNew2 = await checkAndMarkRequest(fingerprint, 'test-operation');
    expect(isNew2).toBe(false);
  });

  itWithRedis('should prevent duplicates even under rapid successive calls', async () => {
    const fingerprint = createRequestFingerprint(testData);

    // Call checkAndMarkRequest 5 times rapidly
    const results = await Promise.all(
      Array(5)
        .fill(null)
        .map(() => checkAndMarkRequest(fingerprint, 'rapid-test'))
    );

    // Exactly one should be true (the first one that won the race)
    const allowedCount = results.filter(r => r === true).length;
    expect(allowedCount).toBe(1);

    // All others should be false (duplicates)
    const duplicateCount = results.filter(r => r === false).length;
    expect(duplicateCount).toBe(4);
  });

  itWithRedis('should allow new requests after dedup window expires', async () => {
    const fingerprint = createRequestFingerprint(testData);

    // First request
    const isNew1 = await checkAndMarkRequest(fingerprint, 'test-operation');
    expect(isNew1).toBe(true);

    // Second request immediately after (should be duplicate)
    const isNew2 = await checkAndMarkRequest(fingerprint, 'test-operation');
    expect(isNew2).toBe(false);

    // Clear the fingerprint (simulating TTL expiration)
    await clearRequestFingerprint(fingerprint);

    // Third request after expiration (should be allowed)
    const isNew3 = await checkAndMarkRequest(fingerprint, 'test-operation');
    expect(isNew3).toBe(true);
  });

  itWithRedis('should handle high concurrent load without race conditions', async () => {
    const fingerprint = createRequestFingerprint(testData);

    // Simulate 20 concurrent requests with the same fingerprint
    // (e.g., from a load balancer distributing requests to multiple instances)
    const concurrentRequests = Array(20)
      .fill(null)
      .map(() => checkAndMarkRequest(fingerprint, 'high-concurrency-test'));

    const results = await Promise.all(concurrentRequests);

    // Should have exactly 1 success and 19 duplicates
    const successes = results.filter(r => r === true).length;
    const duplicates = results.filter(r => r === false).length;

    expect(successes).toBe(1);
    expect(duplicates).toBe(19);
  });

  itWithRedis('should maintain isolation between different fingerprints', async () => {
    const fp1 = createRequestFingerprint(testData);
    const fp2 = createRequestFingerprint({ ...testData, email: 'other@example.com' });

    // Both should be allowed (different fingerprints)
    const isNew1 = await checkAndMarkRequest(fp1, 'test-1');
    const isNew2 = await checkAndMarkRequest(fp2, 'test-2');

    expect(isNew1).toBe(true);
    expect(isNew2).toBe(true);

    // Duplicates should only be detected within same fingerprint
    const isDup1 = await checkAndMarkRequest(fp1, 'test-1');
    const isDup2 = await checkAndMarkRequest(fp2, 'test-2');

    expect(isDup1).toBe(false);
    expect(isDup2).toBe(false);
  });

  itWithRedis('should handle per-user deduplication correctly', async () => {
    const userId1 = 'user-123';
    const userId2 = 'user-456';

    const fp1 = createRequestFingerprint(testData, userId1);
    const fp2 = createRequestFingerprint(testData, userId2);

    // Same data, different users = different fingerprints
    expect(fp1).not.toBe(fp2);

    // Both should be allowed
    const isNew1 = await checkAndMarkRequest(fp1, 'user-1-operation');
    const isNew2 = await checkAndMarkRequest(fp2, 'user-2-operation');

    expect(isNew1).toBe(true);
    expect(isNew2).toBe(true);

    // Duplicates within same user should be blocked
    const isDup1 = await checkAndMarkRequest(fp1, 'user-1-operation');
    const isDup2 = await checkAndMarkRequest(fp2, 'user-2-operation');

    expect(isDup1).toBe(false);
    expect(isDup2).toBe(false);
  });

  itWithRedis('should survive data mutation in input', async () => {
    const data = { email: 'test@example.com', name: 'Test' };
    const fp1 = createRequestFingerprint(data);

    // Mark as processed
    const isNew = await checkAndMarkRequest(fp1, 'mutation-test');
    expect(isNew).toBe(true);

    // Even if we mutate the original object, the fingerprint should remain consistent
    data.name = 'Different Name';
    const fp2 = createRequestFingerprint(data);

    // Different data = different fingerprint
    expect(fp2).not.toBe(fp1);

    // But can still be marked with the mutated fingerprint
    const isNew2 = await checkAndMarkRequest(fp2, 'mutation-test');
    expect(isNew2).toBe(true);
  });

  itWithRedis('should trace dedup behavior in logs during concurrent operations', async () => {
    const fingerprint = createRequestFingerprint(testData);

    // Capture any console output (using Vitest's vi.spyOn)
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Run 3 concurrent requests
    await Promise.all([
      checkAndMarkRequest(fingerprint, 'logged-test'),
      checkAndMarkRequest(fingerprint, 'logged-test'),
      checkAndMarkRequest(fingerprint, 'logged-test'),
    ]);

    // Should have logged duplicate blocks
    const duplicateWarnings = consoleWarnSpy.mock.calls.filter(call =>
      String(call[0]).includes('Blocked duplicate')
    );

    // At least 2 should be logged as duplicates
    expect(duplicateWarnings.length).toBeGreaterThanOrEqual(2);

    consoleWarnSpy.mockRestore();
  });
});
