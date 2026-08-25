import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import { consumeWorkerNonce, isSignedWorkerFailure, verifySignedDailyDeskWorkerRequest } from '@/lib/private-worker-auth';

export const dynamic = 'force-dynamic';

const schema = z.object({ workerId: z.string().trim().min(1).max(160) }).strict();

/**
 * Signed Mac-mini scheduler. It prepares a run from each latest owner brief;
 * the database derives the owner's local date and makes retries idempotent.
 */
export async function POST(request: Request) {
  const signed = await verifySignedDailyDeskWorkerRequest(request, '/api/daily-desk/worker/schedule');
  if (isSignedWorkerFailure(signed)) return signed;
  const parsed = schema.safeParse(await Promise.resolve().then(() => JSON.parse(signed.body)).catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid Daily Desk scheduler request.' }, { status: 400 });
  const replay = await consumeWorkerNonce(signed.nonce);
  if (replay) return replay;

  const admin = getSupabaseAdmin();
  const { data: rows, error } = await admin
    .from('daily_desk_operating_briefs')
    .select('owner_id, revision')
    .order('owner_id')
    .order('revision', { ascending: false });
  if (error) return NextResponse.json({ error: 'Daily Desk setup records are unavailable.' }, { status: 503 });
  const ownerIds = new Set<string>();
  for (const row of rows || []) {
    if (typeof row.owner_id === 'string') ownerIds.add(row.owner_id);
  }

  let queued = 0;
  const unavailable: string[] = [];
  for (const ownerId of ownerIds) {
    const prepared = await admin.rpc('prepare_daily_desk_run', { target_owner_id: ownerId });
    if (prepared.error || !prepared.data) {
      unavailable.push(ownerId);
      continue;
    }
    const result = prepared.data as { duplicate?: boolean };
    if (!result.duplicate) queued += 1;
  }
  return NextResponse.json({ queued, ownersPrepared: ownerIds.size, unavailable });
}
