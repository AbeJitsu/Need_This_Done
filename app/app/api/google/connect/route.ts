import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';
import { getAuthUrl } from '@/lib/google-calendar';

export const dynamic = 'force-dynamic';

// ============================================================================
// Google Calendar Connect API Route - GET /api/google/connect
// ============================================================================
// What: Initiates Google OAuth flow for calendar integration
// Why: Admin needs to authorize access to their Google Calendar
// How: Generates OAuth URL with state parameter for security

export async function GET(_request: NextRequest) {
  try {
    // Verify admin access
    const authResult = await verifyAdmin();
    if (authResult.error) {
      return authResult.error;
    }

    const user = authResult.user;

    // Generate state parameter (includes user ID for security)
    const state = Buffer.from(JSON.stringify({
      user_id: user.id,
      timestamp: Date.now(),
    })).toString('base64');

    // Get the OAuth authorization URL
    const authUrl = getAuthUrl(state);

    return NextResponse.json({
      auth_url: authUrl,
    });

  } catch (error) {
    console.error('[Google Connect] Error:', error);

    if (error instanceof Error && error.message.includes('not configured')) {
      return NextResponse.json(
        { error: 'Google Calendar integration is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
