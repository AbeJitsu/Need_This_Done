import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import {
  consumeAgentBridgeNonce,
  isSignedAgentBridgeFailure,
  verifySignedAgentBridgeRequest,
} from '@/lib/agent-bridge-auth';

export const dynamic = 'force-dynamic';

const artifactSchema = z.object({
  artifactType: z.enum(['research_dossier', 'email_draft', 'script', 'storyboard', 'thumbnail', 'video', 'audio', 'subtitles', 'content_package', 'review_report', 'other']),
  title: z.string().trim().min(1).max(300),
  contentText: z.string().max(200_000).optional(),
  storagePath: z.string().trim().max(500).optional(),
  mimeType: z.string().trim().max(120).optional(),
  byteSize: z.number().int().nonnegative().max(50 * 1024 * 1024).optional(),
  sha256: z.string().trim().regex(/^[a-f0-9]{64}$/i).optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
}).strict().refine((value) => Boolean(value.contentText || value.storagePath), {
  message: 'An artifact needs text content or a private storage path.',
});

const schema = z.object({
  ownerId: z.string().uuid(),
  taskId: z.string().uuid(),
  workerId: z.string().trim().min(1).max(160),
  status: z.enum(['succeeded', 'failed']),
  output: z.record(z.string(), z.unknown()).nullable().optional(),
  error: z.string().trim().max(4_000).nullable().optional(),
  artifacts: z.array(artifactSchema).max(20).default([]),
  reservationKey: z.string().uuid().optional(),
  actualCost: z.number().finite().nonnegative().max(20).optional(),
  provider: z.string().trim().max(160).optional(),
  providerUsage: z.record(z.string(), z.unknown()).default({}),
}).strict();

export async function POST(request: Request) {
  const signed = await verifySignedAgentBridgeRequest(request, '/api/agent-bridge/complete');
  if (isSignedAgentBridgeFailure(signed)) return signed;
  if (signed.body.length > 512_000) return NextResponse.json({ error: 'Agent completion payload is too large.' }, { status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(signed.body);
  } catch {
    return NextResponse.json({ error: 'Invalid agent completion JSON.' }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid agent completion.' }, { status: 400 });
  }
  const replay = await consumeAgentBridgeNonce(signed.nonce);
  if (replay) return replay;

  const admin = getSupabaseAdmin();
  const { data: task, error: taskError } = await admin
    .from('agent_orchestration_tasks')
    .select('id, owner_id, run_id, task_type, status, leased_by, lease_expires_at')
    .eq('id', parsed.data.taskId)
    .eq('owner_id', parsed.data.ownerId)
    .maybeSingle();
  if (taskError || !task) return NextResponse.json({ error: 'Agent task was not found.' }, { status: 404 });
  if (!['leased', 'running'].includes(task.status)
    || task.leased_by !== parsed.data.workerId
    || !task.lease_expires_at
    || new Date(task.lease_expires_at) <= new Date()) {
    return NextResponse.json({ error: 'Agent task lease is invalid or expired.' }, { status: 409 });
  }
  if (parsed.data.status === 'succeeded'
    && task.task_type === 'produce_daily_content'
    && (!parsed.data.reservationKey || parsed.data.actualCost === undefined)) {
    return NextResponse.json({ error: 'Daily content completion requires a reconciled media reservation and actual cost.' }, { status: 400 });
  }
  for (const artifact of parsed.data.artifacts) {
    if (artifact.storagePath) {
      const prefix = 'agent-media/' + parsed.data.ownerId + '/' + task.run_id + '/' + task.id + '/';
      if (!artifact.storagePath.startsWith(prefix)) {
        return NextResponse.json({ error: 'Artifact storage paths must be server-issued for this task.' }, { status: 400 });
      }
    }
  }
  if (parsed.data.reservationKey && parsed.data.actualCost === undefined) {
    return NextResponse.json({ error: 'A media reservation must report its actual cost, including zero.' }, { status: 400 });
  }

  let overage = false;
  if (parsed.data.reservationKey) {
    const reservation = await admin
      .from('media_usage_reservations')
      .select('owner_id, task_id, status')
      .eq('reservation_key', parsed.data.reservationKey)
      .maybeSingle();
    if (reservation.error || !reservation.data
      || reservation.data.owner_id !== parsed.data.ownerId
      || reservation.data.task_id !== parsed.data.taskId) {
      return NextResponse.json({ error: 'Media reservation does not belong to this task.' }, { status: 409 });
    }
    const reconciled = await admin.rpc('reconcile_media_usage', {
      target_reservation_key: parsed.data.reservationKey,
      target_actual_cost: parsed.data.actualCost,
      target_provider_usage: parsed.data.providerUsage,
    });
    if (reconciled.error || !reconciled.data) {
      return NextResponse.json({ error: 'Media usage could not be reconciled.' }, { status: 409 });
    }
    overage = (reconciled.data as { status?: string }).status === 'overage';
  }

  const finalStatus = overage ? 'failed' : parsed.data.status;
  const finalError = overage
    ? 'The reported media cost exceeded the $0.99 daily ceiling; the task was failed closed.'
    : parsed.data.error;
  const { data, error } = await admin.rpc('complete_agent_orchestration_task', {
    target_task_id: parsed.data.taskId,
    target_worker: parsed.data.workerId,
    target_status: finalStatus,
    target_output: parsed.data.output || null,
    target_error: finalError || null,
    target_artifacts: overage ? [] : parsed.data.artifacts,
  });
  if (error || !data) {
    return NextResponse.json({
      error: error?.code === '22023' ? 'Agent completion failed validation or the task lease expired.' : 'Agent completion could not be recorded.',
    }, { status: error?.code === '22023' ? 409 : 503 });
  }
  return NextResponse.json({ ...data as Record<string, unknown>, overage });
}
