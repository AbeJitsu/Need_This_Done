import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import { consumeWorkerNonce, isSignedWorkerFailure, verifySignedWorkerRequest } from '@/lib/private-worker-auth';

export const dynamic = 'force-dynamic';

const schema = z.object({
  taskId: z.string().uuid(),
  workerId: z.string().trim().min(1).max(160),
  modelId: z.string().trim().min(1).max(240),
  reservationKey: z.string().uuid(),
  reservedCost: z.number().finite().min(0).max(0.10),
}).strict();

/** Reserve before an OpenRouter call; the database serializes the daily cap. */
export async function POST(request: Request) {
  const signed = await verifySignedWorkerRequest(request, '/api/prospecting/worker/reserve');
  if (isSignedWorkerFailure(signed)) return signed;
  let json: unknown;
  try { json = JSON.parse(signed.body); } catch { return NextResponse.json({ error: 'Invalid model reservation JSON.' }, { status: 400 }); }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid model reservation.' }, { status: 400 });
  const replay = await consumeWorkerNonce(signed.nonce);
  if (replay) return replay;

  const admin = getSupabaseAdmin();
  const { data: task } = await admin.from('agent_tasks').select('profile_id').eq('id', parsed.data.taskId).maybeSingle();
  if (!task) return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
  const { data: reservation, error } = await admin.rpc('reserve_private_model_usage', {
    target_profile_id: task.profile_id,
    target_task_id: parsed.data.taskId,
    target_worker: parsed.data.workerId,
    target_reservation_key: parsed.data.reservationKey,
    target_usage_kind: 'research',
    target_model_id: parsed.data.modelId,
    target_reserved_cost: parsed.data.reservedCost,
  });
  if (error) return NextResponse.json({ error: 'The shared model budget cannot reserve this request.' }, { status: 409 });
  return NextResponse.json({ reservation });
}
