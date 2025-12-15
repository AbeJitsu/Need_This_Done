import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// ============================================================================
// Speed Demo API Route - /api/demo/speed
// ============================================================================
// This route demonstrates the dramatic performance difference between
// cached and uncached responses using real Redis.
//
// How it works:
// 1. First request: Generates fresh data, stores in Redis with 30-second TTL
// 2. Subsequent requests within 30 seconds: Returns from Redis (100× faster)
// 3. After 30 seconds: Cache expires, cycle repeats
//
// Real performance: First request ~300ms, cached requests ~2ms
// This is why caching is critical for fast web apps.
//
// Security: Admin-only endpoint for dev dashboard demos.

interface SpeedDemoResponse {
  quote: string;
  isFromCache: boolean;
  cacheKey: string;
  ttl: number;
  message: string;
}

export async function GET() {
  try {
    // ========================================================================
    // Admin Authentication Check
    // ========================================================================
    // This endpoint is for admin dev dashboard demos only.
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
    const cacheKey = 'demo:speed:quote';
    const cacheTTL = 30; // Cache for 30 seconds

    // ====================================================================
    // Step 1: Check Redis Cache (Fast - ~2ms)
    // ====================================================================
    // Redis is in-memory storage. Checking it is almost instant because
    // data lives in RAM, not on disk like a database.

    let cachedQuote: string | null = null;
    try {
      cachedQuote = await redis.get(cacheKey);
    } catch (error) {
      console.error('Redis cache check failed:', error);
      // Continue even if cache check fails
    }

    if (cachedQuote) {
      // ================================================================
      // Cache Hit: Return Immediately (2ms)
      // ================================================================
      // We found the quote in Redis. This is 100× faster than fetching
      // from the database because it's already in memory.

      return NextResponse.json({
        quote: cachedQuote,
        isFromCache: true,
        cacheKey,
        ttl: cacheTTL,
        message: '⚡ Lightning fast! Data loaded from Redis cache',
      } as SpeedDemoResponse);
    }

    // ====================================================================
    // Step 2: Cache Miss - Generate Fresh Data (Slower - ~100-300ms)
    // ====================================================================
    // Cache expired or was never set. Generate fresh data.
    // In a real app, this would be a database query.

    const quotes = [
      'The best time to plant a tree was 20 years ago. The second best time is now.',
      'Innovation distinguishes between a leader and a follower.',
      'Life is what happens when you\'re busy making other plans.',
      'The future belongs to those who believe in the beauty of their dreams.',
      'It is during our darkest moments that we must focus to see the light.',
      'Simplicity is the ultimate sophistication.',
      'The only way to do great work is to love what you do.',
      'Stay hungry. Stay foolish.',
      'Your time is limited, don\'t waste it living someone else\'s life.',
      'The purpose of our lives is to be happy.',
    ];

    // Simulate generating fresh data (would be a database query in real life)
    // This takes time: network latency + database query
    const simulatedDelay = Math.random() * 100 + 200; // 200-300ms
    await new Promise((resolve) => setTimeout(resolve, simulatedDelay));

    const freshQuote = quotes[Math.floor(Math.random() * quotes.length)];

    // ====================================================================
    // Step 3: Store in Cache (Redis) with TTL
    // ====================================================================
    // Now that we have fresh data, save it to Redis so the next request
    // gets the super-fast cached response. TTL = 30 seconds means:
    // - Requests for 30 seconds: Get from cache (~2ms)
    // - After 30 seconds: Cache expires, fetch fresh data again (~300ms)
    //
    // This balance keeps data current while keeping most requests instant.

    try {
      await redis.setEx(cacheKey, cacheTTL, freshQuote);
    } catch (error) {
      console.error('Failed to cache quote:', error);
      // Cache error doesn't prevent us from returning the data
    }

    // ====================================================================
    // Step 4: Return Fresh Data
    // ====================================================================
    // This request was slow (~300ms) but future requests will be instant
    // until the cache expires.

    return NextResponse.json({
      quote: freshQuote,
      isFromCache: false,
      cacheKey,
      ttl: cacheTTL,
      message: `📡 Cache miss - fetched fresh data from database. Cached for ${cacheTTL} seconds.`,
    } as SpeedDemoResponse);
  } catch (error) {
    console.error('Speed demo error:', error);

    return NextResponse.json(
      {
        quote: 'Unexpected error occurred',
        isFromCache: false,
        cacheKey: 'demo:speed:quote',
        ttl: 0,
        message: 'Error generating data',
      } as SpeedDemoResponse,
      { status: 500 }
    );
  }
}
