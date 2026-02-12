import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateTimeSlotsForDate,
  getAvailableDays,
} from '@/lib/consultation-slots';

// ============================================================================
// generateTimeSlotsForDate
// ============================================================================

describe('generateTimeSlotsForDate', () => {
  // Use a fixed "now" so tests don't depend on real time
  // Set to Feb 10 2026 at 7:00 AM (before business hours)
  const FIXED_NOW = new Date(2026, 1, 10, 7, 0, 0, 0);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // A future weekday to generate slots for
  const futureDay = new Date(2026, 1, 11, 0, 0, 0, 0); // Feb 11, Wed

  it('generates 30-minute interval slots from 9 AM to 5 PM', () => {
    const slots = generateTimeSlotsForDate(futureDay, 15);

    // 15-min call: can start 9:00–4:30 (inclusive) = 16 slots
    expect(slots.length).toBe(16);
    expect(slots[0].label).toBe('9:00 AM');
    expect(slots[slots.length - 1].label).toBe('4:30 PM');
  });

  it('restricts slots so consultation ends before 5 PM', () => {
    // 45-min call: latest start is 4:00 PM (ends 4:45)
    const slots = generateTimeSlotsForDate(futureDay, 45);
    const lastSlot = slots[slots.length - 1];

    expect(lastSlot.label).toBe('4:00 PM');
  });

  it('handles 30-min duration (latest start 4:30 PM)', () => {
    const slots = generateTimeSlotsForDate(futureDay, 30);
    const lastSlot = slots[slots.length - 1];

    expect(lastSlot.label).toBe('4:30 PM');
  });

  it('handles 60-min duration (latest start 4:00 PM)', () => {
    const slots = generateTimeSlotsForDate(futureDay, 60);
    const lastSlot = slots[slots.length - 1];

    expect(lastSlot.label).toBe('4:00 PM');
  });

  it('filters out past slots when date is today', () => {
    // "Now" is 7:00 AM on Feb 10, set to 10:15 AM
    vi.setSystemTime(new Date(2026, 1, 10, 10, 15, 0, 0));

    const today = new Date(2026, 1, 10, 0, 0, 0, 0);
    const slots = generateTimeSlotsForDate(today, 15);

    // First available should be 10:30 AM (10:00 already passed at 10:15)
    expect(slots[0].label).toBe('10:30 AM');
  });

  it('returns empty array when all slots have passed today', () => {
    // Set time to 6 PM — all business hours passed
    vi.setSystemTime(new Date(2026, 1, 10, 18, 0, 0, 0));

    const today = new Date(2026, 1, 10, 0, 0, 0, 0);
    const slots = generateTimeSlotsForDate(today, 15);

    expect(slots).toHaveLength(0);
  });

  it('formats AM/PM labels correctly', () => {
    const slots = generateTimeSlotsForDate(futureDay, 15);

    // Check specific formats
    const labels = slots.map((s) => s.label);
    expect(labels).toContain('9:00 AM');
    expect(labels).toContain('11:30 AM');
    expect(labels).toContain('12:00 PM');
    expect(labels).toContain('12:30 PM');
    expect(labels).toContain('1:00 PM');
    expect(labels).toContain('2:30 PM');
  });

  it('sets correct Date objects on each slot', () => {
    const slots = generateTimeSlotsForDate(futureDay, 15);

    const nineAM = slots[0];
    expect(nineAM.date.getHours()).toBe(9);
    expect(nineAM.date.getMinutes()).toBe(0);
    expect(nineAM.date.getDate()).toBe(11); // Feb 11

    const nineThirty = slots[1];
    expect(nineThirty.date.getHours()).toBe(9);
    expect(nineThirty.date.getMinutes()).toBe(30);
  });
});

// ============================================================================
// getAvailableDays
// ============================================================================

describe('getAvailableDays', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns only weekdays', () => {
    // Monday Feb 9, 2026
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 1, 9, 8, 0, 0, 0));

    const days = getAvailableDays();
    for (const day of days) {
      const dow = day.getDay();
      expect(dow).not.toBe(0); // not Sunday
      expect(dow).not.toBe(6); // not Saturday
    }
  });

  it('skips weekends', () => {
    // Friday Feb 13, 2026 — next weekday is Monday Feb 16
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 1, 13, 8, 0, 0, 0));

    const days = getAvailableDays();
    const dayNumbers = days.map((d) => d.getDate());

    // Should include Friday 13 and Monday 16 (skipping Sat 14, Sun 15)
    expect(dayNumbers).toContain(13);
    expect(dayNumbers).not.toContain(14); // Saturday
    expect(dayNumbers).not.toContain(15); // Sunday
    expect(dayNumbers).toContain(16);
  });

  it('returns at most 3 days', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 1, 9, 8, 0, 0, 0)); // Monday

    const days = getAvailableDays();
    expect(days.length).toBeLessThanOrEqual(3);
  });

  it('includes today if it is a weekday', () => {
    // Wednesday Feb 11
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 1, 11, 8, 0, 0, 0));

    const days = getAvailableDays();
    expect(days[0].getDate()).toBe(11);
  });
});
