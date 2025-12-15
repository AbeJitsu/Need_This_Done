import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// ============================================================================
// Embeddings Status API - GET /api/embeddings/status
// ============================================================================
// What: Returns status information about indexed pages
// Why: Debugging tool to verify pages are being indexed correctly
// How: Queries page_embeddings table for summary statistics

/**
 * GET /api/embeddings/status
 *
 * Query parameters (all optional):
 * - page_url: Filter to a specific page URL
 *
 * Returns:
 * - total_pages: Number of unique pages indexed
 * - total_chunks: Total number of content chunks
 * - pages: Array of indexed pages with details
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageUrl = searchParams.get('page_url');

    const supabase = getSupabaseAdmin();

    // ========================================================================
    // Build query based on whether filtering by page_url
    // ========================================================================
    let query = supabase
      .from('page_embeddings')
      .select('page_url, page_title, page_type, content_hash, created_at');

    if (pageUrl) {
      query = query.eq('page_url', pageUrl);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching embeddings status:', error);
      return NextResponse.json(
        { error: 'Database error while fetching status' },
        { status: 500 }
      );
    }

    // ========================================================================
    // Aggregate data by page URL
    // ========================================================================
    const pageMap = new Map<string, {
      url: string;
      title: string;
      type: string;
      chunks: number;
      content_hash: string;
      indexed_at: string;
    }>();

    for (const row of data || []) {
      const existing = pageMap.get(row.page_url);
      if (existing) {
        existing.chunks += 1;
      } else {
        pageMap.set(row.page_url, {
          url: row.page_url,
          title: row.page_title,
          type: row.page_type || 'static',
          chunks: 1,
          content_hash: row.content_hash,
          indexed_at: row.created_at,
        });
      }
    }

    const pages = Array.from(pageMap.values());
    const totalChunks = data?.length || 0;

    return NextResponse.json({
      total_pages: pages.length,
      total_chunks: totalChunks,
      pages,
    });
  } catch (error) {
    console.error('Embeddings status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
