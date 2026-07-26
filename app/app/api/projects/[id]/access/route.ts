import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { verifyAdmin } from '@/lib/api-auth';
import { handleApiError } from '@/lib/api-errors';
import { cache, CACHE_KEYS } from '@/lib/cache';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

type ProjectAccessRecord = {
  id: string;
  email: string;
  user_id: string | null;
};

const USER_PAGE_SIZE = 1_000;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function findExistingUserByEmail(
  adminClient: ReturnType<typeof getSupabaseAdmin>,
  projectEmail: string
): Promise<User | null> {
  const targetEmail = normalizeEmail(projectEmail);

  for (let page = 1; ; page += 1) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage: USER_PAGE_SIZE,
    });

    if (error) {
      throw new Error('Failed to look up the existing client account');
    }

    const match = data.users.find((user) =>
      typeof user.email === 'string' && normalizeEmail(user.email) === targetEmail
    );
    if (match) return match;

    if (data.users.length < USER_PAGE_SIZE) return null;
  }
}

async function invalidateProjectAccessCaches(projectId: string, userId: string) {
  await Promise.all([
    cache.invalidate(CACHE_KEYS.userProjects(userId)),
    cache.invalidate(CACHE_KEYS.projectComments(projectId, true)),
    cache.invalidate(CACHE_KEYS.projectComments(projectId, false)),
    cache.invalidatePattern('admin:projects:*'),
  ]);
}

// PATCH /api/projects/:id/access
// Links a guest project only to an already-existing account with the exact
// normalized project email, or removes its existing portal link. This route
// deliberately never creates accounts, sends invitations, or returns users.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminAuth = await verifyAdmin();
    if (adminAuth.error) return adminAuth.error;

    const { id } = await params;
    const body: unknown = await request.json();
    const action = typeof body === 'object' && body !== null
      ? (body as { action?: unknown }).action
      : undefined;

    if (action !== 'link' && action !== 'unlink') {
      return NextResponse.json(
        { error: 'Action must be either "link" or "unlink".' },
        { status: 400 }
      );
    }

    const adminClient = getSupabaseAdmin();
    const { data: project, error: projectError } = await adminClient
      .from('projects')
      .select('id, email, user_id')
      .eq('id', id)
      .maybeSingle<ProjectAccessRecord>();

    if (projectError) {
      throw new Error(`Failed to load project: ${projectError.message}`);
    }
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    if (action === 'link') {
      if (project.user_id) {
        return NextResponse.json(
          { error: 'Client portal access is already enabled for this project.' },
          { status: 409 }
        );
      }

      const matchingUser = await findExistingUserByEmail(adminClient, project.email);
      if (!matchingUser) {
        return NextResponse.json(
          {
            error: 'No existing account matches this project email. Create no account or invitation here.',
            eligibleEmail: project.email,
          },
          { status: 404 }
        );
      }

      // The empty-link condition prevents this route from reassigning a
      // project if a second operator acts between the initial read and update.
      const { data: updatedProject, error: updateError } = await adminClient
        .from('projects')
        .update({ user_id: matchingUser.id })
        .eq('id', id)
        .is('user_id', null)
        .select('id')
        .maybeSingle();

      if (updateError) {
        throw new Error(`Failed to enable client access: ${updateError.message}`);
      }
      if (!updatedProject) {
        return NextResponse.json(
          { error: 'Client portal access was changed before this request completed.' },
          { status: 409 }
        );
      }

      await invalidateProjectAccessCaches(id, matchingUser.id);
      return NextResponse.json({
        success: true,
        action,
        portalAccessEnabled: true,
        eligibleEmail: project.email,
      });
    }

    if (!project.user_id) {
      return NextResponse.json(
        { error: 'Client portal access is not enabled for this project.' },
        { status: 409 }
      );
    }

    const { data: updatedProject, error: updateError } = await adminClient
      .from('projects')
      .update({ user_id: null })
      .eq('id', id)
      .eq('user_id', project.user_id)
      .select('id')
      .maybeSingle();

    if (updateError) {
      throw new Error(`Failed to remove client access: ${updateError.message}`);
    }
    if (!updatedProject) {
      return NextResponse.json(
        { error: 'Client portal access was changed before this request completed.' },
        { status: 409 }
      );
    }

    await invalidateProjectAccessCaches(id, project.user_id);
    return NextResponse.json({
      success: true,
      action,
      portalAccessEnabled: false,
      eligibleEmail: project.email,
    });
  } catch (error) {
    return handleApiError(error, 'Project access PATCH');
  }
}
