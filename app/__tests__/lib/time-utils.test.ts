import { describe, it, expect } from 'vitest';
import { convertTo12HourFormat } from '@/lib/time-utils';

describe('convertTo12HourFormat', () => {
  it('should convert midnight (00) to 12 AM', () => {
    expect(convertTo12HourFormat(0)).toBe(12);
  });

  it('should keep morning hours (1-11) as is', () => {
    expect(convertTo12HourFormat(1)).toBe(1);
    expect(convertTo12HourFormat(11)).toBe(11);
  });

  it('should convert noon (12) to 12 PM', () => {
    expect(convertTo12HourFormat(12)).toBe(12);
  });

  it('should convert afternoon/evening hours (13-23) correctly', () => {
    expect(convertTo12HourFormat(13)).toBe(1);
    expect(convertTo12HourFormat(23)).toBe(11);
  });

  it('should handle edge cases', () => {
    expect(convertTo12HourFormat(24)).toBe(12); // 24 should wrap to 12
  });
});