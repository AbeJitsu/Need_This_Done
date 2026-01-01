import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/api-auth';
import { handleApiError } from '@/lib/api-errors';
import { EDITABLE_PAGES } from '@/lib/page-content-types';

export const dynamic = 'force-dynamic';

// ============================================================================
// Page Content History API Route - /api/page-content/[slug]/history
// ============================================================================
// GET: Fetches version history for a page (admin only)
//
// What: Lists previous versions of page content
// Why: Allows clients to see and restore previous versions
// How: Queries page_content_history table, ordered by most recent

// ============================================================================
// GET - Fetch Version History
// ============================================================================

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Admin only
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;

    const { slug } = params;

    // Validate slug is an editable page
    if (!EDITABLE_PAGES.includes(slug as typeof EDITABLE_PAGES[number])) {
      return NextResponse.json(
        { error: 'Invalid page slug' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Get version history for this page
    const { data: history, error } = await supabaseAdmin
      .from('page_content_history')
      .select(`
        id,
        page_slug,
        content,
        created_by,
        created_at,
        version_note
      `)
      .eq('page_slug', slug)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Failed to fetch page content history:', error);
      return NextResponse.json(
        { error: 'Failed to fetch version history' },
        { status: 500 }
      );
    }

    // Format response with human-readable dates
    const formattedHistory = (history || []).map((version) => ({
      id: version.id,
      created_at: version.created_at,
      version_note: version.version_note,
      // Create a summary of what was in this version
      summary: getSummary(version.content),
    }));

    return NextResponse.json({
      slug,
      versions: formattedHistory,
      count: formattedHistory.length,
    });
  } catch (error) {
    return handleApiError(error, 'PageContentHistory GET');
  }
}

// ============================================================================
// Helper: Generate summary of content for preview
// ============================================================================

function getSummary(content: Record<string, unknown>): string {
  if (!content) return 'Empty content';

  // Get top-level section names
  const sections = Object.keys(content);
  if (sections.length === 0) return 'Empty content';

  // Return first few section names
  const preview = sections.slice(0, 3).join(', ');
  const more = sections.length > 3 ? ` (+${sections.length - 3} more)` : '';

  return `Sections: ${preview}${more}`;
}
