import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/api-auth';
import { serverError, handleApiError } from '@/lib/api-errors';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import {
  PAGE_CONTENT_TYPES,
  EDITABLE_PAGES,
  type PageContent,
  type EditablePageSlug,
} from '@/lib/page-content-types';
import { getDefaultContent } from '@/lib/default-page-content';

export const dynamic = 'force-dynamic';

// ============================================================================
// Page Content API Route - /api/page-content/[slug]
// ============================================================================
// GET: Fetches editable content for a marketing page (public, cached)
// PUT: Updates page content (admin only) and invalidates cache
//
// What: CRUD operations for marketing page content
// Why: Allows non-technical users to edit page text/colors via admin UI
// How: Content stored as JSON in database, rendered by existing page components

// ============================================================================
// GET - Fetch Page Content
// ============================================================================

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Validate slug is an editable page
    if (!EDITABLE_PAGES.includes(slug as typeof EDITABLE_PAGES[number])) {
      return NextResponse.json(
        { error: 'Invalid page slug' },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS - this is public content
    const supabaseAdmin = getSupabaseAdmin();

    const result = await cache.wrap(
      CACHE_KEYS.pageContent(slug),
      async () => {
        const { data, error } = await supabaseAdmin
          .from('page_content')
          .select('*')
          .eq('page_slug', slug)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = no rows returned (not an error, just no custom content)
          throw new Error('Failed to load page content');
        }

        // If no custom content exists, return defaults
        if (!data) {
          const validSlug = slug as EditablePageSlug;
          const contentType = PAGE_CONTENT_TYPES[validSlug];
          return {
            page_slug: slug,
            content_type: contentType,
            content: getDefaultContent(validSlug),
            is_default: true,
          };
        }

        return {
          ...data,
          is_default: false,
        };
      },
      CACHE_TTL.STATIC // 1 hour - page content changes infrequently
    );

    return NextResponse.json({
      ...result.data,
      cached: result.cached,
      source: result.source,
    });
  } catch (error) {
    return handleApiError(error, 'PageContent GET');
  }
}

// ============================================================================
// PUT - Update Page Content (Admin Only)
// ============================================================================
// Saves current content to history before updating.
// This enables version history / revert functionality.

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
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
    const { content } = body as { content: PageContent };

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const validSlug = slug as EditablePageSlug;
    const contentType = PAGE_CONTENT_TYPES[validSlug];
    const supabaseAdmin = getSupabaseAdmin();

    // ========================================================================
    // Save current content to history before updating
    // ========================================================================
    const { data: existingContent } = await supabaseAdmin
      .from('page_content')
      .select('id, content')
      .eq('page_slug', slug)
      .single();

    // If content exists, save it to history before overwriting
    if (existingContent?.id && existingContent?.content) {
      await supabaseAdmin
        .from('page_content_history')
        .insert({
          page_content_id: existingContent.id,
          page_slug: slug,
          content: existingContent.content,
          created_by: user.id,
          version_note: 'Before edit',
        });
      // Note: Cleanup trigger automatically removes old versions (keeps last 20)
    }

    // ========================================================================
    // Upsert: create if doesn't exist, update if it does
    // ========================================================================
    const { data, error } = await supabaseAdmin
      .from('page_content')
      .upsert(
        {
          page_slug: slug,
          content_type: contentType,
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
      console.error('Page content update error:', error);
      return serverError('Failed to update page content');
    }

    // Invalidate caches
    await cache.invalidate(CACHE_KEYS.pageContent(slug));
    await cache.invalidate(CACHE_KEYS.adminPageContent());

    return NextResponse.json({
      success: true,
      page_slug: slug,
      content: data.content,
      updated_at: data.updated_at,
    });
  } catch (error) {
    return handleApiError(error, 'PageContent PUT');
  }
}
