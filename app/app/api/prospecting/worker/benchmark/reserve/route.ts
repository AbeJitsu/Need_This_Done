import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import { consumeWorkerNonce, isSignedWorkerFailure, verifySignedWorkerRequest } from '@/lib/private-worker-auth';

export const dynamic = 'force-dynamic';

const schema = z.object({ workerId: z.string().trim().min(1).max(160), profileId: z.string().uuid(), modelId: z.string().trim().min(1).max(240), reservationKey: z.string().uuid(), reservedCost: z.number().finite().min(0).max(0.10) }).strict();

export async function POST(request: Request) {
  const signed = await verifySignedWorkerRequest(request, '/api/prospecting/worker/benchmark/reserve');
  if (isSignedWorkerFailure(signed)) return signed;
  let json: unknown;
  try { json = JSON.parse(signed.body); } catch { return NextResponse.json({ error: 'Invalid benchmark reservation JSON.' }, { status: 400 }); }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid benchmark reservation.' }, { status: 400 });
  const replay = await consumeWorkerNonce(signed.nonce);
  if (replay) return replay;
  const { data: reservation, error } = await getSupabaseAdmin().rpc('reserve_private_model_usage', {
    target_profile_id: parsed.data.profileId,
    target_task_id: null,
    target_worker: parsed.data.workerId,
    target_reservation_key: parsed.data.reservationKey,
    target_usage_kind: 'benchmark',
    target_model_id: parsed.data.modelId,
    target_reserved_cost: parsed.data.reservedCost,
  });
  if (error) return NextResponse.json({ error: 'The shared model budget cannot reserve this benchmark.' }, { status: 409 });
  return NextResponse.json({ reservation });
}
