'use client';

import { useCallback, useEffect, useRef } from 'react';

// ============================================================================
// useProductTracking Hook
// ============================================================================
// What: Tracks product interactions for the recommendations engine
// Why: Enables personalized recommendations and analytics
// How: Sends interaction events to /api/recommendations on view, cart add, etc.

type InteractionType = 'view' | 'cart_add' | 'purchase' | 'wishlist';

interface TrackingOptions {
  variantId?: string;
  sourcePage?: string;
  referrerProductId?: string;
}

// Get or create a session ID for anonymous tracking
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem('product_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    sessionStorage.setItem('product_session_id', sessionId);
  }
  return sessionId;
}

export function useProductTracking(productId: string, options: TrackingOptions = {}) {
  const hasTrackedView = useRef(false);
  const { variantId, sourcePage, referrerProductId } = options;

  // Track a product interaction
  const trackInteraction = useCallback(async (
    type: InteractionType,
    overrideOptions?: TrackingOptions
  ) => {
    try {
      await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          interaction_type: type,
          session_id: getSessionId(),
          variant_id: overrideOptions?.variantId || variantId,
          source_page: overrideOptions?.sourcePage || sourcePage,
          referrer_product_id: overrideOptions?.referrerProductId || referrerProductId,
        }),
      });
    } catch (error) {
      // Silently fail - tracking shouldn't break the UI
      console.debug('Product tracking failed:', error);
    }
  }, [productId, variantId, sourcePage, referrerProductId]);

  // Auto-track view on mount (once per session per product)
  useEffect(() => {
    if (hasTrackedView.current) return;

    // Check if we've already tracked this product in this session
    const viewedKey = `viewed_${productId}`;
    if (sessionStorage.getItem(viewedKey)) return;

    // Track the view
    hasTrackedView.current = true;
    sessionStorage.setItem(viewedKey, 'true');
    trackInteraction('view');
  }, [productId, trackInteraction]);

  // Convenience methods
  const trackCartAdd = useCallback((opts?: TrackingOptions) => {
    trackInteraction('cart_add', opts);
  }, [trackInteraction]);

  const trackPurchase = useCallback((opts?: TrackingOptions) => {
    trackInteraction('purchase', opts);
  }, [trackInteraction]);

  const trackWishlist = useCallback((opts?: TrackingOptions) => {
    trackInteraction('wishlist', opts);
  }, [trackInteraction]);

  return {
    trackInteraction,
    trackCartAdd,
    trackPurchase,
    trackWishlist,
  };
}

export default useProductTracking;
