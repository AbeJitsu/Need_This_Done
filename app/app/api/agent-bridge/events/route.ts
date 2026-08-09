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
  taskId: z.string().uuid(),
  workerId: z.string().trim().min(1).max(160),
  eventType: z.enum(['progress', 'artifact']),
  payload: z.record(z.string(), z.unknown()).default({}),
  progress: z.number().int().min(0).max(100).optional(),
}).strict();

export async function POST(request: Request) {
  const signed = await verifySignedAgentBridgeRequest(request, '/api/agent-bridge/events');
  if (isSignedAgentBridgeFailure(signed)) return signed;
  if (signed.body.length > 128_000) return NextResponse.json({ error: 'Agent event payload is too large.' }, { status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(signed.body);
  } catch {
    return NextResponse.json({ error: 'Invalid agent event JSON.' }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid agent event.' }, { status: 400 });
  }
  const replay = await consumeAgentBridgeNonce(signed.nonce);
  if (replay) return replay;

  const { data, error } = await getSupabaseAdmin().rpc('record_agent_task_event', {
    target_task_id: parsed.data.taskId,
    target_worker: parsed.data.workerId,
    target_event_type: parsed.data.eventType,
    target_payload: parsed.data.payload,
    target_progress: parsed.data.progress ?? null,
  });
  if (error) {
    return NextResponse.json({
      error: error.code === '22023' ? 'Agent event is invalid or the task lease has expired.' : 'Agent event could not be recorded.',
    }, { status: error.code === '22023' ? 409 : 503 });
  }
  return NextResponse.json({ event: data });
}
