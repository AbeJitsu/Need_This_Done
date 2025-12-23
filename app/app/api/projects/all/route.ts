import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/api-auth';
import { handleApiError } from '@/lib/api-errors';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// ============================================================================
// All Projects API Route - /api/projects/all (Admin Only)
// ============================================================================
// GET: Returns all projects with optional filtering.
// Requires authentication and admin privileges.

export async function GET(request: NextRequest) {
  try {
    // ========================================================================
    // Verify Admin Access
    // ========================================================================

    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;

    // ========================================================================
    // Parse Query Parameters
    // ========================================================================

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const email = searchParams.get('email');

    // ========================================================================
    // Fetch Projects (with Caching)
    // ========================================================================
    // Cache status filters, but bypass cache for email searches (less common)
    // TTL: 60 seconds
    // Uses admin client to bypass RLS (user already verified as admin above)

    const supabaseAdmin = getSupabaseAdmin();

    // Build cache key based on status filter (email searches bypass cache)
    const cacheKey = CACHE_KEYS.adminProjects(status || undefined);

    const result = await cache.wrap(
      cacheKey,
      async () => {
        let query = supabaseAdmin
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (status) {
          query = query.eq('status', status);
        }

        if (email) {
          query = query.ilike('email', `%${email}%`);
        }

        const { data: projects, error } = await query;

        if (error) {
          throw new Error('Failed to load projects');
        }

        return projects || [];
      },
      CACHE_TTL.MEDIUM
    );

    // ========================================================================
    // Success Response
    // ========================================================================

    return NextResponse.json({
      projects: result.data,
      count: result.data.length,
      cached: result.cached,
      source: result.source,
    });
  } catch (error) {
    return handleApiError(error, 'Projects all GET');
  }
}
