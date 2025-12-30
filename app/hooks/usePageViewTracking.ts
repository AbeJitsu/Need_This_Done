import { useEffect, useRef } from 'react';

// ============================================================================
// Page View Tracking Hook
// ============================================================================
// What: Tracks page views by sending a POST request when a page loads
// Why: Provides analytics for Puck CMS pages to understand visitor behavior
// How: Uses useEffect to fire once on mount, with session ID for unique visitors
//
// Usage:
//   import { usePageViewTracking } from '@/hooks/usePageViewTracking';
//
//   export default function MyPage() {
//     usePageViewTracking('my-page-slug');
//     return <div>...</div>;
//   }

// Generate or retrieve a session ID for anonymous tracking
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem('ntd_session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('ntd_session_id', sessionId);
  }
  return sessionId;
}

interface PageViewOptions {
  // Skip tracking in development mode
  skipInDev?: boolean;
  // Optional page ID (if known)
  pageId?: string;
}

/**
 * Tracks a page view for analytics.
 *
 * @param pageSlug - The slug of the page being viewed (e.g., 'home', 'about')
 * @param options - Optional configuration
 *
 * @example
 * // Basic usage
 * usePageViewTracking('home');
 *
 * @example
 * // With options
 * usePageViewTracking('pricing', { skipInDev: true });
 */
export function usePageViewTracking(
  pageSlug: string,
  options: PageViewOptions = {}
): void {
  const { skipInDev = false, pageId } = options;
  const hasTracked = useRef(false);

  useEffect(() => {
    // Only track once per page load
    if (hasTracked.current) return;

    // Skip in development if requested
    if (skipInDev && process.env.NODE_ENV === 'development') {
      return;
    }

    // Skip if no slug provided
    if (!pageSlug) return;

    // Track the page view
    const trackView = async () => {
      try {
        const sessionId = getSessionId();
        const referrer = document.referrer || undefined;

        await fetch('/api/page-views', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page_slug: pageSlug,
            page_id: pageId,
            session_id: sessionId,
            referrer,
          }),
        });

        hasTracked.current = true;
      } catch (error) {
        // Silently fail - analytics shouldn't break the page
        console.debug('Failed to track page view:', error);
      }
    };

    trackView();
  }, [pageSlug, pageId, skipInDev]);
}

export default usePageViewTracking;
