import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyAdmin as verifyAdminAuth } from '@/lib/api-auth';
import { badRequest, serverError, handleApiError } from '@/lib/api-errors';

export const dynamic = 'force-dynamic';

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
// GET - List All Users
// ============================================================================

export async function GET() {
  try {
    const authResult = await verifyAdminAuth();
    if (authResult.error) return authResult.error;

    // Read both identities and database-backed operator roles live. Roles are
    // intentionally not derived from mutable browser-visible user metadata.
    const adminClient = getSupabaseAdmin();
    const [{ data, error: listError }, { data: roles, error: rolesError }] = await Promise.all([
      adminClient.auth.admin.listUsers(),
      adminClient.from('user_roles').select('user_id').eq('role', 'admin'),
    ]);

    if (listError || rolesError) {
      throw new Error('Failed to load users');
    }

    const operatorIds = new Set((roles || []).map((role) => role.user_id));
    // Note: banned_until is not in the TypeScript types but exists in the API response.
    const users = data.users.map((user) => {
      const userData = user as typeof user & { banned_until?: string | null };
      return {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        email_confirmed_at: user.email_confirmed_at,
        is_admin: operatorIds.has(user.id),
        is_disabled: userData.banned_until !== null && userData.banned_until !== undefined,
        name: user.user_metadata?.name || user.user_metadata?.full_name || null,
      };
    });

    return NextResponse.json({
      users,
      count: users.length,
    });
  } catch (error) {
    return handleApiError(error, 'Admin users GET');
  }
}

// ============================================================================
// PATCH - Update User Role or Status
// ============================================================================

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth();
    if (authResult.error) return authResult.error;
    const adminUser = authResult.user;

    const body = await request.json();
    const { userId, action, value } = body;

    if (!userId || !action) {
      return badRequest('Missing required fields: userId and action');
    }

    if (action === 'setAdmin') {
      return badRequest('Operator roles are provisioned through the reviewed user_roles process.');
    }

    // Prevent admins from modifying their own account
    if (userId === adminUser.id) {
      return badRequest('Cannot modify your own account');
    }

    const adminClient = getSupabaseAdmin();

    // Handle different actions
    switch (action) {
      case 'disable': {
        // Ban/unban user (disable/enable account)
        // Note: ban_duration must be a valid Go duration string (e.g., '87600h' for ~10 years)
        // 'infinity' is not valid - use a very long duration instead
        const { error: updateError } = await adminClient.auth.admin.updateUserById(
          userId,
          {
            ban_duration: value ? '876000h' : 'none', // ~100 years
          }
        );

        if (updateError) {
          return serverError('Failed to update user status');
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
          return serverError('Failed to get user email');
        }

        // Use admin client to generate password reset link
        const { error: resetError } = await adminClient.auth.admin.generateLink({
          type: 'recovery',
          email: userData.user.email,
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/login`,
          },
        });

        if (resetError) {
          return serverError('Failed to send password reset email');
        }

        return NextResponse.json({
          success: true,
          message: 'Password reset email sent',
        });
      }

      default:
        return badRequest(`Unknown action: ${action}`);
    }
  } catch (error) {
    return handleApiError(error, 'Admin users PATCH');
  }
}
