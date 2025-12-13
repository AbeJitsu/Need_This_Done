import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeCodeForTokens,
  getGoogleEmail,
  storeTokens,
} from '@/lib/google-calendar';

// ============================================================================
// Google Calendar OAuth Callback - GET /api/google/callback
// ============================================================================
// What: Handles OAuth callback after Google authorization
// Why: Exchanges auth code for tokens and stores them
// How: Validates state, exchanges code, stores tokens in Supabase

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('[Google Callback] OAuth error:', error);
      return NextResponse.redirect(
        new URL('/admin/settings?error=google_auth_failed', request.url)
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/admin/settings?error=missing_params', request.url)
      );
    }

    // Decode and validate state
    let stateData: { user_id: string; timestamp: number };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch {
      return NextResponse.redirect(
        new URL('/admin/settings?error=invalid_state', request.url)
      );
    }

    // Check state is not too old (15 minutes max)
    const stateAge = Date.now() - stateData.timestamp;
    if (stateAge > 15 * 60 * 1000) {
      return NextResponse.redirect(
        new URL('/admin/settings?error=state_expired', request.url)
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Get the Google email for display
    const googleEmail = await getGoogleEmail(tokens.access_token);

    // Store tokens in Supabase
    await storeTokens(stateData.user_id, tokens, googleEmail);

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/admin/settings?success=google_connected', request.url)
    );

  } catch (error) {
    console.error('[Google Callback] Error:', error);
    return NextResponse.redirect(
      new URL('/admin/settings?error=token_exchange_failed', request.url)
    );
  }
}
