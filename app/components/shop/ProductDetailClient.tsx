'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Check, ArrowLeft, Heart, ShoppingCart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useBrowsingHistory } from '@/context/BrowsingHistoryContext';
import { useCart } from '@/context/CartContext';
import Button from '@/components/Button';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion';
import { getCheckmarkColors } from '@/lib/colors';
import type { Product } from '@/lib/medusa-client';

// ============================================================================
// Product Theme System
// ============================================================================
// Maps product type + handle to a visual theme matching pricing page cards.
// Uses BJJ belt progression: emerald (starter) → blue (growth) → purple (pro).

type ProductTheme = 'emerald' | 'blue' | 'purple';

function getProductTheme(product: Product): ProductTheme {
  const metadata = product.metadata as Record<string, unknown> | undefined;
  const type = metadata?.type as string | undefined;
  const handle = product.handle || '';

  if (type === 'package') {
    if (handle.includes('launch') || handle.includes('starter')) return 'emerald';
    if (handle.includes('growth')) return 'blue';
    if (handle.includes('pro')) return 'purple';
  }
  if (type === 'addon') return 'emerald';
  if (type === 'service') return 'purple';
  if (type === 'subscription') return 'blue';
  return 'emerald';
}

// Theme config — mirrors pricing page card styles (UnifiedPricingPage.tsx:362-390)
const THEME_CONFIG: Record<ProductTheme, {
  bg: string;
  glow1: string;
  glow2: string;
  check: string;
  badge: string;
  shadow: string;
  ctaButtonShadow: string;
  checkmarkColor: 'green' | 'blue' | 'purple';
}> = {
  emerald: {
    bg: 'bg-gradient-to-br from-emerald-800 via-emerald-800 to-emerald-900',
    glow1: 'bg-emerald-400/15',
    glow2: 'bg-emerald-300/10',
    check: 'bg-emerald-500/20 text-emerald-400',
    badge: 'from-emerald-500 to-emerald-600',
    shadow: 'shadow-emerald-500/25',
    ctaButtonShadow: 'shadow-lg shadow-emerald-500/25',
    checkmarkColor: 'green',
  },
  blue: {
    bg: 'bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950',
    glow1: 'bg-blue-500/15',
    glow2: 'bg-blue-400/10',
    check: 'bg-blue-500/20 text-blue-400',
    badge: 'from-blue-500 to-blue-600',
    shadow: 'shadow-blue-500/25',
    ctaButtonShadow: 'shadow-lg shadow-blue-500/25',
    checkmarkColor: 'blue',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-800 via-purple-800 to-purple-900',
    glow1: 'bg-purple-400/15',
    glow2: 'bg-purple-300/10',
    check: 'bg-purple-500/20 text-purple-400',
    badge: 'from-purple-500 to-purple-600',
    shadow: 'shadow-purple-500/25',
    ctaButtonShadow: 'shadow-lg shadow-purple-500/25',
    checkmarkColor: 'purple',
  },
};

// "How It Works" copy adapts by product type
function getHowItWorksSteps(type: string | undefined) {
  switch (type) {
    case 'addon':
      return [
        { title: 'Add to cart', description: 'Pick the add-on that fits your needs and add it to your order.' },
        { title: 'We integrate it', description: 'Our team builds it into your site — no extra work on your end.' },
        { title: "You're live", description: 'Review the result and go live with your new feature.' },
      ];
    case 'service':
      return [
        { title: 'Add to cart', description: 'Choose the automation service you need and place your order.' },
        { title: 'We set it up', description: 'We configure and test everything to work with your systems.' },
        { title: 'Automation running', description: 'Your workflow is live — saving you time from day one.' },
      ];
    case 'subscription':
      return [
        { title: 'Subscribe', description: 'Start your subscription — no long-term commitment required.' },
        { title: 'We configure it', description: 'We set up and train the AI agent for your specific needs.' },
        { title: 'Always-on AI', description: 'Your AI agent works around the clock, getting smarter over time.' },
      ];
    default:
      return [
        { title: 'Add to cart', description: 'Pick the package that fits and we\'ll get started right away.' },
        { title: 'We build it', description: 'We design and develop your site while you focus on your business.' },
        { title: 'Review & launch', description: 'Approve the finished product, pay the remainder, and go live.' },
      ];
  }
}

// Step circle colors — always emerald → blue → purple (BJJ belt progression)
const STEP_COLORS = [
  { bg: 'bg-emerald-500', ring: 'ring-emerald-200' },
  { bg: 'bg-blue-500', ring: 'ring-blue-200' },
  { bg: 'bg-purple-500', ring: 'ring-purple-200' },
];

