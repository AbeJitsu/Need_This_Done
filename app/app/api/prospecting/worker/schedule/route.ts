import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import { consumeWorkerNonce, isSignedWorkerFailure, verifySignedWorkerRequest } from '@/lib/private-worker-auth';

export const dynamic = 'force-dynamic';

const schema = z.object({ workerId: z.string().trim().min(1).max(160) }).strict();

/** Called by the Mac-mini launchd job. The DB derives each profile's local day. */
export async function POST(request: Request) {
  const signed = await verifySignedWorkerRequest(request, '/api/prospecting/worker/schedule');
  if (isSignedWorkerFailure(signed)) return signed;
  let json: unknown;
  try { json = JSON.parse(signed.body); } catch { return NextResponse.json({ error: 'Invalid private scheduler JSON.' }, { status: 400 }); }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid private scheduler request.' }, { status: 400 });
  const replay = await consumeWorkerNonce(signed.nonce);
  if (replay) return replay;

  const { data, error } = await getSupabaseAdmin().rpc('queue_due_private_prospecting_tasks');
  if (error) return NextResponse.json({ error: 'Daily private research tasks could not be queued.' }, { status: 503 });
  const tasks = Array.isArray(data) ? data : [];
  return NextResponse.json({ queued: tasks.length, tasks });
}
