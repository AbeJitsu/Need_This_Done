import { createClient } from '@supabase/supabase-js';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const noStoreHeaders = {
  'Cache-Control': 'no-store, private',
  Pragma: 'no-cache',
};

/**
 * Exchanges the Google ID token already verified by NextAuth for the canonical
 * Supabase session used by API authentication and database RLS.
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403, headers: noStoreHeaders });
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const googleIdToken = token?.provider === 'google' ? token.googleIdToken : undefined;
  const expiresAt = typeof token?.googleIdTokenExpiresAt === 'number'
    ? token.googleIdTokenExpiresAt
    : 0;

  if (typeof googleIdToken !== 'string' || expiresAt <= Math.floor(Date.now() / 1000)) {
    return NextResponse.json(
      { error: 'Google session cannot be verified. Please sign in again.' },
      { status: 401, headers: noStoreHeaders },
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Authentication is unavailable.' }, { status: 503, headers: noStoreHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: googleIdToken,
  });

  if (error || !data.session) {
    console.error('[supabase-bridge] Supabase rejected the Google identity:', error?.message);
    return NextResponse.json(
      { error: 'Google identity could not be linked to application access.' },
      { status: 401, headers: noStoreHeaders },
    );
  }

  return NextResponse.json(
    {
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    },
    { status: 200, headers: noStoreHeaders },
  );
}
