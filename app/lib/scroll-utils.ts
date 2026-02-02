/**
 * Scroll Utilities with Reduced Motion Support
 *
 * These utilities respect the user's prefers-reduced-motion setting.
 * When reduced motion is preferred, scrolling happens instantly instead of smoothly.
 */

/**
 * Check if the user prefers reduced motion
 * Returns true if the user has set their system to reduce motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get the appropriate scroll behavior based on user preferences
 * Returns 'auto' (instant) if reduced motion is preferred, 'smooth' otherwise
 */
export function getScrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? 'auto' : 'smooth';
}

/**
 * Scroll an element into view, respecting reduced motion preferences
 *
 * @param element - The element to scroll into view
 * @param options - Optional ScrollIntoViewOptions (behavior will be overridden based on preferences)
 */
export function scrollIntoViewWithMotionPreference(
  element: Element | null | undefined,
  options: Omit<ScrollIntoViewOptions, 'behavior'> & { block?: ScrollLogicalPosition; inline?: ScrollLogicalPosition } = {}
): void {
  if (!element) return;

  element.scrollIntoView({
    behavior: getScrollBehavior(),
    ...options,
  });
}

/**
 * Scroll to a specific element by ID, respecting reduced motion preferences
 *
 * @param id - The ID of the element to scroll to
 * @param options - Optional scroll options (block, inline positioning)
 */
export function scrollToId(
  id: string,
  options: { block?: ScrollLogicalPosition; inline?: ScrollLogicalPosition } = { block: 'start' }
): void {
  const element = document.getElementById(id);
  scrollIntoViewWithMotionPreference(element, options);
}

/**
 * Scroll to a ref element, respecting reduced motion preferences
 * Useful for React refs
 *
 * @param ref - React ref to the element
 * @param options - Optional scroll options
 */
export function scrollToRef(
  ref: React.RefObject<Element | null>,
  options: { block?: ScrollLogicalPosition; inline?: ScrollLogicalPosition } = { block: 'start' }
): void {
  scrollIntoViewWithMotionPreference(ref.current, options);
}
