import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getOpenRouterModelConfig } from '@/lib/openrouter-config';
import { isMovingOpenRouterModelAlias, validateOpenRouterBackupModelId } from '@/lib/openrouter-model-config';
import { consumeWorkerNonce, isSignedWorkerFailure, verifySignedWorkerRequest } from '@/lib/private-worker-auth';

export const dynamic = 'force-dynamic';

const candidateSchema = z.object({
  candidateId: z.string().trim().min(1).max(240),
  providerModelId: z.string().trim().min(1).max(240),
  label: z.string().trim().min(1).max(300),
  candidateKind: z.enum(['free', 'configured-primary', 'configured-test', 'router-free']),
  catalogMetadata: z.record(z.string(), z.unknown()),
}).strict();
const schema = z.object({ workerId: z.string().trim().min(1).max(160), profileId: z.string().uuid(), candidates: z.array(candidateSchema).min(1).max(3) }).strict();

export async function POST(request: Request) {
  const signed = await verifySignedWorkerRequest(request, '/api/prospecting/worker/benchmark/candidates');
  if (isSignedWorkerFailure(signed)) return signed;
  let json: unknown;
  try { json = JSON.parse(signed.body); } catch { return NextResponse.json({ error: 'Invalid benchmark candidate JSON.' }, { status: 400 }); }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid benchmark candidates.' }, { status: 400 });
  if (parsed.data.candidates.some((candidate) => isMovingOpenRouterModelAlias(candidate.providerModelId))) return NextResponse.json({ error: 'Moving aliases cannot be benchmark candidates.' }, { status: 400 });
  const replay = await consumeWorkerNonce(signed.nonce);
  if (replay) return replay;

  const kinds = new Set(parsed.data.candidates.map((candidate) => candidate.candidateKind));
  const isConfiguredComparison = parsed.data.candidates.length === 2
    && kinds.size === 2
    && parsed.data.candidates.every((candidate) => candidate.candidateKind === 'configured-primary' || candidate.candidateKind === 'configured-test');
  if (!isConfiguredComparison && kinds.size !== 1) return NextResponse.json({ error: 'Register one benchmark candidate kind per request.' }, { status: 400 });
  const kind = parsed.data.candidates[0].candidateKind;
  const uniqueModels = new Set(parsed.data.candidates.map((candidate) => candidate.providerModelId));
  if (uniqueModels.size !== parsed.data.candidates.length) return NextResponse.json({ error: 'Benchmark candidates must have unique model IDs.' }, { status: 400 });
  if (kind === 'router-free' && parsed.data.candidates.length !== 1) {
    return NextResponse.json({ error: 'A backup probe must register exactly one probe candidate.' }, { status: 400 });
  }
  if (kind === 'router-free') {
    const candidate = parsed.data.candidates[0];
    if (candidate.candidateId !== 'openrouter-backup-probe') {
      return NextResponse.json({ error: 'Backup probe candidates must use their fixed probe ID.' }, { status: 400 });
    }
    try { validateOpenRouterBackupModelId(candidate.providerModelId, 'providerModelId'); } catch { return NextResponse.json({ error: 'The pinned backup probe model ID is invalid.' }, { status: 400 }); }
  }

  const admin = getSupabaseAdmin();
  const { data: profile } = await admin.from('growth_profiles').select('id, owner_id, emergency_stop, model_route').eq('id', parsed.data.profileId).maybeSingle();
  if (!profile || profile.emergency_stop) return NextResponse.json({ error: 'Candidate selection is unavailable for this profile.' }, { status: 409 });

  if (isConfiguredComparison) {
    if (profile.model_route !== 'evaluation-required') {
      return NextResponse.json({ error: 'Model comparison is unavailable after a model selection.' }, { status: 409 });
    }
    let configured: ReturnType<typeof getOpenRouterModelConfig>;
    try { configured = getOpenRouterModelConfig(); } catch { return NextResponse.json({ error: 'Configured model comparison is unavailable.' }, { status: 503 }); }
    if (!configured.testModel) return NextResponse.json({ error: 'Configured model comparison is unavailable.' }, { status: 503 });
    const expected = new Map([
      ['configured-primary', configured.primaryModel],
      ['configured-test', configured.testModel],
    ] as const);
    if (parsed.data.candidates.some((candidate) => candidate.candidateId !== candidate.candidateKind || candidate.providerModelId !== expected.get(candidate.candidateKind as 'configured-primary' | 'configured-test'))) {
      return NextResponse.json({ error: 'Comparison candidates do not match the private model configuration.' }, { status: 409 });
    }
  } else if (profile.model_route !== 'evaluation-required') {
    return NextResponse.json({ error: 'Candidate selection is unavailable after model selection or an emergency stop.' }, { status: 409 });
  }

  if (kind === 'free') {
    await admin.from('model_benchmark_candidates').update({ is_active: false }).eq('profile_id', profile.id).eq('candidate_kind', 'free');
  }

  const rows = parsed.data.candidates.map((candidate) => ({
    profile_id: profile.id,
    candidate_id: candidate.candidateId,
    provider_model_id: candidate.providerModelId,
    candidate_kind: candidate.candidateKind,
    catalog_metadata: { ...candidate.catalogMetadata, label: candidate.label },
    is_active: true,
    updated_at: new Date().toISOString(),
  }));
  const { data, error } = await admin.from('model_benchmark_candidates').upsert(rows, { onConflict: 'profile_id,candidate_id' }).select('*');
  if (error) return NextResponse.json({ error: 'Benchmark candidates could not be persisted.' }, { status: 500 });
  return NextResponse.json({ candidates: data }, { status: 201 });
}
