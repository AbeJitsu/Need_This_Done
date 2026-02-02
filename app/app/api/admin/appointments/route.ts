import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// ============================================================================
// Admin Appointments API - GET /api/admin/appointments
// ============================================================================
// What: Fetches all appointment requests for admin dashboard
// Why: Admins need to see and manage all appointment requests
// How: Authenticates admin, queries Supabase, returns sorted list

export async function GET(request: NextRequest) {
  try {
    // Use singleton admin client
    const supabase = getSupabaseAdmin();

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify the user
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

    // Fetch all appointment requests
    const { data: appointments, error: fetchError } = await supabase
      .from('appointment_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('[Admin Appointments] Fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ appointments: appointments || [] });

  } catch (error) {
    console.error('[Admin Appointments] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
