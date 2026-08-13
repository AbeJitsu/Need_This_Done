import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import { consumeWorkerNonce, isSignedWorkerFailure, verifySignedWorkerRequest } from '@/lib/private-worker-auth';

export const dynamic = 'force-dynamic';

const schema = z.object({
  workerId: z.string().trim().min(1).max(160),
  leaseSeconds: z.number().int().min(30).max(1_800).default(300),
}).strict();

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

/** Signed private endpoint. Browser sessions cannot claim Mac-mini research work. */
export async function POST(request: Request) {
  const signed = await verifySignedWorkerRequest(request, '/api/prospecting/worker/claim');
  if (isSignedWorkerFailure(signed)) return signed;
  let json: unknown;
  try { json = JSON.parse(signed.body); } catch { return NextResponse.json({ error: 'Invalid worker claim JSON.' }, { status: 400 }); }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid worker claim.' }, { status: 400 });
  const replay = await consumeWorkerNonce(signed.nonce);
  if (replay) return replay;

  const admin = getSupabaseAdmin();
  const { data: task, error } = await admin.rpc('claim_private_prospecting_task', {
    target_worker: parsed.data.workerId,
    target_lease_seconds: parsed.data.leaseSeconds,
  });
  if (error) return NextResponse.json({ error: 'Private worker queue is not available.' }, { status: 503 });
  if (!task) return NextResponse.json({ task: null });

  const taskRow = task as { profile_id: string };
  const { data: profile, error: profileError } = await admin
    .from('growth_profiles')
    .select('id, target_market, geography, business_size, pain_signals, exclusion_rules, offer, timezone, emergency_stop, model_route, selected_model_id')
    .eq('id', taskRow.profile_id)
    .single();
  if (profileError || !profile) return NextResponse.json({ error: 'Private worker profile is not available.' }, { status: 503 });
  return NextResponse.json({
    task,
    profile: {
      id: profile.id,
      targetMarket: profile.target_market,
      geography: profile.geography,
      businessSize: profile.business_size,
      painSignals: stringArray(profile.pain_signals),
      exclusionRules: stringArray(profile.exclusion_rules),
      offer: profile.offer,
      timezone: profile.timezone,
      emergencyStop: profile.emergency_stop,
      modelRoute: profile.model_route,
      selectedModelId: profile.selected_model_id,
    },
  });
}
