import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyAdmin, verifyAuth } from '@/lib/api-auth';
import { serverError, handleApiError, notFound } from '@/lib/api-errors';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import { BlogPost, UpdateBlogPostInput, generateSlug, generateExcerpt } from '@/lib/blog-types';

export const dynamic = 'force-dynamic';

// ============================================================================
// Single Blog Post API Route - /api/blog/[slug]
// ============================================================================
// GET: Fetches single post (public if published, admin always) with caching
// PUT: Updates post content (admin only) and invalidates cache
// DELETE: Deletes post (admin only) and invalidates cache
//
// What: CRUD operations for individual blog posts
// Why: Enables editing, publishing/unpublishing, and deletion
// How: Public sees only published posts, admins see all for previewing/editing

// ============================================================================
// GET - Fetch Single Blog Post
// ============================================================================

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createSupabaseServerClient();

    // Check if user is admin (optional auth)
    let isAdmin = false;
    try {
      const authResult = await verifyAuth();
      if (!authResult.error) {
        isAdmin = authResult.user.user_metadata?.is_admin === true;
      }
    } catch {
      // Not authenticated - that's OK for published posts
    }

    const result = await cache.wrap(
      CACHE_KEYS.blogPost(slug),
      async () => {
        let query = supabase.from('blog_posts').select('*').eq('slug', slug);

        // Non-admins only see published posts
        if (!isAdmin) {
          query = query.eq('status', 'published');
        }

        const { data: posts, error } = await query;

        if (error) {
          throw new Error('Failed to load blog post');
        }

        if (!posts || posts.length === 0) {
          return null;
        }

        return posts[0] as BlogPost;
      },
      CACHE_TTL.LONG // 5 minutes for published posts
    );

    if (!result.data) {
      return notFound('Blog post not found');
    }

    return NextResponse.json({
      post: result.data,
      cached: result.cached,
      source: result.source,
    });
  } catch (error) {
    return handleApiError(error, 'Blog Post GET');
  }
}

// ============================================================================
// PUT - Update Blog Post (Admin Only)
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;

    const { slug } = await params;
    const body: UpdateBlogPostInput = await request.json();

    const supabaseAdmin = getSupabaseAdmin();

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) {
      updateData.content = body.content;
      // Regenerate excerpt if content changed and no new excerpt provided
      if (body.excerpt === undefined) {
        updateData.excerpt = generateExcerpt(body.content);
      }
    }
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
    if (body.featured_image !== undefined) updateData.featured_image = body.featured_image;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.source !== undefined) updateData.source = body.source;
    if (body.source_url !== undefined) updateData.source_url = body.source_url;
    if (body.meta_title !== undefined) updateData.meta_title = body.meta_title;
    if (body.meta_description !== undefined) updateData.meta_description = body.meta_description;

    // Handle slug change
    let newSlug = slug;
    if (body.slug !== undefined && body.slug !== slug) {
      newSlug = generateSlug(body.slug);
      updateData.slug = newSlug;
    }

    const { data: post, error } = await supabaseAdmin
      .from('blog_posts')
      .update(updateData)
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      console.error('Blog post update error:', error);
      return serverError('Failed to update blog post');
    }

    // Invalidate caches
    await Promise.all([
      cache.invalidate(CACHE_KEYS.blogPost(slug)),
      cache.invalidate(CACHE_KEYS.blogPost(newSlug)),
      cache.invalidate(CACHE_KEYS.adminBlogPosts()),
      cache.invalidatePattern('blog:posts:*'),
    ]);

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error) {
    return handleApiError(error, 'Blog Post PUT');
  }
}

// ============================================================================
// DELETE - Delete Blog Post (Admin Only)
// ============================================================================

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;

    const { slug } = await params;
    const supabaseAdmin = getSupabaseAdmin();

    const { error } = await supabaseAdmin.from('blog_posts').delete().eq('slug', slug);

    if (error) {
      console.error('Blog post delete error:', error);
      return serverError('Failed to delete blog post');
    }

    // Invalidate caches
    await Promise.all([
      cache.invalidate(CACHE_KEYS.blogPost(slug)),
      cache.invalidate(CACHE_KEYS.adminBlogPosts()),
      cache.invalidatePattern('blog:posts:*'),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully',
    });
  } catch (error) {
    return handleApiError(error, 'Blog Post DELETE');
  }
}
