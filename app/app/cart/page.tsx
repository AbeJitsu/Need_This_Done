'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import {
  formInputColors,
  formValidationColors,
  alertColors,
  headingColors,
  dividerColors,
  cardBorderColors,
  titleColors,
  leftBorderColors,
  dangerColors,
  type AccentColor,
} from '@/lib/colors';

// ============================================================================
// Shopping Cart Page - /cart
// ============================================================================
// What: Displays items in cart with quantity management
// Why: Lets customer review before checkout
// How: Uses CartContext to manage items, displays friendly consultation details

// ============================================================================
// Helper: Determine consultation color by price tier
// ============================================================================
// 15-min ($20) → green, 30-min ($35) → blue, 55-min ($50) → purple
function getConsultationColor(unitPrice: number): AccentColor {
  // Prices in cents: 2000 = $20, 3500 = $35, 5000 = $50
  if (unitPrice <= 2500) return 'green';
  if (unitPrice <= 4000) return 'blue';
  return 'purple';
}

// ============================================================================
// Helper: Get friendly duration label from title
// ============================================================================
function getDurationLabel(title: string): string {
  // Extract duration from title like "15-Minute Quick Consultation"
  const match = title.match(/(\d+)-?(?:minute|min)/i);
  if (match) {
    const minutes = parseInt(match[1], 10);
    return `${minutes} minutes`;
  }
  return 'Consultation';
}

export default function CartPage() {
  const { cart, cartId, itemCount, updateItem, removeItem, error: cartError } = useCart();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [localError, setLocalError] = useState('');

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

  // ========================================================================
  // Empty cart state - Friendly and helpful
  // ========================================================================
  if (!cartId || !cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <PageHeader
          title="Your Cart is Empty"
          description="Nothing here yet—but that's easy to fix!"
        />

        <Card hoverEffect="none">
          <div className="p-8 text-center">
            <p className={`${formInputColors.helper} mb-2`}>
              Looking for expert guidance?
            </p>
            <p className={`${formInputColors.helper} mb-6`}>
              Our consultations are a great way to get personalized help before committing to a project.
            </p>
            <Button variant="blue" href="/shop">
              Browse Consultations
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
        title="Almost there!"
        description={`You've got ${itemCount} ${itemCount === 1 ? 'consultation' : 'consultations'} ready to book.`}
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
            {cart.items.map((item) => {
              // Get consultation details
              const title = item.title || item.variant?.title || 'Consultation';
              const unitPrice = item.unit_price || 0;
              const lineTotal = unitPrice * item.quantity;
              const color = getConsultationColor(unitPrice);
              const duration = getDurationLabel(title);

              return (
                <Card key={item.id} hoverEffect="lift" className={`border-l-4 ${leftBorderColors[color]}`}>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-grow">
                        {/* Consultation title */}
                        <h3 className={`text-lg font-semibold ${headingColors.primary}`}>
                          {title}
                        </h3>
                        {/* Duration badge */}
                        <p className={`text-sm mt-1 ${titleColors[color]}`}>
                          {duration}
                        </p>
                        {/* Reassuring note */}
                        <p className={`text-xs mt-2 ${formInputColors.helper}`}>
                          We&apos;ll reach out within 24 hours to schedule
                        </p>
                      </div>
                      {/* Remove button */}
                      <button
                        onClick={() => handleRemoveItem(item.id || '')}
                        disabled={isUpdating === item.id}
                        className={`text-gray-500 ${dangerColors.hover} transition text-xl leading-none`}
                        aria-label="Remove item"
                      >
                        &times;
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleUpdateQuantity(item.id || '', item.quantity - 1)}
                          disabled={isUpdating === item.id}
                          className={`px-3 py-1 border rounded ${cardBorderColors.light} hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50`}
                        >
                          −
                        </button>
                        <span className={`w-8 text-center font-semibold ${headingColors.primary}`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id || '', item.quantity + 1)}
                          disabled={isUpdating === item.id}
                          className={`px-3 py-1 border rounded ${cardBorderColors.light} hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50`}
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <p className={`text-lg font-semibold ${headingColors.primary}`}>
                        ${(lineTotal / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Continue shopping link */}
          <div className="mt-6">
            <Link href="/shop" className={`${titleColors.blue} hover:underline`}>
              &larr; Continue Shopping
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

                {tax > 0 && (
                  <div className="flex justify-between">
                    <span className={formInputColors.helper}>Tax</span>
                    <span className={`font-semibold ${headingColors.primary}`}>
                      ${(tax / 100).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between mb-6">
                <span className={`text-lg font-bold ${headingColors.primary}`}>Total</span>
                <span className={`text-2xl font-bold ${headingColors.primary}`}>
                  ${(total / 100).toFixed(2)}
                </span>
              </div>

              <Button
                variant="orange"
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

          {/* Reassurance box */}
          <Card hoverColor="blue" hoverEffect="glow" className="mt-4">
            <div className="p-6">
              <p className={`text-sm ${formInputColors.helper}`}>
                <strong>What happens next?</strong> After checkout, we&apos;ll send you an email to confirm your consultation and find a time that works for you.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
