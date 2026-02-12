// ============================================================================
// Consultation Time Slot Utilities
// ============================================================================
// Pure functions for generating available consultation time slots.
// Used by ConsultationCalendar component and tested independently.

export interface TimeSlot {
  date: Date;
  label: string; // e.g., "9:00 AM"
}

// Business hours in EST (9 AM – 5 PM), 30-minute intervals.
const BUSINESS_START_HOUR = 9;
const BUSINESS_END_HOUR = 17; // 5 PM
const SLOT_INTERVAL_MINUTES = 30;

/**
 * Generate available time slots for a given date.
 * Filters by consultation duration (slot must end before 5 PM)
 * and excludes past slots if the date is today.
 */
export function generateTimeSlotsForDate(date: Date, durationMinutes: number): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const now = new Date();

  // Latest start time: consultation must end by 5 PM
  const latestStartMinutes = BUSINESS_END_HOUR * 60 - durationMinutes;

  for (
    let minutes = BUSINESS_START_HOUR * 60;
    minutes <= latestStartMinutes;
    minutes += SLOT_INTERVAL_MINUTES
  ) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    // Build a Date for this slot
    const slotDate = new Date(date);
    slotDate.setHours(hour, minute, 0, 0);

    // If slot is today and already passed, skip
    if (slotDate <= now) continue;

    // Format label like "9:00 AM" or "2:30 PM"
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const displayMinute = minute.toString().padStart(2, '0');
    const label = `${displayHour}:${displayMinute} ${period}`;

    slots.push({ date: slotDate, label });
  }

  return slots;
}

/**
 * Get available weekdays within the next ~48 hours (up to 3 days).
 * Skips weekends.
 */
export function getAvailableDays(): Date[] {
  const days: Date[] = [];
  const now = new Date();

  // Check next 7 calendar days to find up to 3 weekdays within 48-72 hours
  for (let i = 0; i < 7 && days.length < 3; i++) {
    const day = new Date(now);
    day.setDate(now.getDate() + i);
    day.setHours(0, 0, 0, 0);

    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (day.getDay() === 0 || day.getDay() === 6) continue;

    // Only include days within ~48 hours (72h buffer for timezone edge cases)
    const hoursAway = (day.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursAway > 72) break;

    days.push(day);
  }

  return days;
}
