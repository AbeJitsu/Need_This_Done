// ============================================================================
// GET /api/user/appointments - Fetch current user's appointments
// ============================================================================
// Why: Customers need to see their scheduled consultations
// How: Queries appointment_requests by customer email, filters by status

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create Supabase client with service role (bypasses RLS for server-side queries)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_KEY || ''
    );

    // Fetch appointments for the user's email
    const { data: appointments, error } = await supabase
      .from('appointment_requests')
      .select(
        `
        id,
        order_id,
        customer_email,
        customer_name,
        preferred_date,
        preferred_time_start,
        preferred_time_end,
        alternate_date,
        alternate_time_start,
        duration_minutes,
        notes,
        status,
        admin_notes,
        scheduled_at,
        google_event_link,
        created_at,
        updated_at
      `
      )
      .eq('customer_email', session.user.email)
      .order('preferred_date', { ascending: true });

    if (error) {
      console.error('Supabase error fetching appointments:', error);
      return Response.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      );
    }

    // Filter to show only non-completed appointments (active/pending) if requested
    // Include all statuses by default, caller can filter
    return Response.json({
      appointments: appointments || [],
      total: appointments?.length || 0,
    });
  } catch (err) {
    console.error('Error fetching appointments:', err);
    return Response.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}
