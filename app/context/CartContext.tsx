'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { Cart as MedusaCart } from '@/lib/medusa-client';

// ============================================================================
// Cart Context
// ============================================================================
// What: Manages shopping cart state across the app
// Why: Multiple pages need to access/update cart (product pages, cart page, checkout)
// How: Stores cart ID in localStorage, fetches cart data from Medusa API
//
// OPTIMISTIC UPDATES:
// Cart operations update the UI immediately, then sync with server in background.
// If the server request fails, we rollback to the previous state.
// This makes the cart feel instant even with network latency.

// Product info for optimistic add (so we can show title/price before server responds)
interface OptimisticProductInfo {
  title?: string;
  unit_price?: number;
  thumbnail?: string;
}

interface CartContextType {
  cart: MedusaCart | null;
  cartId: string | null;
  isLoading: boolean;
  isSyncing: boolean;  // True when background sync is in progress
  isCartReady: boolean; // True when cart is synced and safe for checkout
  error: string | null;
  itemCount: number;

  // Actions
  createCart: () => Promise<string>;
  getCart: (cartId: string) => Promise<void>;
  addItem: (variantId: string, quantity: number, productInfo?: OptimisticProductInfo) => Promise<void>;
  updateItem: (lineItemId: string, quantity: number) => Promise<void>;
  removeItem: (lineItemId: string) => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ============================================================================
// Cart Provider Component
// ============================================================================

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<MedusaCart | null>(null);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track pending operations for rollback
  const pendingOpsRef = useRef(0);

  // ========================================================================
  // Initialize cart from localStorage on mount and validate it exists
  // ========================================================================
  useEffect(() => {
    const initializeCart = async () => {
      try {
        const savedCartId = localStorage.getItem('medusa_cart_id');
        if (savedCartId) {
          // Validate that the saved cart actually exists on the server
          try {
            const response = await fetch(`/api/cart?id=${savedCartId}`);
            if (response.ok) {
              // Cart exists, use it
              const data = await response.json();
              setCart(data.cart);
              setCartId(savedCartId);
            } else {
              // Cart doesn't exist (maybe server restarted), clear and create new one
              localStorage.removeItem('medusa_cart_id');
              setCartId(null);
            }
          } catch (err) {
            console.warn('Could not validate saved cart, will create new one on first action:', err);
            localStorage.removeItem('medusa_cart_id');
            setCartId(null);
          }
        }
      } catch (err) {
        console.error('Failed to initialize cart:', err);
      }
    };

    initializeCart();
  }, []);

