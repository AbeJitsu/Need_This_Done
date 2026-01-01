import { NextResponse } from 'next/server';
import { cache } from '@/lib/cache';
import { resetStats } from '@/lib/cache-stats';
import { isAdmin } from '@/lib/auth';

// ============================================================================
// Admin Cache Stats API
// ============================================================================
// What: Provides cache hit/miss statistics for monitoring
// Why: Helps identify caching efficiency and potential improvements
// How: Returns aggregated stats by pattern and total hit rates
//
// Endpoints:
// - GET: Retrieve current cache statistics
// - POST: Reset cache statistics (useful for fresh monitoring periods)

/**
 * GET /api/admin/cache-stats
 *
 * Returns cache statistics including:
 * - Total hits, misses, and hit rate
 * - Per-pattern breakdown (e.g., page:*, user:*, admin:*)
 * - Uptime and requests per second
 */
export async function GET() {
  try {
    // Verify admin access
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = cache.getStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve cache statistics' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/cache-stats
 *
 * Resets cache statistics to zero.
 * Useful for:
 * - Starting fresh monitoring periods
 * - After deployments
 * - Testing cache efficiency changes
 */
export async function POST() {
  try {
    // Verify admin access
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    resetStats();

    return NextResponse.json({ message: 'Cache statistics reset' });
  } catch (error) {
    console.error('Failed to reset cache stats:', error);
    return NextResponse.json(
      { error: 'Failed to reset cache statistics' },
      { status: 500 }
    );
  }
}
