import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const decisionSchema = z.object({
  decision: z.enum(['approve', 'revise', 'defer', 'reject']),
  instructions: z.string().trim().max(2000).optional(),
  idempotencyKey: z.string().uuid(),
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const parsed = decisionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid decision' }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase.from('ai_employee_decisions').insert({
    work_item_id: params.id,
    decided_by: user.id,
    decision: parsed.data.decision,
    instructions: parsed.data.instructions || null,
    idempotency_key: parsed.data.idempotencyKey,
  }).select('id, decision, instructions, created_at').single();

  if (error?.code === '23505') {
    const { data: existing } = await supabase.from('ai_employee_decisions')
      .select('id, decision, instructions, created_at')
      .eq('work_item_id', params.id)
      .eq('idempotency_key', parsed.data.idempotencyKey)
      .single();
    return NextResponse.json({ decision: existing, duplicate: true });
  }
  if (error) return NextResponse.json({ error: 'Decision could not be recorded' }, { status: 403 });
  return NextResponse.json({ decision: data, duplicate: false }, { status: 201 });
}
