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
  limit: z.number().int().min(1).max(50).default(20),
}).strict();

/**
 * This endpoint does not enqueue or execute work. The signed Mac-side
 * scheduler may only materialize durable approval-required schedule runs.
 */
export async function POST(request: Request) {
  const signed = await verifySignedAgentBridgeRequest(request, '/api/agent-bridge/hermes-scheduler/tick');
  if (isSignedAgentBridgeFailure(signed)) return signed;
  let body: unknown;
  try {
    body = JSON.parse(signed.body);
  } catch {
    return NextResponse.json({ error: 'Invalid Hermes scheduler JSON.' }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid Hermes scheduler request.' }, { status: 400 });
  }
  const replay = await consumeAgentBridgeNonce(signed.nonce);
  if (replay) return replay;

  const { data, error } = await getSupabaseAdmin().rpc('materialize_due_hermes_schedule_runs', {
    target_owner_id: parsed.data.ownerId,
    target_limit: parsed.data.limit,
  });
  if (error) return NextResponse.json({ error: 'Hermes scheduler state is not available.' }, { status: 503 });

  const runs = Array.isArray(data) ? data.map((row) => ({
    id: String(row.schedule_run_id),
    scheduleId: String(row.schedule_id),
    scheduledFor: String(row.scheduled_for),
    status: 'awaiting_approval' as const,
  })) : [];
  return NextResponse.json({
    workerId: parsed.data.workerId,
    materialized: runs.length,
    runs,
    checkedAt: new Date().toISOString(),
  });
}
