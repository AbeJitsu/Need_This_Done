// ============================================================================
// Format Utilities - Centralized formatting functions
// ============================================================================
// What: Common formatting helpers for prices, dates, etc.
// Why: DRY - same formatPrice was duplicated in 4+ files
// How: Import and use anywhere formatting is needed

/**
 * Format a price in cents to a USD string
 *
 * @param cents - Price in cents (e.g., 1999 = $19.99)
 * @param options.showCents - Show decimal cents (default: true)
 * @returns Formatted price string (e.g., "$19.99" or "$20")
 *
 * @example
 * formatPrice(1999)              // "$19.99"
 * formatPrice(2000, { showCents: false }) // "$20"
 */
export function formatPrice(
  cents: number,
  options?: { showCents?: boolean }
): string {
  const showCents = options?.showCents ?? true;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(cents / 100);
}

/**
 * Format a price in cents without showing decimal cents
 * Convenience wrapper for formatPrice with showCents: false
 *
 * @param cents - Price in cents
 * @returns Formatted price string without cents (e.g., "$20")
 */
export function formatPriceWhole(cents: number): string {
  return formatPrice(cents, { showCents: false });
}
