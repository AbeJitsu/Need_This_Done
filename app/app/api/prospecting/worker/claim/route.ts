import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const auth = await verifyAdmin(); if (auth.error) return auth.error;
  const parsed = z.object({ workerId: z.string().trim().min(1).max(160), leaseSeconds: z.number().int().min(30).max(1800).default(300) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid worker claim.' }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('claim_prospecting_task', { target_worker: parsed.data.workerId, target_lease_seconds: parsed.data.leaseSeconds });
  if (error) return NextResponse.json({ error: 'Worker task queue is not available.' }, { status: 503 });
  return NextResponse.json({ task: data });
}