  // ========================================================================
  // Create new cart
  // ========================================================================
  const createCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to create cart');
      }

      const data = await response.json();
      const newCartId = data.cart.id;

      setCart(data.cart);
      setCartId(newCartId);
      localStorage.setItem('medusa_cart_id', newCartId);

      return newCartId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create cart';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ========================================================================
  // Fetch cart by ID
  // ========================================================================
  const getCart = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/cart?id=${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const data = await response.json();
      setCart(data.cart);
      setCartId(id);
      localStorage.setItem('medusa_cart_id', id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch cart';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ========================================================================
  // Add item to cart (OPTIMISTIC)
  // ========================================================================
  // Updates UI immediately, syncs with server in background
  const addItem = useCallback(
    async (variantId: string, quantity: number, productInfo?: OptimisticProductInfo) => {
      setError(null);

      // Save current state for potential rollback
      const previousCart = cart;

      try {
        let currentCartId = cartId;

        // Create cart if it doesn't exist (this part must be synchronous)
        if (!currentCartId) {
          currentCartId = await createCart();
        }

        // Generate temporary ID for optimistic item
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // OPTIMISTIC UPDATE: Add item to cart immediately
        setCart((prev) => {
          if (!prev) return prev;

          // Check if item with same variant already exists
          const existingItemIndex = prev.items.findIndex((item) => item.variant_id === variantId);

          if (existingItemIndex >= 0) {
            // Update existing item quantity
            const updatedItems = [...prev.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + quantity,
            };
            return {
              ...prev,
              items: updatedItems,
              // Estimate new totals
              subtotal: prev.subtotal + (productInfo?.unit_price || 0) * quantity,
              total: prev.total + (productInfo?.unit_price || 0) * quantity,
            };
          }

          // Add new item
          const newItem = {
            id: tempId,
            variant_id: variantId,
            quantity,
            title: productInfo?.title || 'Adding...',
            unit_price: productInfo?.unit_price || 0,
            thumbnail: productInfo?.thumbnail,
          };

          return {
            ...prev,
            items: [...prev.items, newItem],
            subtotal: prev.subtotal + (productInfo?.unit_price || 0) * quantity,
            total: prev.total + (productInfo?.unit_price || 0) * quantity,
          };
        });

        // BACKGROUND SYNC: Send request to server
        pendingOpsRef.current++;
        setIsSyncing(true);

        const response = await fetch(`/api/cart/${currentCartId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variant_id: variantId, quantity }),
        });

        if (!response.ok) {
          throw new Error('Failed to add item to cart');
        }

        // Replace optimistic cart with server response
        const data = await response.json();
        setCart(data.cart);
      } catch (err) {
        // ROLLBACK: Restore previous cart state
        setCart(previousCart);
        const message = err instanceof Error ? err.message : 'Failed to add item';
        setError(message);
        throw err;
      } finally {
        pendingOpsRef.current--;
        if (pendingOpsRef.current === 0) {
          setIsSyncing(false);
        }
      }
    },
    [cartId, cart, createCart]
  );

  // ========================================================================
  // Update item quantity (OPTIMISTIC)
  // ========================================================================
  const updateItem = useCallback(
    async (lineItemId: string, quantity: number) => {
      if (!cartId) throw new Error('No cart');
      setError(null);

      // Save current state for rollback
      const previousCart = cart;

      try {
        // OPTIMISTIC UPDATE: Update quantity immediately
        setCart((prev) => {
          if (!prev) return prev;

          const updatedItems = prev.items.map((item) => {
            if (item.id === lineItemId) {
              return { ...item, quantity };
            }
            return item;
          });

          // Recalculate totals
          const item = prev.items.find((i) => i.id === lineItemId);
          const priceDiff = item ? (item.unit_price || 0) * (quantity - item.quantity) : 0;

          return {
            ...prev,
            items: updatedItems,
            subtotal: prev.subtotal + priceDiff,
            total: prev.total + priceDiff,
          };
        });

        // BACKGROUND SYNC
        pendingOpsRef.current++;
        setIsSyncing(true);

        const response = await fetch(`/api/cart/${cartId}/items`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ line_item_id: lineItemId, quantity }),
        });

        if (!response.ok) {
          throw new Error('Failed to update item');
        }

        const data = await response.json();
        setCart(data.cart);
      } catch (err) {
        // ROLLBACK
        setCart(previousCart);
        const message = err instanceof Error ? err.message : 'Failed to update item';
        setError(message);
        throw err;
      } finally {
        pendingOpsRef.current--;
        if (pendingOpsRef.current === 0) {
          setIsSyncing(false);
        }
      }
    },
    [cartId, cart]
  );

  // ========================================================================
  // Remove item from cart (OPTIMISTIC)
  // ========================================================================
  const removeItem = useCallback(
    async (lineItemId: string) => {
      if (!cartId) throw new Error('No cart');
      setError(null);

      // Save current state for rollback
      const previousCart = cart;

      try {
        // OPTIMISTIC UPDATE: Remove item immediately
        setCart((prev) => {
          if (!prev) return prev;

          const itemToRemove = prev.items.find((item) => item.id === lineItemId);
          const priceReduction = itemToRemove
            ? (itemToRemove.unit_price || 0) * itemToRemove.quantity
            : 0;

          return {
            ...prev,
            items: prev.items.filter((item) => item.id !== lineItemId),
            subtotal: prev.subtotal - priceReduction,
            total: prev.total - priceReduction,
          };
        });

        // BACKGROUND SYNC
        pendingOpsRef.current++;
        setIsSyncing(true);

        const response = await fetch(`/api/cart/${cartId}/items?line_item_id=${lineItemId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to remove item');
        }

        const data = await response.json();
        setCart(data.cart);
      } catch (err) {
        // ROLLBACK
        setCart(previousCart);
        const message = err instanceof Error ? err.message : 'Failed to remove item';
        setError(message);
        throw err;
      } finally {
        pendingOpsRef.current--;
        if (pendingOpsRef.current === 0) {
          setIsSyncing(false);
        }
      }
    },
    [cartId, cart]
  );

  // ========================================================================
  // Clear cart (local only)
  // ========================================================================
  const clearCart = useCallback(() => {
    setCart(null);
    setCartId(null);
    localStorage.removeItem('medusa_cart_id');
  }, []);

  // ========================================================================
  // Compute item count
  // ========================================================================
  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  // ========================================================================
  // Check if cart is ready for checkout
  // ========================================================================
  // Cart is ready when:
  // 1. Not currently syncing with server
  // 2. No items have temporary IDs (all items confirmed by server)
  // 3. Cart exists and has items
  const hasTemporaryItems = cart?.items?.some((item) => item.id?.startsWith('temp_')) ?? false;
  const isCartReady = !isSyncing && !hasTemporaryItems && !!cart && itemCount > 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartId,
        isLoading,
        isSyncing,
        isCartReady,
        error,
        itemCount,
        createCart,
        getCart,
        addItem,
        updateItem,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ============================================================================
// useCart Hook
// ============================================================================
// Use this in any component that needs to access/manage the cart

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
