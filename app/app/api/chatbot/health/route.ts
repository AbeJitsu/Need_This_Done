import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// ============================================================================
// Chatbot Health Check Endpoint - GET /api/chatbot/health
// ============================================================================
// What: Diagnostic endpoint to verify chatbot is ready to use
// Why: Quick way to check if vector search and database are working
// How: Check Supabase connection, embeddings table, and content index
//
// Returns: { status: "healthy"|"degraded", indexed_pages: number, ... }

/**
 * GET /api/chatbot/health
 *
 * Returns health status of chatbot infrastructure:
 * - Database connectivity
 * - pgvector extension status
 * - Number of indexed pages
 * - Last successful index time
 */
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    // ====================================================================
    // Check 1: Database connection
    // ====================================================================
    let dbConnected = false;
    try {
      // Simple query to test connection
      const { error } = await supabase
        .from('page_embeddings')
        .select('count', { count: 'exact', head: true })
        .limit(1);

      if (!error) {
        dbConnected = true;
      }
    } catch {
      // Connection failed
    }

    if (!dbConnected) {
      return NextResponse.json({
        status: 'unhealthy',
        reason: 'database_unreachable',
        message: 'Cannot connect to Supabase database',
        timestamp: new Date().toISOString(),
      });
    }

    // ====================================================================
    // Check 2: Get index statistics
    // ====================================================================
    const { error: statsError, count } = await supabase
      .from('page_embeddings')
      .select('page_url, page_title', { count: 'exact', head: true });

    if (statsError) {
      // Table might not exist, but we're still connected
      return NextResponse.json({
        status: 'degraded',
        reason: 'embeddings_table_missing',
        message: 'page_embeddings table not found. Run migrations: supabase db push',
        indexed_pages: 0,
        timestamp: new Date().toISOString(),
      });
    }

    const indexedCount = count || 0;

    // ====================================================================
    // Check 3: Get list of indexed pages
    // ====================================================================
    const { data: pageData } = await supabase
      .from('page_embeddings')
      .select('page_url, page_title');

    const indexedPages = pageData
      ? [...new Set(pageData.map((row: any) => row.page_url))]
      : [];

    // ====================================================================
    // Check 4: Get timestamp of latest indexed content
    // ====================================================================
    const { data: latestData } = await supabase
      .from('page_embeddings')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const lastIndexed = latestData?.created_at || null;

    // ====================================================================
    // Determine overall status
    // ====================================================================
    const status = indexedCount === 0 ? 'degraded' : 'healthy';
    const readiness = indexedCount === 0
      ? 'Pages not yet indexed. Run: npx tsx scripts/index-all-pages.ts'
      : 'Ready for chatbot queries';

    return NextResponse.json({
      status,
      readiness,
      indexed_embeddings: indexedCount,
      indexed_pages: indexedPages.length,
      pages: indexedPages,
      last_indexed: lastIndexed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
