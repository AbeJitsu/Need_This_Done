import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// Login Endpoint - /api/auth/login (POST)
// ============================================================================
// This endpoint authenticates a user with email and password.
//
// How it works:
// 1. Client sends email and password to this endpoint
// 2. We validate the input
// 3. Supabase verifies the password against the stored hash using bcrypt
// 4. If valid, Supabase returns session tokens (JWT)
// 5. We return tokens to the client
// 6. Client stores tokens (usually in cookies or localStorage)
// 7. Future requests include the token to prove the user is authenticated
//
// Important Security Notes:
// - We NEVER send passwords over the network unencrypted (use HTTPS)
// - Passwords are compared using bcrypt (fast comparison, secure)
// - Session tokens are JWTs that expire after a set time
// - We use the "ticket stub" system: password once, token many times

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // ========================================================================
    // Step 1: Validate Input
    // ========================================================================
    // Check that both email and password were provided.
    // We do this validation SERVER-SIDE because we never trust the client.

    if (!email || !password) {
      return NextResponse.json(
        {
          error: 'Email and password are required',
        },
        { status: 400 } // 400 = Bad Request (client error)
      );
    }

    // ========================================================================
    // Step 2: Authenticate with Supabase
    // ========================================================================
    // Supabase uses bcrypt to compare the provided password against the
    // stored hash. Bcrypt is slow on purpose—this prevents brute-force
    // attacks (trying thousands of passwords per second).
    //
    // If credentials are valid, Supabase returns:
    // - user: User object (ID, email, metadata, etc.)
    // - session: Contains access_token and refresh_token (JWTs)
    //
    // These tokens are like "ticket stubs" that prove the user is authenticated
    // without sending the password again.

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password, // Bcrypt compares this against the stored hash
    });

    if (error) {
      // SECURITY: Don't reveal whether email exists or password is wrong.
      // Attackers use "user enumeration" to find valid email addresses.
      // We use the same message for both cases to prevent this.
      return NextResponse.json(
        {
          error: 'Invalid email or password',
        },
        { status: 401 } // 401 = Unauthorized (authentication failed)
      );
    }

    // ========================================================================
    // Step 3: Return Tokens to Client
    // ========================================================================
    // Authentication succeeded! We return:
    //
    // user: The user object with ID, email, and metadata
    // access_token: JWT that proves the user is logged in
    //   - Expires in 1 hour (or configured TTL)
    //   - Sent with every API request to prove identity
    // refresh_token: Used to get a new access_token when it expires
    //   - Longer-lived (days/weeks)
    //   - Never sent with API requests, only used to refresh
    //
    // The client stores these tokens (usually in secure cookies) and
    // includes the access_token in future requests as: Authorization: Bearer {token}

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
      { status: 200 } // 200 = OK (success)
    );
  } catch (error) {
    // Unexpected error (JSON parsing, network issue, etc.)
    console.error('Login error:', error);

    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
      },
      { status: 500 } // 500 = Server Error
    );
  }
}
