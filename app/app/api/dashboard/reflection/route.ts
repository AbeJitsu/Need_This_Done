import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const reflectionSchema = z.object({ reflection: z.string().trim().min(1).max(2000) });

function todayInUtc() {
  return new Date().toISOString().slice(0, 10);
}

export async function PUT(request: Request) {
  const auth = await verifyAuth();
  if (auth.error) return auth.error;

  const parsed = reflectionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Write a short reflection first.' }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('operator_daily_reflections').upsert({
    owner_id: auth.user.id,
    reflection_date: todayInUtc(),
    reflection: parsed.data.reflection,
  }, { onConflict: 'owner_id,reflection_date' }).select('*').single();
  if (error) return NextResponse.json({ error: 'Reflection could not be saved.' }, { status: 500 });
  return NextResponse.json({ reflection: data });
}
