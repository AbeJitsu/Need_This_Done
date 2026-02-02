import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getFailedNotifications } from '@/lib/appointment-notifications';

export const dynamic = 'force-dynamic';

// ============================================================================
// Get Failed Appointment Notifications - GET /api/admin/appointments/failed-notifications
// ============================================================================
// What: Returns list of appointment requests with failed admin notifications
// Why: Admins need to know which appointment requests weren't delivered
// How: Fetch from database and filter by failed notification status

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const isAdmin = user.user_metadata?.is_admin === true;
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get failed notifications
    const failedNotifications = await getFailedNotifications();

    return NextResponse.json({
      success: true,
      count: failedNotifications.length,
      appointments: failedNotifications,
    });
  } catch (error) {
    console.error('[Failed Notifications] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
