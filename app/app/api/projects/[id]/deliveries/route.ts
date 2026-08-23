import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';
import { cache, CACHE_KEYS } from '@/lib/cache';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

type ProjectRecord = {
  id: string;
};

type HandoffRecord = {
  id: string;
  project_id: string;
  github_url: string;
  note: string | null;
  notification_status: 'draft' | 'pending' | 'sent' | 'failed';
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

async function invalidateProjectDeliveryCaches(projectId: string) {
  await Promise.all([
    cache.invalidate(CACHE_KEYS.projectDeliveries(projectId, true)),
  ]);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;

  const result = await cache.wrap(
    CACHE_KEYS.projectDeliveries(id, true),
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

  return NextResponse.json({ handoffs: result.data, cached: result.cached, source: result.source });
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
    .select('id')
    .eq('id', id)
    .maybeSingle<ProjectRecord>();

  if (projectError) return NextResponse.json({ error: 'Failed to load project.' }, { status: 500 });
  if (!project) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  const { data: handoff, error: insertError } = await admin
    .from('project_github_handoffs')
    .insert({
      project_id: id,
      github_url: githubUrl,
      note,
      created_by: auth.user.id,
      notification_status: 'draft',
      notification_attempts: 0,
    })
    .select('id, project_id, github_url, note, notification_status, notification_attempts, notification_sent_at, notification_error, created_at')
    .single<HandoffRecord>();

  if (insertError || !handoff) {
    return NextResponse.json({ error: 'Failed to save GitHub handoff draft.' }, { status: 500 });
  }

  await invalidateProjectDeliveryCaches(id);
  return NextResponse.json({ handoff, notificationSent: false, draft: true }, { status: 201 });
}
