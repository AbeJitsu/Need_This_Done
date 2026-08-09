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
  workerId: z.string().trim().min(1).max(160),
  ownerId: z.string().uuid(),
  leaseSeconds: z.number().int().min(30).max(1_800).default(300),
}).strict();

export async function POST(request: Request) {
  const signed = await verifySignedAgentBridgeRequest(request, '/api/agent-bridge/claim');
  if (isSignedAgentBridgeFailure(signed)) return signed;
  let body: unknown;
  try {
    body = JSON.parse(signed.body);
  } catch {
    return NextResponse.json({ error: 'Invalid agent claim JSON.' }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid agent claim request.' }, { status: 400 });
  }
  const replay = await consumeAgentBridgeNonce(signed.nonce);
  if (replay) return replay;

  const admin = getSupabaseAdmin();
  const heartbeat = await admin
    .from('worker_heartbeats')
    .select('owner_id, status')
    .eq('worker_id', parsed.data.workerId)
    .maybeSingle();
  if (heartbeat.data && heartbeat.data.owner_id !== parsed.data.ownerId) {
    return NextResponse.json({ error: 'Worker identity is bound to another operator.' }, { status: 409 });
  }
  if (heartbeat.data?.status === 'stopped' || heartbeat.data?.status === 'offline') {
    return NextResponse.json({ task: null, reason: 'worker_not_available' });
  }

  const { data: task, error } = await admin.rpc('claim_agent_orchestration_task', {
    target_owner_id: parsed.data.ownerId,
    target_worker: parsed.data.workerId,
    target_lease_seconds: parsed.data.leaseSeconds,
  });
  if (error) return NextResponse.json({ error: 'Agent task queue is not available.' }, { status: 503 });
  return NextResponse.json({ task: task || null });
}
