import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeCodeForTokens,
  getGoogleEmail,
  storeTokens,
} from '@/lib/google-calendar';
import { verifyAdmin } from '@/lib/api-auth';
import {
  GOOGLE_OAUTH_STATE_COOKIE,
  verifyGoogleOAuthState,
} from '@/lib/google-oauth-state';

export const dynamic = 'force-dynamic';

// ============================================================================
// Google Calendar OAuth Callback - GET /api/google/callback
// ============================================================================
// What: Handles OAuth callback after Google authorization
// Why: Exchanges auth code for tokens and stores them
// How: Validates state, exchanges code, stores tokens in Supabase

export async function GET(request: NextRequest) {
  const redirect = (query: string) => {
    const response = NextResponse.redirect(new URL(`/admin/settings?${query}`, request.url));
    response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/google/callback',
      maxAge: 0,
    });
    return response;
  };

  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('[Google Callback] OAuth error:', error);
      return redirect('error=google_auth_failed');
    }

    // Validate required parameters
    if (!code || !state) {
      return redirect('error=missing_params');
    }

    const authResult = await verifyAdmin();
    if (authResult.error) {
      return redirect('error=invalid_state');
    }

    try {
      verifyGoogleOAuthState(
        state,
        request.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value,
        authResult.user.id
      );
    } catch (stateError) {
      const reason = stateError instanceof Error && stateError.message === 'state_expired'
        ? 'state_expired'
        : 'invalid_state';
      return redirect(`error=${reason}`);
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Get the Google email for display
    const googleEmail = await getGoogleEmail(tokens.access_token);

    // Store tokens in Supabase
    await storeTokens(authResult.user.id, tokens, googleEmail);

    // Redirect to success page
    return redirect('success=google_connected');

  } catch (error) {
    console.error('[Google Callback] Error:', error);
    return redirect('error=token_exchange_failed');
  }
}
