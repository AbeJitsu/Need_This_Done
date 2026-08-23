import { createHash } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { getValidAccessToken } = vi.hoisted(() => ({
  getValidAccessToken: vi.fn().mockResolvedValue('server-only-access-token'),
}));

vi.mock('server-only', () => ({}));
vi.mock('@/lib/google-calendar', () => ({ getValidAccessToken }));

import { calendarAdapter, calendarEventId } from '@/lib/provider-adapters';

function referenceBase32Hex(value: string) {
  const alphabet = '0123456789abcdefghijklmnopqrstuv';
  const bytes = createHash('sha256').update(value).digest();
  let bits = 0;
  let accumulator = 0;
  let output = '';
  for (const byte of bytes) {
    accumulator = (accumulator << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      output += alphabet[(accumulator >>> bits) & 31];
    }
  }
  if (bits > 0) output += alphabet[(accumulator << (5 - bits)) & 31];
  return output;
}

describe('Google Calendar provider boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv('CALENDAR_PROVIDER', 'live');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'configured');
  });
  afterEach(() => vi.unstubAllGlobals());

  it('derives an ntd-prefixed lower-case base32hex SHA-256 event ID', () => {
    const key = '5ad08284-4231-46fc-9e7c-664cf40d68a2';
    expect(calendarEventId(key)).toBe(`ntd${referenceBase32Hex(key).slice(0, 32)}`);
    expect(calendarEventId(key)).toMatch(/^ntd[0-9a-v]{32}$/);
  });

  it('uses the same deterministic semantics in explicit offline fake mode', async () => {
    vi.stubEnv('CALENDAR_PROVIDER', 'fake');
    vi.stubEnv('OFFLINE_ASSEMBLY_PROOF', 'true');
    const providerFetch = vi.fn();
    vi.stubGlobal('fetch', providerFetch);
    const adapter = calendarAdapter().adapter!;
    await expect(adapter.execute('create', {
      idempotencyKey: 'fake-operation-key', calendarUserId: 'operator-1', calendarId: 'primary',
      startsAt: '2026-09-01T14:00:00.000Z', endsAt: '2026-09-01T14:30:00.000Z', summary: 'Fake consultation',
    })).resolves.toEqual({ externalEventId: calendarEventId('fake-operation-key') });
    expect(providerFetch).not.toHaveBeenCalled();
    expect(getValidAccessToken).not.toHaveBeenCalled();
  });

  it('creates with the derived event ID and never accepts a browser event ID', async () => {
    const providerFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ id: calendarEventId('operation-key-1') }),
    });
    vi.stubGlobal('fetch', providerFetch);
    const adapter = calendarAdapter().adapter!;
    const result = await adapter.execute('create', {
      idempotencyKey: 'operation-key-1', calendarUserId: 'operator-1', calendarId: 'primary',
      startsAt: '2026-09-01T14:00:00.000Z', endsAt: '2026-09-01T14:30:00.000Z', summary: 'Reviewed consultation',
    });
    expect(result.externalEventId).toBe(calendarEventId('operation-key-1'));
    expect(providerFetch.mock.calls[0]?.[0]).toContain(`/events/${calendarEventId('operation-key-1')}?sendUpdates=none`);
    expect(getValidAccessToken).toHaveBeenCalledWith('operator-1');
  });

  it('updates and cancels only the stored reference with attendee notifications', async () => {
    const providerFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ id: 'stored-event-1' }),
    });
    vi.stubGlobal('fetch', providerFetch);
    const adapter = calendarAdapter().adapter!;
    await adapter.execute('update', {
      idempotencyKey: 'update-key', calendarUserId: 'operator-1', calendarId: 'primary',
      externalEventId: 'stored-event-1', startsAt: '2026-09-02T14:00:00.000Z',
      endsAt: '2026-09-02T14:30:00.000Z', summary: 'Updated consultation',
    });
    await adapter.execute('cancel', {
      idempotencyKey: 'cancel-key', calendarUserId: 'operator-1', calendarId: 'primary',
      externalEventId: 'stored-event-1',
    });
    expect(providerFetch.mock.calls[0]?.[0]).toContain('/events/stored-event-1?sendUpdates=all');
    expect(providerFetch.mock.calls[1]?.[0]).toContain('/events/stored-event-1?sendUpdates=all');
    expect(providerFetch.mock.calls[1]?.[1]).toMatchObject({ method: 'PATCH' });
    expect(JSON.parse(String(providerFetch.mock.calls[1]?.[1]?.body))).toEqual({ status: 'cancelled' });
  });

  it('deletes without notifications only for explicit test or accidental cleanup', async () => {
    const providerFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', providerFetch);
    const adapter = calendarAdapter().adapter!;
    await expect(adapter.execute('delete', {
      idempotencyKey: 'delete-key', calendarUserId: 'operator-1', calendarId: 'primary', externalEventId: 'stored-event-1',
    })).rejects.toThrow('test_or_accidental');
    await adapter.execute('delete', {
      idempotencyKey: 'delete-key', calendarUserId: 'operator-1', calendarId: 'primary',
      externalEventId: 'stored-event-1', cleanupReason: 'test_or_accidental',
    });
    expect(providerFetch).toHaveBeenCalledWith(expect.stringContaining('/events/stored-event-1?sendUpdates=none'),
      expect.objectContaining({ method: 'DELETE' }));
  });
});
