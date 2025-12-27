import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/api-auth';
import { badRequest, serverError, handleApiError } from '@/lib/api-errors';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import {
  BlogPostSummary,
  BlogPostStatus,
  CreateBlogPostInput,
  generateSlug,
  generateExcerpt,
} from '@/lib/blog-types';

export const dynamic = 'force-dynamic';

// ============================================================================
// Blog API Route - /api/blog
// ============================================================================
// GET: Lists blog posts (public for published, admin for all)
// POST: Creates new blog post (admin only)
//
// What: CRUD endpoints for blog content management
// Why: Enables easy content creation and repurposing from LinkedIn
// How: Uses caching, admin verification, and input validation

// ============================================================================
// GET - List Blog Posts
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as BlogPostStatus | null;
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const adminView = searchParams.get('admin') === 'true';

    // If admin view requested, verify admin status
    if (adminView) {
      const authResult = await verifyAdmin();
      if (authResult.error) return authResult.error;
    }

    // Use admin client for admin views (bypasses RLS for E2E testing)
    // Use regular client for public views (respects RLS)
    const supabase = adminView ? getSupabaseAdmin() : await createSupabaseServerClient();

    // Determine cache key based on request
    const cacheKey = adminView
      ? CACHE_KEYS.adminBlogPosts()
      : CACHE_KEYS.blogPosts(status || undefined);

    const result = await cache.wrap(
      cacheKey,
      async () => {
        let query = supabase
          .from('blog_posts')
          .select(
            'id, slug, title, excerpt, featured_image, tags, category, status, published_at, author_name'
          )
          .order('published_at', { ascending: false, nullsFirst: false });

        // Public view: only published posts
        if (!adminView) {
          query = query.eq('status', 'published');
        } else if (status) {
          // Admin can filter by status
          query = query.eq('status', status);
        }

        // Category filter
        if (category) {
          query = query.eq('category', category);
        }

        // Tag filter (array contains)
        if (tag) {
          query = query.contains('tags', [tag]);
        }

        const { data: posts, error } = await query;

        if (error) throw new Error('Failed to load blog posts');
        return (posts || []) as BlogPostSummary[];
      },
      adminView ? CACHE_TTL.MEDIUM : CACHE_TTL.LONG
    );

    return NextResponse.json({
      posts: result.data,
      count: result.data.length,
      cached: result.cached,
      source: result.source,
    });
  } catch (error) {
    return handleApiError(error, 'Blog GET');
  }
}

// ============================================================================
// POST - Create New Blog Post (Admin Only)
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;
    const user = authResult.user;

    const body: CreateBlogPostInput = await request.json();
    const { title, content } = body;

    // Validate required fields
    if (!title || !content) {
      return badRequest('Missing required fields: title and content');
    }

    // Generate slug if not provided
    let slug = body.slug || generateSlug(title);

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return badRequest('Slug must contain only lowercase letters, numbers, and hyphens');
    }

    // Generate excerpt if not provided
    const excerpt = body.excerpt || generateExcerpt(content);

    const supabaseAdmin = getSupabaseAdmin();

    // Check for duplicate slug
    const { data: existing } = await supabaseAdmin
      .from('blog_posts')
      .select('slug')
      .eq('slug', slug)
      .single();

    if (existing) {
      // Append timestamp to make unique
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // E2E bypass users have a fake UUID that won't exist in auth.users
    // Set author_id to null to avoid foreign key constraint violation
    const isE2EBypassUser = user.id === '00000000-0000-0000-0000-000000000000';

    const { data: post, error } = await supabaseAdmin
      .from('blog_posts')
      .insert({
        slug,
        title,
        content,
        excerpt,
        featured_image: body.featured_image || null,
        tags: body.tags || [],
        category: body.category || null,
        status: body.status || 'draft',
        source: body.source || 'original',
        source_url: body.source_url || null,
        meta_title: body.meta_title || null,
        meta_description: body.meta_description || null,
        author_id: isE2EBypassUser ? null : user.id,
        author_name: user.user_metadata?.full_name || user.email || 'Admin',
      })
      .select()
      .single();

    if (error) {
      console.error('Blog post creation error:', error);
      return serverError('Failed to create blog post');
    }

    // Invalidate blog caches
    await Promise.all([
      cache.invalidate(CACHE_KEYS.adminBlogPosts()),
      cache.invalidatePattern('blog:posts:*'),
    ]);

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error) {
    return handleApiError(error, 'Blog POST');
  }
}
