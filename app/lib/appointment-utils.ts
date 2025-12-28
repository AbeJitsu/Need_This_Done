// ============================================================================
// Appointment Utilities - Centralized appointment scheduling logic
// ============================================================================
// What: Time options, duration formatting, and scheduling helpers
// Why: DRY - eliminates duplicate time option arrays across components
// How: Import and use in AppointmentRequestForm and AppointmentStepForm

export interface TimeOption {
  value: string;
  label: string;
}

/**
 * Generate time options for appointment scheduling
 * @param startHour - Starting hour (24-hour format, e.g., 9 for 9 AM)
 * @param endHour - Ending hour (24-hour format, e.g., 17 for 5 PM)
 * @param intervalMinutes - Interval between options (default: 30)
 * @returns Array of time options with value (HH:MM) and label (12-hour format)
 */
export function generateTimeOptions(
  startHour: number = 9,
  endHour: number = 17,
  intervalMinutes: number = 30
): TimeOption[] {
  const options: TimeOption[] = [];

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      // Skip if we've passed the end hour
      if (hour === endHour - 1 && minute > 0) continue;

      const value = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayMinute = minute.toString().padStart(2, '0');
      const label = `${displayHour}:${displayMinute} ${period}`;

      options.push({ value, label });
    }
  }

  return options;
}

// ============================================================================
// Pre-generated time options for common use cases
// ============================================================================

/** Standard business hours: 9 AM - 5 PM, 30-minute intervals */
export const businessHoursTimeOptions = generateTimeOptions(9, 17, 30);

/** Extended hours: 8 AM - 6 PM, 30-minute intervals */
export const extendedHoursTimeOptions = generateTimeOptions(8, 18, 30);

/** Morning only: 8 AM - 12 PM, 30-minute intervals */
export const morningTimeOptions = generateTimeOptions(8, 12, 30);

/** Afternoon only: 12 PM - 5 PM, 30-minute intervals */
export const afternoonTimeOptions = generateTimeOptions(12, 17, 30);

// ============================================================================
// Duration helpers
// ============================================================================

export interface DurationOption {
  value: number;
  label: string;
}

/** Standard appointment duration options */
export const durationOptions: DurationOption[] = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

/**
 * Format duration in minutes to human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours} hr`;
  return `${hours} hr ${remainingMinutes} min`;
}
