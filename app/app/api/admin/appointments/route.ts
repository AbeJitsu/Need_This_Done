import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// ============================================================================
// Admin Appointments API - GET /api/admin/appointments
// ============================================================================
// What: Fetches all appointment requests for admin dashboard
// Why: Admins need to see and manage all appointment requests
// How: Authenticates admin, queries Supabase, returns sorted list

export async function GET(_request: NextRequest) {
  try {
    // ========================================================================
    // AUTHORIZATION: Use centralized verifyAdmin() helper
    // ========================================================================
    // This ensures consistent auth logic across all admin endpoints.
    // If auth fails, returns appropriate 401/403 error response.
    const auth = await verifyAdmin();
    if (auth.error) {
      return auth.error;
    }

    // Use singleton admin client
    const supabase = getSupabaseAdmin();

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
