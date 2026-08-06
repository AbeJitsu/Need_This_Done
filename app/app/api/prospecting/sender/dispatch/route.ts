import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const schema = z.object({ messageId: z.string().uuid(), providerMessageId: z.string().trim().min(1).max(240) });

/** Records a provider dispatch after the approved sender has accepted the
 * exact message. It never changes pending/rejected records into sent. */
export async function POST(request: Request) {
  const auth = await verifyAdmin(); if (auth.error) return auth.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid dispatch record.' }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const { data: message } = await supabase.from('outreach_messages').select('id, approval_status, profile_id, prospect_id, provider_message_id').eq('id', parsed.data.messageId).maybeSingle();
  if (!message) return NextResponse.json({ error: 'Message not found.' }, { status: 404 });
  if (message.approval_status === 'sent' && message.provider_message_id === parsed.data.providerMessageId) return NextResponse.json({ message, duplicate: true });
  if (message.approval_status !== 'approved') return NextResponse.json({ error: 'Only approved messages may be dispatched.' }, { status: 409 });
  const { data, error } = await supabase.from('outreach_messages').update({ approval_status: 'sent', provider_message_id: parsed.data.providerMessageId, sent_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', message.id).eq('approval_status', 'approved').select('*').single();
  if (error) return NextResponse.json({ error: 'Dispatch record could not be saved.' }, { status: 409 });
  await supabase.from('prospects').update({ outreach_status: 'contacted', last_contacted_at: new Date().toISOString() }).eq('id', message.prospect_id);
  return NextResponse.json({ message: data, duplicate: false }, { status: 201 });
}