// ============================================================================
// Product Detail Client Component
// ============================================================================
// Redesigned as a 4-section sales page:
//   1. Dark Hero (title, price, deposit, image)
//   2. What's Included (feature checklist)
//   3. How It Works (3-step process)
//   4. CTA (add to cart, book a call, wishlist)

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addViewedProduct } = useBrowsingHistory();
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    product?.variants?.[0]?.id || null
  );
  const [isManagingWishlist, setIsManagingWishlist] = useState(false);
  const [showCartSuccess, setShowCartSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const inWishlist = isInWishlist(product.id);

  // ========================================================================
  // Computed values from product + metadata
  // ========================================================================
  const metadata = product.metadata as Record<string, unknown> | undefined;
  const productType = metadata?.type as string | undefined;
  const features = Array.isArray(metadata?.features) ? metadata.features as string[] : [];
  const depositPercent = typeof metadata?.deposit_percent === 'number' ? metadata.deposit_percent : 50;
  const isPopular = metadata?.popular === true || metadata?.popular === 'true';
  const billingPeriod = metadata?.billing_period as string | null;
  const isSubscription = productType === 'subscription' || billingPeriod === 'monthly';

  const variant0 = product.variants?.[0];
  const price = variant0?.calculated_price?.calculated_amount
    ?? variant0?.prices?.find((p: any) => p.currency_code === 'usd')?.amount
    ?? variant0?.prices?.[0]?.amount
    ?? 0;
  const image = product.images?.[0]?.url;
  const variants = product.variants || [];
  const hasMultipleVariants = variants.length > 1;

  const theme = getProductTheme(product);
  const themeConfig = THEME_CONFIG[theme];
  const deposit = Math.round(price * (depositPercent / 100));
  const steps = getHowItWorksSteps(productType);
  const checkColors = getCheckmarkColors(themeConfig.checkmarkColor);

  // Product type label for section copy
  const typeLabel = productType === 'subscription' ? 'plan'
    : productType === 'addon' ? 'add-on'
    : productType === 'service' ? 'service'
    : 'package';

  // ========================================================================
  // Track product view in browsing history
  // ========================================================================
  useEffect(() => {
    addViewedProduct({
      product_id: product.id,
      title: product.title,
      image: image,
      viewed_at: new Date().toISOString(),
    });
  }, [product.id, product.title, image, addViewedProduct]);

  // ========================================================================
  // Wishlist toggle handler
  // ========================================================================
  const handleWishlistToggle = async () => {
    try {
      setIsManagingWishlist(true);

      if (inWishlist) {
        await removeFromWishlist(product.id);
        setToastMessage('Removed from wishlist');
      } else {
        await addToWishlist(product.id, product.title, price, image);
        setToastMessage('Added to wishlist!');
      }

      setTimeout(() => setToastMessage(''), 3000);
    } catch {
      setToastMessage('Failed to update wishlist');
      setTimeout(() => setToastMessage(''), 3000);
    } finally {
      setIsManagingWishlist(false);
    }
  };

  // ========================================================================
  // Add-to-cart handler with brief success feedback
  // ========================================================================
  const handleAddToCart = () => {
    if (!selectedVariant || showCartSuccess) return;
    addItem(selectedVariant, 1, {
      title: product.title,
      unit_price: price,
      thumbnail: image,
    });
    setShowCartSuccess(true);
    setTimeout(() => setShowCartSuccess(false), 1500);
  };

  // CTA label — shows deposit anchor for one-time, clear price for subscriptions
  const ctaLabel = showCartSuccess
    ? 'Added!'
    : isSubscription
      ? `Subscribe — $${(price / 100).toLocaleString()}/mo`
      : `Add to Cart — $${(deposit / 100).toLocaleString()} deposit`;

  // Trust/risk-reversal line below the CTA
  const trustLine = isSubscription
    ? 'Cancel anytime. No long-term contracts.'
    : `Pay ${depositPercent}% now, the rest when you're happy.`;

  return (
    <div className="min-h-screen">
      {/* ================================================================== */}
      {/* Toast notification (fixed position) */}
      {/* ================================================================== */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="px-4 py-3 bg-gray-900 text-white rounded-xl shadow-lg text-sm font-medium">
            {toastMessage}
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* SECTION 1: Dark Hero */}
      {/* ================================================================== */}
      <section className="relative overflow-hidden">
        {/* Background gradient (matches pricing page card for this product type) */}
        <div className={`absolute inset-0 ${themeConfig.bg}`} />

        {/* Glow orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute -top-20 -right-20 w-96 h-96 rounded-full ${themeConfig.glow1} blur-3xl`} />
          <div className={`absolute -bottom-10 -left-10 w-64 h-64 rounded-full ${themeConfig.glow2} blur-2xl`} />
        </div>

        {/* Dot pattern texture */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 md:px-12 pt-10 md:pt-14 pb-14 md:pb-20">
          {/* Back link */}
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Pricing
          </Link>

          {/* Popular badge */}
          {isPopular && (
            <div className="mb-4">
              <span className={`inline-block bg-gradient-to-r ${themeConfig.badge} text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg ${themeConfig.shadow}`}>
                Most Popular
              </span>
            </div>
          )}

          <FadeIn direction="up" triggerOnScroll={false}>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
              {/* Text content */}
              <div className="flex-1">
                <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
                  {product.title}
                </h1>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-black text-white">
                    ${(price / 100).toLocaleString()}
                  </span>
                  <span className="text-base font-medium text-white/90">
                    {isSubscription ? '/month' : 'one-time'}
                  </span>
                </div>

                {/* Deposit badge */}
                {!isSubscription && depositPercent > 0 && (
                  <div className="mb-6">
                    <span className="inline-flex px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-sm font-medium">
                      Start for just ${(deposit / 100).toLocaleString()} &middot; {depositPercent}% deposit
                    </span>
                  </div>
                )}

                {/* Description */}
                {product.description && (
                  <p className="text-lg text-white/85 leading-relaxed max-w-xl">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Product image (small, accent) */}
              {image && (
                <div className="flex-shrink-0">
                  <div className="relative w-48 h-48 md:w-52 md:h-52 rounded-2xl overflow-hidden ring-2 ring-white/20">
                    <Image
                      src={image}
                      alt={product.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SECTION 2: What's Included */}
      {/* ================================================================== */}
      {features.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="max-w-5xl mx-auto px-6 sm:px-8 md:px-12">
            <FadeIn direction="up" triggerOnScroll>
              <div className="text-center mb-10">
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-400 mb-2">
                  What&apos;s Included
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Everything in this {typeLabel}.
                </h2>
              </div>
            </FadeIn>

            <StaggerContainer staggerDelay={0.06} className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {features.map((feature, i) => (
                <StaggerItem key={i}>
                  <div className="flex items-center gap-3 p-3 rounded-xl">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full ${checkColors.bg} flex items-center justify-center`}>
                      <Check size={14} strokeWidth={3} className={checkColors.icon} />
                    </div>
                    <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* ================================================================== */}
      {/* SECTION 3: How It Works */}
      {/* ================================================================== */}
      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 md:px-12">
          <FadeIn direction="up" triggerOnScroll>
            <div className="text-center mb-10">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-400 mb-2">
                How It Works
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Three steps. That&apos;s it.
              </h2>
            </div>
          </FadeIn>

          <div className="relative">
            {/* Horizontal connector line (md+ only) */}
            <div className="hidden md:block absolute top-6 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-emerald-300 via-blue-300 to-purple-300 opacity-40" />

            <StaggerContainer staggerDelay={0.12} className="grid md:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <StaggerItem key={i}>
                  <div className="text-center relative">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 text-sm font-bold text-white ring-4 ring-offset-2 ring-offset-white ${STEP_COLORS[i].ring} ${STEP_COLORS[i].bg}`}
                    >
                      {i + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                      {step.description}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SECTION 4: CTA */}
      {/* ================================================================== */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-lg mx-auto px-6 sm:px-8 text-center">
          <FadeIn direction="up" triggerOnScroll>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
              Ready to get started?
            </h2>

            {/* Variant selector — only shows when there are multiple options */}
            {hasMultipleVariants && (
              <div className="mb-6 text-left">
                <label htmlFor="variant-select-cta" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Option
                </label>
                <select
                  id="variant-select-cta"
                  value={selectedVariant || ''}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 bg-white text-gray-900 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 transition hover:border-gray-400"
                >
                  {variants.map((variant: any) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.title || `Option ${variant.id.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Primary CTA — full-width, dominant green button */}
            {selectedVariant && (
              <Button
                variant="green"
                size="lg"
                onClick={handleAddToCart}
                disabled={showCartSuccess}
                className={`w-full ${themeConfig.ctaButtonShadow}`}
              >
                {showCartSuccess ? (
                  <>
                    <Check size={20} strokeWidth={3} />
                    Added!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    {ctaLabel}
                  </>
                )}
              </Button>
            )}

            {/* Trust / risk-reversal line */}
            <p className="text-sm text-gray-500 mt-3 mb-4">
              {trustLine}
            </p>

            {/* Secondary CTA — understated text link */}
            <Link
              href="/contact"
              className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2 transition-colors"
            >
              or Book a free consultation &rarr;
            </Link>

            {/* Wishlist toggle (most subtle) */}
            <div className="mt-5">
              <button
                onClick={handleWishlistToggle}
                disabled={isManagingWishlist}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
                aria-pressed={inWishlist}
                className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                  inWishlist
                    ? 'text-red-500 hover:text-red-600'
                    : 'text-gray-400 hover:text-gray-600'
                } disabled:opacity-50`}
              >
                {isManagingWishlist ? (
                  <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                ) : (
                  <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
                )}
                {inWishlist ? 'Saved to wishlist' : 'Save to wishlist'}
              </button>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
