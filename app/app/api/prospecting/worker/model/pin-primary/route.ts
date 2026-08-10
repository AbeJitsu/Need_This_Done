import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getOpenRouterModelConfig } from '@/lib/openrouter-config';
import { getSupabaseAdmin } from '@/lib/supabase';
import { consumeWorkerNonce, isSignedWorkerFailure, verifySignedWorkerRequest } from '@/lib/private-worker-auth';

export const dynamic = 'force-dynamic';

const schema = z.object({
  workerId: z.string().trim().min(1).max(160),
  profileId: z.string().uuid(),
  modelId: z.string().trim().min(1).max(240),
}).strict();

/** Pin only the server-configured primary model through the signed private worker boundary. */
export async function POST(request: Request) {
  const signed = await verifySignedWorkerRequest(request, '/api/prospecting/worker/model/pin-primary');
  if (isSignedWorkerFailure(signed)) return signed;
  let json: unknown;
  try { json = JSON.parse(signed.body); } catch { return NextResponse.json({ error: 'Invalid primary model pin JSON.' }, { status: 400 }); }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid primary model pin.' }, { status: 400 });
  const replay = await consumeWorkerNonce(signed.nonce);
  if (replay) return replay;

  let configured: ReturnType<typeof getOpenRouterModelConfig>;
  try { configured = getOpenRouterModelConfig(); } catch { return NextResponse.json({ error: 'Primary model configuration is unavailable.' }, { status: 503 }); }
  if (parsed.data.modelId !== configured.primaryModel) {
    return NextResponse.json({ error: 'The requested model is not the configured primary model.' }, { status: 409 });
  }

  const { error } = await getSupabaseAdmin().rpc('pin_private_primary_model', {
    target_profile_id: parsed.data.profileId,
    target_worker: parsed.data.workerId,
    target_model_id: parsed.data.modelId,
    target_rationale: 'Explicitly approved primary model configuration through the private worker.',
  });
  if (error) return NextResponse.json({ error: 'The configured primary model could not be pinned.' }, { status: 409 });
  return NextResponse.json({ pinned: true, modelRoute: 'selected-primary' });
}
