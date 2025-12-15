import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
import { badRequest, handleApiError } from '@/lib/api-errors';

export const dynamic = 'force-dynamic';

// ============================================================================
// Logout Endpoint - /api/auth/logout (POST)
// ============================================================================
// This endpoint invalidates the user's session tokens.
//
// How it works:
// 1. Client sends a request with their current session (access_token)
// 2. We tell Supabase to invalidate this session
// 3. The access_token becomes invalid immediately
// 4. We return success to the client
// 5. Client deletes their local tokens and clears auth state
// 6. Any future requests without a valid token are rejected
//
// Security note: Even though the client can delete tokens locally,
// invalidating on the server prevents stolen tokens from being used.
// If someone steals the token before logout, the server invalidation
// stops them from using it.

export async function POST(_request: NextRequest) {
  try {
    // ========================================================================
    // Step 1: Invalidate Session on Server
    // ========================================================================
    // Call Supabase to invalidate the current session.
    // This revokes the access_token immediately.
    //
    // Important: This is SERVER-SIDE invalidation. Even if a hacker
    // somehow got the token, they can't use it after logout because
    // the server no longer recognizes it as valid.

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      // If something goes wrong on the server side, return an error
      return badRequest('Failed to sign out');
    }

    // ========================================================================
    // Step 2: Return Success
    // ========================================================================
    // Session invalidated! The client will:
    // 1. Delete tokens from storage (cookies/localStorage)
    // 2. Redirect to login page
    // 3. Clear auth state in React
    //
    // Any future API requests must include a new valid token.
    // Without a token, the server rejects the request.

    return NextResponse.json(
      {
        message: 'Signed out successfully',
      },
      { status: 200 } // 200 = OK (success)
    );
  } catch (error) {
    // Unexpected error
    return handleApiError(error, 'Logout');
  }
}
