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
  reservedCost: z.number().finite().min(0),
}).strict();

/** Record the expected provider usage before an OpenRouter call. */
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
  if (error) return NextResponse.json({ error: 'The model usage record could not be created for this request.' }, { status: 409 });
  return NextResponse.json({ reservation });
}
