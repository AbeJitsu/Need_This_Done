import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, verifyProjectAccess } from '@/lib/api-auth';
import { cache, CACHE_KEYS } from '@/lib/cache';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendProjectGithubHandoff } from '@/lib/email-service';

export const dynamic = 'force-dynamic';

type ProjectRecord = {
  id: string;
  name: string;
  email: string;
  user_id: string | null;
};

type HandoffRecord = {
  id: string;
  project_id: string;
  github_url: string;
  note: string | null;
  notification_status: 'pending' | 'sent' | 'failed';
  notification_attempts: number;
  notification_sent_at: string | null;
  notification_error: string | null;
  created_at: string;
};

function parseGithubUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  try {
    const url = new URL(value.trim());
    const isGithub = url.protocol === 'https:' &&
      (url.hostname === 'github.com' || url.hostname === 'www.github.com');
    const pathParts = url.pathname.split('/').filter(Boolean);
    return isGithub && pathParts.length >= 2 ? url.toString() : null;
  } catch {
    return null;
  }
}

function parseNote(value: unknown): string | null | undefined {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return undefined;
  const note = value.trim();
  return note.length <= 2_000 ? note || null : undefined;
}

function portalUrl() {
  return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com'}/dashboard`;
}

async function invalidateProjectDeliveryCaches(projectId: string, userId: string) {
  await Promise.all([
    cache.invalidate(CACHE_KEYS.userProjects(userId)),
    cache.invalidate(CACHE_KEYS.projectDeliveries(projectId, true)),
    cache.invalidate(CACHE_KEYS.projectDeliveries(projectId, false)),
  ]);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const access = await verifyProjectAccess(id);
  if (access.error) return access.error;

  const result = await cache.wrap(
    CACHE_KEYS.projectDeliveries(id, access.isAdmin),
    async () => {
      const { data, error } = await getSupabaseAdmin()
        .from('project_github_handoffs')
        .select('id, project_id, github_url, note, notification_status, notification_attempts, notification_sent_at, notification_error, created_at')
        .eq('project_id', id)
        .order('created_at', { ascending: false });
      if (error) throw new Error('Failed to load GitHub handoffs.');
      return (data || []) as HandoffRecord[];
    },
  );

  const handoffs = access.isAdmin
    ? result.data
    : result.data.map(({ notification_status: _status, notification_attempts: _attempts, notification_sent_at: _sentAt, notification_error: _error, ...handoff }) => handoff);

  return NextResponse.json({ handoffs, cached: result.cached, source: result.source });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;

  const body: unknown = await request.json().catch(() => null);
  const githubUrl = body && typeof body === 'object' ? parseGithubUrl((body as { githubUrl?: unknown }).githubUrl) : null;
  const note = body && typeof body === 'object' ? parseNote((body as { note?: unknown }).note) : undefined;
  if (!githubUrl || note === undefined) {
    return NextResponse.json(
      { error: 'Provide an HTTPS GitHub repository link and an optional note of 2,000 characters or fewer.' },
      { status: 400 },
    );
  }

  const { id } = await params;
  const admin = getSupabaseAdmin();
  const { data: project, error: projectError } = await admin
    .from('projects')
    .select('id, name, email, user_id')
    .eq('id', id)
    .maybeSingle<ProjectRecord>();

  if (projectError) return NextResponse.json({ error: 'Failed to load project.' }, { status: 500 });
  if (!project) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  if (!project.user_id) {
    return NextResponse.json(
      { error: 'Link this project to an existing client account before publishing a GitHub handoff.' },
      { status: 409 },
    );
  }

  const { data: handoff, error: insertError } = await admin
    .from('project_github_handoffs')
    .insert({
      project_id: id,
      github_url: githubUrl,
      note,
      created_by: auth.user.id,
      notification_status: 'pending',
      notification_attempts: 1,
    })
    .select('id, project_id, github_url, note, notification_status, notification_attempts, notification_sent_at, notification_error, created_at')
    .single<HandoffRecord>();

  if (insertError || !handoff) {
    return NextResponse.json({ error: 'Failed to publish GitHub handoff.' }, { status: 500 });
  }

  const emailId = await sendProjectGithubHandoff({
    email: project.email,
    name: project.name,
    githubUrl,
    note,
    portalUrl: portalUrl(),
  }).catch(() => null);

  const notificationUpdate = emailId
    ? { notification_status: 'sent', notification_sent_at: new Date().toISOString(), notification_provider_id: emailId, notification_error: null }
    : { notification_status: 'failed', notification_error: 'The delivery email could not be sent. Retry it from this project.' };
  const { data: updatedHandoff, error: notificationError } = await admin
    .from('project_github_handoffs')
    .update(notificationUpdate)
    .eq('id', handoff.id)
    .select('id, project_id, github_url, note, notification_status, notification_attempts, notification_sent_at, notification_error, created_at')
    .single<HandoffRecord>();

  if (notificationError || !updatedHandoff) {
    return NextResponse.json({ error: 'GitHub handoff was published but its notification status could not be recorded.' }, { status: 500 });
  }

  await invalidateProjectDeliveryCaches(id, project.user_id);
  return NextResponse.json({ handoff: updatedHandoff, notificationSent: Boolean(emailId) }, { status: 201 });
}
