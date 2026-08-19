import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import { parseProspectDossierBatch } from '@/lib/prospect-dossier';
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

const citationSchema = z.object({
  url: z.string().url().max(2_000),
  title: z.string().trim().min(1).max(500),
  excerpt: z.string().trim().min(1).max(2_000),
}).strict();

const prospectingSchema = z.object({
  dossiers: z.array(z.unknown()).min(1).max(2),
  providerCitations: z.array(citationSchema).min(1).max(20),
  shortfallReason: z.string().trim().min(1).max(2_000).optional(),
}).strict();

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
  modelReservationKey: z.string().uuid().optional(),
  modelActualCost: z.number().finite().nonnegative().optional(),
  actualModelId: z.string().trim().min(1).max(240).optional(),
  providerInvoked: z.boolean().optional(),
  prospecting: prospectingSchema.optional(),
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
    .select('*')
    .eq('id', parsed.data.taskId)
    .eq('owner_id', parsed.data.ownerId)
    .maybeSingle();
  if (taskError || !task) return NextResponse.json({ error: 'Agent task was not found.' }, { status: 404 });
  if (parsed.data.provider && parsed.data.provider !== task.agent_provider) {
    return NextResponse.json({ error: 'Provider identity does not match the leased task.' }, { status: 409 });
  }
  if (task.plan_id && task.agent_provider !== 'openclaw') {
    return NextResponse.json({ error: 'Approved planner tasks must execute through OpenClaw.' }, { status: 409 });
  }
  if (['succeeded', 'failed'].includes(task.status)
    && task.leased_by === parsed.data.workerId
    && !task.lease_expires_at) {
    return NextResponse.json({ task, duplicate: true, overage: task.last_error?.includes('ceiling') || false });
  }
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
  if (parsed.data.modelReservationKey && parsed.data.modelActualCost === undefined) {
    return NextResponse.json({ error: 'An OpenClaw model reservation must report its actual cost, including zero.' }, { status: 400 });
  }
  const preProviderAbort = Boolean(task.plan_id)
    && parsed.data.status === 'failed'
    && parsed.data.providerInvoked === false;
  if (task.plan_id && parsed.data.status === 'failed' && parsed.data.providerInvoked === undefined) {
    return NextResponse.json({ error: 'An approved task failure must declare whether the Gateway was invoked.' }, { status: 400 });
  }
  if (preProviderAbort && (parsed.data.modelReservationKey || parsed.data.actualModelId || Object.keys(parsed.data.providerUsage).length > 0)) {
    return NextResponse.json({ error: 'A pre-provider abort cannot report model usage or provenance.' }, { status: 400 });
  }
  if (task.plan_id && task.agent_provider === 'openclaw' && !preProviderAbort
    && (!parsed.data.modelReservationKey || parsed.data.modelActualCost === undefined || !parsed.data.actualModelId || Object.keys(parsed.data.providerUsage).length === 0)) {
    return NextResponse.json({ error: 'An approved OpenClaw task requires a model usage reservation and reconciliation.' }, { status: 400 });
  }
  if (task.plan_id && parsed.data.actualModelId && parsed.data.actualModelId !== task.model_id) {
    return NextResponse.json({ error: 'The Gateway model identity does not match the approved task model.' }, { status: 409 });
  }
  let prospecting: Record<string, unknown> | null = null;
  if (parsed.data.prospecting) {
    if (task.task_type !== 'research_public_web' || task.agent_provider !== 'openclaw' || parsed.data.status !== 'succeeded') {
      return NextResponse.json({ error: 'Only an approved OpenClaw public-research task may submit a prospecting adapter result.' }, { status: 400 });
    }
    try {
      const validated = parseProspectDossierBatch(
        JSON.stringify({
          dossiers: parsed.data.prospecting.dossiers,
          ...(parsed.data.prospecting.shortfallReason ? { shortfallReason: parsed.data.prospecting.shortfallReason } : {}),
        }),
        parsed.data.prospecting.providerCitations,
      );
      prospecting = validated as unknown as Record<string, unknown>;
    } catch (validationError) {
      return NextResponse.json({
        error: validationError instanceof Error ? validationError.message : 'The prospecting result failed citation validation.',
      }, { status: 400 });
    }
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

  if (parsed.data.modelReservationKey && !task.plan_id) {
    const reservation = await admin
      .from('openclaw_model_usage_reservations')
      .select('owner_id, task_id, plan_id, model_id, status')
      .eq('reservation_key', parsed.data.modelReservationKey)
      .maybeSingle();
    if (reservation.error || !reservation.data
      || reservation.data.owner_id !== parsed.data.ownerId
      || reservation.data.task_id !== parsed.data.taskId
      || reservation.data.plan_id !== task.plan_id
      || reservation.data.model_id !== task.model_id) {
      return NextResponse.json({ error: 'OpenClaw model reservation does not belong to this task.' }, { status: 409 });
    }
    const reconciled = await admin.rpc('reconcile_openclaw_model_usage', {
      target_reservation_key: parsed.data.modelReservationKey,
      target_actual_cost: parsed.data.modelActualCost,
      target_provider_usage: parsed.data.providerUsage,
    });
    if (reconciled.error || !reconciled.data) {
      return NextResponse.json({ error: 'OpenClaw model usage could not be reconciled.' }, { status: 409 });
    }
  }

  const finalStatus = overage ? 'failed' : parsed.data.status;
  const finalError = overage
    ? 'The reported media cost exceeded the $0.99 daily ceiling; the task was failed closed.'
    : parsed.data.error;
  const completionArgs = {
    target_task_id: parsed.data.taskId,
    target_worker: parsed.data.workerId,
    target_status: finalStatus,
    target_output: parsed.data.output || null,
    target_error: finalError || null,
    target_artifacts: overage ? [] : parsed.data.artifacts,
  };
  const completion = preProviderAbort
    ? await admin.rpc('abort_openclaw_task_before_provider', {
      target_task_id: parsed.data.taskId,
      target_worker: parsed.data.workerId,
      target_error: finalError || null,
    })
    : task.plan_id
    ? await admin.rpc('complete_openclaw_task_with_provenance', {
      ...completionArgs,
      target_model_reservation_key: parsed.data.modelReservationKey,
      target_model_actual_cost: parsed.data.modelActualCost,
      target_actual_model_id: parsed.data.actualModelId,
      target_provider_usage: parsed.data.providerUsage,
      target_prospecting: prospecting,
    })
    : prospecting
    ? await admin.rpc('complete_openclaw_orchestration_task', {
      ...completionArgs,
      target_model_reservation_key: parsed.data.modelReservationKey || null,
      target_prospecting: prospecting,
    })
    : await admin.rpc('complete_agent_orchestration_task', completionArgs);
  const { data, error } = completion;
  if (error || !data) {
    return NextResponse.json({
      error: error?.code === '22023' ? 'Agent completion failed validation or the task lease expired.' : 'Agent completion could not be recorded.',
    }, { status: error?.code === '22023' ? 409 : 503 });
  }
  return NextResponse.json({ ...data as Record<string, unknown>, overage });
}
