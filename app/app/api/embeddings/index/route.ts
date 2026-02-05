import { NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { embedMany } from 'ai';
import { getSupabaseAdmin } from '@/lib/supabase';
import { chunkText } from '@/lib/chatbot';
import { verifyAdmin } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

// ============================================================================
// Embeddings Index API - POST /api/embeddings/index
// ============================================================================
// What: Indexes page content by generating embeddings and storing them
// Why: Enables semantic search for the chatbot
// How: Chunk content → Generate embeddings → Store in pgvector

/**
 * Request body type for indexing
 */
interface IndexRequest {
  page_url: string;
  page_title: string;
  page_type?: 'static' | 'cms' | 'product';
  content: string;
  content_hash: string;
  metadata?: Record<string, unknown>;
}

/**
 * POST /api/embeddings/index
 *
 * Indexes a page's content for semantic search:
 * 1. Deletes any existing embeddings for this page
 * 2. Chunks the content into smaller pieces
 * 3. Generates embeddings for each chunk using OpenAI
 * 4. Stores the chunks and embeddings in the database
 */
export async function POST(request: Request) {
  try {
    // Admin-only - embedding indexing can overwrite chatbot knowledge
    const auth = await verifyAdmin();
    if (auth.error) {
      return auth.error;
    }

    const body: IndexRequest = await request.json();

    const {
      page_url,
      page_title,
      page_type = 'static',
      content,
      content_hash,
      metadata = {},
    } = body;

    // ========================================================================
    // Validate required fields
    // ========================================================================
    if (!page_url || !page_title || !content || !content_hash) {
      return NextResponse.json(
        {
          error: 'Missing required fields: page_url, page_title, content, content_hash',
        },
        { status: 400 }
      );
    }

    // Minimum content length check
    if (content.length < 50) {
      return NextResponse.json(
        { error: 'Content too short to index (minimum 50 characters)' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // ========================================================================
    // Step 1: Delete existing embeddings for this page
    // ========================================================================
    // We do a full re-index rather than partial updates for simplicity
    const { error: deleteError } = await supabase
      .from('page_embeddings')
      .delete()
      .eq('page_url', page_url);

    if (deleteError) {
      // PGRST205 = table doesn't exist - embeddings feature not configured
      if (deleteError.code === 'PGRST205') {
        return NextResponse.json({
          success: false,
          skipped: true,
          reason: 'embeddings_not_configured',
          message: 'Embeddings table not found. Run Supabase migrations to enable this feature.',
        });
      }
      console.error('Error deleting existing embeddings:', deleteError);
      // Continue anyway - might be a new page
    }

    // ========================================================================
    // Step 2: Chunk the content
    // ========================================================================
    const chunks = chunkText(content, {
      maxChunkSize: 2500,  // ~500-600 tokens, balanced semantic coherence
      overlapSize: 150,    // Balance between context and deduplication
    });

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: 'No content chunks generated' },
        { status: 400 }
      );
    }

    // ========================================================================
    // Step 3: Generate embeddings for all chunks
    // ========================================================================
    // Using embedMany for efficient batch processing
    const { embeddings } = await embedMany({
      model: openai.embedding('text-embedding-3-small'),
      values: chunks.map(c => c.text),
    });

    // ========================================================================
    // Step 4: Prepare records for database insertion
    // ========================================================================
    const records = chunks.map((chunk, idx) => ({
      page_url,
      page_title,
      page_type,
      content_hash,
      content_chunk: chunk.text,
      chunk_index: chunk.index,
      embedding: embeddings[idx],
      metadata,
    }));

    // ========================================================================
    // Step 5: Insert into database
    // ========================================================================
    const { error: insertError } = await supabase
      .from('page_embeddings')
      .insert(records);

    if (insertError) {
      console.error('Error inserting embeddings:', insertError);
      return NextResponse.json(
        { error: 'Failed to save embeddings to database' },
        { status: 500 }
      );
    }

    // ========================================================================
    // Success response
    // ========================================================================
    return NextResponse.json({
      success: true,
      page_url,
      page_title,
      chunks_indexed: chunks.length,
      message: `Successfully indexed ${chunks.length} chunk(s) for ${page_url}`,
    });
  } catch (error) {
    console.error('Embeddings index error:', error);

    // Handle specific OpenAI errors
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error while indexing' },
      { status: 500 }
    );
  }
}
