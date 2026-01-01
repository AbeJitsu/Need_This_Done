// ============================================================================
// Cache Statistics - Track Cache Hit/Miss Rates
// ============================================================================
// What: Provides hit rate monitoring for Redis cache
// Why: Helps identify caching efficiency and potential improvements
// How: Records hits/misses and calculates rates per key pattern
//
// Usage:
// - Called automatically by cache.wrap() to track performance
// - Query stats via /api/admin/cache-stats endpoint
// - Reset stats periodically or on demand

// ============================================================================
// Types
// ============================================================================

interface PatternStats {
  hits: number;
  misses: number;
  hitRate: number;
}

interface CacheStatsData {
  total: PatternStats;
  byPattern: Record<string, PatternStats>;
  startTime: number;
}

// ============================================================================
// In-Memory Stats Storage
// ============================================================================
// Stats are stored in memory for simplicity
// In production, could be moved to Redis for persistence across restarts

let stats: CacheStatsData = createInitialStats();

function createInitialStats(): CacheStatsData {
  return {
    total: { hits: 0, misses: 0, hitRate: 0 },
    byPattern: {},
    startTime: Date.now(),
  };
}

// ============================================================================
// Pattern Extraction
// ============================================================================
// Groups keys by their prefix for aggregate reporting
// e.g., "page:home" -> "page:*", "user:projects:123" -> "user:*"

function getPattern(key: string): string {
  const colonIndex = key.indexOf(':');
  if (colonIndex === -1) return key;
  return key.substring(0, colonIndex + 1) + '*';
}

// ============================================================================
// Stats Recording
// ============================================================================

function recordHit(key: string): void {
  const pattern = getPattern(key);

  // Update pattern stats
  if (!stats.byPattern[pattern]) {
    stats.byPattern[pattern] = { hits: 0, misses: 0, hitRate: 0 };
  }
  stats.byPattern[pattern].hits++;
  updateHitRate(stats.byPattern[pattern]);

  // Update totals
  stats.total.hits++;
  updateHitRate(stats.total);
}

function recordMiss(key: string): void {
  const pattern = getPattern(key);

  // Update pattern stats
  if (!stats.byPattern[pattern]) {
    stats.byPattern[pattern] = { hits: 0, misses: 0, hitRate: 0 };
  }
  stats.byPattern[pattern].misses++;
  updateHitRate(stats.byPattern[pattern]);

  // Update totals
  stats.total.misses++;
  updateHitRate(stats.total);
}

function updateHitRate(patternStats: PatternStats): void {
  const total = patternStats.hits + patternStats.misses;
  patternStats.hitRate = total > 0 ? patternStats.hits / total : 0;
}

// ============================================================================
// Stats Retrieval
// ============================================================================

interface CacheStatsResult {
  total: PatternStats;
  byPattern: Record<string, PatternStats>;
  uptimeSeconds: number;
  requestsPerSecond: number;
}

function getStats(): CacheStatsResult {
  const uptimeSeconds = Math.floor((Date.now() - stats.startTime) / 1000);
  const totalRequests = stats.total.hits + stats.total.misses;
  const requestsPerSecond = uptimeSeconds > 0 ? totalRequests / uptimeSeconds : 0;

  return {
    total: { ...stats.total },
    byPattern: { ...stats.byPattern },
    uptimeSeconds,
    requestsPerSecond,
  };
}

// ============================================================================
// Reset Stats
// ============================================================================

function resetStats(): void {
  stats = createInitialStats();
}

// ============================================================================
// Export
// ============================================================================

export const cacheStats = {
  recordHit,
  recordMiss,
  getStats,
};

export { resetStats };
