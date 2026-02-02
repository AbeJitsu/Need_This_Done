import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isValidEmail, isValidPassword, PASSWORD_REQUIREMENTS } from '@/lib/validation';
import { badRequest, unauthorized, handleApiError, serverError } from '@/lib/api-errors';
import { sendLoginNotification } from '@/lib/email-service';
import { withTimeout, TIMEOUT_LIMITS, TimeoutError } from '@/lib/api-timeout';
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit';
import { initializeRequestContext, logger, createResponseHeaders } from '@/lib/request-context';

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
    // ========================================================================
    // Initialize Request Context
    // ========================================================================
    // Create correlation ID for distributed tracing - allows us to track this
    // request through all logs and debug issues end-to-end

    initializeRequestContext(request);
    logger.info('Login request received', {
      ip: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
    });

    // ========================================================================
    // Rate Limit Protection
    // ========================================================================
    // Protect login endpoint from brute-force attacks by limiting attempts
    // per IP address. 5 attempts per 15 minutes is enough for legitimate users
    // but prevents password guessing attacks.

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const { allowed: rateLimitAllowed, resetAt } = await checkRateLimit(
      ip,
      RATE_LIMITS.AUTH_LOGIN,
      'login'
    );

    if (!rateLimitAllowed) {
      logger.warn('Rate limit exceeded for login', { ip });
      return rateLimitResponse(
        resetAt,
        'Too many login attempts. Please try again in a few minutes.'
      );
    }

    // Parse JSON body with explicit error handling
    let body: unknown;
    try {
      body = await request.json();
    } catch (e) {
      // JSON parsing failed - return clear 400 error
      return badRequest('Invalid JSON format');
    }

    // Validate input with Zod schema
    const parsed = LoginSchema.safeParse(body);
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
    //
    // TIMEOUT PROTECTION: Supabase auth can hang if the service is slow.
    // Fail fast with a 10-second timeout to prevent blocking users.

    const supabase = await createSupabaseServerClient();

    let result;
    try {
      result = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        TIMEOUT_LIMITS.DATABASE, // 10 seconds - auth should be fast
        'Supabase login'
      );
    } catch (timeoutErr) {
      if (timeoutErr instanceof TimeoutError) {
        console.error('[Login] Timeout during login:', timeoutErr.message);
        return serverError('Sign in service is currently slow. Please try again in a moment.');
      }
      throw timeoutErr;
    }

    const { data, error } = result;

    if (error) {
      // SECURITY: Don't reveal whether email exists or password is wrong.
      // Attackers use "user enumeration" to find valid email addresses.
      // We use the same message for both cases to prevent this.
      return unauthorized('Invalid email or password');
    }

    // ========================================================================
    // Step 3: Send Login Notification Email (Fire-and-Forget)
    // ========================================================================
    // Security feature: notify user of new sign-ins so they can spot
    // unauthorized access. Fire-and-forget background task with error tracking.
    //
    // SAFETY: We use a separate function and explicitly handle rejection to prevent
    // any possibility of unhandled promise rejections, even in edge cases.

    if (data.user?.email) {
      const ipAddress =
        request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        'Unknown';
      const userAgent = request.headers.get('user-agent') || 'Unknown';

      // Fire-and-forget: send email in background without awaiting
      // Use void to explicitly mark as intentional fire-and-forget
      void sendLoginEmailInBackground(
        data.user.email,
        data.user.id,
        ipAddress,
        userAgent
      );
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

    logger.info('Login successful', { userId: data.user?.id, email: data.user?.email });

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
      {
        status: 200, // 200 = OK (success)
        headers: createResponseHeaders(),
      }
    );
  } catch (error) {
    // Unexpected error (JSON parsing, network issue, etc.)
    logger.error('Login failed with exception', error as Error);
    return handleApiError(error, 'Login');
  }
}

// ============================================================================
// Background Email Task - Fire-and-Forget with Full Error Handling
// ============================================================================
// Separated into its own function so we can use fire-and-forget semantics
// while ensuring NO unhandled rejections are possible.
// This function catches all errors internally and logs them appropriately.

async function sendLoginEmailInBackground(
  email: string,
  userId: string,
  ipAddress: string,
  userAgent: string
): Promise<void> {
  try {
    const emailId = await sendLoginNotification({
      email,
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
    });

    // Log successful delivery
    if (emailId) {
      logger.info('Login notification email sent', { userId, emailId });
    }
  } catch (err) {
    logger.error('Login notification email failed', err as Error, {
      userId,
      email,
      ipAddress,
    });

    // Track failed email for retry cron job
    // This is best-effort - if tracking fails, we just log it
    try {
      const supabaseClient = await createSupabaseServerClient();
      await supabaseClient.from('email_failures').insert({
        type: 'login_notification',
        recipient_email: email,
        subject: `Sign-In Notification for ${email}`,
        user_id: userId,
        attempt_count: 1,
        last_error: err instanceof Error ? err.message : 'Unknown error',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (logErr) {
      // If we can't even log the failure, just log locally
      logger.error('Failed to log login notification failure', logErr as Error);
    }
  }
}
