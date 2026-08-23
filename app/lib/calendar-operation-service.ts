import 'server-only';

import { randomUUID } from 'node:crypto';
import { calendarAdapter, calendarEventId } from '@/lib/provider-adapters';
import { getSupabaseAdmin } from '@/lib/supabase';

type CalendarAction = 'create' | 'update' | 'cancel' | 'delete';
type NewCalendarOperation = {
  userId: string;
  projectId: string;
  action: CalendarAction;
  startsAt?: string;
  endsAt?: string;
  summary?: string;
  cleanupReason?: 'test_or_accidental';
};
type RetryCalendarOperation = { userId: string; operationId: string };
export type CalendarOperationRequest = NewCalendarOperation | RetryCalendarOperation;
export type CalendarOperationResponse = { status: number; body: Record<string, unknown> };

type StoredOperation = {
  id: string;
  provider: string;
  operation_type: CalendarAction;
  idempotency_key: string;
  status: string;
  provider_reference: string | null;
  request_metadata: Record<string, string | null>;
};

function operationMetadata(input: {
  projectId: string; tokenId: string; action: CalendarAction; startsAt?: string | null;
  endsAt?: string | null; summary?: string | null; cleanupReason?: string | null;
}) {
  return {
    project_id: input.projectId,
    calendar_token_id: input.tokenId,
    action: input.action,
    starts_at: input.startsAt || null,
    ends_at: input.endsAt || null,
    summary: input.summary || null,
    cleanup_reason: input.cleanupReason || null,
  };
}

async function writeOperation(
  operation: Pick<StoredOperation, 'idempotency_key' | 'operation_type' | 'request_metadata'>,
  status: 'pending' | 'failed_retryable' | 'acceptance_unknown',
  options: { error?: string; providerReference?: string } = {},
) {
  const result = await getSupabaseAdmin().rpc('upsert_provider_operation', {
    target_provider: 'google_calendar',
    target_operation_type: operation.operation_type,
    target_idempotency_key: operation.idempotency_key,
    target_status: status,
    target_request_metadata: operation.request_metadata,
    ...(options.error ? { target_error: options.error } : {}),
    ...(options.providerReference ? { target_provider_reference: options.providerReference } : {}),
  });
  if (result.error) throw new Error('Calendar operation state could not be recorded.');
  return result.data as StoredOperation;
}

