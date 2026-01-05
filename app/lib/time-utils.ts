/**
 * Converts 24-hour format hour to 12-hour format
 * @param hour - Hour in 24-hour format (0-23)
 * @returns Hour in 12-hour format (1-12)
 * 
 * Examples:
 * - 0 → 12 (midnight)
 * - 12 → 12 (noon)
 * - 13 → 1 (1 PM)
 * - 23 → 11 (11 PM)
 */
export function convertTo12HourFormat(hour: number): number {
  if (hour === 0) {
    return 12;
  }
  
  if (hour > 12) {
    return hour - 12;
  }
  
  return hour;
}