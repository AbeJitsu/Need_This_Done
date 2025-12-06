import { createServerClient } from '@supabase/ssr';
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
//
// IMPORTANT: This route handler uses a custom Supabase client pattern that
// explicitly attaches cookies to the redirect response. This is necessary
// because the standard createSupabaseServerClient() uses cookies() from
// next/headers which doesn't work well with NextResponse.redirect().

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  // Use NEXT_PUBLIC_SITE_URL for the redirect base to avoid internal port leaking
  // Inside Docker, request.url contains the internal port (3000), but we need
  // the external URL (https://localhost) that nginx serves
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin;
  const redirectUrl = new URL(next, siteUrl);
  const response = NextResponse.redirect(redirectUrl);

  console.log('=== AUTH CALLBACK DEBUG ===');
  console.log('Request URL:', request.url);
  console.log('Code present:', !!code);

  if (code) {
    // Create a Supabase client that reads cookies from request and writes to response
    // This ensures the session cookies are included in the redirect
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            console.log('=== SETTING COOKIES ===');
            cookiesToSet.forEach(({ name, value, options }) => {
              console.log(`Setting cookie: ${name}`);
              console.log(`  Options:`, JSON.stringify(options));
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // Exchange the code for a session - this sets cookies on the response
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    console.log('Exchange result:', error ? `Error: ${error.message}` : `Success: ${data.user?.email}`);
  }

  // Log all cookies on the response
  console.log('=== RESPONSE COOKIES ===');
  response.cookies.getAll().forEach(c => {
    console.log(`  ${c.name}: ${c.value.substring(0, 30)}...`);
  });

  return response;
}
