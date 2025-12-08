import { NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';
import { getSupabaseAdmin } from '@/lib/supabase';

// ============================================================================
// Embeddings Debug API - GET /api/embeddings/debug
// ============================================================================
// What: Debug tool to inspect embeddings and test vector search
// Why: Helps diagnose why chatbot isn't finding relevant content
// How: Shows content chunks and tests vector similarity search

/**
 * GET /api/embeddings/debug
 *
 * Query parameters:
 * - query: Test query for vector search (optional)
 * - show_content: Show content chunks (default: true)
 *
 * Returns debug info about embeddings and vector search results
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const testQuery = searchParams.get('query');
    const showContent = searchParams.get('show_content') !== 'false';

    const supabase = getSupabaseAdmin();

    // ========================================================================
    // Get all embeddings with content (including embedding for validation)
    // ========================================================================
    const { data: embeddings, error: fetchError } = await supabase
      .from('page_embeddings')
      .select('id, page_url, page_title, page_type, content_chunk, embedding, created_at')
      .order('created_at', { ascending: false });

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Build response with content preview and embedding validation
    const embeddingsInfo = embeddings?.map(e => ({
      id: e.id,
      page_url: e.page_url,
      page_title: e.page_title,
      page_type: e.page_type,
      content_length: e.content_chunk?.length || 0,
      has_embedding: !!e.embedding,
      embedding_length: Array.isArray(e.embedding) ? e.embedding.length : (typeof e.embedding === 'string' ? 'string' : 0),
      content_preview: showContent
        ? (e.content_chunk?.substring(0, 500) + (e.content_chunk?.length > 500 ? '...' : ''))
        : '[hidden]',
      created_at: e.created_at,
    })) || [];

    // ========================================================================
    // Test vector search if query provided
    // ========================================================================
    let searchResults = null;
    if (testQuery) {
      // Generate embedding for test query
      const { embedding } = await embed({
        model: openai.embedding('text-embedding-3-small'),
        value: testQuery,
      });

      // Run similarity search - try both formats
      const embeddingStr = `[${embedding.join(',')}]`;

      // First try with string format
      const { data: matches, error: searchError } = await supabase.rpc(
        'match_page_embeddings',
        {
          query_embedding: embeddingStr,
          match_threshold: 0.0, // Zero threshold to get ALL results
          match_count: 10,
        }
      );

      // If no results, try with array format
      let matches2 = null;
      let searchError2 = null;
      if (!matches || matches.length === 0) {
        const result2 = await supabase.rpc(
          'match_page_embeddings',
          {
            query_embedding: embedding,
            match_threshold: 0.0,
            match_count: 10,
          }
        );
        matches2 = result2.data;
        searchError2 = result2.error;
      }

      const finalMatches = matches?.length ? matches : matches2;
      searchResults = {
        query: testQuery,
        string_format_error: searchError?.message || null,
        string_format_count: matches?.length || 0,
        array_format_error: searchError2?.message || null,
        array_format_count: matches2?.length || 0,
        match_count: finalMatches?.length || 0,
        matches: finalMatches?.map((m: {
          page_title: string;
          page_url: string;
          content_chunk: string;
          similarity: number;
        }) => ({
          page_title: m.page_title,
          page_url: m.page_url,
          similarity: m.similarity,
          content_preview: m.content_chunk?.substring(0, 200) + '...',
        })) || [],
      };
    }

    return NextResponse.json({
      total_embeddings: embeddings?.length || 0,
      embeddings: embeddingsInfo,
      search_results: searchResults,
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
