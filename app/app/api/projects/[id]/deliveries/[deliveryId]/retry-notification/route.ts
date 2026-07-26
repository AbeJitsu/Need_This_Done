import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';
import { cache, CACHE_KEYS } from '@/lib/cache';
import { sendProjectGithubHandoff } from '@/lib/email-service';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; deliveryId: string }> }
) {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;

  const { id, deliveryId } = await params;
  const admin = getSupabaseAdmin();
  const { data: project, error: projectError } = await admin
    .from('projects')
    .select('id, name, email, user_id')
    .eq('id', id)
    .maybeSingle();
  if (projectError || !project) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  if (!project.user_id) return NextResponse.json({ error: 'This project no longer has linked client portal access.' }, { status: 409 });

  const { data: handoff, error: handoffError } = await admin
    .from('project_github_handoffs')
    .select('id, github_url, note, notification_status, notification_attempts')
    .eq('id', deliveryId)
    .eq('project_id', id)
    .maybeSingle();
  if (handoffError || !handoff) return NextResponse.json({ error: 'GitHub handoff not found.' }, { status: 404 });
  if (handoff.notification_status === 'sent') return NextResponse.json({ error: 'The delivery email was already sent.' }, { status: 409 });
  if (handoff.notification_status === 'pending') return NextResponse.json({ error: 'A delivery email is already being sent.' }, { status: 409 });

  const { data: claimedHandoff, error: claimError } = await admin
    .from('project_github_handoffs')
    .update({
      notification_status: 'pending',
      notification_attempts: handoff.notification_attempts + 1,
      notification_error: null,
    })
    .eq('id', deliveryId)
    .eq('notification_status', 'failed')
    .select('id')
    .maybeSingle();
  if (claimError) return NextResponse.json({ error: 'Failed to retry delivery email.' }, { status: 500 });
  if (!claimedHandoff) return NextResponse.json({ error: 'A delivery email retry is already in progress.' }, { status: 409 });

  const emailId = await sendProjectGithubHandoff({
    email: project.email,
    name: project.name,
    githubUrl: handoff.github_url,
    note: handoff.note,
    portalUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com'}/dashboard`,
  }).catch(() => null);
  const notificationUpdate = emailId
    ? { notification_status: 'sent', notification_sent_at: new Date().toISOString(), notification_provider_id: emailId, notification_error: null }
    : { notification_status: 'failed', notification_error: 'The delivery email could not be sent. Retry it from this project.' };
  const { data: updatedHandoff, error: updateError } = await admin
    .from('project_github_handoffs')
    .update(notificationUpdate)
    .eq('id', deliveryId)
    .select('id, project_id, github_url, note, notification_status, notification_attempts, notification_sent_at, notification_error, created_at')
    .single();
  if (updateError || !updatedHandoff) return NextResponse.json({ error: 'The delivery email was attempted but its status could not be recorded.' }, { status: 500 });

  await Promise.all([
    cache.invalidate(CACHE_KEYS.userProjects(project.user_id)),
    cache.invalidate(CACHE_KEYS.projectDeliveries(id, true)),
    cache.invalidate(CACHE_KEYS.projectDeliveries(id, false)),
  ]);
  return NextResponse.json({ handoff: updatedHandoff, notificationSent: Boolean(emailId) });
}
