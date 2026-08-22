import 'server-only';

import { createHash } from 'node:crypto';
import { getSupabaseAdmin } from '@/lib/supabase';
import { newOperationKey, transactionalEmailAdapter } from '@/lib/provider-adapters';

export type DurableTransactionalEmail = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer | string; contentType?: string }[];
  projectId?: string | null;
  operationKey?: string;
};

const recipientHash = (value: string) => createHash('sha256').update(value.trim().toLowerCase()).digest('hex');

/** Sends one transactional message through the only outbound boundary. The
 * operation key is created once and retained across every retry; message bodies
 * are deliberately never written to the provider ledger. */
export async function sendDurableTransactionalEmail(input: DurableTransactionalEmail): Promise<string | null> {
  const { adapter } = transactionalEmailAdapter();
  if (!adapter) return null;
  const idempotencyKey = input.operationKey || newOperationKey();
  const metadata = { recipient_hash: recipientHash(input.to), subject: input.subject };
  const admin = getSupabaseAdmin();
  const operation = await admin.rpc('upsert_provider_operation', {
    target_provider: 'resend_transactional', target_operation_type: 'send_email',
    target_idempotency_key: idempotencyKey, target_status: 'pending', target_request_metadata: metadata,
  });
  const operationId = (operation.data as { id?: string } | null)?.id;
  if (operation.error || !operationId) throw new Error('Transactional email operation could not be recorded.');
  try {
    const result = await adapter.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev', to: input.to,
      subject: input.subject, text: input.text, html: input.html, replyTo: input.replyTo || process.env.RESEND_FROM_EMAIL, attachments: input.attachments,
      idempotencyKey,
    });
    const accepted = await admin.rpc('accept_resend_transactional_operation', {
      target_operation_id: operationId, target_project_id: input.projectId || null,
      target_recipient_hash: metadata.recipient_hash, target_subject: input.subject,
      target_provider_message_id: result.providerMessageId,
    });
    if (accepted.error) throw new Error('Resend accepted the message but durable reconciliation is required.');
    return result.providerMessageId;
  } catch (error) {
    await admin.rpc('upsert_provider_operation', {
      target_provider: 'resend_transactional', target_operation_type: 'send_email',
      target_idempotency_key: idempotencyKey, target_status: 'failed_retryable', target_request_metadata: metadata,
      target_error: error instanceof Error ? error.message : 'Transactional Resend operation failed.',
    });
    throw error;
  }
}
