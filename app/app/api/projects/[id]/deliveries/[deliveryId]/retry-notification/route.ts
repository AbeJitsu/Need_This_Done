import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';
import { cache, CACHE_KEYS } from '@/lib/cache';
import { sendProjectGithubHandoff } from '@/lib/email-service';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

type HandoffWithProject = {
  id: string;
  project_id: string;
  github_url: string;
  note: string | null;
  notification_status: 'draft' | 'pending' | 'acceptance_unknown' | 'sent' | 'failed';
  notification_attempts: number;
  notification_sent_at: string | null;
  notification_error: string | null;
  notification_idempotency_key: string;
  notification_operation_id: string;
  created_at: string;
  projects: { name: string; email: string } | Array<{ name: string; email: string }>;
};

function projectContact(handoff: HandoffWithProject) {
  return Array.isArray(handoff.projects) ? handoff.projects[0] : handoff.projects;
}

function withoutProjectContact(handoff: HandoffWithProject) {
  const { projects: _projects, notification_idempotency_key: _key, notification_operation_id: _operation, ...safe } = handoff;
  return safe;
}

/** An operator-confirmed send or retry always reuses the migration-managed key. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; deliveryId: string }> },
) {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;
  const body = await request.json().catch(() => null) as { confirm?: unknown } | null;
  if (body?.confirm !== true) {
    return NextResponse.json({ error: 'Explicit handoff email confirmation is required.' }, { status: 400 });
  }

  const { id: projectId, deliveryId } = await params;
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('project_github_handoffs')
    .select(`
      id, project_id, github_url, note, notification_status,
      notification_attempts, notification_sent_at, notification_error,
      notification_idempotency_key, notification_operation_id, created_at,
      projects!inner(name, email)
    `)
    .eq('id', deliveryId)
    .eq('project_id', projectId)
    .maybeSingle<HandoffWithProject>();
  if (error) return NextResponse.json({ error: 'Failed to load GitHub handoff.' }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'GitHub handoff not found.' }, { status: 404 });
  if (data.notification_status === 'sent') {
    return NextResponse.json({ handoff: withoutProjectContact(data), notificationSent: true, duplicate: true });
  }
  if (data.notification_status === 'acceptance_unknown') {
    return NextResponse.json(
      { error: 'This handoff needs operator reconciliation before another send.' },
      { status: 409 },
    );
  }
  const contact = projectContact(data);
  if (!contact?.email) {
    return NextResponse.json({ error: 'The project has no handoff recipient.' }, { status: 409 });
  }

  try {
    const result = await sendProjectGithubHandoff({
      email: contact.email,
      name: contact.name,
      githubUrl: data.github_url,
      note: data.note,
    }, {
      operationKey: data.notification_idempotency_key,
      operationId: data.notification_operation_id,
      handoffId: data.id,
      projectId: data.project_id,
    });
    if (!result) {
      return NextResponse.json(
        { error: 'Transactional email is disabled; the handoff remains unsent.' },
        { status: 503 },
      );
    }
    await cache.invalidate(CACHE_KEYS.projectDeliveries(projectId, true));
    return NextResponse.json({
      handoff: result.handoff,
      providerMessageId: result.providerMessageId,
      notificationSent: true,
    });
  } catch {
    return NextResponse.json(
      { error: 'The handoff email was not completed. Review its durable operation before retrying.' },
      { status: 503 },
    );
  }
}
