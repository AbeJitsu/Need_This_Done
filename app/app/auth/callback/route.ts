import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// Auth Callback Handler
// ============================================================================
// Handles OAuth redirects from providers (Google, etc.) and email confirmations.
// This route is called by Supabase after the user authenticates with Google.
//
// What it does:
// 1. Receives the OAuth authorization code from Supabase
// 2. Exchanges the code for a session (handled by Supabase internally)
// 3. Redirects the user to the dashboard or specified next URL
//
// How the flow works:
// - User clicks "Sign in with Google"
// - Redirected to Google login
// - User approves access
// - Google redirects back to Supabase
// - Supabase redirects to this route with a `code` parameter
// - We exchange the code for a session
// - User is logged in and redirected to dashboard

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    // Exchange the code for a session
    // This is the critical step that completes OAuth authentication
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to the dashboard or the next specified URL
  return NextResponse.redirect(new URL(next, request.url));
}
