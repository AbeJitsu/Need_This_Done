import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import {
  consumeAgentBridgeNonce,
  isSignedAgentBridgeFailure,
  verifySignedAgentBridgeRequest,
} from '@/lib/agent-bridge-auth';

export const dynamic = 'force-dynamic';

const schema = z.object({
  ownerId: z.string().uuid(),
  workerId: z.string().trim().min(1).max(160),
  taskId: z.string().uuid(),
  reservationKey: z.string().uuid(),
  reservedCost: z.number().finite().nonnegative().max(100),
}).strict();

export async function POST(request: Request) {
  const signed = await verifySignedAgentBridgeRequest(request, '/api/agent-bridge/reserve-model');
  if (isSignedAgentBridgeFailure(signed)) return signed;
  let body: unknown;
  try { body = JSON.parse(signed.body); } catch { return NextResponse.json({ error: 'Invalid OpenClaw model reservation JSON.' }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid OpenClaw model reservation.' }, { status: 400 });
  const replay = await consumeAgentBridgeNonce(signed.nonce);
  if (replay) return replay;

  const admin = getSupabaseAdmin();
  const { data: task, error: taskError } = await admin
    .from('agent_orchestration_tasks')
    .select('id, owner_id, plan_id, run_id, status, leased_by, lease_expires_at')
    .eq('id', parsed.data.taskId)
    .maybeSingle();
  if (taskError || !task) return NextResponse.json({ error: 'Agent task was not found.' }, { status: 404 });
  if (task.owner_id !== parsed.data.ownerId || !['leased', 'running'].includes(task.status) || task.leased_by !== parsed.data.workerId
    || !task.lease_expires_at || new Date(task.lease_expires_at) <= new Date()) {
    return NextResponse.json({ error: 'The OpenClaw task lease is invalid.' }, { status: 409 });
  }
  const { data: reservation, error } = await admin.rpc('reserve_openclaw_model_usage', {
    target_owner_id: parsed.data.ownerId,
    target_plan_id: task.plan_id,
    target_run_id: task.run_id,
    target_task_id: parsed.data.taskId,
    target_worker: parsed.data.workerId,
    target_reservation_key: parsed.data.reservationKey,
    target_reserved_cost: parsed.data.reservedCost,
  });
  if (error || !reservation) return NextResponse.json({ error: 'The approved OpenClaw model usage could not be reserved.' }, { status: 409 });
  return NextResponse.json({ reservation });
}
