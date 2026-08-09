import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createProspectingSender, getProspectingSenderProvider } from '@/lib/prospecting-sender';
import { isApprovedSenderConfigured } from '@/lib/prospecting';

const schema = z.object({ messageId: z.string().uuid() });

/** Executes exactly one approved message through the explicitly configured
 * prospecting sender. Draft creation and approval never call this route. */
export async function POST(request: Request) {
  const auth = await verifyAdmin(); if (auth.error) return auth.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid sender request.' }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const { data: message } = await supabase.from('outreach_messages').select('id, approval_status, profile_id, prospect_id, sender_email, recipient_email, subject, body, idempotency_key, provider_message_id').eq('id', parsed.data.messageId).maybeSingle();
  if (!message) return NextResponse.json({ error: 'Message not found.' }, { status: 404 });
  if (message.approval_status === 'sent' && message.provider_message_id) return NextResponse.json({ message, duplicate: true });
  if (message.approval_status !== 'approved') return NextResponse.json({ error: 'Only approved messages may be sent.' }, { status: 409 });
  const { data: profile } = await supabase.from('growth_profiles').select('sender_name, sender_email, emergency_stop').eq('id', message.profile_id).single();
  if (!profile || profile.emergency_stop) return NextResponse.json({ error: 'Outreach is stopped.' }, { status: 409 });
  if (!isApprovedSenderConfigured(profile.sender_name, profile.sender_email) || message.sender_email !== profile.sender_email) return NextResponse.json({ error: 'No approved sender is configured for this draft.' }, { status: 409 });
  const sender = createProspectingSender();
  if (!sender) return NextResponse.json({ error: `No approved prospecting sender is configured (provider: ${getProspectingSenderProvider()}).` }, { status: 503 });

  let providerMessageId: string;
  try {
    const prepared = await sender.prepare({ id: message.id, senderName: profile.sender_name, senderEmail: message.sender_email, recipientEmail: message.recipient_email, subject: message.subject, body: message.body, idempotencyKey: message.idempotency_key });
    ({ providerMessageId } = await sender.send(prepared));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Prospecting sender failed.' }, { status: 502 });
  }

  const sentAt = new Date().toISOString();
  const { data, error } = await supabase.from('outreach_messages').update({ approval_status: 'sent', provider_message_id: providerMessageId, sent_at: sentAt, updated_at: sentAt }).eq('id', message.id).eq('approval_status', 'approved').select('*').maybeSingle();
  if (error) return NextResponse.json({ error: 'Sender accepted the message but durable send recording failed; retry with the same message.' }, { status: 503 });
  if (!data) {
    const { data: existing } = await supabase.from('outreach_messages').select('*').eq('id', message.id).single();
    if (existing?.approval_status === 'sent' && existing.provider_message_id === providerMessageId) return NextResponse.json({ message: existing, duplicate: true });
    return NextResponse.json({ error: 'Message was changed before the send could be recorded.' }, { status: 409 });
  }
  await supabase.from('prospects').update({ outreach_status: 'contacted', last_contacted_at: sentAt }).eq('id', message.prospect_id);
  return NextResponse.json({ message: data, duplicate: false, provider: getProspectingSenderProvider() }, { status: 201 });
}
