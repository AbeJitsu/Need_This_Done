'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSession } from '@/lib/auth';

// ============================================================================
// Wishlist Context - Manage saved products
// ============================================================================
// What: Shared state for wishlist items across pages
// Why: Users need to see and manage saved products
// How: Tracks wishlist items, persists to database if authenticated

interface WishlistItem {
  product_id: string;
  title: string;
  price: number;
  thumbnail?: string;
  added_at: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  addToWishlist: (productId: string, title: string, price: number, thumbnail?: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearError: () => void;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ========================================================================
  // Load wishlist on mount and after auth changes
  // ========================================================================
  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const session = await getSession();

      if (session?.access_token) {
        // ======================================================================
        // Authenticated User: Migrate anonymous wishlist to server
        // ======================================================================
        // When user logs in, check if they have items in localStorage
        // (saved while browsing anonymously). If so, migrate them to the server
        // before loading the authenticated wishlist.

        const localStorageWishlist = localStorage.getItem('wishlist');
        const anonymousItems = localStorageWishlist ? JSON.parse(localStorageWishlist) : [];

        // Fetch authenticated wishlist
        const response = await fetch('/api/wishlist', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load wishlist');
        }

        const data = await response.json();
        const authenticatedItems = data.items || [];

        // ======================================================================
        // Merge anonymous items into authenticated wishlist
        // ======================================================================
        // Add any anonymous items that aren't already in the authenticated wishlist
        const mergedItems = [...authenticatedItems];
        for (const item of anonymousItems) {
          if (!mergedItems.some(existing => existing.product_id === item.product_id)) {
            try {
              // Add to server
              const addResponse = await fetch('/api/wishlist', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify(item),
              });

              if (addResponse.ok) {
                mergedItems.push(item);
              }
            } catch (err) {
              console.warn(`Failed to migrate wishlist item ${item.product_id}:`, err);
              // Continue migrating other items even if one fails
            }
          }
        }

        setItems(mergedItems);

        // Clear localStorage since we've migrated everything
        localStorage.removeItem('wishlist');
      } else {
        // ======================================================================
        // Anonymous User: Use localStorage
        // ======================================================================
        const saved = localStorage.getItem('wishlist');
        setItems(saved ? JSON.parse(saved) : []);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToWishlist = useCallback(async (
    productId: string,
    title: string,
    price: number,
    thumbnail?: string
  ) => {
    try {
      setError(null);

      const session = await getSession();
      const newItem: WishlistItem = {
        product_id: productId,
        title,
        price,
        thumbnail,
        added_at: new Date().toISOString(),
      };

      if (session?.access_token) {
        // Save to database
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(newItem),
        });

        if (!response.ok) {
          throw new Error('Failed to save to wishlist');
        }
      }

      // Update local state
      setItems(prev => {
        if (prev.some(item => item.product_id === productId)) {
          return prev;
        }
        return [...prev, newItem];
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add to wishlist';
      setError(message);
      throw err;
    }
  }, []);

  const removeFromWishlist = useCallback(async (productId: string) => {
    try {
      setError(null);

      const session = await getSession();

      if (session?.access_token) {
        // Remove from database
        const response = await fetch(`/api/wishlist/${productId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to remove from wishlist');
        }
      }

      // Update local state
      setItems(prev => prev.filter(item => item.product_id !== productId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove from wishlist';
      setError(message);
      throw err;
    }
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return items.some(item => item.product_id === productId);
  }, [items]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: WishlistContextType = {
    items,
    isLoading,
    error,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearError,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
