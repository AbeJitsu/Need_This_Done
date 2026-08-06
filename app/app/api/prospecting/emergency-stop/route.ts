import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const auth = await verifyAdmin(); if (auth.error) return auth.error;
  const parsed = z.object({ active: z.boolean() }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Emergency-stop state is invalid.' }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase.from('growth_profiles').select('id').eq('owner_id', auth.user.id).maybeSingle();
  if (!profile) return NextResponse.json({ error: 'Configure a growth profile first.' }, { status: 409 });
  const { error } = await supabase.from('growth_profiles').update({ emergency_stop: parsed.data.active }).eq('id', profile.id);
  if (error) return NextResponse.json({ error: 'Emergency-stop state could not be saved.' }, { status: 500 });
  return NextResponse.json({ emergencyStop: parsed.data.active });
}
