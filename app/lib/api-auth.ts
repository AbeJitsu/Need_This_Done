// ============================================================================
// API Route Authentication Utilities
// ============================================================================
// Shared authentication helpers for API routes. These handle the common
// patterns of verifying users, checking admin status, and validating
// project access - reducing duplication across route handlers.
//
// Supabase Auth is the only application session accepted here. This is
// intentional: the same identity must reach database RLS and API checks.

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase';
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
// Checks if a user is authenticated via Supabase Auth.
// Returns the user object on success, or a 401 NextResponse error if not.

export async function verifyAuth(): Promise<AuthResult> {
  const supabase = await createSupabaseServerClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (supabaseUser) {
    return { user: supabaseUser };
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
//
export async function verifyAdmin(): Promise<AuthResult> {
  const authResult = await verifyAuth();

  if (authResult.error) {
    return authResult;
  }

  if (!(await hasAdminRole(authResult.user.id))) {
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

export async function hasAdminRole(userId: string): Promise<boolean> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (error) {
      console.error('[hasAdminRole] Failed to check operator role:', error);
      return false;
    }

    return data !== null;
  } catch (error) {
    console.error('[hasAdminRole] Failed to initialize operator role check:', error);
    return false;
  }
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
  const isAdmin = await hasAdminRole(user.id);

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
