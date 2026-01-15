import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyAdmin, verifyAuth } from '@/lib/api-auth';
import { serverError, handleApiError } from '@/lib/api-errors';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// ============================================================================
// Single Page API Route - /api/pages/[slug]
// ============================================================================
// GET: Fetches single page (public if published, admin always) with caching
// PUT: Updates page content (admin only) and invalidates cache
// DELETE: Deletes page (admin only) and invalidates cache
//
// What: CRUD operations for individual pages
// Why: Enables editing in Puck, publishing/unpublishing, and deletion
// How: Public sees only published pages, admins see all for previewing/editing

// ============================================================================
// GET - Fetch Single Page
// ============================================================================

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const supabase = await createSupabaseServerClient();

    // Check if user is admin (optional auth)
    let isAdmin = false;
    try {
      const authResult = await verifyAuth();
      if (!authResult.error) {
        isAdmin = authResult.user.user_metadata?.is_admin === true;
      }
    } catch {
      // Not authenticated - that's OK for published pages
    }

    const result = await cache.wrap(
      CACHE_KEYS.page(slug),
      async () => {
        let query = supabase
          .from('pages')
          .select('*')
          .eq('slug', slug);

        // Non-admins only see published pages
        if (!isAdmin) {
          query = query.eq('is_published', true);
        }

        const { data: pages, error } = await query;

        // Handle gracefully: PGRST205 = table doesn't exist
        // Pages feature may not be set up yet
        if (error) {
          if (error.code === 'PGRST205') {
            return null; // Table doesn't exist - feature not configured
          }
          throw new Error('Failed to load page');
        }

        if (!pages || pages.length === 0) {
          return null;
        }

        return pages[0];
      },
      CACHE_TTL.LONG // 5 minutes for published pages
    );

    if (!result.data) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      page: result.data,
      cached: result.cached,
      source: result.source,
    });
  } catch (error) {
    return handleApiError(error, 'Page GET');
  }
}

// ============================================================================
// PUT - Update Page (Admin Only)
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;
    const user = authResult.user;

    const { slug } = params;
    const body = await request.json();
    const { title, content, is_published } = body;

    const supabaseAdmin = getSupabaseAdmin();

    const { data: page, error } = await supabaseAdmin
      .from('pages')
      .update({
        ...(title && { title }),
        ...(content !== undefined && { content }),
        ...(is_published !== undefined && { is_published }),
        updated_by: user.id,
      })
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      return serverError('Failed to update page');
    }

    // Invalidate individual page cache and admin list
    await cache.invalidate(CACHE_KEYS.page(slug));
    await cache.invalidate(CACHE_KEYS.adminPages());

    return NextResponse.json({
      success: true,
      page,
    });
  } catch (error) {
    return handleApiError(error, 'Page PUT');
  }
}

// ============================================================================
// DELETE - Delete Page (Admin Only)
// ============================================================================

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;

    const { slug } = params;
    const supabaseAdmin = getSupabaseAdmin();

    const { error } = await supabaseAdmin
      .from('pages')
      .delete()
      .eq('slug', slug);

    if (error) {
      return serverError('Failed to delete page');
    }

    // Invalidate individual page cache and admin list
    await cache.invalidate(CACHE_KEYS.page(slug));
    await cache.invalidate(CACHE_KEYS.adminPages());

    return NextResponse.json({
      success: true,
      message: 'Page deleted successfully',
    });
  } catch (error) {
    return handleApiError(error, 'Page DELETE');
  }
}
