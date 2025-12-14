'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import {
  formInputColors,
  formValidationColors,
  titleColors,
  dangerColors,
  alertColors,
  headingColors,
  dividerColors,
  cardBorderColors,
} from '@/lib/colors';

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
            <p className={`${formInputColors.helper} mb-6`}>
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
        <div className={`mb-6 p-4 ${alertColors.error.bg} ${alertColors.error.border} rounded-lg`}>
          <p className={`text-sm ${formValidationColors.error}`}>{localError || cartError}</p>
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
                      <h3 className={`text-lg font-semibold ${headingColors.primary}`}>
                        {/* Item title would come from product data */}
                        Product #{item.variant_id.slice(0, 8)}
                      </h3>
                      <p className={`text-sm ${formInputColors.helper} mt-1`}>
                        Variant: {item.variant_id}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id || '')}
                      disabled={isUpdating === item.id}
                      className={`text-gray-500 ${dangerColors.hover} transition`}
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
                        className={`px-2 py-1 border rounded ${cardBorderColors.light} hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50`}
                      >
                        −
                      </button>
                      <span className={`w-8 text-center font-semibold ${headingColors.primary}`}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id || '', item.quantity + 1)}
                        disabled={isUpdating === item.id}
                        className={`px-2 py-1 border rounded ${cardBorderColors.light} hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50`}
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <p className={`text-lg font-semibold ${headingColors.primary}`}>
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
            <Link href="/shop" className={`${titleColors.blue} hover:underline`}>
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order summary */}
        <div>
          <Card hoverColor="purple" hoverEffect="lift">
            <div className="p-6">
              <h2 className={`text-xl font-bold ${headingColors.primary} mb-6`}>
                Order Summary
              </h2>

              <div className={`space-y-4 mb-6 pb-6 border-b ${dividerColors.border}`}>
                <div className="flex justify-between">
                  <span className={formInputColors.helper}>Subtotal</span>
                  <span className={`font-semibold ${headingColors.primary}`}>
                    ${(subtotal / 100).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className={formInputColors.helper}>Tax</span>
                  <span className={`font-semibold ${headingColors.primary}`}>
                    ${(tax / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className={`text-lg font-bold ${headingColors.primary}`}>Total</span>
                <span className={`text-2xl font-bold ${headingColors.primary}`}>
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
              <p className={`text-sm ${formInputColors.helper}`}>
                Prices shown are in USD. Your final cost may vary based on your location and any applicable taxes.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
