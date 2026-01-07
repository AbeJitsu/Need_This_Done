// eslint-disable-next-line no-restricted-imports -- signup creates new users, no existing session needed
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isValidEmail, isValidPassword, PASSWORD_REQUIREMENTS } from '@/lib/validation';
import { badRequest, handleApiError } from '@/lib/api-errors';
import { sendWelcomeEmail } from '@/lib/email-service';

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
    // Validate input with Zod schema
    const parsed = SignupSchema.safeParse(await request.json());
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
      return badRequest(error.message);
    }

    // ========================================================================
    // Step 3: Send Welcome Email
    // ========================================================================
    // Send our custom welcome email in addition to Supabase's confirmation.
    // This runs async - we don't wait for it to complete before responding.
    // Email failures shouldn't break the signup flow.

    if (data.user?.email) {
      sendWelcomeEmail({
        email: data.user.email,
        name: metadata?.name || metadata?.full_name,
      }).catch((err) => {
        console.error('[Signup] Welcome email failed:', err);
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
