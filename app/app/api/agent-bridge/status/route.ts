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
}).strict();

const heartbeatFields = 'worker_id, owner_id, status, version, capabilities, last_seen_at, last_error, active_task_id, updated_at';
const taskFields = 'id, run_id, task_key, agent_role, agent_provider, model_id, task_type, status, progress, last_error, started_at, completed_at, updated_at, lease_expires_at';

export async function POST(request: Request) {
  const signed = await verifySignedAgentBridgeRequest(request, '/api/agent-bridge/status');
  if (isSignedAgentBridgeFailure(signed)) return signed;
  let body: unknown;
  try {
    body = JSON.parse(signed.body);
  } catch {
    return NextResponse.json({ error: 'Invalid agent status JSON.' }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid agent status request.' }, { status: 400 });
  }
  const replay = await consumeAgentBridgeNonce(signed.nonce);
  if (replay) return replay;

  const admin = getSupabaseAdmin();
  const { data: heartbeat, error: heartbeatError } = await admin
    .from('worker_heartbeats')
    .select(heartbeatFields)
    .eq('worker_id', parsed.data.workerId)
    .eq('owner_id', parsed.data.ownerId)
    .maybeSingle();
  if (heartbeatError) return NextResponse.json({ error: 'Worker heartbeat could not be read.' }, { status: 503 });

  let currentTask = null;
  if (heartbeat?.active_task_id) {
    const { data: task, error: taskError } = await admin
      .from('agent_orchestration_tasks')
      .select(taskFields)
      .eq('id', heartbeat.active_task_id)
      .eq('owner_id', parsed.data.ownerId)
      .eq('leased_by', parsed.data.workerId)
      .maybeSingle();
    if (taskError) return NextResponse.json({ error: 'Current worker task could not be read.' }, { status: 503 });
    currentTask = task || null;
  }

  return NextResponse.json({
    workerId: parsed.data.workerId,
    checkedAt: new Date().toISOString(),
    heartbeat: heartbeat || null,
    currentTask,
  }, { headers: { 'cache-control': 'no-store' } });
}
