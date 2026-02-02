import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';
import { disconnectCalendar } from '@/lib/google-calendar';

export const dynamic = 'force-dynamic';

// ============================================================================
// Google Calendar Disconnect API Route - POST /api/google/disconnect
// ============================================================================
// What: Disconnect Google Calendar integration
// Why: Admin needs ability to revoke calendar access
// How: Delete stored tokens from database

export async function POST(_request: NextRequest) {
  try {
    // Verify admin access
    const authResult = await verifyAdmin();
    if (authResult.error) {
      return authResult.error;
    }

    const user = authResult.user;

    // Remove stored tokens
    await disconnectCalendar(user.id);

    return NextResponse.json({
      success: true,
      message: 'Google Calendar disconnected successfully',
    });

  } catch (error) {
    console.error('[Google Disconnect] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
