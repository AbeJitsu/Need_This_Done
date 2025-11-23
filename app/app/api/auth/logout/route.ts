import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// Logout Endpoint - Sign Out the Current User
// ============================================================================
// This clears the user's session and logs them out.
// The client should delete their local session tokens after this.

export async function POST(_request: NextRequest) {
  try {
    // ========================================================================
    // Sign Out User
    // ========================================================================
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Sign out error:', error);
      return NextResponse.json(
        {
          error: 'Failed to sign out',
        },
        { status: 400 }
      );
    }

    // ========================================================================
    // Return Success
    // ========================================================================
    return NextResponse.json(
      {
        message: 'Signed out successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
