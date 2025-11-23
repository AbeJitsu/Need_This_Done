import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// Login Endpoint - Sign In with Email and Password
// ============================================================================
// This signs in an existing user with their email and password.
// Returns the user object and session tokens if successful.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // ========================================================================
    // Validate Input
    // ========================================================================
    if (!email || !password) {
      return NextResponse.json(
        {
          error: 'Email and password are required',
        },
        { status: 400 }
      );
    }

    // ========================================================================
    // Sign In User
    // ========================================================================
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Don't reveal whether email exists or password is wrong (security best practice)
      return NextResponse.json(
        {
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // ========================================================================
    // Return Success with User and Session Data
    // ========================================================================
    return NextResponse.json(
      {
        message: 'Signed in successfully',
        user: data.user,
        session: {
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
          expires_at: data.session?.expires_at,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
