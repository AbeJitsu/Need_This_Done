import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// Sign Up Endpoint - Create a New User Account
// ============================================================================
// This creates a new user account with email and password.
// The user receives a confirmation email (if email confirmation is enabled).
// After confirming their email, they can log in.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, metadata } = body;

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

    if (password.length < 6) {
      return NextResponse.json(
        {
          error: 'Password must be at least 6 characters',
        },
        { status: 400 }
      );
    }

    // ========================================================================
    // Create User Account
    // ========================================================================
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata || {}, // Store additional user info (name, etc.)
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 400 }
      );
    }

    // ========================================================================
    // Return Success
    // ========================================================================
    return NextResponse.json(
      {
        message: 'Account created! Check your email to confirm.',
        user: data.user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Sign up error:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
