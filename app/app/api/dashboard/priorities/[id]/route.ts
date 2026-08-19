import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const statusSchema = z.object({ status: z.enum(['active', 'completed', 'dropped']) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth();
  if (auth.error) return auth.error;
  if (!z.string().uuid().safeParse((await params).id).success) return NextResponse.json({ error: 'Invalid priority.' }, { status: 400 });

  const parsed = statusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid priority status.' }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('operator_weekly_priorities').update({ status: parsed.data.status }).eq('id', (await params).id).eq('owner_id', auth.user.id).select('*').maybeSingle();
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'That weekly position is already in use.' }, { status: 409 });
    return NextResponse.json({ error: 'Priority status could not be changed.' }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'Priority not found.' }, { status: 404 });

  const actionStatus = parsed.data.status === 'active' ? 'open' : 'completed';
  await supabase.from('operator_cockpit_actions').update({
    status: actionStatus,
    deferred_until: null,
    completed_at: parsed.data.status === 'active' ? null : new Date().toISOString(),
  }).eq('priority_id', (await params).id).eq('owner_id', auth.user.id);

  return NextResponse.json({ priority: data });
}
