import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// ============================================================================
// Admin Users API Route - /api/admin/users
// ============================================================================
// GET: List all users with their roles and status.
// PATCH: Update user role or disable/enable account.
// Requires authentication and admin privileges.
//
// NOTE: User management requires Supabase service role key for admin operations.
// This is separate from the client-side supabase instance.

// ============================================================================
// Create Admin Supabase Client with Service Role
// ============================================================================

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin credentials');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ============================================================================
// Verify Admin Access
// ============================================================================

async function verifyAdmin(): Promise<{
  isAdmin: boolean;
  user: any;
  error?: string;
}> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { isAdmin: false, user: null, error: 'Unauthorized. Please sign in.' };
  }

  const isAdmin = user.user_metadata?.is_admin === true;

  if (!isAdmin) {
    return { isAdmin: false, user, error: 'Forbidden. Admin access required.' };
  }

  return { isAdmin: true, user };
}

// ============================================================================
// GET - List All Users
// ============================================================================

export async function GET() {
  try {
    const { isAdmin, error } = await verifyAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        { error },
        { status: error?.includes('Unauthorized') ? 401 : 403 }
      );
    }

    // Use admin client to list users
    const adminClient = getAdminClient();
    const { data, error: listError } = await adminClient.auth.admin.listUsers();

    if (listError) {
      console.error('Failed to list users:', listError.message);
      return NextResponse.json(
        { error: 'Failed to load users' },
        { status: 500 }
      );
    }

    // Transform user data for the frontend
    // Note: banned_until is not in the TypeScript types but exists in the API response
    const users = data.users.map((user) => {
      const userData = user as typeof user & { banned_until?: string | null };
      return {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        email_confirmed_at: user.email_confirmed_at,
        is_admin: user.user_metadata?.is_admin === true,
        is_disabled: userData.banned_until !== null && userData.banned_until !== undefined,
        name: user.user_metadata?.name || user.user_metadata?.full_name || null,
      };
    });

    return NextResponse.json({
      users,
      count: users.length,
    });
  } catch (error) {
    console.error('Admin users GET error:', error);

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH - Update User Role or Status
// ============================================================================

export async function PATCH(request: NextRequest) {
  try {
    const { isAdmin, user: adminUser, error } = await verifyAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        { error },
        { status: error?.includes('Unauthorized') ? 401 : 403 }
      );
    }

    const body = await request.json();
    const { userId, action, value } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and action' },
        { status: 400 }
      );
    }

    // Prevent admins from modifying their own account
    if (userId === adminUser.id) {
      return NextResponse.json(
        { error: 'Cannot modify your own account' },
        { status: 400 }
      );
    }

    const adminClient = getAdminClient();

    // Handle different actions
    switch (action) {
      case 'setAdmin': {
        // Set or remove admin role
        const { error: updateError } = await adminClient.auth.admin.updateUserById(
          userId,
          {
            user_metadata: { is_admin: value === true },
          }
        );

        if (updateError) {
          console.error('Failed to update admin status:', updateError.message);
          return NextResponse.json(
            { error: 'Failed to update user role' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: value ? 'User promoted to admin' : 'Admin role removed',
        });
      }

      case 'disable': {
        // Ban/unban user (disable/enable account)
        const { error: updateError } = await adminClient.auth.admin.updateUserById(
          userId,
          {
            ban_duration: value ? 'infinity' : 'none',
          }
        );

        if (updateError) {
          console.error('Failed to update user status:', updateError.message);
          return NextResponse.json(
            { error: 'Failed to update user status' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: value ? 'User account disabled' : 'User account enabled',
        });
      }

      case 'resetPassword': {
        // Trigger password reset email
        const { data: userData, error: getUserError } =
          await adminClient.auth.admin.getUserById(userId);

        if (getUserError || !userData.user?.email) {
          return NextResponse.json(
            { error: 'Failed to get user email' },
            { status: 500 }
          );
        }

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          userData.user.email,
          {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/login`,
          }
        );

        if (resetError) {
          console.error('Failed to send reset email:', resetError.message);
          return NextResponse.json(
            { error: 'Failed to send password reset email' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Password reset email sent',
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Admin users PATCH error:', error);

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
