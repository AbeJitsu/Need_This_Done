import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isValidEmail, isValidPassword, PASSWORD_REQUIREMENTS } from '@/lib/validation';
import { badRequest, unauthorized, handleApiError } from '@/lib/api-errors';
import { sendLoginNotification } from '@/lib/email-service';

// Schema uses existing validation helpers for consistency with forms
const LoginSchema = z.object({
  email: z.string().min(1, 'Email is required').refine(isValidEmail, 'Invalid email format'),
  password: z.string().min(1, 'Password is required').refine(isValidPassword, `Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters`),
});

export const dynamic = 'force-dynamic';

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
    // Validate input with Zod schema
    const parsed = LoginSchema.safeParse(await request.json());
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }
    const { email, password } = parsed.data;

    // ========================================================================
    // Authenticate with Supabase
    // ========================================================================
    // Uses the server client which automatically handles cookies.
    // This ensures the session is stored in cookies for subsequent requests.
    //
    // Supabase uses bcrypt to compare the provided password against the
    // stored hash. Bcrypt is slow on purpose—this prevents brute-force
    // attacks (trying thousands of passwords per second).
    //
    // If credentials are valid, Supabase returns:
    // - user: User object (ID, email, metadata, etc.)
    // - session: Contains access_token and refresh_token (JWTs)

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // SECURITY: Don't reveal whether email exists or password is wrong.
      // Attackers use "user enumeration" to find valid email addresses.
      // We use the same message for both cases to prevent this.
      return unauthorized('Invalid email or password');
    }

    // ========================================================================
    // Step 3: Send Login Notification Email
    // ========================================================================
    // Security feature: notify user of new sign-ins so they can spot
    // unauthorized access. Runs async - doesn't block the login response.

    if (data.user?.email) {
      const ipAddress =
        request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        'Unknown';
      const userAgent = request.headers.get('user-agent') || 'Unknown';

      sendLoginNotification({
        email: data.user.email,
        loginTime: new Date().toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZoneName: 'short',
        }),
        ipAddress,
        userAgent,
      }).catch((err) => {
        console.error('[Login] Login notification email failed:', err);
      });
    }

    // ========================================================================
    // Step 4: Return Tokens to Client
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
    return handleApiError(error, 'Login');
  }
}
