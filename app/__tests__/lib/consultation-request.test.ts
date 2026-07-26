import { describe, expect, it } from 'vitest';
import { parseConsultationRequestDetails } from '@/lib/consultation-request';

describe('parseConsultationRequestDetails', () => {
  it('preserves a valid consultation type and preferred times as ISO strings', () => {
    expect(parseConsultationRequestDetails({
      consultationType: 'strategy',
      preferredTime: '2026-07-30T14:00:00.000Z',
      alternateTime: '2026-07-31T14:00:00.000Z',
    })).toEqual({
      consultationType: 'strategy',
      preferredConsultationAt: '2026-07-30T14:00:00.000Z',
      alternateConsultationAt: '2026-07-31T14:00:00.000Z',
    });
  });

  it('allows a standard project inquiry without consultation context', () => {
    expect(parseConsultationRequestDetails({
      consultationType: null,
      preferredTime: null,
      alternateTime: null,
    })).toEqual({
      consultationType: null,
      preferredConsultationAt: null,
      alternateConsultationAt: null,
    });
  });

  it.each([
    { consultationType: 'unknown', preferredTime: null, alternateTime: null },
    { consultationType: null, preferredTime: '2026-07-30T14:00:00.000Z', alternateTime: null },
    { consultationType: 'quick', preferredTime: null, alternateTime: '2026-07-31T14:00:00.000Z' },
    { consultationType: 'quick', preferredTime: 'not a date', alternateTime: null },
  ])('rejects invalid or incomplete consultation details', (input) => {
    expect(() => parseConsultationRequestDetails(input)).toThrow();
  });
});
