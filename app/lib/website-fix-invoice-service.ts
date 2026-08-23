import 'server-only';

import { randomUUID } from 'node:crypto';
import { invoiceAdapter } from '@/lib/provider-adapters';
import { getSupabaseAdmin } from '@/lib/supabase';

type NewInvoiceRequest = { userId: string; projectId: string };
type RetryInvoiceRequest = { userId: string; operationId: string };
export type WebsiteFixInvoiceRequest = NewInvoiceRequest | RetryInvoiceRequest;
export type WebsiteFixInvoiceResponse = { status: number; body: Record<string, unknown> };

type StoredOperation = {
  id: string;
  provider: string;
  operation_type: string;
  idempotency_key: string;
  status: string;
  provider_reference: string | null;
  request_metadata: { project_id?: string; amount_cents?: number; currency?: string; test_mode?: boolean };
};

const requestMetadata = (projectId: string) => ({
  project_id: projectId, amount_cents: 25000, currency: 'usd', test_mode: true,
});

async function writeOperation(
  operation: Pick<StoredOperation, 'idempotency_key' | 'request_metadata'>,
  status: 'pending' | 'failed_retryable' | 'acceptance_unknown',
  options: { error?: string; providerReference?: string } = {},
) {
  const result = await getSupabaseAdmin().rpc('upsert_provider_operation', {
    target_provider: 'stripe',
    target_operation_type: 'website_improvement_start_invoice',
    target_idempotency_key: operation.idempotency_key,
    target_status: status,
    target_request_metadata: operation.request_metadata,
    ...(options.error ? { target_error: options.error } : {}),
    ...(options.providerReference ? { target_provider_reference: options.providerReference } : {}),
  });
  if (result.error) throw new Error('Invoice operation state could not be recorded.');
}

/** Create or retry the single fixed, test-mode Website Fix invoice operation. */
export async function executeWebsiteFixInvoice(
  request: WebsiteFixInvoiceRequest,
): Promise<WebsiteFixInvoiceResponse> {
  void request.userId;
  const admin = getSupabaseAdmin();
  let operation: StoredOperation;
  let projectId: string;

  if ('operationId' in request) {
    const stored = await admin.from('provider_operations')
      .select('id, provider, operation_type, idempotency_key, status, provider_reference, request_metadata')
      .eq('id', request.operationId).maybeSingle<StoredOperation>();
    if (stored.error || !stored.data || stored.data.provider !== 'stripe'
      || stored.data.operation_type !== 'website_improvement_start_invoice') {
      return { status: 404, body: { error: 'Website Fix invoice operation not found.' } };
    }
    operation = stored.data;
    projectId = operation.request_metadata.project_id || '';
    if (operation.request_metadata.amount_cents !== 25000
      || operation.request_metadata.currency !== 'usd'
      || operation.request_metadata.test_mode !== true) {
      return { status: 409, body: { error: 'Stored invoice operation does not match the fixed test invoice.', operationId: operation.id } };
    }
    if (operation.status === 'succeeded') {
      const reference = await admin.from('website_improvement_invoice_references')
        .select('*').eq('operation_id', operation.id).maybeSingle();
      return { status: 200, body: {
        operationId: operation.id, invoice: reference.data, duplicate: true,
        amountCents: 25000, currency: 'usd', testMode: true,
      } };
    }
    const retry = await admin.rpc('assert_provider_operation_retryable', { target_operation_id: operation.id });
    if (retry.error || !(retry.data as { retryable?: boolean } | null)?.retryable) {
      return { status: 409, body: { error: 'Invoice operation requires reconciliation before retry.', operationId: operation.id } };
    }
  } else {
    projectId = request.projectId;
    const project = await admin.from('projects').select('id').eq('id', projectId).maybeSingle();
    if (project.error || !project.data) return { status: 404, body: { error: 'Project not found.' } };
    const idempotencyKey = randomUUID();
    const metadata = requestMetadata(projectId);
    const created = await admin.rpc('upsert_provider_operation', {
      target_provider: 'stripe', target_operation_type: 'website_improvement_start_invoice',
      target_idempotency_key: idempotencyKey, target_status: 'pending',
      target_request_metadata: metadata,
    });
    const operationId = (created.data as { id?: string } | null)?.id;
    if (created.error || !operationId) {
      return { status: 503, body: { error: 'Invoice operation could not be created.' } };
    }
    operation = {
      id: operationId, provider: 'stripe', operation_type: 'website_improvement_start_invoice',
      idempotency_key: idempotencyKey, status: 'pending', provider_reference: null,
      request_metadata: metadata,
    };
  }

  const project = await admin.from('projects').select('id').eq('id', projectId).maybeSingle();
  if (project.error || !project.data) {
    return { status: 404, body: { error: 'The stored invoice project is unavailable.', operationId: operation.id } };
  }
  await writeOperation(operation, 'pending');
  const { mode, adapter } = invoiceAdapter();
  if (!adapter) {
    await writeOperation(operation, 'failed_retryable', { error: 'Stripe test-mode adapter is disabled.' });
    return { status: 503, body: { error: 'Stripe test-mode adapter is disabled; no provider action was attempted.', operationId: operation.id } };
  }

  try {
    const result = await adapter.createStartInvoice({ idempotencyKey: operation.idempotency_key, projectId });
    if (!result.invoiceId.startsWith('in_')
      || (operation.provider_reference && operation.provider_reference !== result.invoiceId)) {
      await writeOperation(operation, 'acceptance_unknown', {
        error: 'Stripe returned an unexpected invoice reference.', providerReference: result.invoiceId,
      });
      return { status: 503, body: { error: 'Stripe invoice acceptance needs reconciliation.', operationId: operation.id } };
    }
    const accepted = await admin.rpc('accept_website_improvement_invoice', {
      target_operation_id: operation.id,
      target_project_id: projectId,
      target_stripe_invoice_id: result.invoiceId,
    });
    if (accepted.error || !accepted.data) {
      await writeOperation(operation, 'acceptance_unknown', {
        error: 'Stripe accepted the invoice before its reference could be recorded.',
        providerReference: result.invoiceId,
      });
      return { status: 503, body: { error: 'Invoice was created but its durable reference needs reconciliation.', operationId: operation.id } };
    }
    return { status: 201, body: {
      operationId: operation.id, invoice: accepted.data, providerMode: mode,
      amountCents: 25000, currency: 'usd', testMode: true,
    } };
  } catch (error) {
    await writeOperation(operation, 'failed_retryable', {
      error: error instanceof Error ? error.message : 'Stripe provider failed.',
    });
    return { status: 502, body: { error: 'Stripe provider action failed; retry with the operation ID.', operationId: operation.id } };
  }
}
