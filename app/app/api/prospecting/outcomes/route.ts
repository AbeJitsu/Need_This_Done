import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const schema = z.object({ prospectId: z.string().uuid(), messageId: z.string().uuid().optional(), outcomeType: z.enum(['reply', 'meeting', 'qualified', 'not_a_fit', 'customer', 'note']), notes: z.string().trim().max(4000), idempotencyKey: z.string().uuid() });

export async function POST(request: Request) {
  const auth = await verifyAdmin(); if (auth.error) return auth.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid outcome.' }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('prospect_outcomes').upsert({ prospect_id: parsed.data.prospectId, message_id: parsed.data.messageId || null, outcome_type: parsed.data.outcomeType, notes: parsed.data.notes, recorded_by: auth.user.id, idempotency_key: parsed.data.idempotencyKey }, { onConflict: 'idempotency_key' }).select('*').single();
  if (error) return NextResponse.json({ error: 'Outcome could not be recorded.' }, { status: 409 });
  return NextResponse.json({ outcome: data }, { status: 201 });
}
