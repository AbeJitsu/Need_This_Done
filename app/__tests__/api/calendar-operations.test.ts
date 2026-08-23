import { beforeEach, describe, expect, it, vi } from 'vitest';

const { executeCalendarOperation, verifyAdmin } = vi.hoisted(() => ({
  executeCalendarOperation: vi.fn(),
  verifyAdmin: vi.fn(),
}));

vi.mock('@/lib/api-auth', () => ({ verifyAdmin }));
vi.mock('@/lib/calendar-operation-service', () => ({ executeCalendarOperation }));
vi.mock('server-only', () => ({}));

import { POST } from '@/app/api/admin/calendar/operations/route';

function request(body: Record<string, unknown>) {
  return new Request('http://localhost/api/admin/calendar/operations', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
}

describe('operator Calendar operations route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyAdmin.mockResolvedValue({ user: { id: 'operator-1' } });
  });

  it('rejects browser-supplied idempotency keys and provider event IDs', async () => {
    const response = await POST(request({
      projectId: '10000000-0000-4000-8000-000000000001', action: 'create',
      confirmOperatorAction: true, idempotencyKey: 'browser-key', externalEventId: 'browser-event',
    }));
    expect(response.status).toBe(400);
    expect(executeCalendarOperation).not.toHaveBeenCalled();
  });

  it('creates an operation server-side and returns its durable ID', async () => {
    executeCalendarOperation.mockResolvedValue({ status: 503, body: { error: 'disabled', operationId: 'operation-1' } });
    const response = await POST(request({
      projectId: '10000000-0000-4000-8000-000000000001', action: 'create',
      confirmOperatorAction: true, startsAt: '2026-09-01T14:00:00.000Z',
      endsAt: '2026-09-01T14:30:00.000Z', summary: 'Reviewed consultation',
    }));
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ operationId: 'operation-1' });
    expect(executeCalendarOperation).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'operator-1', action: 'create',
    }));
    expect(executeCalendarOperation.mock.calls[0]?.[0]).not.toHaveProperty('confirmOperatorAction');
  });

  it('retries only by durable operation ID', async () => {
    executeCalendarOperation.mockResolvedValue({ status: 201, body: { operationId: '10000000-0000-4000-8000-000000000002' } });
    const response = await POST(request({
      operationId: '10000000-0000-4000-8000-000000000002', confirmOperatorAction: true,
    }));
    expect(response.status).toBe(201);
    expect(executeCalendarOperation).toHaveBeenCalledWith({
      userId: 'operator-1', operationId: '10000000-0000-4000-8000-000000000002',
    });
  });

  it('requires the exact cleanup reason for a new delete action', async () => {
    const response = await POST(request({
      projectId: '10000000-0000-4000-8000-000000000001', action: 'delete',
      confirmOperatorAction: true, cleanupReason: 'ordinary_cleanup',
    }));
    expect(response.status).toBe(400);
    expect(executeCalendarOperation).not.toHaveBeenCalled();
  });
});
