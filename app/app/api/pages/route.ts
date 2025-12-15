import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/api-auth';
import { badRequest, serverError, handleApiError } from '@/lib/api-errors';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// ============================================================================
// Pages API Route - /api/pages
// ============================================================================
// GET: Lists all pages (admin only) with caching
// POST: Creates new page (admin only) and invalidates cache
//
// What: Provides CRUD endpoints for managing pages used by Puck visual editor
// Why: Separates page management from projects, enables visual page building
// How: Uses admin verification, validates input, manages cache lifecycle

// ============================================================================
// GET - List All Pages (Admin Only)
// ============================================================================

export async function GET() {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;

    const supabase = await createSupabaseServerClient();

    const result = await cache.wrap(
      CACHE_KEYS.adminPages(),
      async () => {
        const { data: pages, error } = await supabase
          .from('pages')
          .select('id, slug, title, is_published, published_at, created_at, updated_at')
          .order('updated_at', { ascending: false });

        if (error) throw new Error('Failed to load pages');
        return pages || [];
      },
      CACHE_TTL.MEDIUM
    );

    return NextResponse.json({
      pages: result.data,
      count: result.data.length,
      cached: result.cached,
      source: result.source,
    });
  } catch (error) {
    return handleApiError(error, 'Pages GET');
  }
}

// ============================================================================
// POST - Create New Page (Admin Only)
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;
    const user = authResult.user;

    const body = await request.json();
    const { slug, title, content } = body;

    // Validate required fields
    if (!slug || !title) {
      return badRequest('Missing required fields: slug and title');
    }

    // Validate slug format (alphanumeric, hyphens only, lowercase)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return badRequest('Slug must contain only lowercase letters, numbers, and hyphens');
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: page, error } = await supabaseAdmin
      .from('pages')
      .insert({
        slug,
        title,
        content: content || {},
        is_published: false,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes('duplicate key')) {
        return badRequest('A page with this slug already exists');
      }
      return serverError('Failed to create page');
    }

    // Invalidate admin pages list cache
    await cache.invalidate(CACHE_KEYS.adminPages());

    return NextResponse.json({
      success: true,
      page,
    });
  } catch (error) {
    return handleApiError(error, 'Pages POST');
  }
}
