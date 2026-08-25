import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import { consumeWorkerNonce, isSignedWorkerFailure, verifySignedDailyDeskWorkerRequest } from '@/lib/private-worker-auth';

export const dynamic = 'force-dynamic';

const policySchema = z.object({ require_parameters: z.literal(true), data_collection: z.literal('deny'), zdr: z.literal(true), allow_fallbacks: z.literal(false) }).strict();
const schema = z.object({
  workerId: z.string().trim().min(1).max(160), ownerId: z.string().uuid(), runId: z.string().uuid(), reservationKey: z.string().uuid(),
  modelId: z.string().trim().min(3).max(240), estimatedCostUsd: z.number().finite().nonnegative(), providerPolicy: policySchema,
  rationale: z.string().trim().min(1).max(2_000),
}).strict();

/** Reserve only the immutable server-recorded route before the provider call. */
export async function POST(request: Request) {
  const signed = await verifySignedDailyDeskWorkerRequest(request, '/api/daily-desk/worker/reserve');
  if (isSignedWorkerFailure(signed)) return signed;
  const parsed = schema.safeParse(await Promise.resolve().then(() => JSON.parse(signed.body)).catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid Daily Desk reservation.' }, { status: 400 });
  const replay = await consumeWorkerNonce(signed.nonce);
  if (replay) return replay;
  const result = await getSupabaseAdmin().rpc('reserve_daily_desk_cost', {
    target_owner_id: parsed.data.ownerId,
    target_run_id: parsed.data.runId,
    target_worker: parsed.data.workerId,
    target_reservation_key: parsed.data.reservationKey,
    target_model_id: parsed.data.modelId,
    target_estimated_cost: parsed.data.estimatedCostUsd,
    target_reserved_cost: parsed.data.estimatedCostUsd,
    target_provider_policy: parsed.data.providerPolicy,
    target_route_rationale: parsed.data.rationale,
  });
  if (result.error || !result.data) return NextResponse.json({ error: 'The Daily Desk cost reservation was rejected.' }, { status: 409 });
  return NextResponse.json({ reservation: result.data });
}
