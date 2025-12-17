'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  formInputColors,
  formValidationColors,
  alertColors,
  headingColors,
  dividerColors,
  titleColors,
  leftBorderColors,
  dangerColors,
  lightBgColors,
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
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);

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
  // Handle remove item - Show confirmation dialog
  // ========================================================================
  const handleRemoveItem = (lineItemId: string) => {
    setItemToRemove(lineItemId);
    setShowRemoveDialog(true);
  };

  // ========================================================================
  // Confirm remove item - Actually remove after user confirms
  // ========================================================================
  const confirmRemoveItem = async () => {
    if (!itemToRemove) return;

    try {
      setIsUpdating(itemToRemove);
      setLocalError('');
      setShowRemoveDialog(false);
      await removeItem(itemToRemove);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to remove item');
    } finally {
      setIsUpdating(null);
      setItemToRemove(null);
    }
  };

  // ========================================================================
  // Cancel remove item
  // ========================================================================
  const cancelRemoveItem = () => {
    setShowRemoveDialog(false);
    setItemToRemove(null);
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
          <p className={`text-sm ${alertColors.error.text}`}>{localError || cartError}</p>
        </div>
      )}

      {/* Unified container with three inner rectangles */}
      <Card hoverEffect="none">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-8">
          {/* Left column - Cart items */}
          <div className="lg:col-span-3 space-y-6">
            {cart.items.map((item) => {
              // Get consultation details
              const title = item.title || item.variant?.title || 'Consultation';
              const unitPrice = item.unit_price || 0;
              const lineTotal = unitPrice * item.quantity;
              const color = getConsultationColor(unitPrice);
              const duration = getDurationLabel(title);

              return (
                <div key={item.id} className={`${dividerColors.border} border rounded-lg p-8 border-l-4 ${leftBorderColors[color]} dark:bg-gray-700/50`}>
                  <div className="flex justify-between items-start mb-6">
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
                      <p className={`text-xs mt-3 ${formInputColors.helper}`}>
                        You&apos;ll pick your preferred time at checkout
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
                        className="px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium transition disabled:opacity-50"
                      >
                        −
                      </button>
                      <span className={`w-10 text-center font-semibold text-lg ${headingColors.primary}`}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id || '', item.quantity + 1)}
                        disabled={isUpdating === item.id}
                        className="px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium transition disabled:opacity-50"
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
              );
            })}

            {/* Continue shopping link */}
            <div className="pt-2">
              <Link href="/shop" className={`${titleColors.blue} hover:underline`}>
                &larr; Continue Shopping
              </Link>
            </div>
          </div>

          {/* Right column - Order summary + Info */}
          <div className="lg:col-span-2 space-y-6 lg:self-start lg:sticky lg:top-20">
            {/* Order Summary - Inner rectangle */}
            <div className={`${dividerColors.border} border rounded-lg p-8 dark:bg-gray-800`}>
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
                Checkout
              </Button>

              <Button
                variant="gray"
                href="/shop"
                className="w-full"
              >
                Shop
              </Button>
            </div>

            {/* What happens next - Inner rectangle */}
            <div className={`${dividerColors.border} border rounded-lg p-6 ${lightBgColors.blue}`}>
              <p className={`text-sm ${formInputColors.helper}`}>
                <strong>What happens next?</strong> At checkout, you&apos;ll select your preferred appointment time. We&apos;ll confirm within 24 hours and send you calendar details.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Remove item confirmation dialog */}
      <ConfirmDialog
        isOpen={showRemoveDialog}
        onConfirm={confirmRemoveItem}
        onCancel={cancelRemoveItem}
        title="Remove Item"
        message="Remove this item from your cart?"
        confirmLabel="Remove"
        cancelLabel="Keep It"
        variant="warning"
      />
    </div>
  );
}
