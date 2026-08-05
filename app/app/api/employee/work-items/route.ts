import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const workItemSchema = z.object({
  employeeId: z.string().uuid(),
  queue: z.enum(['morning', 'midday', 'evening']),
  scheduledDate: z.string().date(),
  title: z.string().trim().min(1).max(200),
  evidence: z.array(z.string().trim().min(1).max(1000)).max(20),
  proposedAction: z.string().trim().min(1).max(4000),
  expectedOutcome: z.string().trim().max(2000).optional(),
  riskLevel: z.enum(['low', 'medium', 'high']),
  priority: z.number().int().min(1).max(5),
  sourceType: z.string().trim().max(80).optional(),
  sourceId: z.string().trim().max(200).optional(),
  idempotencyKey: z.string().uuid(),
});

const databaseErrors: Record<string, { status: number; error: string }> = {
  '22023': { status: 400, error: 'Invalid work item.' },
  '42501': { status: 403, error: 'Only customer owners and managers can author queue items.' },
  '23505': { status: 409, error: 'That queue priority is already occupied or the retry details changed.' },
  '42883': { status: 503, error: 'Queue authoring is not configured yet.' },
};

export async function POST(request: Request) {
  const parsed = workItemSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid work item.' }, { status: 400 });
  }
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase.rpc('create_ai_employee_work_item', {
    target_employee_id: parsed.data.employeeId,
    target_queue: parsed.data.queue,
    target_scheduled_date: parsed.data.scheduledDate,
    target_title: parsed.data.title,
    target_evidence: parsed.data.evidence,
    target_proposed_action: parsed.data.proposedAction,
    target_expected_outcome: parsed.data.expectedOutcome || '',
    target_risk_level: parsed.data.riskLevel,
    target_priority: parsed.data.priority,
    target_source_type: parsed.data.sourceType || 'manual',
    target_source_id: parsed.data.sourceId || '',
    target_idempotency_key: parsed.data.idempotencyKey,
  });
  if (error) {
    const mapped = databaseErrors[error.code];
    return NextResponse.json({ error: mapped?.error || 'Work item could not be created.' }, { status: mapped?.status || 500 });
  }
  return NextResponse.json({ workItem: data, duplicate: Boolean(data?.duplicate) }, { status: data?.duplicate ? 200 : 201 });
}
