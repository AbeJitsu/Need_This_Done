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

export async function POST(request: Request) {
  const signed = await verifySignedAgentBridgeRequest(request, '/api/agent-bridge/schedule');
  if (isSignedAgentBridgeFailure(signed)) return signed;
  let body: unknown;
  try {
    body = JSON.parse(signed.body);
  } catch {
    return NextResponse.json({ error: 'Invalid agent schedule JSON.' }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid agent schedule request.' }, { status: 400 });
  }
  const replay = await consumeAgentBridgeNonce(signed.nonce);
  if (replay) return replay;

  const { data, error } = await getSupabaseAdmin()
    .from('agent_orchestration_tasks')
    .select('id, run_id, task_key, agent_role, agent_provider, model_id, capabilities, status, progress, created_at')
    .eq('owner_id', parsed.data.ownerId)
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(parsed.data.limit);
  if (error) return NextResponse.json({ error: 'Agent schedule could not be read.' }, { status: 503 });
  return NextResponse.json({
    workerId: parsed.data.workerId,
    queued: data?.length || 0,
    tasks: data || [],
    checkedAt: new Date().toISOString(),
  });
}
