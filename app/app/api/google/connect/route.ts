import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';
import { getAuthUrl } from '@/lib/google-calendar';
import {
  createGoogleOAuthState,
  GOOGLE_OAUTH_STATE_COOKIE,
  GOOGLE_OAUTH_STATE_MAX_AGE_SECONDS,
} from '@/lib/google-oauth-state';

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

    const { state, nonce } = createGoogleOAuthState(user.id);

    // Get the OAuth authorization URL
    const authUrl = getAuthUrl(state);

    const response = NextResponse.json({
      auth_url: authUrl,
    });
    response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/google/callback',
      maxAge: GOOGLE_OAUTH_STATE_MAX_AGE_SECONDS,
    });
    return response;

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
