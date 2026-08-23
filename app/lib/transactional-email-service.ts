import 'server-only';

import { createHash } from 'node:crypto';
import { getSupabaseAdmin } from '@/lib/supabase';
import { transactionalEmailAdapter } from '@/lib/provider-adapters';

type Attachment = {
  filename: string;
  content: Buffer | string;
  contentType?: string;
};

export type DurableTransactionalEmail = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  attachments?: Attachment[];
  projectId?: string | null;
  operationKey: string;
  domainReference: string;
};

export type DurableGithubHandoffEmail = Omit<DurableTransactionalEmail, 'domainReference'> & {
  operationId: string;
  handoffId: string;
  projectId: string;
};

export type GithubHandoffSendResult = {
  providerMessageId: string;
  handoff: Record<string, unknown>;
};

type ProviderOperation = {
  id: string;
  status: string;
  provider_reference?: string | null;
};

const recipientHash = (value: string) =>
  createHash('sha256').update(value.trim().toLowerCase()).digest('hex');

function requireValue(value: string | undefined, message: string) {
  if (!value?.trim()) throw new Error(message);
  return value.trim();
}

function providerInput(input: DurableTransactionalEmail, idempotencyKey: string) {
  return {
    from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
    replyTo: input.replyTo || process.env.RESEND_FROM_EMAIL,
    attachments: input.attachments,
    idempotencyKey,
  };
}

async function recordFailure(
  operationType: string,
  operationKey: string,
  requestMetadata: Record<string, string>,
  error: string,
) {
  const result = await getSupabaseAdmin().rpc('upsert_provider_operation', {
    target_provider: 'resend_transactional',
    target_operation_type: operationType,
    target_idempotency_key: operationKey,
    target_status: 'failed_retryable',
    target_request_metadata: requestMetadata,
    target_error: error,
  });
  if (result.error) throw new Error('Transactional email failure state could not be recorded.');
}

async function markAcceptanceUnknown(operationId: string) {
  const result = await getSupabaseAdmin().rpc('mark_resend_acceptance_unknown', {
    target_operation_id: operationId,
    target_error: 'Provider acceptance was returned before the domain transition could be recorded.',
  });
  if (result.error) throw new Error('Resend acceptance and reconciliation state could not be recorded.');
}

/**
 * The caller owns the operation key at the logical event boundary. This
 * service persists that exact key before any adapter call and never stores an
 * address, body, attachment, token, or raw provider payload.
 */
export async function sendDurableTransactionalEmail(
  input: DurableTransactionalEmail,
): Promise<string | null> {
  const operationKey = requireValue(input.operationKey, 'Transactional email operation key is required.');
  const domainReference = requireValue(input.domainReference, 'Transactional email domain reference is required.');
  const normalizedRecipientHash = recipientHash(input.to);
  const requestMetadata = {
    domain_reference: domainReference,
    recipient_hash: normalizedRecipientHash,
    subject: input.subject,
  };
  const admin = getSupabaseAdmin();
  const existing = await admin
    .from('provider_operations')
    .select('id, status, provider_reference')
    .eq('provider', 'resend_transactional')
    .eq('idempotency_key', operationKey)
    .maybeSingle<ProviderOperation>();
  if (existing.error) throw new Error('Transactional email operation could not be read.');
  if (existing.data?.status === 'succeeded' || existing.data?.status === 'reconciled') {
    if (!existing.data.provider_reference) throw new Error('Transactional email terminal operation is missing its provider reference.');
    return existing.data.provider_reference;
  }
  if (existing.data) {
    const retry = await admin.rpc('assert_provider_operation_retryable', {
      target_operation_id: existing.data.id,
    });
    if (retry.error || !(retry.data as { retryable?: boolean } | null)?.retryable) {
      throw new Error('Transactional email operation requires reconciliation before retry.');
    }
  }

  const operation = await admin.rpc('upsert_provider_operation', {
    target_provider: 'resend_transactional',
    target_operation_type: 'send_email',
    target_idempotency_key: operationKey,
    target_status: 'pending',
    target_request_metadata: requestMetadata,
  });
  const operationId = (operation.data as ProviderOperation | null)?.id;
  if (operation.error || !operationId) throw new Error('Transactional email operation could not be recorded.');

  const { adapter } = transactionalEmailAdapter();
  if (!adapter) {
    await recordFailure('send_email', operationKey, requestMetadata, 'Transactional Resend provider is disabled.');
    return null;
  }

  let providerMessageId: string;
  try {
    const result = await adapter.send(providerInput(input, operationKey));
    providerMessageId = result.providerMessageId;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Transactional Resend operation failed.';
    await recordFailure('send_email', operationKey, requestMetadata, message);
    throw error;
  }

  const accepted = await admin.rpc('accept_resend_transactional_operation', {
    target_operation_id: operationId,
    target_project_id: input.projectId || null,
    target_recipient_hash: normalizedRecipientHash,
    target_subject: input.subject,
    target_provider_message_id: providerMessageId,
  });
  if (accepted.error) {
    await markAcceptanceUnknown(operationId);
    throw new Error('Resend accepted the message but durable reconciliation is required.');
  }
  return providerMessageId;
}

