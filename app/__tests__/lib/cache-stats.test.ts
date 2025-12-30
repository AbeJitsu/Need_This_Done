import { describe, it, expect, beforeEach } from 'vitest';
import { cacheStats, resetStats } from '@/lib/cache-stats';

// ============================================================================
// Cache Stats Unit Tests
// ============================================================================
// What: Tests for cache hit/miss tracking and statistics
// Why: Ensures we can monitor cache performance accurately
// How: Tests the stats tracking functions directly

describe('cacheStats', () => {
  beforeEach(() => {
    resetStats();
  });

  describe('recordHit', () => {
    it('should increment hit count for a key pattern', () => {
      cacheStats.recordHit('page:home');
      cacheStats.recordHit('page:home');
      cacheStats.recordHit('page:about');

      const stats = cacheStats.getStats();
      expect(stats.byPattern['page:*'].hits).toBe(3);
    });

    it('should track total hits', () => {
      cacheStats.recordHit('page:home');
      cacheStats.recordHit('cart:123');

      const stats = cacheStats.getStats();
      expect(stats.total.hits).toBe(2);
    });
  });

  describe('recordMiss', () => {
    it('should increment miss count for a key pattern', () => {
      cacheStats.recordMiss('page:home');
      cacheStats.recordMiss('page:about');

      const stats = cacheStats.getStats();
      expect(stats.byPattern['page:*'].misses).toBe(2);
    });

    it('should track total misses', () => {
      cacheStats.recordMiss('page:home');
      cacheStats.recordMiss('cart:123');

      const stats = cacheStats.getStats();
      expect(stats.total.misses).toBe(2);
    });
  });

  describe('hit rate calculation', () => {
    it('should calculate hit rate correctly', () => {
      cacheStats.recordHit('page:home');
      cacheStats.recordHit('page:home');
      cacheStats.recordHit('page:home');
      cacheStats.recordMiss('page:about');

      const stats = cacheStats.getStats();
      // 3 hits, 1 miss = 75% hit rate
      expect(stats.byPattern['page:*'].hitRate).toBe(0.75);
      expect(stats.total.hitRate).toBe(0.75);
    });

    it('should return 0 hit rate when no requests', () => {
      const stats = cacheStats.getStats();
      expect(stats.total.hitRate).toBe(0);
    });

    it('should return 1 hit rate when all hits', () => {
      cacheStats.recordHit('page:home');
      cacheStats.recordHit('page:home');

      const stats = cacheStats.getStats();
      expect(stats.total.hitRate).toBe(1);
    });
  });

  describe('pattern grouping', () => {
    it('should group keys by their pattern prefix', () => {
      cacheStats.recordHit('page:home');
      cacheStats.recordHit('page:about');
      cacheStats.recordHit('cart:123');
      cacheStats.recordHit('cart:456');
      cacheStats.recordMiss('user:projects:abc');

      const stats = cacheStats.getStats();
      expect(stats.byPattern['page:*']).toBeDefined();
      expect(stats.byPattern['cart:*']).toBeDefined();
      expect(stats.byPattern['user:*']).toBeDefined();
    });
  });

  describe('resetStats', () => {
    it('should clear all statistics', () => {
      cacheStats.recordHit('page:home');
      cacheStats.recordMiss('cart:123');

      resetStats();

      const stats = cacheStats.getStats();
      expect(stats.total.hits).toBe(0);
      expect(stats.total.misses).toBe(0);
      expect(Object.keys(stats.byPattern)).toHaveLength(0);
    });
  });
});
