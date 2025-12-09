'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';

// ============================================================================
// Shopping Cart Page - /cart
// ============================================================================
// What: Displays items in cart with quantity management
// Why: Lets customer review before checkout
// How: Uses CartContext to manage items, fetches fresh cart data on mount

export default function CartPage() {
  const { cart, cartId, itemCount, updateItem, removeItem, isLoading: _isLoading, error: cartError } = useCart();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [localError, setLocalError] = useState('');

  // Refresh cart on mount if we have a cart ID
  useEffect(() => {
    // Cart should already be loaded in context
    // This page just displays it
  }, []);

  // ========================================================================
  // Handle quantity change
  // ========================================================================
  const handleUpdateQuantity = async (lineItemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await handleRemoveItem(lineItemId);
      return;
    }

    try {
      setIsUpdating(lineItemId);
      setLocalError('');
      await updateItem(lineItemId, newQuantity);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to update item');
    } finally {
      setIsUpdating(null);
    }
  };

  // ========================================================================
  // Handle remove item
  // ========================================================================
  const handleRemoveItem = async (lineItemId: string) => {
    if (!confirm('Remove this item from your cart?')) return;

    try {
      setIsUpdating(lineItemId);
      setLocalError('');
      await removeItem(lineItemId);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to remove item');
    } finally {
      setIsUpdating(null);
    }
  };

  // Empty cart state
  if (!cartId || !cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <PageHeader
          title="Your Cart"
          description="Your shopping cart is empty"
        />

        <Card hoverEffect="none">
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Looks like you haven't added anything yet.
            </p>
            <Button variant="purple" href="/shop">
              Continue Shopping
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Calculate totals
  const subtotal = cart.subtotal || 0;
  const tax = cart.tax_total || 0;
  const total = cart.total || subtotal + tax;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      <PageHeader
        title="Your Cart"
        description={`${itemCount} item${itemCount !== 1 ? 's' : ''} in your cart`}
      />

      {/* Error messages */}
      {(localError || cartError) && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-900 dark:text-red-200">{localError || cartError}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <Card key={item.id} hoverEffect="lift">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {/* Item title would come from product data */}
                        Product #{item.variant_id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Variant: {item.variant_id}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id || '')}
                      disabled={isUpdating === item.id}
                      className="text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition"
                    >
                      ×
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUpdateQuantity(item.id || '', item.quantity - 1)}
                        disabled={isUpdating === item.id}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-900 dark:text-gray-100">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id || '', item.quantity + 1)}
                        disabled={isUpdating === item.id}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {/* Price calculation would come from product data */}
                      Calculating...
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Continue shopping link */}
          <div className="mt-6">
            <Link href="/shop" className="text-blue-600 dark:text-blue-400 hover:underline">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order summary */}
        <div>
          <Card hoverColor="purple" hoverEffect="lift">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-gray-100 font-semibold">
                    ${(subtotal / 100).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <span className="text-gray-900 dark:text-gray-100 font-semibold">
                    ${(tax / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Total</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ${(total / 100).toFixed(2)}
                </span>
              </div>

              <Button
                variant="purple"
                href="/checkout"
                className="w-full mb-3"
              >
                Proceed to Checkout
              </Button>

              <Button
                variant="gray"
                href="/shop"
                className="w-full"
              >
                Continue Shopping
              </Button>
            </div>
          </Card>

          {/* Info box */}
          <Card hoverColor="blue" hoverEffect="glow" className="mt-4">
            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Prices shown are in USD. Your final cost may vary based on your location and any applicable taxes.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
