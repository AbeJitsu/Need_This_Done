import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const prioritySchema = z.object({
  outcome: z.string().trim().min(1).max(500),
  ownerName: z.string().trim().min(1).max(120),
  dueDate: z.string().date(),
  nextAction: z.string().trim().min(1).max(500),
});

function weekStartFor(value: Date) {
  const start = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  const daysSinceMonday = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - daysSinceMonday);
  return start.toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  const auth = await verifyAuth();
  if (auth.error) return auth.error;

  const parsed = prioritySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid weekly priority.' }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const weekStart = weekStartFor(new Date());
  const { data: existing, error: existingError } = await supabase
    .from('operator_weekly_priorities')
    .select('position')
    .eq('owner_id', auth.user.id)
    .eq('week_start', weekStart)
    .eq('status', 'active');
  if (existingError) return NextResponse.json({ error: 'Weekly priorities are not configured yet.' }, { status: 503 });

  const occupied = new Set((existing || []).map((item) => Number(item.position)));
  const position = [1, 2, 3].find((candidate) => !occupied.has(candidate));
  if (!position) return NextResponse.json({ error: 'Keep the week to three big rocks.' }, { status: 409 });

  const { data, error } = await supabase.from('operator_weekly_priorities').insert({
    owner_id: auth.user.id,
    week_start: weekStart,
    position,
    outcome: parsed.data.outcome,
    owner_name: parsed.data.ownerName,
    due_date: parsed.data.dueDate,
    next_action: parsed.data.nextAction,
  }).select('*').single();

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Another priority already occupies that weekly slot.' }, { status: 409 });
    return NextResponse.json({ error: 'Weekly priority could not be saved.' }, { status: 500 });
  }
  return NextResponse.json({ priority: data }, { status: 201 });
}
