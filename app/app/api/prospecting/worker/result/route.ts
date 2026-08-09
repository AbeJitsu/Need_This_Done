import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import { parseProspectDossierBatch } from '@/lib/prospect-dossier';
import { consumeWorkerNonce, isSignedWorkerFailure, verifySignedWorkerRequest } from '@/lib/private-worker-auth';

export const dynamic = 'force-dynamic';

const citationSchema = z.object({ url: z.string().url().max(2_000), title: z.string().trim().min(1).max(500), excerpt: z.string().trim().min(1).max(2_000) }).strict();
const schema = z.object({
  taskId: z.string().uuid(),
  workerId: z.string().trim().min(1).max(160),
  status: z.enum(['succeeded', 'failed']),
  output: z.object({ dossiers: z.unknown(), providerCitations: z.array(citationSchema).min(1).max(20) }).strict().optional(),
  error: z.string().trim().max(4_000).optional(),
  modelName: z.string().trim().max(240).optional(),
  promptTokens: z.number().int().nonnegative().optional(),
  completionTokens: z.number().int().nonnegative().optional(),
  cost: z.number().finite().nonnegative().max(10).optional(),
  reservationKey: z.string().uuid().optional(),
  providerUsage: z.record(z.string(), z.unknown()).optional(),
}).strict();

function safeFailureMessage(value: unknown) {
  return value instanceof Error ? value.message : 'A strict dossier validation failed.';
}

export async function POST(request: Request) {
  const signed = await verifySignedWorkerRequest(request, '/api/prospecting/worker/result');
  if (isSignedWorkerFailure(signed)) return signed;
  let json: unknown;
  try { json = JSON.parse(signed.body); } catch { return NextResponse.json({ error: 'Invalid worker result JSON.' }, { status: 400 }); }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid worker result.' }, { status: 400 });
  const replay = await consumeWorkerNonce(signed.nonce);
  if (replay) return replay;

  const admin = getSupabaseAdmin();
  const { data: task } = await admin.from('agent_tasks').select('id, profile_id, leased_by, status, lease_expires_at, task_type').eq('id', parsed.data.taskId).maybeSingle();
  if (!task || task.status !== 'leased' || task.leased_by !== parsed.data.workerId || !task.lease_expires_at || new Date(task.lease_expires_at) <= new Date()) {
    return NextResponse.json({ error: 'Task lease is invalid or expired.' }, { status: 409 });
  }
  const { data: profile } = await admin.from('growth_profiles').select('id, emergency_stop, model_route, selected_model_id').eq('id', task.profile_id).maybeSingle();
  if (!profile || profile.emergency_stop) return NextResponse.json({ error: 'Emergency stop is active or the profile is unavailable.' }, { status: 409 });

  const modelWorkReported = Boolean(parsed.data.modelName || parsed.data.reservationKey || (parsed.data.cost && parsed.data.cost > 0));
  if (profile.model_route === 'evaluation-required' && modelWorkReported) {
    return NextResponse.json({ error: 'Model evaluation is required before a live worker can report research.' }, { status: 409 });
  }
  if (modelWorkReported && parsed.data.modelName !== profile.selected_model_id) {
    return NextResponse.json({ error: 'The worker did not use the selected pinned model.' }, { status: 409 });
  }

  let reconciled: { status?: string; actual_cost?: number } | null = null;
  if (parsed.data.reservationKey) {
    if (parsed.data.cost === undefined) return NextResponse.json({ error: 'A reserved provider call must report its actual or reserved cost.' }, { status: 400 });
    const { data, error } = await admin.rpc('reconcile_private_model_usage', {
      target_reservation_key: parsed.data.reservationKey,
      target_actual_cost: parsed.data.cost,
      target_provider_usage: parsed.data.providerUsage || {},
    });
    if (error || !data) return NextResponse.json({ error: 'Model usage could not be reconciled.' }, { status: 409 });
    reconciled = data as { status?: string; actual_cost?: number };
  }

  let output: Record<string, unknown> | null = null;
  let finalStatus: 'succeeded' | 'failed' = parsed.data.status;
  let finalError = parsed.data.error || null;
  if (reconciled?.status === 'overage') {
    finalStatus = 'failed';
    finalError = 'OpenRouter reported a cost above the reserved cap; further worker calls are stopped.';
  } else if (parsed.data.status === 'succeeded') {
    if (!parsed.data.output || !parsed.data.modelName || !parsed.data.reservationKey) {
      return NextResponse.json({ error: 'A successful research result requires a reservation, model ID, dossier batch, and citations.' }, { status: 400 });
    }
    try {
      const dossiers = parseProspectDossierBatch(JSON.stringify(parsed.data.output.dossiers), parsed.data.output.providerCitations);
      let accepted = 0;
      let duplicates = 0;
      for (const dossier of dossiers.dossiers) {
        const { data, error } = await admin.rpc('record_private_prospect_dossier', {
          target_task_id: task.id,
          target_worker: parsed.data.workerId,
          target_model_id: parsed.data.modelName,
          target_dossier: dossier,
        });
        if (error || !data) throw new Error('A citation-backed dossier could not be stored.');
        if ((data as { duplicate?: boolean }).duplicate) duplicates += 1;
        else accepted += 1;
      }
      output = {
        dossiers,
        acceptedDossiers: accepted,
        duplicateDossiers: duplicates,
        shortfall: Math.max(0, 2 - accepted),
        ...(dossiers.shortfallReason ? { shortfallReason: dossiers.shortfallReason } : {}),
      };
    } catch (error) {
      finalStatus = 'failed';
      finalError = safeFailureMessage(error);
    }
  }

  const completedAt = new Date().toISOString();
  const { data: updated, error: updateError } = await admin.from('agent_tasks').update({
    status: finalStatus,
    output,
    last_error: finalStatus === 'failed' ? (finalError || 'Private worker failed.') : null,
    model_name: parsed.data.modelName || null,
    prompt_tokens: parsed.data.promptTokens || null,
    completion_tokens: parsed.data.completionTokens || null,
    cost: parsed.data.cost || 0,
    completed_at: completedAt,
    lease_expires_at: null,
    updated_at: completedAt,
  }).eq('id', task.id).eq('status', 'leased').select('*').maybeSingle();
  if (updateError || !updated) return NextResponse.json({ error: 'Task result could not be recorded.' }, { status: 500 });
  await admin.from('agent_task_events').insert({ task_id: task.id, event_type: finalStatus, payload: output || { error: finalError || null } });
  return NextResponse.json({ task: updated, overage: reconciled?.status === 'overage' });
}
