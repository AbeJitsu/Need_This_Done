import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import { consumeWorkerNonce, isSignedWorkerFailure, verifySignedDailyDeskWorkerRequest } from '@/lib/private-worker-auth';

export const dynamic = 'force-dynamic';

const schema = z.object({ workerId: z.string().trim().min(1).max(160), leaseSeconds: z.number().int().min(30).max(1_800).default(300) }).strict();

/** Signed worker claim; browser sessions cannot enumerate or lease Daily Desk work. */
export async function POST(request: Request) {
  const signed = await verifySignedDailyDeskWorkerRequest(request, '/api/daily-desk/worker/claim');
  if (isSignedWorkerFailure(signed)) return signed;
  const parsed = schema.safeParse(await Promise.resolve().then(() => JSON.parse(signed.body)).catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid Daily Desk claim.' }, { status: 400 });
  const replay = await consumeWorkerNonce(signed.nonce);
  if (replay) return replay;

  const admin = getSupabaseAdmin();
  const claimed = await admin.rpc('claim_next_daily_desk_run', {
    target_worker: parsed.data.workerId,
    target_lease_seconds: parsed.data.leaseSeconds,
  });
  if (claimed.error) return NextResponse.json({ error: 'Daily Desk work is unavailable.' }, { status: 503 });
  if (!claimed.data) return NextResponse.json({ claim: null });
  const run = claimed.data as { id: string; owner_id: string; local_date: string; brief_id: string };
  const briefResult = await admin
    .from('daily_desk_operating_briefs')
    .select('id, region, offer, target_segment, pain_focus')
    .eq('id', run.brief_id)
    .eq('owner_id', run.owner_id)
    .maybeSingle();
  if (briefResult.error || !briefResult.data) return NextResponse.json({ error: 'The claimed Daily Desk brief is unavailable.' }, { status: 503 });
  const brief = briefResult.data;
  return NextResponse.json({
    claim: {
      run: { id: run.id, ownerId: run.owner_id, localDate: run.local_date },
      brief: { id: brief.id, region: brief.region, offer: brief.offer, targetSegment: brief.target_segment, painFocus: brief.pain_focus },
    },
  });
}
