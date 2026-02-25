'use client';

import { useEffect, useState } from 'react';

const DESKTOP_QUERY = '(min-width: 1280px)';

/**
 * Returns true when the viewport is xl (1280px+).
 * Returns false during SSR and on smaller viewports — used to
 * conditionally render heavy elements like device preview iframes
 * so they never mount on mobile.
 */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY);
    setIsDesktop(mql.matches);

    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return isDesktop;
}
