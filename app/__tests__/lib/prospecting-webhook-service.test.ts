import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getSupabaseAdmin } = vi.hoisted(() => ({ getSupabaseAdmin: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('@/lib/supabase', () => ({ getSupabaseAdmin }));

import { recordProspectingWebhookEvent } from '@/lib/prospecting-webhook-service';

describe('prospecting webhook persistence service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('correlates a bounce and records durable suppression without raw payload', async () => {
    const eventInsert = vi.fn();
    const suppressionUpsert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn((table: string) => {
      if (table === 'sender_events') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) })),
          })),
          insert: eventInsert.mockReturnValue({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: { id: 'event-row-1', message_id: null }, error: null }),
            })),
          }),
          update: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) })),
        };
      }
      if (table === 'outreach_messages') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  id: 'message-1', prospect_id: 'prospect-1', approved_by: 'operator-1',
                  provider_message_id: 'resend-prospecting-1', recipient_email: 'prospect@example.test',
                },
                error: null,
              }),
            })),
          })),
          update: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) })),
        };
      }
      if (table === 'prospects') {
        return { update: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) })) };
      }
      if (table === 'suppression_records') return { upsert: suppressionUpsert };
      throw new Error(`Unexpected table ${table}`);
    });
    getSupabaseAdmin.mockReturnValue({ from });

    await expect(recordProspectingWebhookEvent({
      providerEventId: 'provider-event-1',
      eventType: 'bounced',
      providerMessageId: 'resend-prospecting-1',
      address: 'Prospect@Example.Test',
      payloadSha256: 'c'.repeat(64),
      occurredAt: '2026-08-23T00:00:00.000Z',
    })).resolves.toMatchObject({ correlated: true, duplicate: false });

    expect(eventInsert).toHaveBeenCalledWith(expect.objectContaining({
      provider_event_id: 'provider-event-1',
      payload: { payload_sha256: 'c'.repeat(64) },
    }));
    expect(JSON.stringify(eventInsert.mock.calls[0]?.[0])).not.toContain('raw');
    expect(suppressionUpsert).toHaveBeenCalledWith({
      normalized_address: 'prospect@example.test',
      reason: 'bounce',
      source_message_id: 'message-1',
      created_by: 'operator-1',
    }, { onConflict: 'normalized_address', ignoreDuplicates: true });
  });
});
