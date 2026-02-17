// eslint-disable-next-line no-restricted-imports -- signup creates new users, no existing session needed
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isValidEmail, isValidPassword, PASSWORD_REQUIREMENTS } from '@/lib/validation';
import { badRequest, handleApiError, serverError } from '@/lib/api-errors';
import { sendWelcomeEmail } from '@/lib/email-service';
import { withTimeout, TIMEOUT_LIMITS, TimeoutError } from '@/lib/api-timeout';
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit';

// Schema uses existing validation helpers for consistency with forms
const SignupSchema = z.object({
  email: z.string().min(1, 'Email is required').refine(isValidEmail, 'Invalid email format'),
  password: z.string().min(1, 'Password is required').refine(isValidPassword, `Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters`),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const dynamic = 'force-dynamic';

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
    // ========================================================================
    // Rate Limit Protection
    // ========================================================================
    // Protect signup endpoint from account enumeration and spam by limiting
    // signup attempts per IP. 3 attempts per 15 minutes is strict but prevents
    // bulk account creation attacks.

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const { allowed: rateLimitAllowed, resetAt } = await checkRateLimit(
      ip,
      RATE_LIMITS.AUTH_SIGNUP,
      'signup'
    );

    if (!rateLimitAllowed) {
      return rateLimitResponse(
        resetAt,
        'Too many signup attempts. Please try again in a few minutes.'
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
    const parsed = SignupSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }
    const { email, password, metadata } = parsed.data;

    // ========================================================================
    // Create User Account in Supabase Auth
    // ========================================================================
    // Supabase handles the heavy lifting:
    // - Hashes the password using bcrypt (one-way encryption)
    // - Stores the email and hashed password in the auth table
    // - Creates a user session token (JWT)
    // - Sends confirmation email if email verification is enabled
    //
    // We pass emailRedirectTo so users return to our app after confirming
    // their email, completing the signup flow.
    //
    // TIMEOUT PROTECTION: Supabase auth can hang if the service is slow.
    // Fail fast with a 10-second timeout to prevent blocking users.

    let result;
    try {
      result = await withTimeout(
        supabase.auth.signUp({
          email,
          password, // This is hashed by Supabase - we never store plain passwords
          options: {
            data: metadata || {}, // Store additional user info (name, etc.)
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
          },
        }),
        TIMEOUT_LIMITS.DATABASE, // 10 seconds - auth should be fast
        'Supabase signup'
      );
    } catch (timeoutErr) {
      if (timeoutErr instanceof TimeoutError) {
        console.error('[Signup] Timeout during signup:', timeoutErr.message);
        return serverError('Sign up service is currently slow. Please try again in a moment.');
      }
      throw timeoutErr;
    }

    const { data, error } = result;

    if (error) {
      // If signup fails (e.g., email already exists), return the error
      return badRequest(error.message);
    }

    // ========================================================================
    // Step 3: Send Welcome Email
    // ========================================================================
    // Send our custom welcome email in addition to Supabase's confirmation.
    // Fire-and-forget but track delivery in database for monitoring.

    if (data.user?.email) {
      // Send asynchronously without blocking response, but track in DB for visibility
      // CRITICAL: Attach error handler to prevent unhandled rejections
      const sendWelcomeEmailAsync = (async () => {
        try {
          const userEmail = data.user?.email;
          if (!userEmail) return; // Email is required to send notification

          const emailId = await sendWelcomeEmail({
            email: userEmail,
            name: (metadata?.name || metadata?.full_name) as string | undefined,
          });

          if (emailId) {
            console.log('[Signup] Welcome email sent', {
              userId: data.user?.id,
              emailId,
            });
          }
        } catch (err) {
          console.error('[Signup] Welcome email failed:', err, {
            userId: data.user?.id,
            email: data.user?.email,
          });

          // Track failed email for manual follow-up (best-effort, don't block response)
          try {
            const supabaseClient = await import('@/lib/supabase').then(m => m.supabase);
            await supabaseClient
              .from('email_failures')
              .insert({
                type: 'welcome_email',
                recipient_email: data.user?.email,
                subject: 'Welcome to NeedThisDone!',
                user_id: data.user?.id,
                error_message: err instanceof Error ? err.message : 'Unknown error',
                created_at: new Date().toISOString(),
              });
          } catch (logErr) {
            console.error('[Signup] Failed to log welcome email failure:', logErr);
          }
        }
      })();

      // Attach catch handler to prevent unhandled promise rejections
      sendWelcomeEmailAsync.catch((err) => {
        console.error('[Signup] Unhandled error in async welcome email task:', err);
      });
    }

    // ========================================================================
    // Step 4: Return Success Response
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
    return handleApiError(error, 'Sign up');
  }
}
