'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Button from '@/components/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  formInputColors,
  alertColors,
  headingColors,
  leftBorderColors,
  accentColors,
  focusRingClasses,
  type AccentColor,
} from '@/lib/colors';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion';

// ============================================================================
// Shopping Cart Page - /cart
// ============================================================================
// What: Displays items in cart with quantity management
// Why: Lets customer review before checkout
// How: Uses CartContext to manage Medusa cart items with product metadata

// ============================================================================
// Empty Cart State Component - Editorial, warm invitation design
// ============================================================================
function EmptyCartState() {
  return (
    <section className="min-h-[70vh] flex items-center py-8 md:py-12">
      <div className="relative overflow-hidden md:max-w-6xl md:mx-auto md:rounded-2xl py-12 md:py-16 w-full">
          {/* Gradient orbs - purple/violet for pricing/cart theme (matching site pattern) */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-purple-100 to-purple-100 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-blue-100 to-blue-100 blur-2xl" />
          <div className="absolute top-20 left-1/4 w-32 h-32 rounded-full bg-green-100 blur-xl" />

          {/* Content with z-10 to stay above gradients */}
          <div className="relative z-10 px-4 sm:px-6 md:px-8">
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
                      className="absolute top-4 right-8 w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-green-400 animate-float"
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
    </section>
  );
}

// ============================================================================
// Helper: Determine color by product type or price
// ============================================================================
// Packages → green, Addons → purple, Services → blue, Subscriptions → purple
function getItemColor(item: {
  unit_price?: number;
  product?: { metadata?: Record<string, unknown> };
}): AccentColor {
  const productType = item.product?.metadata?.type as string | undefined;
  if (productType === 'package') return 'green';
  if (productType === 'addon') return 'purple';
  if (productType === 'service') return 'blue';
  if (productType === 'subscription') return 'purple'; // Use purple for subscriptions

  // Fallback for shop products: color by price tier
  const unitPrice = item.unit_price || 0;
  if (unitPrice <= 2500) return 'green';
  if (unitPrice <= 4000) return 'blue';
  return 'purple';
}

// ============================================================================
// Helper: Get display label for product type
// ============================================================================
function getItemTypeLabel(item: {
  product?: { metadata?: Record<string, unknown> };
}): string {
  const productType = item.product?.metadata?.type as string | undefined;
  if (productType === 'package') return 'Website Package';
  if (productType === 'addon') return 'Add-on Service';
  if (productType === 'service') return 'Automation Service';
  if (productType === 'subscription') return 'Monthly Subscription';
  return 'Product';
}

export default function CartPage() {
  const {
    cart, itemCount, updateItem, removeItem, error: cartError,
  } = useCart();
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
  // Empty cart state
  // ========================================================================
  const hasItems = cart && cart.items && cart.items.length > 0;

  if (!hasItems) {
    return <EmptyCartState />;
  }

  // Calculate totals (all in cents from Medusa)
  const subtotal = cart?.subtotal || 0;
  const tax = cart?.tax_total || 0;
  const total = cart?.total || subtotal + tax;

  return (
    <div className="min-h-screen">
      {/* ================================================================
          Hero Header - Editorial Style
          ================================================================ */}
      <section className="pt-8 md:pt-12 pb-4">
        <div className="relative overflow-hidden py-12 md:py-16 md:max-w-6xl md:mx-auto md:rounded-3xl">
          {/* Dark gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950" />
          {/* Accent glows */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
          {/* Watermark */}
          <div className="absolute -bottom-8 -right-4 text-[10rem] font-black text-white/[0.03] leading-none select-none pointer-events-none">🛒</div>

          <div className="relative z-10 px-6 sm:px-8 md:px-12">
            <FadeIn direction="up" triggerOnScroll={false}>
              {/* Editorial header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-purple-400" />
                <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">Shopping Cart</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[0.95] mb-4">
                Almost there.
              </h1>
              <p className="text-xl text-slate-400 max-w-xl leading-relaxed">
                You&apos;ve got {itemCount} {itemCount === 1 ? 'item' : 'items'} ready to go.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ================================================================
          Main Content - Cart Items & Order Summary
          ================================================================ */}
      <section className="py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Error messages */}
          {(localError || cartError) && (
            <FadeIn direction="up">
              <div className={`mb-6 p-4 ${alertColors.error.bg} ${alertColors.error.border} rounded-xl`}>
                <p className={`text-sm ${alertColors.error.text}`}>{localError || cartError}</p>
              </div>
            </FadeIn>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">
            {/* Left column - Cart items */}
            <div className="lg:col-span-3">
              {/* Section header */}
              <FadeIn direction="up" delay={0.1}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-6 h-1 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500" />
                  <span className="text-sm font-semibold tracking-widest uppercase text-gray-500">Your Items</span>
                </div>
              </FadeIn>

              <StaggerContainer staggerDelay={0.08} className="space-y-4">
                {/* All cart items from Medusa (packages, addons, services, products) */}
                {cart?.items?.map((item) => {
                  const title = item.title || item.variant?.title || item.product?.title || 'Item';
                  const description = item.description || item.product?.description;
                  const unitPrice = item.unit_price || 0;
                  const lineTotal = unitPrice * item.quantity;
                  const color = getItemColor(item);
                  const typeLabel = getItemTypeLabel(item);
                  const features = item.product?.metadata?.features as string[] | undefined;
                  const isSubscription = item.product?.metadata?.type === 'subscription';

                  return (
                    <StaggerItem key={item.id}>
                      <div className={`bg-white rounded-2xl p-5 sm:p-6 shadow-lg shadow-slate-200/50 border-l-4 ${leftBorderColors[color]} transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5`}>
                        <div className="flex justify-between items-start mb-5">
                          <div className="flex-grow">
                            <h3 className={`text-lg font-bold ${headingColors.primary}`}>
                              {title}
                            </h3>
                            <p className={`text-sm mt-1 font-medium ${accentColors[color].titleText}`}>
                              {typeLabel}
                              {isSubscription && ' • Billed monthly'}
                            </p>
                            {description && (
                              <p className={`text-sm mt-2 ${formInputColors.helper}`}>
                                {description}
                              </p>
                            )}
                            {features && features.length > 0 && (
                              <ul className={`text-sm mt-3 space-y-1.5 ${formInputColors.helper}`}>
                                {features.slice(0, 3).map((f, i) => (
                                  <li key={i} className="flex items-center gap-2">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                      <span className="text-emerald-600 text-xs">✓</span>
                                    </span>
                                    {f}
                                  </li>
                                ))}
                                {features.length > 3 && (
                                  <li className="text-xs text-gray-400 pl-7">
                                    +{features.length - 3} more features
                                  </li>
                                )}
                              </ul>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id || '')}
                            disabled={isUpdating === item.id}
                            className={`text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all duration-200 text-xl leading-none ${focusRingClasses.gold} motion-safe:hover:scale-110 motion-safe:active:scale-95 motion-reduce:hover:scale-100 motion-reduce:active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed`}
                            aria-label={`Remove ${title} from cart`}
                            aria-busy={isUpdating === item.id}
                          >
                            &times;
                          </button>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                          {/* Quantity controls */}
                          <div className="flex items-center gap-2" role="group" aria-label="Quantity selector">
                            <button
                              onClick={() => handleUpdateQuantity(item.id || '', item.quantity - 1)}
                              disabled={isUpdating === item.id}
                              className={`w-10 h-10 rounded-xl border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 ${headingColors.secondary} font-bold transition disabled:opacity-50 ${focusRingClasses.blue} hover:scale-105 active:scale-95 motion-reduce:hover:scale-100 motion-reduce:active:scale-100 flex items-center justify-center`}
                              aria-label={`Decrease quantity for ${title}`}
                              aria-busy={isUpdating === item.id}
                            >
                              {isUpdating === item.id ? (
                                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                              ) : (
                                '−'
                              )}
                            </button>
                            <span
                              className={`w-12 text-center font-bold text-lg ${headingColors.primary}`}
                              aria-live="polite"
                              aria-atomic="true"
                            >
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id || '', item.quantity + 1)}
                              disabled={isUpdating === item.id}
                              className={`w-10 h-10 rounded-xl border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 ${headingColors.secondary} font-bold transition disabled:opacity-50 ${focusRingClasses.blue} hover:scale-105 active:scale-95 motion-reduce:hover:scale-100 motion-reduce:active:scale-100 flex items-center justify-center`}
                              aria-label={`Increase quantity for ${title}`}
                              aria-busy={isUpdating === item.id}
                            >
                              {isUpdating === item.id ? (
                                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                              ) : (
                                '+'
                              )}
                            </button>
                          </div>

                          {/* Price */}
                          <p className={`text-xl font-bold ${headingColors.primary}`}>
                            ${(lineTotal / 100).toFixed(2)}
                            {isSubscription && <span className="text-sm font-normal text-gray-500">/mo</span>}
                          </p>
                        </div>
                      </div>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>

              {/* Continue shopping link */}
              <FadeIn direction="up" delay={0.3}>
                <div className="pt-6">
                  <Link href="/pricing" className={`inline-flex items-center gap-2 ${accentColors.blue.titleText} font-medium hover:underline rounded ${focusRingClasses.blue} transition-colors`}>
                    <span>←</span>
                    <span>Browse More Consultations</span>
                  </Link>
                </div>
              </FadeIn>
            </div>

            {/* Right column - Order summary + Info (Dark Glass Treatment) */}
            <div className="lg:col-span-2 space-y-6 lg:self-start lg:sticky lg:top-20">
              <FadeIn direction="up" delay={0.2}>
                {/* Order Summary - Dark Glass Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8">
                  {/* Accent glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/15 rounded-full blur-2xl" />

                  <div className="relative z-10">
                    {/* Section header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-6 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-purple-400" />
                      <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">Order Summary</span>
                    </div>

                    <div className="space-y-4 mb-6 pb-6 border-b border-white/10">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Subtotal</span>
                        <span className="font-semibold text-white">
                          ${(subtotal / 100).toFixed(2)}
                        </span>
                      </div>

                      {tax > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Tax</span>
                          <span className="font-semibold text-white">
                            ${(tax / 100).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-baseline mb-8">
                      <span className="text-lg font-bold text-white">Total</span>
                      <span className="text-3xl font-black text-white">
                        ${(total / 100).toFixed(2)}
                      </span>
                    </div>

                    <Button
                      variant="green"
                      href="/checkout"
                      className="w-full mb-3 shadow-lg shadow-emerald-500/25"
                      size="lg"
                    >
                      Proceed to Checkout
                    </Button>

                    <Button
                      variant="gray"
                      href="/pricing"
                      className="w-full bg-white/10 hover:bg-white/15 border-white/10 text-white"
                      size="lg"
                    >
                      Browse More
                    </Button>
                  </div>
                </div>
              </FadeIn>

              <FadeIn direction="up" delay={0.3}>
                {/* What happens next - Dark Glass Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 sm:p-6">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-2xl" />

                  <div className="relative z-10">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <span className="text-blue-400 text-sm">💡</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white mb-1">What happens next?</p>
                        <p className="text-sm text-slate-400 leading-relaxed">
                          At checkout, you&apos;ll select your preferred appointment time. We&apos;ll confirm within 24 hours and send you calendar details.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

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
