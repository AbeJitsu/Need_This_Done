import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
// eslint-disable-next-line no-restricted-imports -- public demo endpoint, no auth required
import { supabase } from '@/lib/supabase';

// ============================================================================
// Demo API Route - /api/demo/items
// ============================================================================
// This route demonstrates the complete cache-first pattern:
//
// 1. GET request arrives at this endpoint
// 2. Check Redis cache for items
// 3. If cache miss, query Supabase database
// 4. Store result in Redis for 1 minute
// 5. Return response with metadata showing source
//
// This is a real example of how every API route should work:
// Try cache first (fast) → Fall back to database (slower) → Save to cache (future requests are instant)

interface DemoItem {
  id: string;
  content: string;
  timestamp: string;
}

interface ApiResponse {
  items: DemoItem[];
  source: 'cache' | 'database';
  cacheKey: string;
  message: string;
}

export async function GET() {
  try {
    const cacheKey = 'demo:items';

    // ====================================================================
    // Step 1: Check Redis Cache (Fast - ~2ms)
    // ====================================================================
    // Before hitting the database, see if we have this data in memory.
    // Redis is like a whiteboard: we write data there temporarily so future
    // requests can grab it instantly instead of going to the filing cabinet.

    let cachedData: string | null = null;
    try {
      cachedData = await redis.get(cacheKey);
    } catch (error) {
      console.error('Redis cache check failed:', error);
      // Redis error doesn't stop us - we'll just query the database instead
    }

    if (cachedData) {
      // ================================================================
      // Cache Hit: Return immediately
      // ================================================================
      // We found the data in Redis. This request took ~2ms instead of ~200ms.
      // This is why the page feels instant on repeat visits.

      return NextResponse.json({
        items: JSON.parse(cachedData),
        source: 'cache',
        cacheKey,
        message: 'Data loaded from cache (super fast)',
      } as ApiResponse);
    }

    // ====================================================================
    // Step 2: Cache Miss - Query Database (Slower - ~200ms)
    // ====================================================================
    // Redis didn't have it, so fetch from Supabase (the filing cabinet).
    // This is slower, but only happens when data isn't cached yet.

    const { data: items, error } = await supabase
      .from('demo_items')
      .select('id, content, timestamp')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      // If demo_items table doesn't exist yet, return sample data
      // This lets the demo work without requiring database setup
      console.warn('Could not fetch from demo_items table:', error.message);

      const sampleItems: DemoItem[] = [
        {
          id: '1',
          content: 'Sample item 1 - This demonstrates the database structure',
          timestamp: new Date(Date.now() - 60000).toLocaleTimeString(),
        },
        {
          id: '2',
          content: 'Sample item 2 - In production, these would be real database rows',
          timestamp: new Date(Date.now() - 120000).toLocaleTimeString(),
        },
      ];

      // Still cache the sample data for consistency
      try {
        await redis.setEx(cacheKey, 60, JSON.stringify(sampleItems));
      } catch (err) {
        console.error('Failed to cache sample data:', err);
      }

      return NextResponse.json({
        items: sampleItems,
        source: 'database',
        cacheKey,
        message: 'Sample data (demo_items table not yet created)',
      } as ApiResponse);
    }

    // ====================================================================
    // Step 3: Store in Cache for Next Time (TTL = 1 minute)
    // ====================================================================
    // Now that we have the fresh data, save it to Redis so the next request
    // gets the instant ~2ms response instead of waiting ~200ms.
    // TTL (time-to-live) of 60 seconds means cache expires after 1 minute.
    // After that, we fetch fresh data again. This balance keeps data current
    // while keeping pages fast.

    try {
      await redis.setEx(cacheKey, 60, JSON.stringify(items || []));
    } catch (error) {
      console.error('Failed to cache items:', error);
      // Cache error doesn't stop us - we still return the data
    }

    // ====================================================================
    // Step 4: Return Response with Metadata
    // ====================================================================
    // Tell the client where the data came from. This helps them understand
    // the cache-first pattern is working.

    return NextResponse.json({
      items: items || [],
      source: 'database',
      cacheKey,
      message: 'Data fetched from database (slower). Cached for 60 seconds. Next request will be instant.',
    } as ApiResponse);
  } catch (error) {
    console.error('Items endpoint error:', error);

    return NextResponse.json(
      {
        items: [],
        source: 'database' as const,
        cacheKey: 'demo:items',
        message: 'Error fetching items',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // ====================================================================
    // Save to Database
    // ====================================================================
    // When a user creates a new item, save it permanently to Supabase.

    const { data: newItem, error } = await supabase
      .from('demo_items')
      .insert({
        content: content.trim(),
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // If table doesn't exist, still respond with success so demo works
      console.warn('Could not insert into demo_items table:', error.message);

      const sampleItem: DemoItem = {
        id: Date.now().toString(),
        content: content.trim(),
        timestamp: new Date().toLocaleTimeString(),
      };

      // Invalidate cache so GET request will see this new item
      try {
        await redis.del('demo:items');
      } catch (err) {
        console.error('Failed to invalidate cache:', err);
      }

      return NextResponse.json({
        item: sampleItem,
        message: 'Item saved (demo mode - not persisted)',
      });
    }

    // ====================================================================
    // Invalidate Cache
    // ====================================================================
    // Since we added a new item, the cached list is now stale.
    // Delete it from Redis so the next GET request fetches fresh data
    // and includes this new item.

    try {
      await redis.del('demo:items');
    } catch (error) {
      console.error('Failed to invalidate cache:', error);
      // Cache deletion error doesn't stop us from returning success
    }

    return NextResponse.json({
      item: newItem,
      message: 'Item saved and cache invalidated',
    });
  } catch (error) {
    console.error('Items POST error:', error);

    return NextResponse.json(
      { error: 'Failed to save item' },
      { status: 500 }
    );
  }
}
