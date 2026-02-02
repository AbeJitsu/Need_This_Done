import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// ============================================================================
// Admin Enrollments API - GET /api/admin/enrollments
// ============================================================================
// What: Provides admin access to all enrollment records
// Why: Admins need to see who's enrolled in what courses
// How: Queries enrollments table with joined user and course data

/**
 * GET /api/admin/enrollments
 *
 * Query parameters:
 * - course_id: Filter by specific course (optional)
 * - user_id: Filter by specific user (optional)
 * - enrollment_type: Filter by free/paid (optional)
 *
 * Returns:
 * - enrollments: Array of enrollment records with user and course details
 * - summary: Aggregated enrollment statistics
 */
export async function GET(request: Request) {
  try {
    // Verify admin authentication
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('course_id');
    const userId = searchParams.get('user_id');
    const enrollmentType = searchParams.get('enrollment_type');

    const supabase = getSupabaseAdmin();

    // Build query with filters
    let query = supabase
      .from('enrollments')
      .select(`
        *,
        user:auth.users!enrollments_user_id_fkey(id, email, raw_user_meta_data)
      `)
      .order('enrolled_at', { ascending: false });

    if (courseId) {
      query = query.eq('course_id', courseId);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (enrollmentType && ['free', 'paid'].includes(enrollmentType)) {
      query = query.eq('enrollment_type', enrollmentType);
    }

    const { data: enrollments, error } = await query;

    if (error) {
      console.error('Error fetching enrollments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch enrollments' },
        { status: 500 }
      );
    }

    // ========================================================================
    // Fetch summary statistics
    // ========================================================================
    const { data: stats, error: statsError } = await supabase
      .from('enrollments')
      .select('enrollment_type, progress, amount_paid');

    if (statsError) {
      console.error('Error fetching enrollment stats:', statsError);
    }

    const summary = {
      total: stats?.length || 0,
      free: stats?.filter(e => e.enrollment_type === 'free').length || 0,
      paid: stats?.filter(e => e.enrollment_type === 'paid').length || 0,
      completed: stats?.filter(e => e.progress === 100).length || 0,
      totalRevenue: stats?.reduce((sum, e) => sum + (e.amount_paid || 0), 0) || 0,
      averageProgress: stats && stats.length > 0
        ? Math.round(stats.reduce((sum, e) => sum + e.progress, 0) / stats.length)
        : 0,
    };

    return NextResponse.json({
      enrollments: enrollments || [],
      summary,
    });
  } catch (error) {
    console.error('Admin enrollments API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/enrollments?id=<enrollment_id>
 *
 * Allows admins to remove enrollments (e.g., refunds, access revoked)
 */
export async function DELETE(request: Request) {
  try {
    // Verify admin authentication
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const enrollmentId = searchParams.get('id');

    if (!enrollmentId) {
      return NextResponse.json(
        { error: 'Enrollment ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('enrollments')
      .delete()
      .eq('id', enrollmentId);

    if (error) {
      console.error('Error deleting enrollment:', error);
      return NextResponse.json(
        { error: 'Failed to delete enrollment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin enrollment delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete enrollment' },
      { status: 500 }
    );
  }
}
