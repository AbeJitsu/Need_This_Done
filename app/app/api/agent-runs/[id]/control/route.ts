import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const schema = z.object({
  action: z.enum(['pause', 'resume', 'cancel', 'retry', 'emergency-stop']),
  idempotencyKey: z.string().uuid(),
  note: z.string().trim().max(1_000).default(''),
}).strict();

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;
  if (!z.string().uuid().safeParse(params.id).success) return NextResponse.json({ error: 'Invalid agent run.' }, { status: 400 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid agent control request.' }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('control_agent_run', {
    target_run_id: params.id,
    target_command: parsed.data.action,
    target_idempotency_key: parsed.data.idempotencyKey,
    target_note: parsed.data.note,
  });
  if (error) {
    const status = error.code === 'P0002' ? 404 : error.code === '23505' ? 409 : 409;
    return NextResponse.json({ error: error.code === 'P0002' ? 'Agent run not found.' : 'The requested run control transition is not available.' }, { status });
  }
  return NextResponse.json(data);
}
