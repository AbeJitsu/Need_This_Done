import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// ============================================================================
// Embeddings Check API - GET /api/embeddings/check
// ============================================================================
// What: Checks if a page is already indexed with the current content hash
// Why: Avoid re-indexing unchanged pages (saves API costs and time)
// How: Query page_embeddings table for matching URL + hash

/**
 * GET /api/embeddings/check
 *
 * Query parameters:
 * - page_url: The URL path to check (required)
 * - content_hash: The SHA-256 hash of current content (required)
 *
 * Returns:
 * - indexed: boolean - Whether the page is indexed with this hash
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageUrl = searchParams.get('page_url');
    const contentHash = searchParams.get('content_hash');

    // Validate required parameters
    if (!pageUrl || !contentHash) {
      return NextResponse.json(
        { error: 'Missing required parameters: page_url and content_hash' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Check if any embedding exists for this URL with this exact hash
    // We only need to check one record since all chunks share the same hash
    console.log(`[Check] Searching for page_url="${pageUrl}" with hash="${contentHash}"`);

    const { data, error } = await supabase
      .from('page_embeddings')
      .select('id, content_hash')
      .eq('page_url', pageUrl)
      .eq('content_hash', contentHash)
      .limit(1);

    console.log(`[Check] Query result: data=${data?.length || 0} rows, error=`, error);

    // Handle gracefully: PGRST205 = table doesn't exist
    // If embeddings feature isn't set up, just return not indexed
    if (error) {
      if (error.code === 'PGRST205') {
        // Table doesn't exist - embeddings feature not set up
        return NextResponse.json({
          indexed: false,
          page_url: pageUrl,
          content_hash: contentHash,
          reason: 'embeddings_not_configured',
        });
      }
      console.error('Error checking embeddings:', error);
      return NextResponse.json(
        { error: 'Database error while checking embeddings' },
        { status: 500 }
      );
    }

    // Page is indexed if we found a matching record
    const isIndexed = data && data.length > 0;
    console.log(`[Check] Result: indexed=${isIndexed}`);

    return NextResponse.json({
      indexed: isIndexed,
      page_url: pageUrl,
      content_hash: contentHash,
    });
  } catch (error) {
    console.error('Embeddings check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
