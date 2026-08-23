import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createSupabaseServerClient, getProspectingSenderProvider, sendApprovedProspectingMessage, verifyAdmin } = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  getProspectingSenderProvider: vi.fn(() => 'fake'),
  sendApprovedProspectingMessage: vi.fn(),
  verifyAdmin: vi.fn(),
}));

vi.mock('@/lib/api-auth', () => ({ verifyAdmin }));
vi.mock('@/lib/supabase-server', () => ({ createSupabaseServerClient }));
vi.mock('@/lib/prospecting-sender', () => ({ getProspectingSenderProvider }));
vi.mock('@/lib/prospecting-delivery-service', () => ({ sendApprovedProspectingMessage }));
vi.mock('@/lib/prospecting', () => ({ isApprovedSenderConfigured: vi.fn(() => true) }));

import { POST } from '@/app/api/prospecting/sender/send/route';

const message = {
  id: '10000000-0000-4000-8000-000000000001',
  approval_status: 'approved',
  profile_id: 'profile-1',
  prospect_id: 'prospect-1',
  sender_email: 'operator@example.test',
  recipient_email: 'prospect@example.test',
  subject: 'Reviewed subject',
  body: 'Reviewed body',
  idempotency_key: 'original-outreach-key',
  provider_operation_id: 'operation-1',
  provider_message_id: null,
};

function request() {
  return new Request('http://localhost/api/prospecting/sender/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messageId: message.id }),
  });
}

function clientWith(options: { approval?: string; emergency?: boolean; suppression?: string } = {}) {
  const currentMessage = { ...message, approval_status: options.approval || message.approval_status };
  const from = vi.fn((table: string) => {
    if (table === 'outreach_messages') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({ maybeSingle: vi.fn().mockResolvedValue({ data: currentMessage, error: null }) })),
        })),
      };
    }
    if (table === 'growth_profiles') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { sender_name: 'Operator', sender_email: message.sender_email, emergency_stop: options.emergency || false },
              error: null,
            }),
          })),
        })),
      };
    }
    if (table === 'prospects') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: { suppression_status: options.suppression || 'clear' }, error: null }),
          })),
        })),
        update: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) })),
      };
    }
    throw new Error(`Unexpected table ${table}`);
  });
  createSupabaseServerClient.mockResolvedValue({ from });
  return from;
}

describe('operator prospecting send route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyAdmin.mockResolvedValue({ user: { id: 'operator-1' } });
    getProspectingSenderProvider.mockReturnValue('fake');
  });

  it('rejects a message before explicit approval', async () => {
    clientWith({ approval: 'pending' });
    expect((await POST(request())).status).toBe(409);
    expect(sendApprovedProspectingMessage).not.toHaveBeenCalled();
  });

  it('honors the emergency stop and current suppression state', async () => {
    clientWith({ emergency: true });
    expect((await POST(request())).status).toBe(409);
    expect(sendApprovedProspectingMessage).not.toHaveBeenCalled();

    clientWith({ suppression: 'suppressed' });
    expect((await POST(request())).status).toBe(409);
    expect(sendApprovedProspectingMessage).not.toHaveBeenCalled();
  });

  it('passes the migration-managed operation and exact original key to delivery', async () => {
    clientWith();
    sendApprovedProspectingMessage.mockResolvedValue({
      ...message,
      approval_status: 'sent',
      provider_message_id: 'fake-original-outreach-key',
      sent_at: '2026-08-23T00:00:00.000Z',
    });

    const response = await POST(request());
    expect(response.status).toBe(201);
    expect(sendApprovedProspectingMessage).toHaveBeenCalledWith(expect.objectContaining({
      id: message.id,
      idempotencyKey: 'original-outreach-key',
      operationId: 'operation-1',
    }));
  });

  it('fails closed after durably recording a disabled provider attempt', async () => {
    clientWith();
    getProspectingSenderProvider.mockReturnValue('disabled');
    sendApprovedProspectingMessage.mockResolvedValue(null);

    const response = await POST(request());
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: 'No approved prospecting sender is configured (provider: disabled).',
    });
    expect(sendApprovedProspectingMessage).toHaveBeenCalledWith(expect.objectContaining({
      idempotencyKey: 'original-outreach-key',
      operationId: 'operation-1',
    }));
  });
});
