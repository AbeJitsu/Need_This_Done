// eslint-disable-next-line no-restricted-imports -- signup creates new users, no existing session needed
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// Sign Up Endpoint - /api/auth/signup (POST)
// ============================================================================
// This is an API route that creates a new user account in Supabase.
//
// How it works:
// 1. Client sends email and password to this endpoint
// 2. We validate the input (required fields, password strength)
// 3. Supabase hashes the password using bcrypt (one-way encryption)
// 4. User record is created in the database
// 5. Confirmation email is sent (if email confirmation is enabled)
// 6. We return the user data or an error
//
// Important: Passwords are permanently scrambled (hashed). Even if someone
// steals the database, they can't reverse the hash to get the original password.
//
// Typical flow:
// - Browser → POST /api/auth/signup → Supabase auth → Response → Browser

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, metadata } = body;

    // ========================================================================
    // Step 1: Validate Input
    // ========================================================================
    // Never trust the client. Always validate input on the server.
    // This prevents malformed requests and protects the database.
    // We check:
    // - Email and password are present (not null/undefined)
    // - Password meets minimum length requirement
    // These checks happen BEFORE we touch the database.

    if (!email || !password) {
      return NextResponse.json(
        {
          error: 'Email and password are required',
        },
        { status: 400 } // 400 = Bad Request (client's fault)
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
    // Step 2: Create User Account in Supabase Auth
    // ========================================================================
    // Supabase handles the heavy lifting:
    // - Hashes the password using bcrypt (one-way encryption)
    // - Stores the email and hashed password in the auth table
    // - Creates a user session token (JWT)
    // - Sends confirmation email if email verification is enabled
    //
    // We pass emailRedirectTo so users return to our app after confirming
    // their email, completing the signup flow.

    const { data, error } = await supabase.auth.signUp({
      email,
      password, // This is hashed by Supabase - we never store plain passwords
      options: {
        data: metadata || {}, // Store additional user info (name, etc.)
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      // If signup fails (e.g., email already exists), return the error
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 400 }
      );
    }

    // ========================================================================
    // Step 3: Return Success Response
    // ========================================================================
    // User account created! We return:
    // - data.user: The new user object (includes ID, email, created_at, etc.)
    // - 201 status: "Created" (new resource was created successfully)
    //
    // The user will receive a confirmation email. After confirming their
    // email, they can log in. Until then, their account is in a "pending"
    // state if email verification is required.

    return NextResponse.json(
      {
        message: 'Account created! Check your email to confirm.',
        user: data.user,
      },
      { status: 201 } // 201 = Created (success)
    );
  } catch (error) {
    // Unexpected error (not validation error, not Supabase error)
    // This could be: JSON parsing error, network issue, etc.
    console.error('Sign up error:', error);

    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
      },
      { status: 500 } // 500 = Server Error (our fault)
    );
  }
}
