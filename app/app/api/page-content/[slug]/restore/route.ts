import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/api-auth';
import { serverError, handleApiError } from '@/lib/api-errors';
import { cache, CACHE_KEYS } from '@/lib/cache';
import { EDITABLE_PAGES } from '@/lib/page-content-types';

export const dynamic = 'force-dynamic';

// ============================================================================
// Page Content Restore API Route - /api/page-content/[slug]/restore
// ============================================================================
// POST: Restores page content to a specific version (admin only)
//
// What: Replaces current content with a previous version
// Why: Allows clients to undo changes and revert to previous state
// How: Saves current content to history first, then restores the selected version

// ============================================================================
// POST - Restore to a specific version
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Admin only
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;
    const user = authResult.user;

    const { slug } = params;

    // Validate slug is an editable page
    if (!EDITABLE_PAGES.includes(slug as typeof EDITABLE_PAGES[number])) {
      return NextResponse.json(
        { error: 'Invalid page slug' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { versionId } = body as { versionId: string };

    if (!versionId) {
      return NextResponse.json(
        { error: 'Version ID is required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // ========================================================================
    // Step 1: Get the version to restore
    // ========================================================================
    const { data: versionToRestore, error: versionError } = await supabaseAdmin
      .from('page_content_history')
      .select('id, content, page_content_id, created_at')
      .eq('id', versionId)
      .eq('page_slug', slug)
      .single();

    if (versionError || !versionToRestore) {
      return NextResponse.json(
        { error: 'Version not found' },
        { status: 404 }
      );
    }

    // ========================================================================
    // Step 2: Get current content to save to history before restoring
    // ========================================================================
    const { data: currentContent } = await supabaseAdmin
      .from('page_content')
      .select('id, content')
      .eq('page_slug', slug)
      .single();

    // Save current content to history with a note
    if (currentContent?.id && currentContent?.content) {
      const restoreDate = new Date(versionToRestore.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });

      await supabaseAdmin
        .from('page_content_history')
        .insert({
          page_content_id: currentContent.id,
          page_slug: slug,
          content: currentContent.content,
          created_by: user.id,
          version_note: `Before restoring to ${restoreDate} version`,
        });
    }

    // ========================================================================
    // Step 3: Update page_content with the restored version
    // ========================================================================
    const { error: updateError } = await supabaseAdmin
      .from('page_content')
      .update({
        content: versionToRestore.content,
        updated_by: user.id,
      })
      .eq('page_slug', slug);

    if (updateError) {
      console.error('Failed to restore version:', updateError);
      return serverError('Failed to restore version');
    }

    // Invalidate caches
    await cache.invalidate(CACHE_KEYS.pageContent(slug));
    await cache.invalidate(CACHE_KEYS.adminPageContent());

    return NextResponse.json({
      success: true,
      message: 'Content restored successfully',
      restored_from: versionToRestore.created_at,
    });
  } catch (error) {
    return handleApiError(error, 'PageContentRestore POST');
  }
}
