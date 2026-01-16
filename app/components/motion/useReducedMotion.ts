'use client';

import { useEffect, useState } from 'react';

// ============================================================================
// useReducedMotion Hook
// ============================================================================
// Detects if user prefers reduced motion (accessibility setting).
// When enabled, animations should be toned down or disabled.
//
// Usage:
//   const prefersReducedMotion = useReducedMotion();
//   if (prefersReducedMotion) {
//     // Use fade-only animation or skip animation
//   }

export function useReducedMotion(): boolean {
  // Default to false during SSR, will update on client
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if matchMedia is available (client-side only)
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes (user might toggle the setting)
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}
