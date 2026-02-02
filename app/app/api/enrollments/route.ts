import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { withSupabaseRetry, isUniqueViolation } from '@/lib/supabase-retry';

export const dynamic = 'force-dynamic';

// ============================================================================
// Enrollments API - /api/enrollments
// ============================================================================
// What: Manages course enrollments for the LMS
// Why: Enables users to enroll in courses (free) or purchase access (paid)
// How: Creates enrollment records, integrates with Stripe for paid courses
//
// Endpoints:
// - GET: List user's enrollments or check enrollment status
// - POST: Create new enrollment (free or initiate paid)

// ============================================================================
// Types
// ============================================================================

interface EnrollmentInput {
  course_id: string;
  enrollment_type: 'free' | 'paid';
}

// ============================================================================
// GET - List Enrollments or Check Status
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for specific course enrollment
    const courseId = searchParams.get('course_id');

    if (courseId) {
      // Check if user is enrolled in specific course
      const { data: enrollment, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Failed to check enrollment:', error);
        return NextResponse.json(
          { error: 'Failed to check enrollment status' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        enrolled: !!enrollment,
        enrollment: enrollment || null,
      });
    }

    // List all user enrollments
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', user.id)
      .order('enrolled_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch enrollments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch enrollments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ enrollments: enrollments || [] });
  } catch (error) {
    console.error('Enrollments GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Create Enrollment
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as Partial<EnrollmentInput>;

    // Validate required fields
    if (!body.course_id) {
      return NextResponse.json(
        { error: 'course_id is required' },
        { status: 400 }
      );
    }

    if (!body.enrollment_type || !['free', 'paid'].includes(body.enrollment_type)) {
      return NextResponse.json(
        { error: 'enrollment_type must be "free" or "paid"' },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', body.course_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 409 }
      );
    }

    // For paid courses, would integrate with Stripe here
    // For now, only handle free enrollments
    if (body.enrollment_type === 'paid') {
      return NextResponse.json(
        { error: 'Paid enrollment requires payment integration', redirect: '/checkout' },
        { status: 402 }
      );
    }

    // Create free enrollment with retry logic
    const enrollmentResult = await withSupabaseRetry(
      async () => {
        const res = await supabase
          .from('enrollments')
          .insert({
            user_id: user.id,
            course_id: body.course_id,
            enrollment_type: 'free',
            amount_paid: 0,
            progress: 0,
          })
          .select()
          .single();
        return res;
      },
      { operation: 'Create enrollment', maxRetries: 3 }
    );

    const { data: enrollment, error } = enrollmentResult;

    if (error) {
      // Handle unique constraint violation specifically
      if (isUniqueViolation(error)) {
        return NextResponse.json(
          { error: 'Already enrolled in this course' },
          { status: 409 }
        );
      }

      console.error('Failed to create enrollment after retries:', error);
      return NextResponse.json(
        { error: 'Failed to create enrollment' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, enrollment },
      { status: 201 }
    );
  } catch (error) {
    console.error('Enrollments POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create enrollment' },
      { status: 500 }
    );
  }
}
