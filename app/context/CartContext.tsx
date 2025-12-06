'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Cart as MedusaCart } from '@/lib/medusa-client';

// ============================================================================
// Cart Context
// ============================================================================
// What: Manages shopping cart state across the app
// Why: Multiple pages need to access/update cart (product pages, cart page, checkout)
// How: Stores cart ID in localStorage, fetches cart data from Medusa API

interface CartContextType {
  cart: MedusaCart | null;
  cartId: string | null;
  isLoading: boolean;
  error: string | null;
  itemCount: number;

  // Actions
  createCart: () => Promise<string>;
  getCart: (cartId: string) => Promise<void>;
  addItem: (variantId: string, quantity: number) => Promise<void>;
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
  const [error, setError] = useState<string | null>(null);

  // ========================================================================
  // Initialize cart from localStorage on mount
  // ========================================================================
  useEffect(() => {
    try {
      const savedCartId = localStorage.getItem('medusa_cart_id');
      if (savedCartId) {
        setCartId(savedCartId);
      }
    } catch (err) {
      console.error('Failed to load cart from localStorage:', err);
    }
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
  // Add item to cart
  // ========================================================================
  const addItem = useCallback(
    async (variantId: string, quantity: number) => {
      setError(null);

      try {
        let currentCartId = cartId;

        // Create cart if it doesn't exist
        if (!currentCartId) {
          currentCartId = await createCart();
        }

        const response = await fetch(`/api/cart/${currentCartId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variant_id: variantId, quantity }),
        });

        if (!response.ok) {
          throw new Error('Failed to add item to cart');
        }

        const data = await response.json();
        setCart(data.cart);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add item';
        setError(message);
        throw err;
      }
    },
    [cartId, createCart]
  );

  // ========================================================================
  // Update item quantity
  // ========================================================================
  const updateItem = useCallback(
    async (lineItemId: string, quantity: number) => {
      if (!cartId) throw new Error('No cart');
      setError(null);

      try {
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
        const message = err instanceof Error ? err.message : 'Failed to update item';
        setError(message);
        throw err;
      }
    },
    [cartId]
  );

  // ========================================================================
  // Remove item from cart
  // ========================================================================
  const removeItem = useCallback(
    async (lineItemId: string) => {
      if (!cartId) throw new Error('No cart');
      setError(null);

      try {
        const response = await fetch(`/api/cart/${cartId}/items?line_item_id=${lineItemId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to remove item');
        }

        const data = await response.json();
        setCart(data.cart);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to remove item';
        setError(message);
        throw err;
      }
    },
    [cartId]
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

  return (
    <CartContext.Provider
      value={{
        cart,
        cartId,
        isLoading,
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