export async function executeCalendarOperation(
  request: CalendarOperationRequest,
): Promise<CalendarOperationResponse> {
  const admin = getSupabaseAdmin();
  let operation: StoredOperation;
  let projectId: string;
  let action: CalendarAction;
  let metadata: Record<string, string | null>;

  if ('operationId' in request) {
    const stored = await admin.from('provider_operations')
      .select('id, provider, operation_type, idempotency_key, status, provider_reference, request_metadata')
      .eq('id', request.operationId)
      .maybeSingle<StoredOperation>();
    if (stored.error || !stored.data || stored.data.provider !== 'google_calendar') {
      return { status: 404, body: { error: 'Calendar operation not found.' } };
    }
    operation = stored.data;
    metadata = operation.request_metadata;
    projectId = metadata.project_id || '';
    action = operation.operation_type;
    if (operation.status === 'succeeded') {
      const reference = await admin.from('calendar_operation_references').select('*')
        .eq('operation_id', operation.id).maybeSingle();
      return { status: 200, body: { operationId: operation.id, operation: reference.data, duplicate: true } };
    }
    const retry = await admin.rpc('assert_provider_operation_retryable', { target_operation_id: operation.id });
    if (retry.error || !(retry.data as { retryable?: boolean } | null)?.retryable) {
      return { status: 409, body: { error: 'Calendar operation requires reconciliation before retry.', operationId: operation.id } };
    }
  } else {
    projectId = request.projectId;
    action = request.action;
    const project = await admin.from('projects').select('id, preferred_consultation_at')
      .eq('id', projectId).maybeSingle<{ id: string; preferred_consultation_at: string | null }>();
    if (project.error || !project.data) return { status: 404, body: { error: 'Project not found.' } };
    const token = await admin.from('google_calendar_tokens').select('id, google_calendar_id')
      .eq('user_id', request.userId).maybeSingle<{ id: string; google_calendar_id: string | null }>();
    if (token.error || !token.data) {
      return { status: 409, body: { error: 'No server-side Calendar connection is available.' } };
    }
    const startsAt = request.startsAt || project.data.preferred_consultation_at;
    if ((action === 'create' || action === 'update') && (!startsAt || !request.endsAt || !request.summary)) {
      return { status: 400, body: { error: 'Calendar create and update require start, end, and summary.' } };
    }
    metadata = operationMetadata({
      projectId, tokenId: token.data.id, action, startsAt, endsAt: request.endsAt,
      summary: request.summary, cleanupReason: request.cleanupReason,
    });
    const idempotencyKey = randomUUID();
    const created = await admin.rpc('upsert_provider_operation', {
      target_provider: 'google_calendar', target_operation_type: action,
      target_idempotency_key: idempotencyKey, target_status: 'pending',
      target_request_metadata: metadata,
    });
    const operationId = (created.data as { id?: string } | null)?.id;
    if (created.error || !operationId) {
      return { status: 503, body: { error: 'Calendar operation could not be created.' } };
    }
    operation = {
      id: operationId, provider: 'google_calendar', operation_type: action,
      idempotency_key: idempotencyKey, status: 'pending', provider_reference: null,
      request_metadata: metadata,
    };
  }

  const tokenId = metadata.calendar_token_id || '';
  const token = await admin.from('google_calendar_tokens').select('id, google_calendar_id')
    .eq('id', tokenId).eq('user_id', request.userId)
    .maybeSingle<{ id: string; google_calendar_id: string | null }>();
  if (token.error || !token.data) {
    return { status: 409, body: { error: 'The stored Calendar connection is unavailable.', operationId: operation.id } };
  }
  const project = await admin.from('projects').select('id').eq('id', projectId).maybeSingle();
  if (project.error || !project.data) {
    return { status: 404, body: { error: 'The stored Calendar project is unavailable.', operationId: operation.id } };
  }

  let externalEventId: string | null = null;
  if (action !== 'create') {
    const reference = await admin.from('calendar_operation_references').select('external_event_id')
      .eq('project_id', projectId).not('external_event_id', 'is', null)
      .in('status', ['accepted', 'succeeded']).order('updated_at', { ascending: false })
      .limit(1).maybeSingle<{ external_event_id: string | null }>();
    if (reference.error || !reference.data?.external_event_id) {
      return { status: 409, body: { error: 'This project has no stored Calendar event reference.', operationId: operation.id } };
    }
    externalEventId = reference.data.external_event_id;
  }

  await writeOperation(operation, 'pending');
  const { mode, adapter } = calendarAdapter();
  if (!adapter) {
    await writeOperation(operation, 'failed_retryable', { error: 'Calendar adapter is disabled.' });
    return { status: 503, body: { error: 'Calendar adapter is disabled; no provider action was attempted.', operationId: operation.id } };
  }

  try {
    const result = await adapter.execute(action, {
      idempotencyKey: operation.idempotency_key,
      calendarUserId: request.userId,
      calendarId: token.data.google_calendar_id || 'primary',
      externalEventId,
      startsAt: metadata.starts_at,
      endsAt: metadata.ends_at,
      summary: metadata.summary,
      cleanupReason: metadata.cleanup_reason === 'test_or_accidental' ? 'test_or_accidental' : null,
    });
    const expectedEventId = action === 'create' ? calendarEventId(operation.idempotency_key) : externalEventId;
    if (!expectedEventId || result.externalEventId !== expectedEventId) {
      await writeOperation(operation, 'acceptance_unknown', {
        error: 'Calendar returned an unexpected event reference.',
        providerReference: result.externalEventId,
      });
      return { status: 503, body: { error: 'Calendar acceptance needs reconciliation.', operationId: operation.id } };
    }
    const accepted = await admin.rpc('accept_calendar_operation', {
      target_operation_id: operation.id,
      target_project_id: projectId,
      target_calendar_token_id: token.data.id,
      target_external_event_id: result.externalEventId,
      target_action: action,
    });
    if (accepted.error || !accepted.data) {
      await writeOperation(operation, 'acceptance_unknown', {
        error: 'Calendar accepted the action before its reference could be recorded.',
        providerReference: result.externalEventId,
      });
      return { status: 503, body: { error: 'Calendar action completed but its reference needs reconciliation.', operationId: operation.id } };
    }
    return { status: 201, body: { operationId: operation.id, operation: accepted.data, providerMode: mode } };
  } catch (error) {
    await writeOperation(operation, 'failed_retryable', {
      error: error instanceof Error ? error.message : 'Calendar provider failed.',
    });
    return { status: 502, body: { error: 'Calendar provider action failed; retry with the operation ID.', operationId: operation.id } };
  }
}
