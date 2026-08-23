import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { verifyAdmin } from '@/lib/api-auth';

const outcomeSchema = z.object({
  employeeId: z.string().uuid(),
  workItemId: z.string().uuid().optional(),
  kind: z.enum(['lead', 'reply', 'meeting', 'project', 'time_saved', 'revenue', 'cost']),
  value: z.number().positive().max(1_000_000),
  amountCents: z.number().int().positive().max(Number.MAX_SAFE_INTEGER).optional(),
  currency: z.string().trim().regex(/^[A-Za-z]{3}$/).optional(),
  costCategory: z.enum(['model', 'tooling', 'payment', 'advertising', 'contractor', 'delivery']).optional(),
  notes: z.string().trim().max(4000).optional(),
  occurredAt: z.string().datetime({ offset: true }).optional(),
  idempotencyKey: z.string().uuid(),
}).superRefine((value, context) => {
  const financial = value.kind === 'revenue' || value.kind === 'cost';
  if (financial && (!value.amountCents || !value.currency)) {
    context.addIssue({ code: 'custom', path: ['amountCents'], message: 'Revenue and cost require an amount and currency.' });
  }
  if (value.kind === 'cost' && !value.costCategory) {
    context.addIssue({ code: 'custom', path: ['costCategory'], message: 'Cost requires a category.' });
  }
  if (value.kind !== 'cost' && value.costCategory) {
    context.addIssue({ code: 'custom', path: ['costCategory'], message: 'Only costs have a category.' });
  }
  if (!financial && (value.amountCents || value.currency)) {
    context.addIssue({ code: 'custom', path: ['amountCents'], message: 'Only revenue and cost use money fields.' });
  }
});

const databaseErrors: Record<string, { status: number; error: string }> = {
  '22023': { status: 400, error: 'Invalid outcome details.' },
  '42501': { status: 403, error: 'Only customer owners and managers can record outcomes.' },
  '23505': { status: 409, error: 'The retry details conflict with an existing outcome.' },
  '42883': { status: 503, error: 'Outcome recording is not configured yet.' },
};

export async function POST(request: Request) {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;

  const parsed = outcomeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid outcome details.' }, { status: 400 });
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('record_ai_employee_outcome', {
    target_employee_id: parsed.data.employeeId,
    target_work_item_id: parsed.data.workItemId || null,
    target_kind: parsed.data.kind,
    target_value: parsed.data.value,
    target_amount_cents: parsed.data.amountCents || null,
    target_currency: parsed.data.currency || null,
    target_cost_category: parsed.data.costCategory || null,
    target_notes: parsed.data.notes || '',
    target_occurred_at: parsed.data.occurredAt || null,
    target_idempotency_key: parsed.data.idempotencyKey,
  });
  if (error) {
    const mapped = databaseErrors[error.code];
    return NextResponse.json({ error: mapped?.error || 'Outcome could not be recorded.' }, { status: mapped?.status || 500 });
  }
  return NextResponse.json({ outcome: data, duplicate: Boolean(data?.duplicate) }, { status: data?.duplicate ? 200 : 201 });
}
