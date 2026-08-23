import 'server-only';

import { createProspectingSender } from '@/lib/prospecting-sender';
import { getSupabaseAdmin } from '@/lib/supabase';

export type DurableProspectingMessage = {
  id: string;
  profileId: string;
  prospectId: string;
  senderName?: string;
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  body: string;
  idempotencyKey: string;
  operationId: string;
};

const metadataFor = (message: DurableProspectingMessage) => ({
  message_id: message.id,
  profile_id: message.profileId,
  prospect_id: message.prospectId,
});

async function recordState(
  message: DurableProspectingMessage,
  status: 'pending' | 'failed_retryable',
  error?: string,
) {
  const result = await getSupabaseAdmin().rpc('upsert_provider_operation', {
    target_provider: 'resend_prospecting',
    target_operation_type: 'send_outreach_message',
    target_idempotency_key: message.idempotencyKey,
    target_status: status,
    target_request_metadata: metadataFor(message),
    ...(error ? { target_error: error } : {}),
  });
  if (result.error || (result.data as { id?: string } | null)?.id !== message.operationId) {
    throw new Error('Prospecting provider operation could not be recorded.');
  }
}

/** Send one approved outreach record with its migration-managed operation. */
export async function sendApprovedProspectingMessage(
  message: DurableProspectingMessage,
): Promise<Record<string, unknown> | null> {
  const admin = getSupabaseAdmin();
  const retry = await admin.rpc('assert_provider_operation_retryable', {
    target_operation_id: message.operationId,
  });
  if (retry.error || !(retry.data as { retryable?: boolean } | null)?.retryable) {
    throw new Error('Prospecting provider operation requires reconciliation before retry.');
  }
  await recordState(message, 'pending');

  const sender = createProspectingSender();
  if (!sender) {
    await recordState(message, 'failed_retryable', 'Prospecting Resend provider is disabled.');
    return null;
  }

  let providerMessageId: string;
  try {
    const prepared = await sender.prepare({
      id: message.id,
      senderName: message.senderName,
      senderEmail: message.senderEmail,
      recipientEmail: message.recipientEmail,
      subject: message.subject,
      body: message.body,
      idempotencyKey: message.idempotencyKey,
    });
    ({ providerMessageId } = await sender.send(prepared));
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Prospecting Resend operation failed.';
    await recordState(message, 'failed_retryable', reason);
    throw error;
  }

  const accepted = await admin.rpc('accept_resend_prospecting_operation', {
    target_operation_id: message.operationId,
    target_message_id: message.id,
    target_provider_message_id: providerMessageId,
  });
  if (accepted.error || !accepted.data) {
    const unknown = await admin.rpc('mark_resend_acceptance_unknown', {
      target_operation_id: message.operationId,
      target_error: 'Provider acceptance was returned before the outreach transition could be recorded.',
    });
    if (unknown.error) throw new Error('Prospecting acceptance state could not be reconciled.');
    throw new Error('Resend accepted the outreach message but durable reconciliation is required.');
  }
  return accepted.data as Record<string, unknown>;
}