/** Send an explicitly confirmed handoff through its migration-managed operation. */
export async function sendDurableGithubHandoffEmail(
  input: DurableGithubHandoffEmail,
): Promise<GithubHandoffSendResult | null> {
  const operationKey = requireValue(input.operationKey, 'GitHub handoff operation key is required.');
  const operationId = requireValue(input.operationId, 'GitHub handoff operation ID is required.');
  const handoffId = requireValue(input.handoffId, 'GitHub handoff ID is required.');
  const projectId = requireValue(input.projectId, 'GitHub handoff project ID is required.');
  const normalizedRecipientHash = recipientHash(input.to);
  const requestMetadata = { handoff_id: handoffId, project_id: projectId };
  const admin = getSupabaseAdmin();

  const retry = await admin.rpc('assert_provider_operation_retryable', {
    target_operation_id: operationId,
  });
  if (retry.error || !(retry.data as { retryable?: boolean } | null)?.retryable) {
    throw new Error('GitHub handoff operation requires reconciliation before retry.');
  }
  const pending = await admin.rpc('upsert_provider_operation', {
    target_provider: 'resend_transactional',
    target_operation_type: 'github_handoff_notification',
    target_idempotency_key: operationKey,
    target_status: 'pending',
    target_request_metadata: requestMetadata,
  });
  if (pending.error || (pending.data as ProviderOperation | null)?.id !== operationId) {
    throw new Error('GitHub handoff operation could not be prepared.');
  }

  const { adapter } = transactionalEmailAdapter();
  if (!adapter) {
    await recordFailure(
      'github_handoff_notification', operationKey, requestMetadata,
      'Transactional Resend provider is disabled.',
    );
    return null;
  }

  let providerMessageId: string;
  try {
    const result = await adapter.send(providerInput({
      ...input,
      domainReference: `github_handoff:${handoffId}`,
    }, operationKey));
    providerMessageId = result.providerMessageId;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'GitHub handoff Resend operation failed.';
    await recordFailure('github_handoff_notification', operationKey, requestMetadata, message);
    throw error;
  }

  const accepted = await admin.rpc('accept_github_handoff_operation', {
    target_operation_id: operationId,
    target_handoff_id: handoffId,
    target_recipient_hash: normalizedRecipientHash,
    target_subject: input.subject,
    target_provider_message_id: providerMessageId,
  });
  if (accepted.error || !accepted.data) {
    await markAcceptanceUnknown(operationId);
    throw new Error('Resend accepted the GitHub handoff but durable reconciliation is required.');
  }
  return { providerMessageId, handoff: accepted.data as Record<string, unknown> };
}
