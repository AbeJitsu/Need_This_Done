import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getProspectingSenderProvider } from '@/lib/prospecting-sender';
import { sendApprovedProspectingMessage } from '@/lib/prospecting-delivery-service';
import { isApprovedSenderConfigured } from '@/lib/prospecting';

const schema = z.object({ messageId: z.string().uuid() });

/** Executes exactly one approved message through the explicitly configured
 * prospecting sender. Draft creation and approval never call this route. */
export async function POST(request: Request) {
  const auth = await verifyAdmin(); if (auth.error) return auth.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid sender request.' }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const { data: message } = await supabase.from('outreach_messages').select('id, approval_status, profile_id, prospect_id, sender_email, recipient_email, subject, body, idempotency_key, provider_operation_id, provider_message_id').eq('id', parsed.data.messageId).maybeSingle();
  if (!message) return NextResponse.json({ error: 'Message not found.' }, { status: 404 });
  if (message.approval_status === 'sent' && message.provider_message_id) return NextResponse.json({ message, duplicate: true });
  if (message.approval_status !== 'approved') return NextResponse.json({ error: 'Only approved messages may be sent.' }, { status: 409 });
  const { data: profile } = await supabase.from('growth_profiles').select('sender_name, sender_email, emergency_stop').eq('id', message.profile_id).single();
  if (!profile || profile.emergency_stop) return NextResponse.json({ error: 'Outreach is stopped.' }, { status: 409 });
  if (!isApprovedSenderConfigured(profile.sender_name, profile.sender_email) || message.sender_email !== profile.sender_email) return NextResponse.json({ error: 'No approved sender is configured for this draft.' }, { status: 409 });
  const { data: prospect } = await supabase.from('prospects').select('suppression_status').eq('id', message.prospect_id).single();
  if (!prospect || prospect.suppression_status !== 'clear') {
    return NextResponse.json({ error: 'This recipient is suppressed from outreach.' }, { status: 409 });
  }

  try {
    const sent = await sendApprovedProspectingMessage({
      id: message.id,
      profileId: message.profile_id,
      prospectId: message.prospect_id,
      senderName: profile.sender_name,
      senderEmail: message.sender_email,
      recipientEmail: message.recipient_email,
      subject: message.subject,
      body: message.body,
      idempotencyKey: message.idempotency_key,
      operationId: message.provider_operation_id,
    });
    if (!sent) {
      return NextResponse.json({
        error: `No approved prospecting sender is configured (provider: ${getProspectingSenderProvider()}).`,
      }, { status: 503 });
    }
    await supabase.from('prospects').update({
      outreach_status: 'contacted',
      last_contacted_at: (sent.sent_at as string | undefined) || new Date().toISOString(),
    }).eq('id', message.prospect_id);
    return NextResponse.json({ message: sent, duplicate: false, provider: getProspectingSenderProvider() }, { status: 201 });
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Prospecting sender failed.';
    const status = reason.includes('reconciliation') ? 409 : 502;
    return NextResponse.json({ error: reason }, { status });
  }
}
