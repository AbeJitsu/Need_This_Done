import { beforeEach, describe, expect, it, vi } from 'vitest';

const { calendarAdapter, getSupabaseAdmin } = vi.hoisted(() => ({
  calendarAdapter: vi.fn(),
  getSupabaseAdmin: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@/lib/supabase', () => ({ getSupabaseAdmin }));
vi.mock('@/lib/provider-adapters', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/provider-adapters')>();
  return { ...original, calendarAdapter };
});

import { executeCalendarOperation } from '@/lib/calendar-operation-service';
import { calendarEventId } from '@/lib/provider-adapters';

const projectId = '10000000-0000-4000-8000-000000000001';
const operationId = '20000000-0000-4000-8000-000000000001';
const tokenId = '30000000-0000-4000-8000-000000000001';

type FixtureOptions = {
  storedOperation?: Record<string, unknown>;
  externalEventId?: string;
  acceptError?: boolean;
  retryable?: boolean;
};

function fixture(options: FixtureOptions = {}) {
  let projectReads = 0;
  const externalEventId = options.externalEventId || 'stored-calendar-event-1';
  const from = vi.fn((table: string) => {
    const builder: Record<string, ReturnType<typeof vi.fn>> = {};
    for (const method of ['select', 'eq', 'not', 'in', 'order', 'limit']) {
      builder[method] = vi.fn(() => builder);
    }
    builder.maybeSingle = vi.fn(async () => {
      if (table === 'provider_operations') return { data: options.storedOperation || null, error: null };
      if (table === 'projects') {
        projectReads += 1;
        return { data: projectReads === 1
          ? { id: projectId, preferred_consultation_at: '2026-09-01T14:00:00.000Z' }
          : { id: projectId }, error: null };
      }
      if (table === 'google_calendar_tokens') {
        return { data: { id: tokenId, google_calendar_id: 'primary' }, error: null };
      }
      if (table === 'calendar_operation_references') {
        return { data: { id: 'reference-1', external_event_id: externalEventId }, error: null };
      }
      throw new Error(`Unexpected maybeSingle ${table}`);
    });
    return builder;
  });
  const rpc = vi.fn(async (name: string, args: Record<string, unknown>) => {
    if (name === 'upsert_provider_operation') {
      return { data: {
        id: operationId,
        provider: 'google_calendar',
        operation_type: args.target_operation_type,
        idempotency_key: args.target_idempotency_key,
        status: args.target_status,
        provider_reference: args.target_provider_reference || null,
        request_metadata: args.target_request_metadata,
      }, error: null };
    }
    if (name === 'assert_provider_operation_retryable') {
      return { data: { retryable: options.retryable ?? true }, error: null };
    }
    if (name === 'accept_calendar_operation') {
      return options.acceptError
        ? { data: null, error: { message: 'database unavailable' } }
        : { data: { id: 'reference-1', action: args.target_action, external_event_id: args.target_external_event_id }, error: null };
    }
    throw new Error(`Unexpected RPC ${name}`);
  });
  getSupabaseAdmin.mockReturnValue({ from, rpc });
  return { from, rpc, externalEventId };
}

describe('durable Calendar operation service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates the operation before disabled mode and returns its ID for retry', async () => {
    const { rpc } = fixture();
    calendarAdapter.mockReturnValue({ mode: 'disabled', adapter: null });
    const response = await executeCalendarOperation({
      userId: 'operator-1', projectId, action: 'create',
      endsAt: '2026-09-01T14:30:00.000Z', summary: 'Reviewed consultation',
    });
    expect(response).toMatchObject({ status: 503, body: { operationId } });
    const create = rpc.mock.calls.find(([name]) => name === 'upsert_provider_operation');
    expect(create?.[1]).toMatchObject({
      target_provider: 'google_calendar', target_operation_type: 'create', target_status: 'pending',
      target_request_metadata: expect.objectContaining({ project_id: projectId, calendar_token_id: tokenId }),
    });
    expect(rpc).toHaveBeenLastCalledWith('upsert_provider_operation', expect.objectContaining({
      target_idempotency_key: create?.[1].target_idempotency_key,
      target_status: 'failed_retryable',
    }));
  });

  it('retries with the stored key and derives the same create event ID', async () => {
    const key = '40000000-0000-4000-8000-000000000001';
    fixture({ storedOperation: {
      id: operationId, provider: 'google_calendar', operation_type: 'create', idempotency_key: key,
      status: 'failed_retryable', provider_reference: null,
      request_metadata: {
        project_id: projectId, calendar_token_id: tokenId, action: 'create',
        starts_at: '2026-09-01T14:00:00.000Z', ends_at: '2026-09-01T14:30:00.000Z',
        summary: 'Reviewed consultation', cleanup_reason: null,
      },
    } });
    const execute = vi.fn().mockResolvedValue({ externalEventId: calendarEventId(key) });
    calendarAdapter.mockReturnValue({ mode: 'fake', adapter: { execute } });
    const response = await executeCalendarOperation({ userId: 'operator-1', operationId });
    expect(response.status).toBe(201);
    expect(execute).toHaveBeenCalledWith('create', expect.objectContaining({
      idempotencyKey: key, externalEventId: null, calendarUserId: 'operator-1',
    }));
    expect(JSON.stringify(response.body)).not.toContain('server-only-access-token');
  });

  it.each([
    ['update', undefined],
    ['cancel', undefined],
    ['delete', 'test_or_accidental'],
  ] as const)('%s uses only the stored project event reference', async (action, cleanupReason) => {
    const { externalEventId } = fixture();
    const execute = vi.fn().mockResolvedValue({ externalEventId });
    calendarAdapter.mockReturnValue({ mode: 'fake', adapter: { execute } });
    const response = await executeCalendarOperation({
      userId: 'operator-1', projectId, action,
      ...(action === 'update' ? {
        startsAt: '2026-09-02T14:00:00.000Z', endsAt: '2026-09-02T14:30:00.000Z', summary: 'Updated consultation',
      } : {}),
      ...(cleanupReason ? { cleanupReason } : {}),
    });
    expect(response.status).toBe(201);
    expect(execute).toHaveBeenCalledWith(action, expect.objectContaining({
      externalEventId,
      cleanupReason: cleanupReason || null,
    }));
  });

  it('records acceptance unknown on event mismatch or database disagreement', async () => {
    const mismatch = fixture();
    calendarAdapter.mockReturnValue({
      mode: 'fake', adapter: { execute: vi.fn().mockResolvedValue({ externalEventId: 'unexpected-event' }) },
    });
    const mismatchResponse = await executeCalendarOperation({
      userId: 'operator-1', projectId, action: 'create',
      endsAt: '2026-09-01T14:30:00.000Z', summary: 'Reviewed consultation',
    });
    expect(mismatchResponse.status).toBe(503);
    expect(mismatch.rpc).toHaveBeenCalledWith('upsert_provider_operation', expect.objectContaining({
      target_status: 'acceptance_unknown', target_provider_reference: 'unexpected-event',
    }));

    const disagreement = fixture({ acceptError: true });
    const execute = vi.fn(async (_action: string, input: { idempotencyKey: string }) => ({
      externalEventId: calendarEventId(input.idempotencyKey),
    }));
    calendarAdapter.mockReturnValue({ mode: 'fake', adapter: { execute } });
    const disagreementResponse = await executeCalendarOperation({
      userId: 'operator-1', projectId, action: 'create',
      endsAt: '2026-09-01T14:30:00.000Z', summary: 'Reviewed consultation',
    });
    expect(disagreementResponse.status).toBe(503);
    expect(disagreement.rpc).toHaveBeenCalledWith('upsert_provider_operation', expect.objectContaining({
      target_status: 'acceptance_unknown',
    }));
  });

  it('records deterministic provider failure as retryable', async () => {
    const { rpc } = fixture();
    calendarAdapter.mockReturnValue({
      mode: 'fake', adapter: { execute: vi.fn().mockRejectedValue(new Error('deterministic fake failure')) },
    });
    const response = await executeCalendarOperation({
      userId: 'operator-1', projectId, action: 'create',
      endsAt: '2026-09-01T14:30:00.000Z', summary: 'Reviewed consultation',
    });
    expect(response.status).toBe(502);
    expect(rpc).toHaveBeenCalledWith('upsert_provider_operation', expect.objectContaining({
      target_status: 'failed_retryable', target_error: 'deterministic fake failure',
    }));
  });
});
