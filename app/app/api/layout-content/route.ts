import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/api-auth';
import { serverError, handleApiError } from '@/lib/api-errors';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import { DEFAULT_LAYOUT_CONTENT, type LayoutContent } from '@/lib/page-config';
import { deepMerge } from '@/lib/object-utils';

export const dynamic = 'force-dynamic';

// ============================================================================
// Layout Content API Route - /api/layout-content
// ============================================================================
// GET: Fetches editable content for header/footer (public, cached)
// PUT: Updates layout content (admin only) and invalidates cache
//
// What: CRUD operations for global layout content (header/footer)
// Why: Allows non-technical users to edit brand, nav links, footer via admin UI
// How: Content stored as JSON in database with page_slug='_layout'

const LAYOUT_SLUG = '_layout';
const LAYOUT_CONTENT_TYPE = 'layout';

// ============================================================================
// GET - Fetch Layout Content
// ============================================================================

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const result = await cache.wrap(
      CACHE_KEYS.pageContent(LAYOUT_SLUG),
      async () => {
        const { data, error } = await supabaseAdmin
          .from('page_content')
          .select('*')
          .eq('page_slug', LAYOUT_SLUG)
          .single();

        // Handle gracefully: PGRST116 = no rows, PGRST205 = table doesn't exist
        // In both cases, we return defaults so the app works without DB setup
        if (error && !['PGRST116', 'PGRST205'].includes(error.code || '')) {
          console.error('Unexpected Supabase error:', error);
          throw new Error('Failed to load layout content');
        }

        // If no custom content exists (or table doesn't exist), return defaults
        if (!data || error?.code === 'PGRST205') {
          return {
            page_slug: LAYOUT_SLUG,
            content_type: LAYOUT_CONTENT_TYPE,
            content: DEFAULT_LAYOUT_CONTENT,
            is_default: true,
          };
        }

        // Merge saved content with defaults so new fields are always available
        const mergedContent = deepMerge(
          DEFAULT_LAYOUT_CONTENT as unknown as Record<string, unknown>,
          data.content as Record<string, unknown>
        ) as unknown as LayoutContent;

        return {
          ...data,
          content: mergedContent,
          is_default: false,
        };
      },
      CACHE_TTL.STATIC // 1 hour - layout content changes infrequently
    );

    return NextResponse.json({
      ...result.data,
      cached: result.cached,
      source: result.source,
    });
  } catch (error) {
    return handleApiError(error, 'LayoutContent GET');
  }
}

// ============================================================================
// PUT - Update Layout Content (Admin Only)
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;
    const user = authResult.user;

    const body = await request.json();
    const { content } = body as { content: LayoutContent };

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Save current content to history before updating
    const { data: existingContent } = await supabaseAdmin
      .from('page_content')
      .select('id, content')
      .eq('page_slug', LAYOUT_SLUG)
      .single();

    if (existingContent?.id && existingContent?.content) {
      await supabaseAdmin
        .from('page_content_history')
        .insert({
          page_content_id: existingContent.id,
          page_slug: LAYOUT_SLUG,
          content: existingContent.content,
          created_by: user.id,
          version_note: 'Before edit',
        });
    }

    // Upsert: create if doesn't exist, update if it does
    const { data, error } = await supabaseAdmin
      .from('page_content')
      .upsert(
        {
          page_slug: LAYOUT_SLUG,
          content_type: LAYOUT_CONTENT_TYPE,
          content,
          updated_by: user.id,
        },
        {
          onConflict: 'page_slug',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Layout content update error:', error);
      return serverError('Failed to update layout content');
    }

    // Invalidate cache
    await cache.invalidate(CACHE_KEYS.pageContent(LAYOUT_SLUG));

    return NextResponse.json({
      success: true,
      page_slug: LAYOUT_SLUG,
      content: data.content,
      updated_at: data.updated_at,
    });
  } catch (error) {
    return handleApiError(error, 'LayoutContent PUT');
  }
}
