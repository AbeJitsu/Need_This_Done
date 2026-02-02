import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// ============================================================================
// Google Calendar Status API Route - GET /api/google/status
// ============================================================================
// What: Check if admin has Google Calendar connected
// Why: Admin needs to see connection status in settings page
// How: Query Supabase for stored tokens

export async function GET(_request: NextRequest) {
  try {
    // Verify admin access
    const authResult = await verifyAdmin();
    if (authResult.error) {
      return authResult.error;
    }

    const user = authResult.user;

    // Check if tokens exist in database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: tokenData, error } = await supabase
      .from('google_calendar_tokens')
      .select('google_email, created_at')
      .eq('user_id', user.id)
      .single();

    if (error || !tokenData) {
      return NextResponse.json({
        connected: false,
      });
    }

    return NextResponse.json({
      connected: true,
      googleEmail: tokenData.google_email,
      connectedAt: tokenData.created_at,
    });

  } catch (error) {
    console.error('[Google Status] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
