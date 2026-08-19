import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const completionSchema = z.object({
  notes: z.string().trim().min(1).max(4000),
  idempotencyKey: z.string().uuid(),
});

const databaseErrors: Record<string, { status: number; error: string }> = {
  '22023': { status: 400, error: 'Invalid completion details.' },
  '42501': { status: 403, error: 'Only an owner or manager can complete approved work.' },
  '23505': { status: 409, error: 'The retry details conflict with an existing completion.' },
  '42883': { status: 503, error: 'Work completion is not configured yet.' },
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const parsed = completionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !z.string().uuid().safeParse((await params).id).success) {
    return NextResponse.json({ error: 'Invalid completion details.' }, { status: 400 });
  }
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase.rpc('complete_ai_employee_work_item', {
    target_work_item_id: (await params).id,
    target_completion_notes: parsed.data.notes,
    target_idempotency_key: parsed.data.idempotencyKey,
  });
  if (error) {
    const mapped = databaseErrors[error.code];
    return NextResponse.json({ error: mapped?.error || 'Work item could not be completed.' }, { status: mapped?.status || 500 });
  }
  return NextResponse.json({ workItem: data, duplicate: Boolean(data?.duplicate) }, { status: data?.duplicate ? 200 : 201 });
}
