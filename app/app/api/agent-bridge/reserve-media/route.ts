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
  mediaKind: z.enum(['image', 'video', 'audio', 'render', 'other']),
  provider: z.string().trim().min(1).max(160),
  reservedCost: z.number().finite().nonnegative().max(0.99),
  localUsageDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).strict();

export async function POST(request: Request) {
  const signed = await verifySignedAgentBridgeRequest(request, '/api/agent-bridge/reserve-media');
  if (isSignedAgentBridgeFailure(signed)) return signed;
  let body: unknown;
  try {
    body = JSON.parse(signed.body);
  } catch {
    return NextResponse.json({ error: 'Invalid media reservation JSON.' }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid media reservation.' }, { status: 400 });
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
  if (task.task_type !== 'produce_daily_content' && parsed.data.mediaKind !== 'other') {
    return NextResponse.json({ error: 'Only daily content tasks may reserve generated media.' }, { status: 400 });
  }

  const { data, error } = await admin.rpc('reserve_media_usage', {
    target_owner_id: parsed.data.ownerId,
    target_run_id: task.run_id,
    target_task_id: task.id,
    target_worker: parsed.data.workerId,
    target_reservation_key: parsed.data.reservationKey,
    target_media_kind: parsed.data.mediaKind,
    target_provider: parsed.data.provider,
    target_reserved_cost: parsed.data.reservedCost,
    target_local_usage_date: parsed.data.localUsageDate || null,
  });
  if (error || !data) {
    return NextResponse.json({
      error: error?.code === '22023'
        ? 'The media reservation was rejected because the $0.99 daily ceiling would be exceeded or the cost is unknown.'
        : 'Media usage could not be reserved.',
    }, { status: error?.code === '22023' ? 409 : 503 });
  }
  return NextResponse.json({ reservation: data });
}
