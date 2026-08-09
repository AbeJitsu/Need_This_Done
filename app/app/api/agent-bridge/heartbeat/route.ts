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
  status: z.enum(['online', 'degraded', 'offline', 'stopped']),
  version: z.string().trim().max(120).default(''),
  capabilities: z.array(z.string().trim().min(1).max(120)).max(100).default([]),
  activeTaskId: z.string().uuid().nullable().optional(),
  error: z.string().trim().max(2_000).nullable().optional(),
}).strict();

export async function POST(request: Request) {
  const signed = await verifySignedAgentBridgeRequest(request, '/api/agent-bridge/heartbeat');
  if (isSignedAgentBridgeFailure(signed)) return signed;

  let body: unknown;
  try {
    body = JSON.parse(signed.body);
  } catch {
    return NextResponse.json({ error: 'Invalid agent heartbeat JSON.' }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid agent heartbeat.' }, { status: 400 });
  }
  const replay = await consumeAgentBridgeNonce(signed.nonce);
  if (replay) return replay;

  const admin = getSupabaseAdmin();
  const existing = await admin
    .from('worker_heartbeats')
    .select('owner_id')
    .eq('worker_id', parsed.data.workerId)
    .maybeSingle();
  if (existing.error && existing.error.code !== 'PGRST116') {
    return NextResponse.json({ error: 'Worker heartbeat storage is unavailable.' }, { status: 503 });
  }
  if (existing.data && existing.data.owner_id !== parsed.data.ownerId) {
    return NextResponse.json({ error: 'Worker identity is already bound to another operator.' }, { status: 409 });
  }

  const { data, error } = await admin
    .from('worker_heartbeats')
    .upsert({
      worker_id: parsed.data.workerId,
      owner_id: parsed.data.ownerId,
      status: parsed.data.status,
      version: parsed.data.version,
      capabilities: parsed.data.capabilities,
      active_task_id: parsed.data.activeTaskId || null,
      last_error: parsed.data.error || null,
      last_seen_at: new Date().toISOString(),
    }, { onConflict: 'worker_id' })
    .select('*')
    .single();
  if (error || !data) return NextResponse.json({ error: 'Worker heartbeat could not be recorded.' }, { status: 503 });
  return NextResponse.json({ heartbeat: data });
}
