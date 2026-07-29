import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const decisionSchema = z.object({
  decision: z.enum(['approve', 'revise', 'defer', 'reject']),
  instructions: z.string().trim().max(2000).optional(),
  idempotencyKey: z.string().uuid(),
  deferDate: z.string().date().optional(),
}).superRefine((value, context) => {
  if (value.decision === 'defer' && (!value.deferDate || value.deferDate <= new Date().toISOString().slice(0, 10))) {
    context.addIssue({ code: 'custom', path: ['deferDate'], message: 'Deferral requires a future date.' });
  }
  if (value.decision === 'revise' && !value.instructions) {
    context.addIssue({ code: 'custom', path: ['instructions'], message: 'Revision instructions are required.' });
  }
  if (value.decision !== 'defer' && value.deferDate) {
    context.addIssue({ code: 'custom', path: ['deferDate'], message: 'A defer date is only valid for deferral.' });
  }
});

const databaseErrors: Record<string, { status: number; error: string }> = {
  '22023': { status: 400, error: 'Invalid decision details.' },
  '42501': { status: 403, error: 'You do not have permission to decide this item.' },
  '23505': { status: 409, error: 'The idempotency key or work item conflicts with an existing decision.' },
  '40001': { status: 409, error: 'This item was decided by another request.' },
  '42883': { status: 503, error: 'Employee decisions are not configured yet.' },
  '42P01': { status: 503, error: 'Employee decisions are not configured yet.' },
};

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const parsed = decisionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !z.string().uuid().safeParse(params.id).success) {
    return NextResponse.json({ error: 'Invalid decision details.' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase.rpc('record_ai_employee_decision', {
    target_work_item_id: params.id,
    target_decision: parsed.data.decision,
    target_instructions: parsed.data.instructions || '',
    target_idempotency_key: parsed.data.idempotencyKey,
    target_defer_date: parsed.data.deferDate || null,
  });

  if (error) {
    const mapped = databaseErrors[error.code];
    return NextResponse.json(
      { error: mapped?.error || 'Decision could not be recorded.' },
      { status: mapped?.status || 500 },
    );
  }
  return NextResponse.json({ decision: data, duplicate: Boolean(data?.duplicate) }, { status: data?.duplicate ? 200 : 201 });
}
