// ============================================================================
// API Route Authentication Utilities
// ============================================================================
// Shared authentication helpers for API routes. These handle the common
// patterns of verifying users, checking admin status, and validating
// project access - reducing duplication across route handlers.
//
// Supports both Supabase sessions (email/password) and NextAuth sessions (Google OAuth)

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { authOptions } from '@/lib/auth-options';
import type { User } from '@supabase/supabase-js';

// ============================================================================
// Type Definitions
// ============================================================================

type AuthSuccess = { user: User; error?: never };
type AuthError = { user?: never; error: NextResponse };
type AuthResult = AuthSuccess | AuthError;

type ProjectAccessResult = {
  hasAccess: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  error?: NextResponse;
};

// ============================================================================
// Verify Authentication
// ============================================================================
// Checks if a user is authenticated via Supabase OR NextAuth.
// Returns the user object on success, or a 401 NextResponse error if not.
//
// Priority: Supabase session first (email/password), then NextAuth (Google OAuth)

export async function verifyAuth(): Promise<AuthResult> {
  // First, try Supabase session (email/password login)
  const supabase = await createSupabaseServerClient();
  const { data: { user: supabaseUser }, error: supabaseError } = await supabase.auth.getUser();

  console.log('[verifyAuth] Supabase check:', JSON.stringify({
    hasUser: !!supabaseUser,
    userId: supabaseUser?.id,
    userEmail: supabaseUser?.email,
    error: supabaseError?.message,
  }));

  if (supabaseUser) {
    return { user: supabaseUser };
  }

  // Fall back to NextAuth session (Google OAuth)
  try {
    const nextAuthSession = await getServerSession(authOptions);

    // Debug logging - remove after fixing
    console.log('[verifyAuth] NextAuth session:', JSON.stringify({
      hasSession: !!nextAuthSession,
      hasUser: !!nextAuthSession?.user,
      userId: nextAuthSession?.user?.id,
      userEmail: nextAuthSession?.user?.email,
      isAdmin: (nextAuthSession?.user as { isAdmin?: boolean })?.isAdmin,
    }));

    if (nextAuthSession?.user?.id) {
      // NextAuth user - construct a compatible User object
      // The user.id from NextAuth is the Supabase user ID (synced during sign-in)
      const sessionUser = nextAuthSession.user;
      const pseudoUser = {
        id: sessionUser.id,
        email: sessionUser.email || undefined,
        user_metadata: {
          name: sessionUser.name,
          avatar_url: sessionUser.image,
          is_admin: sessionUser.isAdmin ?? false,
        },
        app_metadata: {},
        aud: 'authenticated',
        created_at: '',
      } as User;

      return { user: pseudoUser };
    }
  } catch (error) {
    console.error('[verifyAuth] NextAuth session check failed:', error);
    // Continue to return unauthorized error below
  }

  // No valid session found
  return {
    error: NextResponse.json(
      { error: 'Unauthorized. Please sign in.' },
      { status: 401 }
    ),
  };
}

// ============================================================================
// Verify Admin Access
// ============================================================================
// Checks if the user is authenticated AND has admin privileges.
// Returns 401 for unauthenticated, 403 for non-admin users.

export async function verifyAdmin(): Promise<AuthResult> {
  const authResult = await verifyAuth();

  if (authResult.error) {
    return authResult;
  }

  const isAdmin = authResult.user.user_metadata?.is_admin === true;

  if (!isAdmin) {
    return {
      error: NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      ),
    };
  }

  return { user: authResult.user };
}

// ============================================================================
// Check Admin Status
// ============================================================================
// Simple helper to check if a user object has admin privileges.

export function isUserAdmin(user: User): boolean {
  return user.user_metadata?.is_admin === true;
}

// ============================================================================
// Verify Project Access
// ============================================================================
// Checks if the authenticated user has access to a specific project.
// Access is granted if the user owns the project or is an admin.
// Returns 401/403/404 errors as appropriate.

export async function verifyProjectAccess(
  projectId: string
): Promise<ProjectAccessResult> {
  // First verify authentication
  const authResult = await verifyAuth();

  if (authResult.error) {
    return {
      hasAccess: false,
      isOwner: false,
      isAdmin: false,
      error: authResult.error,
    };
  }

  const user = authResult.user;
  const isAdmin = isUserAdmin(user);

  // Fetch project to check ownership
  const supabase = await createSupabaseServerClient();
  const { data: project } = await supabase
    .from('projects')
    .select('user_id')
    .eq('id', projectId)
    .single();

  if (!project) {
    return {
      hasAccess: false,
      isOwner: false,
      isAdmin,
      error: NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      ),
    };
  }

  const isOwner = project.user_id === user.id;
  const hasAccess = isAdmin || isOwner;

  if (!hasAccess) {
    return {
      hasAccess: false,
      isOwner,
      isAdmin,
      error: NextResponse.json(
        { error: 'Forbidden. No access to this project.' },
        { status: 403 }
      ),
    };
  }

  return {
    hasAccess: true,
    isOwner,
    isAdmin,
  };
}
