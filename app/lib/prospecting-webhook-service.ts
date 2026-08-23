import 'server-only';

import { getSupabaseAdmin } from '@/lib/supabase';

export type ProspectingWebhookEvent = {
  providerEventId: string;
  eventType: 'delivered' | 'bounced' | 'replied' | 'unsubscribed';
  providerMessageId: string;
  address: string;
  payloadSha256: string;
  occurredAt?: string | null;
};

type Message = {
  id: string;
  prospect_id: string;
  approved_by: string | null;
  provider_message_id: string | null;
  recipient_email: string;
};

/**
 * Persist a verified event through the isolated service-role lane. Each step is
 * replay-safe so a retryable receipt can finish after a partial database fault.
 */
export async function recordProspectingWebhookEvent(input: ProspectingWebhookEvent) {
  const admin = getSupabaseAdmin();
  const normalizedAddress = input.address.trim().toLowerCase();
  const existing = await admin.from('sender_events')
    .select('id, message_id')
    .eq('provider_event_id', input.providerEventId)
    .maybeSingle<{ id: string; message_id: string | null }>();
  if (existing.error) throw new Error('Prospecting sender event could not be read.');

  let event = existing.data;
  if (!event) {
    const inserted = await admin.from('sender_events').insert({
      event_type: input.eventType,
      provider_event_id: input.providerEventId,
      provider_message_id: input.providerMessageId || null,
      address: normalizedAddress || null,
      payload: { payload_sha256: input.payloadSha256 },
      occurred_at: input.occurredAt || new Date().toISOString(),
    }).select('id, message_id').single<{ id: string; message_id: string | null }>();
    if (inserted.error || !inserted.data) throw new Error('Prospecting sender event could not be recorded.');
    event = inserted.data;
  }

  let messageResult;
  if (input.providerMessageId) {
    messageResult = await admin.from('outreach_messages')
      .select('id, prospect_id, approved_by, provider_message_id, recipient_email')
      .eq('provider_message_id', input.providerMessageId)
      .maybeSingle<Message>();
  } else if (normalizedAddress) {
    messageResult = await admin.from('outreach_messages')
      .select('id, prospect_id, approved_by, provider_message_id, recipient_email')
      .eq('recipient_email', normalizedAddress)
      .order('sent_at', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle<Message>();
  } else {
    messageResult = { data: null, error: null };
  }
  if (messageResult.error) throw new Error('Prospecting message correlation failed.');
  const message = messageResult.data;
  if (!message) return { eventId: event.id, duplicate: Boolean(existing.data), correlated: false };

  if (event.message_id !== message.id) {
    const linked = await admin.from('sender_events').update({ message_id: message.id }).eq('id', event.id);
    if (linked.error) throw new Error('Prospecting sender event linkage failed.');
  }

  const messageUpdate: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    follow_up_eligible: input.eventType === 'replied',
  };
  if (input.eventType === 'delivered') messageUpdate.sent_at = input.occurredAt || new Date().toISOString();
  if (input.eventType === 'bounced') messageUpdate.bounced_at = input.occurredAt || new Date().toISOString();
  if (input.eventType === 'replied') messageUpdate.replied_at = input.occurredAt || new Date().toISOString();
  if (input.eventType === 'unsubscribed') messageUpdate.unsubscribed_at = input.occurredAt || new Date().toISOString();
  const updatedMessage = await admin.from('outreach_messages').update(messageUpdate).eq('id', message.id);
  if (updatedMessage.error) throw new Error('Prospecting message event transition failed.');

  const prospectUpdate: Record<string, unknown> = {
    outreach_status: input.eventType === 'replied' ? 'replied'
      : input.eventType === 'bounced' ? 'bounced'
        : input.eventType === 'unsubscribed' ? 'unsubscribed' : 'contacted',
    updated_at: new Date().toISOString(),
  };
  if (input.eventType === 'replied') prospectUpdate.last_replied_at = input.occurredAt || new Date().toISOString();
  const updatedProspect = await admin.from('prospects').update(prospectUpdate).eq('id', message.prospect_id);
  if (updatedProspect.error) throw new Error('Prospecting prospect event transition failed.');

  if ((input.eventType === 'bounced' || input.eventType === 'unsubscribed') && normalizedAddress) {
    const suppression = await admin.from('suppression_records').upsert({
      normalized_address: normalizedAddress,
      reason: input.eventType === 'bounced' ? 'bounce' : 'unsubscribe',
      source_message_id: message.id,
      created_by: message.approved_by,
    }, { onConflict: 'normalized_address', ignoreDuplicates: true });
    if (suppression.error) throw new Error('Prospecting suppression could not be recorded.');
  }
  return { eventId: event.id, duplicate: Boolean(existing.data), correlated: true };
}
