import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { verifyAuth } from '@/lib/api-auth';
import { handleApiError } from '@/lib/api-errors';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

// ============================================================================
// User's Projects API Route - /api/projects/mine
// ============================================================================
// GET: Returns all projects belonging to the authenticated user.
// Requires authentication via Supabase session.

export async function GET() {
  try {
    // ====================================================================
    // Verify Authentication
    // ====================================================================

    const authResult = await verifyAuth();
    if (authResult.error) return authResult.error;
    const user = authResult.user;

    // ====================================================================
    // Fetch User's Projects (with Caching)
    // ====================================================================
    // Cache-aside pattern: Check cache first (~2ms), fallback to database
    // TTL: 60 seconds (balance freshness vs. performance)

    const supabase = await createSupabaseServerClient();

    const result = await cache.wrap(
      CACHE_KEYS.userProjects(user.id),
      async () => {
        const { data: projects, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error('Failed to load projects');
        }

        return projects || [];
      },
      CACHE_TTL.MEDIUM
    );

    // ====================================================================
    // Success Response
    // ====================================================================

    return NextResponse.json({
      projects: result.data,
      count: result.data.length,
      cached: result.cached,
      source: result.source,
    });

  } catch (error) {
    return handleApiError(error, 'Projects mine GET');
  }
}
