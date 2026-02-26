'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Reads ?heroPreview=true from the URL and adds .hero-preview-mode
 * to <body>. This class (defined in globals.css) hides nav/footer
 * inside device preview iframes.
 *
 * Also intercepts navigation within the iframe and forwards the
 * destination URL to the parent window via postMessage — this powers
 * the "clickable devices" easter egg on the homepage hero.
 */
export default function HeroPreviewDetector() {
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('heroPreview') === 'true';

  useEffect(() => {
    if (isPreview) {
      document.body.classList.add('hero-preview-mode');
    }
    return () => {
      document.body.classList.remove('hero-preview-mode');
    };
  }, [isPreview]);

  // Intercept chatbot/wizard button clicks and forward to parent window.
  // These widgets use onClick state changes (not navigation), so the
  // Navigation API and <a> click handler below won't catch them.
  useEffect(() => {
    if (!isPreview || window === window.parent) return;

    const BUTTON_ACTIONS: Record<string, string> = {
      'Open AI chat assistant': 'open-chatbot',
      'Help me choose the right plan': 'open-wizard',
    };

    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button, [role="button"]');
      if (!button) return;

      const label = button.getAttribute('aria-label');
      if (!label) return;

      const action = BUTTON_ACTIONS[label];
      if (!action) return;

      // Kill the click before React's onClick fires (prevents modal
      // from opening inside the tiny iframe)
      e.stopImmediatePropagation();
      e.preventDefault();
      window.parent.postMessage(
        { type: 'hero-device-action', action },
        window.location.origin,
      );
    };

    // Capture phase so we fire before React's synthetic event system
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [isPreview]);

  // Intercept navigation and forward to parent window
  useEffect(() => {
    if (!isPreview || window === window.parent) return;

    function forwardToParent(url: string) {
      try {
        const parsed = new URL(url, window.location.origin);
        // Only forward same-origin, real URLs (skip hashes, javascript:, etc.)
        if (parsed.origin !== window.location.origin) return;
        if (parsed.pathname === window.location.pathname && parsed.hash) return;
      } catch {
        return;
      }
      window.parent.postMessage({ type: 'hero-device-navigate', url }, window.location.origin);
    }

    // Modern: Navigation API (Chrome/Edge 102+) catches ALL navigation types
    const nav = (window as unknown as { navigation?: { addEventListener: (type: string, handler: (e: NavigateEvent) => void) => void; removeEventListener: (type: string, handler: (e: NavigateEvent) => void) => void } }).navigation;

    if (nav) {
      const handler = (e: NavigateEvent) => {
        if (!e.canIntercept || !e.destination?.url) return;
        const dest = e.destination.url;
        // Skip same-page hash navigations
        try {
          const parsed = new URL(dest);
          if (parsed.origin !== window.location.origin) return;
          if (parsed.pathname === window.location.pathname && parsed.hash && !parsed.search) return;
        } catch { return; }
        e.intercept({ handler: () => Promise.resolve() });
        forwardToParent(dest);
      };
      nav.addEventListener('navigate', handler);
      return () => nav.removeEventListener('navigate', handler);
    }

    // Fallback: capture-phase click listener for <a> tags (Firefox/Safari)
    const handler = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest?.('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
      e.preventDefault();
      e.stopPropagation();
      // Resolve relative URLs against current origin
      const resolved = new URL(href, window.location.origin).href;
      forwardToParent(resolved);
    };

    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [isPreview]);

  return null;
}

// Type for the Navigation API NavigateEvent (not yet in all TS libs)
interface NavigateEvent {
  canIntercept: boolean;
  destination: { url: string };
  intercept: (options: { handler: () => Promise<void> }) => void;
}
