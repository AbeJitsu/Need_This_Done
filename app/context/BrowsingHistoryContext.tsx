'use client';

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';

// ============================================================================
// BROWSING HISTORY CONTEXT
// ============================================================================
// What: Manages recently viewed products for each user session
// Why: Customers benefit from quick access to products they've looked at
// How: Stores up to 10 recent products with timestamps in localStorage (or memory for SSR)

export interface ViewedProduct {
  product_id: string;
  title?: string;
  image?: string;
  variant_id?: string;
  viewed_at: string;
}

interface BrowsingHistoryContextType {
  viewedProducts: ViewedProduct[];
  addViewedProduct: (product: ViewedProduct) => void;
  removeViewedProduct: (productId: string) => void;
  clearHistory: () => void;
  isLoading: boolean;
}

const BrowsingHistoryContext = createContext<BrowsingHistoryContextType | null>(null);

const STORAGE_KEY = 'browsing_history';
const MAX_ITEMS = 10;

export function BrowsingHistoryProvider({ children }: { children: React.ReactNode }) {
  const [viewedProducts, setViewedProducts] = useState<ViewedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // ========================================================================
  // Load history from localStorage on mount
  // ========================================================================
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setViewedProducts(Array.isArray(parsed) ? parsed : []);
      }
    } catch (err) {
      console.error('Failed to load browsing history:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ========================================================================
  // Persist history to localStorage when it changes
  // ========================================================================
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(viewedProducts));
    } catch (err) {
      console.error('Failed to save browsing history:', err);
    }
  }, [viewedProducts, isMounted]);

  // ========================================================================
  // Add a product to recently viewed
  // Moves to front if already exists, removes old entries if exceeds limit
  // ========================================================================
  const addViewedProduct = useCallback((product: ViewedProduct) => {
    setViewedProducts((prev) => {
      // Skip if this product is already the most recent entry
      if (prev[0]?.product_id === product.product_id) return prev;

      // Remove if already exists elsewhere in the list
      const filtered = prev.filter((p) => p.product_id !== product.product_id);

      // Add to front with current timestamp
      const updated = [
        {
          ...product,
          viewed_at: new Date().toISOString(),
        },
        ...filtered,
      ];

      // Keep only the most recent items
      return updated.slice(0, MAX_ITEMS);
    });
  }, []);

  // ========================================================================
  // Remove specific product from history
  // ========================================================================
  const removeViewedProduct = useCallback((productId: string) => {
    setViewedProducts((prev) => prev.filter((p) => p.product_id !== productId));
  }, []);

  // ========================================================================
  // Clear all history
  // ========================================================================
  const clearHistory = useCallback(() => {
    setViewedProducts([]);
  }, []);

  return (
    <BrowsingHistoryContext.Provider
      value={{
        viewedProducts,
        addViewedProduct,
        removeViewedProduct,
        clearHistory,
        isLoading,
      }}
    >
      {children}
    </BrowsingHistoryContext.Provider>
  );
}

export function useBrowsingHistory() {
  const context = useContext(BrowsingHistoryContext);
  if (!context) {
    throw new Error('useBrowsingHistory must be used within BrowsingHistoryProvider');
  }
  return context;
}
