import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const schema = z.object({
  idempotencyKey: z.string().uuid().optional(),
  note: z.string().trim().max(2_000).default(''),
}).strict();

function statusFor(error: { code?: string } | null) {
  if (error?.code === '42P01' || error?.code === '42883') return 503;
  if (error?.code === 'P0002') return 404;
  if (error?.code === '22023' || error?.code === '23505') return 409;
  return 500;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;
  if (!z.string().uuid().safeParse((await params).id).success) return NextResponse.json({ error: 'Invalid agent plan.' }, { status: 400 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid approval request.' }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('approve_agent_plan', {
    target_plan_id: (await params).id,
    target_idempotency_key: parsed.data.idempotencyKey || crypto.randomUUID(),
    target_note: parsed.data.note,
  });
  if (error) return NextResponse.json({ error: 'The plan could not be approved.' }, { status: statusFor(error) });
  return NextResponse.json(data);
}
