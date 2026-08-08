import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const actionSchema = z.object({
  state: z.enum(['complete', 'defer', 'reopen']),
  deferUntil: z.string().date().optional(),
  note: z.string().trim().max(1000).optional(),
}).superRefine((value, context) => {
  if (value.state === 'defer' && (!value.deferUntil || value.deferUntil <= new Date().toISOString().slice(0, 10))) {
    context.addIssue({ code: 'custom', path: ['deferUntil'], message: 'Choose a future date.' });
  }
  if (value.state !== 'defer' && value.deferUntil) {
    context.addIssue({ code: 'custom', path: ['deferUntil'], message: 'A defer date is only valid when deferring.' });
  }
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAuth();
  if (auth.error) return auth.error;
  if (!z.string().uuid().safeParse(params.id).success) return NextResponse.json({ error: 'Invalid cockpit action.' }, { status: 400 });

  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid action update.' }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const update = parsed.data.state === 'complete'
    ? { status: 'completed', deferred_until: null, completed_at: new Date().toISOString(), completion_note: parsed.data.note || null }
    : parsed.data.state === 'defer'
      ? { status: 'deferred', deferred_until: parsed.data.deferUntil || null, completed_at: null, completion_note: parsed.data.note || null }
      : { status: 'open', deferred_until: null, completed_at: null, completion_note: null };

  const { data, error } = await supabase.from('operator_cockpit_actions').update(update).eq('id', params.id).eq('owner_id', auth.user.id).select('*').maybeSingle();
  if (error) return NextResponse.json({ error: 'Cockpit action could not be updated.' }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Cockpit action not found.' }, { status: 404 });
  return NextResponse.json({ action: data });
}
