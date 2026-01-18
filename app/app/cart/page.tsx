'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Button from '@/components/Button';
import Card from '@/components/Card';
import PageHeader from '@/components/PageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  formInputColors,
  alertColors,
  headingColors,
  dividerColors,
  titleColors,
  leftBorderColors,
  dangerColors,
  lightBgColors,
  accentColors,
  cardBgColors,
  focusRingClasses,
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

// ============================================================================
// Empty Cart State Component - Editorial, warm invitation design
// ============================================================================
function EmptyCartState() {
  return (
    <section className="min-h-[70vh] flex items-center py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 w-full">
        <div className="relative overflow-hidden py-12 md:py-16">
          {/* Gradient orbs - purple/violet for pricing/cart theme (matching site pattern) */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-purple-100 to-purple-100 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-blue-100 to-blue-100 blur-2xl" />
          <div className="absolute top-20 left-1/4 w-32 h-32 rounded-full bg-emerald-100 blur-xl" />

          {/* Content with z-10 to stay above gradients */}
          <div className="relative z-10">
            {/* Asymmetric two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">

              {/* Left column - Decorative illustration (5 cols) */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end order-2 lg:order-1">
                <div
                  className="relative animate-fade-in-up"
                  style={{ animationDelay: '200ms', animationFillMode: 'both' }}
                >
                  {/* Decorative abstract shape - represents an empty space waiting to be filled */}
                  <div className="relative w-64 h-64 md:w-80 md:h-80">
                    {/* Outer ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-purple-300/60 animate-spin-slow" />

                    {/* Inner gradient circle */}
                    <div className="absolute inset-8 rounded-full bg-gradient-to-br from-purple-50 via-white to-blue-50 shadow-xl shadow-purple-200/30" />

                    {/* Center icon - sparkle/star representing potential */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        {/* Pulsing background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-400 rounded-2xl blur-xl opacity-20 animate-pulse" />

                        {/* Sparkle SVG */}
                        <svg
                          className="w-16 h-16 md:w-20 md:h-20 text-purple-500"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2L13.09 8.26L19 6L14.74 10.91L21 12L14.74 13.09L19 18L13.09 15.74L12 22L10.91 15.74L5 18L9.26 13.09L3 12L9.26 10.91L5 6L10.91 8.26L12 2Z" />
                        </svg>
                      </div>
                    </div>

                    {/* Floating accent dots */}
                    <div
                      className="absolute top-4 right-8 w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 animate-float"
                      style={{ animationDelay: '0s' }}
                    />
                    <div
                      className="absolute bottom-12 left-4 w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-blue-400 animate-float"
                      style={{ animationDelay: '0.5s' }}
                    />
                    <div
                      className="absolute top-1/2 -right-4 w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-purple-400 animate-float"
                      style={{ animationDelay: '1s' }}
                    />
                  </div>
                </div>
              </div>

              {/* Right column - Content (7 cols) */}
              <div className="lg:col-span-7 order-1 lg:order-2 text-center lg:text-left">
                {/* Eyebrow label */}
                <div
                  className="animate-fade-in-up"
                  style={{ animationDelay: '0ms', animationFillMode: 'both' }}
                >
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-medium tracking-wide mb-6">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Your Cart
                  </span>
                </div>

                {/* Main headline - editorial serif style */}
                <h1
                  className="animate-fade-in-up"
                  style={{ animationDelay: '100ms', animationFillMode: 'both' }}
                >
                  <span className="block text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-2">
                    A fresh start
                  </span>
                  <span className="block text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight leading-[1.1]">
                    awaits.
                  </span>
                </h1>

                {/* Supporting copy */}
                <p
                  className="mt-6 text-lg md:text-xl text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed animate-fade-in-up"
                  style={{ animationDelay: '200ms', animationFillMode: 'both' }}
                >
                  Your cart is ready for something great. Explore our consultations to get expert guidance tailored to your needs.
                </p>

                {/* CTA buttons */}
                <div
                  className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up"
                  style={{ animationDelay: '300ms', animationFillMode: 'both' }}
                >
                  <Button variant="purple" href="/pricing" size="lg">
                    Explore Consultations
                  </Button>
                  <Button variant="gray" href="/contact" size="lg">
                    Get in Touch
                  </Button>
                </div>

                {/* Trust indicators */}
                <div
                  className="mt-10 flex items-center gap-6 justify-center lg:justify-start text-sm text-gray-500 animate-fade-in-up"
                  style={{ animationDelay: '400ms', animationFillMode: 'both' }}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>No commitment required</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Expert guidance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
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
      setLocalError(err instanceof Error ? err.message : 'Oops! We couldn\'t update that. Please try again.');
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
      setLocalError(err instanceof Error ? err.message : 'We couldn\'t remove that item. Please try again or reach out if this keeps happening.');
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
  // Empty cart state - Editorial, warm invitation design
  // ========================================================================
  if (!cartId || !cart || cart.items.length === 0) {
    return <EmptyCartState />;
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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8">
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
                <div key={item.id} className={`${dividerColors.border} border rounded-lg p-4 sm:p-6 md:p-8 border-l-4 ${leftBorderColors[color]} ${cardBgColors.elevated}`}>
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
                      className={`text-gray-500 ${dangerColors.hover} transition text-xl leading-none rounded ${focusRingClasses.gold}`}
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
                        className={`px-4 py-2 rounded-lg border-2 ${accentColors.gray.border} ${accentColors.gray.bg} ${cardBgColors.interactive} ${headingColors.secondary} font-medium transition disabled:opacity-50 ${focusRingClasses.blue}`}
                      >
                        −
                      </button>
                      <span className={`w-10 text-center font-semibold text-lg ${headingColors.primary}`}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id || '', item.quantity + 1)}
                        disabled={isUpdating === item.id}
                        className={`px-4 py-2 rounded-lg border-2 ${accentColors.gray.border} ${accentColors.gray.bg} ${cardBgColors.interactive} ${headingColors.secondary} font-medium transition disabled:opacity-50 ${focusRingClasses.blue}`}
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
              <Link href="/pricing" className={`${titleColors.blue} hover:underline rounded ${focusRingClasses.blue}`}>
                &larr; Browse More Consultations
              </Link>
            </div>
          </div>

          {/* Right column - Order summary + Info */}
          <div className="lg:col-span-2 space-y-6 lg:self-start lg:sticky lg:top-20">
            {/* Order Summary - Inner rectangle */}
            <div className={`${dividerColors.border} border rounded-lg p-4 sm:p-6 md:p-8 ${cardBgColors.elevated}`}>
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
                variant="gold"
                href="/checkout"
                className="w-full mb-3"
              >
                Checkout
              </Button>

              <Button
                variant="gray"
                href="/pricing"
                className="w-full"
              >
                Browse More
              </Button>
            </div>

            {/* What happens next - Inner rectangle */}
            <div className={`${dividerColors.border} border rounded-lg p-4 sm:p-6 ${lightBgColors.blue}`}>
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
        title="Remove Consultation"
        message="Are you sure you want to remove this consultation from your cart?"
        confirmLabel="Yes, Remove It"
        cancelLabel="Keep It"
        variant="warning"
      />
    </div>
  );
}
