'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Check,
  Globe,
  Zap,
  Bot,
  FileText,
  PenTool,
  Upload,
  Calendar,
  CreditCard,
  Edit3,
  ArrowRight,
  Shield,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '@/components/Button';
import { FadeIn, StaggerContainer, StaggerItem, RevealSection } from '@/components/motion';
import { alertColors } from '@/lib/colors';
import { scrollToRef } from '@/lib/scroll-utils';
import AddToCartButton from '@/components/pricing/AddToCartButton';

// ============================================================================
// Unified Pricing Page — Shoppable "Menu Board"
// ============================================================================
// Browse + buy in one page. Cart buttons alongside "View Details".
// Quote authorization lives at /quote.

// ============================================================================
// Data Types
// ============================================================================

type ProductType = 'package' | 'addon' | 'service' | 'subscription';

interface PricingProduct {
  id: string;
  title: string;
  description: string;
  handle: string;
  price: number; // in cents
  variantId: string;
  type: ProductType;
  depositPercent: number;
  features: string[];
  billingPeriod: 'monthly' | null;
  popular: boolean;
  stripePriceId?: string;
}

// Icon mapping for add-on tiles
const ADDON_ICONS: Record<string, React.ElementType> = {
  'additional-page': FileText,
  'blog-setup': PenTool,
  'contact-form-files': Upload,
  'calendar-booking': Calendar,
  'payment-integration': CreditCard,
  'cms-integration': Edit3,
  'customer-accounts': Shield,
  'ai-chatbot': Bot,
  'online-store': Globe,
};

// ============================================================================
// Component
// ============================================================================

export default function UnifiedPricingPage() {
  // Product state (fetched from Medusa)
  const [packages, setPackages] = useState<PricingProduct[]>([]);
  const [addons, setAddons] = useState<PricingProduct[]>([]);
  const [services, setServices] = useState<PricingProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState('');

  // FAQ accordion state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Section refs for smooth scrolling
  const websitesRef = useRef<HTMLElement>(null);
  const automationRef = useRef<HTMLElement>(null);

  // ========================================================================
  // Fetch products from Medusa on mount
  // ========================================================================
  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoadingProducts(true);
        setProductError('');

        const response = await fetch('/api/pricing/products');
        if (!response.ok) {
          throw new Error('Failed to load products');
        }

        const data = await response.json();
        setPackages(data.packages || []);
        setAddons(data.addons || []);
        setServices(data.services || []);
      } catch (err) {
        console.error('Failed to fetch pricing products:', err);
        setProductError('Unable to load products. Please refresh the page.');
      } finally {
        setIsLoadingProducts(false);
      }
    }

    fetchProducts();
  }, []);

  // Scroll helper that respects prefers-reduced-motion
  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    scrollToRef(ref, { block: 'start' });
  };

  // Derived values for hero pills
  const minPackagePrice = packages.length > 0
    ? Math.min(...packages.map((p) => p.price))
    : 50000;

  const automationService = services.find((s) => s.type === 'service');
  const subscriptionService = services.find((s) => s.type === 'subscription');

  return (
    <div className="min-h-screen pb-16 md:pb-24">
      {/* ================================================================== */}
      {/* HERO SECTION — full-width dark, editorial */}
      {/* ================================================================== */}
      <section className="relative overflow-hidden">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -right-4 text-[10rem] font-black text-white/[0.03] leading-none select-none pointer-events-none">$</div>

        {/* Dot pattern texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 md:px-12 pt-16 md:pt-20 pb-20 md:pb-24">
          <FadeIn direction="up" triggerOnScroll={false}>
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-purple-400" />
                <span className="text-sm font-semibold tracking-widest uppercase text-white/95">Pricing</span>
              </div>
              <h1 className="font-playfair text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.05] mb-6">
                Invest in what<br />
                <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">moves you forward.</span>
              </h1>
              <p className="text-xl text-white/90 max-w-xl leading-relaxed">
                Transparent packages. No hidden fees. Pick what fits or build your own.
              </p>
            </div>
          </FadeIn>

          {/* Quick navigation — 3 pills */}
          <StaggerContainer staggerDelay={0.06} className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'Websites', price: `from $${minPackagePrice / 100}`, icon: Globe, ref: websitesRef, color: 'emerald' },
              { label: 'Automation', price: automationService ? `$${automationService.price / 100}/workflow` : '$150/workflow', icon: Zap, ref: automationRef, color: 'blue' },
              { label: 'AI Agents', price: subscriptionService ? `$${subscriptionService.price / 100}/month` : '$500/month', icon: Bot, ref: automationRef, color: 'purple' },
            ].map((item) => {
              const colorMap: Record<string, string> = {
                emerald: 'hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400',
                blue: 'hover:border-blue-500/50 hover:bg-blue-500/10 text-blue-400',
                purple: 'hover:border-purple-500/50 hover:bg-purple-500/10 text-purple-400',
              };
              return (
                <StaggerItem key={item.label}>
                  <button
                    onClick={() => scrollToSection(item.ref)}
                    className={`group flex items-center gap-3 px-6 py-3.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 ${colorMap[item.color]}`}
                  >
                    <item.icon size={20} className="group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-semibold text-base text-white">{item.label}</span>
                    <span className="text-sm font-medium opacity-70">{item.price}</span>
                  </button>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>


      {/* ================================================================== */}
      {/* TRUST STRIP — elevated cards */}
      {/* ================================================================== */}
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Shield size={20} className="text-emerald-600" />
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                50% deposit to start. Pay the rest when you&apos;re happy.
              </p>
            </div>
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Sparkles size={20} className="text-purple-600" />
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Not satisfied? We make it right or refund your deposit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* HOW IT WORKS */}
      {/* ================================================================== */}
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
          <FadeIn direction="up" triggerOnScroll>
            <div className="text-center mb-10">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-400 mb-2">
                How It Works
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Three steps to your new site.
              </h2>
            </div>
          </FadeIn>

          <div className="relative">
            {/* Horizontal connector line (md+ only) */}
            <div className="hidden md:block absolute top-6 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-emerald-300 via-blue-300 to-purple-300 opacity-40" />

            <StaggerContainer staggerDelay={0.12} className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '1',
                  color: 'emerald',
                  title: 'Pick your package',
                  description:
                    'Browse the options below — or mix and match from our à la carte menu.',
                },
                {
                  step: '2',
                  color: 'blue',
                  title: 'Pay 50% to start',
                  description:
                    'We begin building while you keep running your business. No long contracts.',
                },
                {
                  step: '3',
                  color: 'purple',
                  title: 'Review and launch',
                  description:
                    'Approve the finished product, pay the remainder, and go live.',
                },
              ].map((item) => {
                const ringColorMap: Record<string, string> = {
                  emerald: 'ring-emerald-200',
                  blue: 'ring-blue-200',
                  purple: 'ring-purple-200',
                };
                return (
                  <StaggerItem key={item.step}>
                    <div className="text-center relative">
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 text-sm font-bold text-white ring-4 ring-offset-2 ring-offset-white ${ringColorMap[item.color]} ${
                          item.color === 'emerald'
                            ? 'bg-emerald-500'
                            : item.color === 'blue'
                              ? 'bg-blue-500'
                              : 'bg-purple-500'
                        }`}
                      >
                        {item.step}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                        {item.description}
                      </p>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* Loading state */}
      {isLoadingProducts && (
        <div className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="text-center mb-8">
              <p className="text-gray-500 text-sm font-medium">
                Loading your options...
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-3xl bg-gray-100 h-80" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {productError && (
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className={`p-6 ${alertColors.error.bg} ${alertColors.error.border} rounded-lg text-center`}>
            <p className={alertColors.error.text}>{productError}</p>
            <Button variant="gray" onClick={() => window.location.reload()} className="mt-4">
              Refresh Page
            </Button>
          </div>
        </div>
      )}

      {/* Product sections */}
      {!isLoadingProducts && !productError && (
        <>
          {/* ================================================================== */}
          {/* WEBSITES SECTION */}
          {/* ================================================================== */}
          <section ref={websitesRef} id="websites" className="py-24 scroll-mt-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
              <FadeIn direction="up">
                <div className="mb-14">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500" />
                    <span className="text-sm font-semibold tracking-widest uppercase text-gray-500">Websites</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">
                    Your site, built right.
                  </h2>
                  <p className="text-lg text-gray-500 max-w-lg leading-relaxed">
                    Professional websites that get you online fast — designed to grow with you.
                  </p>
                </div>
              </FadeIn>

              <StaggerContainer className="grid md:grid-cols-3 gap-6 md:gap-x-6 md:gap-y-0 md:grid-rows-[repeat(6,auto)]">
                {packages.map((pkg, index) => {
                  const isPopular = pkg.popular;
                  const deposit = Math.round(pkg.price * (pkg.depositPercent / 100));

                  // BJJ belt progression card styles
                  const cardStylesByIndex = [
                    {
                      bg: 'bg-gradient-to-br from-emerald-800 via-emerald-800 to-emerald-900',
                      glow1: 'bg-emerald-400/15',
                      glow2: 'bg-emerald-300/10',
                      check: 'bg-emerald-500/20 text-emerald-400',
                      badge: 'from-emerald-500 to-emerald-600',
                      shadow: 'shadow-emerald-500/25',
                      border: 'ring-4 ring-inset ring-emerald-400/60',
                    },
                    {
                      bg: 'bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950',
                      glow1: 'bg-blue-500/15',
                      glow2: 'bg-blue-400/10',
                      check: 'bg-blue-500/20 text-blue-400',
                      badge: 'from-blue-500 to-blue-600',
                      shadow: 'shadow-blue-500/25',
                      border: 'ring-4 ring-inset ring-blue-400/60',
                    },
                    {
                      bg: 'bg-gradient-to-br from-purple-800 via-purple-800 to-purple-900',
                      glow1: 'bg-purple-400/15',
                      glow2: 'bg-purple-300/10',
                      check: 'bg-purple-500/20 text-purple-400',
                      badge: 'from-purple-500 to-purple-600',
                      shadow: 'shadow-purple-500/25',
                      border: 'ring-4 ring-inset ring-purple-400/60',
                    },
                  ];
                  const cardStyles = cardStylesByIndex[index] || cardStylesByIndex[0];

                  return (
                    <StaggerItem key={pkg.id} className="md:row-span-6 md:grid md:grid-rows-subgrid">
                      <div
                        className={`
                          relative rounded-3xl transition-all duration-300
                          p-8 lg:p-10 hover:-translate-y-2
                          md:row-span-6 md:grid md:grid-rows-subgrid
                          ${cardStyles.bg}
                          ${cardStyles.border} ${isPopular ? 'shadow-2xl shadow-purple-500/20' : 'shadow-xl'}
                        `}
                      >
                        {/* Glow wrapper */}
                        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                          <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full ${cardStyles.glow1} blur-3xl`} />
                          <div className={`absolute -bottom-10 -left-10 w-40 h-40 rounded-full ${cardStyles.glow2} blur-2xl`} />
                        </div>

                        {/* Badge */}
                        {isPopular && (
                          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                            <span className={`inline-block bg-gradient-to-r ${cardStyles.badge} text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg ${cardStyles.shadow}`}>
                              Most Popular
                            </span>
                          </div>
                        )}

                        {/* Dot pattern texture */}
                        <div
                          className="absolute inset-0 rounded-3xl opacity-[0.04] pointer-events-none"
                          style={{
                            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                          }}
                        />

                        {/* Row 1: Title + "Best for" label */}
                        <div className="relative z-10 pt-1">
                          <h3 className="text-2xl font-black text-white tracking-tight">
                            {pkg.title}
                          </h3>
                          <p className="text-xs font-medium text-white/60 uppercase tracking-wider mt-1">
                            {['Best for startups & small biz', 'Best for growing businesses', 'Best for established companies'][index] || ''}
                          </p>
                        </div>

                        {/* Row 2: Description */}
                        <div className="relative z-10 mt-3">
                          <p className="text-base text-white/90 leading-relaxed">{pkg.description}</p>
                        </div>

                        {/* Row 3: Price with decorative dividers */}
                        <div className="relative z-10 mt-6">
                          <div className="h-px w-16 bg-white/20 mb-4" />
                          <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-white">
                              ${(pkg.price / 100).toLocaleString()}
                            </span>
                            <span className="text-base font-medium text-white/95">
                              one-time
                            </span>
                          </div>
                          <div className="h-px w-16 bg-white/20 mt-4" />
                        </div>

                        {/* Row 4: Feature list */}
                        <ul className="relative z-10 space-y-3.5 mt-6">
                          {pkg.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-3">
                              <div className={`flex-shrink-0 w-5 h-5 rounded-full ${cardStyles.check} flex items-center justify-center`}>
                                <Check size={12} strokeWidth={3} />
                              </div>
                              <span className="text-sm text-white/90 leading-relaxed">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Row 5: CTA — Add to Cart + View Details */}
                        <div className="relative z-10 self-end mt-6 space-y-3">
                          <AddToCartButton
                            variantId={pkg.variantId}
                            title={pkg.title}
                            price={pkg.price}
                            variant="primary"
                            className={`shadow-lg ${cardStyles.shadow}`}
                          />
                          <Link
                            href={`/shop/${pkg.handle}`}
                            className="w-full py-2.5 px-6 rounded-xl font-semibold text-sm transition-all duration-300 bg-white/10 border border-white/20 text-white hover:bg-white/20 flex items-center justify-center gap-2"
                          >
                            View Details <ArrowRight size={16} />
                          </Link>
                        </div>

                        {/* Row 6: Deposit pill badge */}
                        <div className="relative z-10 text-center mt-3">
                          <span className="inline-flex px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-medium">
                            Start for ${deposit / 100} &middot; {pkg.depositPercent}% deposit
                          </span>
                        </div>
                      </div>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            </div>
          </section>

          {/* ================================================================== */}
          {/* AUTOMATION & AI SECTION */}
          {/* ================================================================== */}
          <section ref={automationRef} id="automation" className="py-24 scroll-mt-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
              <FadeIn direction="up">
                <div className="mb-14">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-1 rounded-full bg-gradient-to-r from-purple-500 to-gold-500" />
                    <span className="text-sm font-semibold tracking-widest uppercase text-gray-500">Automation & AI</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">
                    Let the machines handle it.
                  </h2>
                  <p className="text-lg text-gray-500 max-w-lg leading-relaxed">
                    Work smarter with intelligent automation that runs while you sleep.
                  </p>
                </div>
              </FadeIn>

              <StaggerContainer className="grid md:grid-cols-2 gap-6">
                {/* Automation Setup */}
                {automationService && (
                  <StaggerItem>
                    <div className="relative flex flex-col rounded-3xl overflow-hidden p-8 lg:p-10 bg-gradient-to-br from-purple-700 via-purple-800 to-purple-900 shadow-xl hover:-translate-y-2 transition-all duration-300 h-full">
                      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-purple-400/20 blur-3xl" />
                      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-purple-300/15 blur-2xl" />
                      {/* Dot pattern texture */}
                      <div
                        className="absolute inset-0 opacity-[0.04] pointer-events-none"
                        style={{
                          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                          backgroundSize: '20px 20px',
                        }}
                      />

                      <div className="relative z-10 flex flex-col h-full">
                        <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center mb-6 border border-white/10">
                          <Zap size={24} className="text-purple-200" />
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-tight mb-2">
                          {automationService.title}
                        </h3>
                        <p className="text-white/90 mb-4 leading-relaxed">
                          {automationService.description}
                        </p>
                        {automationService.features.length > 0 && (
                          <ul className="space-y-2 mb-6">
                            {automationService.features.slice(0, 4).map((feature, i) => (
                              <li key={i} className="flex items-center gap-2.5">
                                <div className="flex-shrink-0 w-4 h-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                                  <Check size={10} strokeWidth={3} className="text-purple-400" />
                                </div>
                                <span className="text-sm text-white/80">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="flex items-baseline gap-2 mb-8">
                          <span className="text-5xl font-black text-white">${automationService.price / 100}</span>
                          <span className="text-base font-medium text-white/95">per workflow</span>
                        </div>
                        <div className="mt-auto space-y-3">
                          <AddToCartButton
                            variantId={automationService.variantId}
                            title={automationService.title}
                            price={automationService.price}
                            variant="primary"
                            className="shadow-lg shadow-purple-500/25"
                          />
                          <Link
                            href={`/shop/${automationService.handle}`}
                            className="w-full py-2.5 px-6 rounded-xl font-semibold text-sm text-center transition-all duration-300 bg-white/10 border border-white/15 text-white hover:bg-white/20 flex items-center justify-center gap-2"
                          >
                            View Details <ArrowRight size={16} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                )}

                {/* Managed AI */}
                {subscriptionService && (
                  <StaggerItem>
                    <div className="relative flex flex-col rounded-3xl overflow-hidden p-8 lg:p-10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 shadow-xl hover:-translate-y-2 transition-all duration-300 h-full">
                      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gold-500/15 blur-3xl" />
                      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-gold-400/10 blur-2xl" />
                      {/* Dot pattern texture */}
                      <div
                        className="absolute inset-0 opacity-[0.04] pointer-events-none"
                        style={{
                          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                          backgroundSize: '20px 20px',
                        }}
                      />

                      <div className="relative z-10 flex flex-col h-full">
                        <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center mb-6 border border-gold-500/20">
                          <Bot size={24} className="text-gold-400" />
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-tight mb-2">
                          {subscriptionService.title}
                        </h3>
                        <p className="text-white/90 mb-4 leading-relaxed">
                          {subscriptionService.description}
                        </p>
                        {subscriptionService.features.length > 0 && (
                          <ul className="space-y-2 mb-6">
                            {subscriptionService.features.slice(0, 4).map((feature, i) => (
                              <li key={i} className="flex items-center gap-2.5">
                                <div className="flex-shrink-0 w-4 h-4 rounded-full bg-gold-500/20 flex items-center justify-center">
                                  <Check size={10} strokeWidth={3} className="text-gold-400" />
                                </div>
                                <span className="text-sm text-white/80">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="flex items-baseline gap-2 mb-8">
                          <span className="text-5xl font-black text-white">${subscriptionService.price / 100}</span>
                          <span className="text-base font-medium text-white/95">per month</span>
                        </div>
                        <div className="mt-auto space-y-3">
                          <AddToCartButton
                            variantId={subscriptionService.variantId}
                            title={subscriptionService.title}
                            price={subscriptionService.price}
                            variant="primary"
                            className="shadow-lg shadow-gold-500/25"
                          />
                          <Link
                            href={`/shop/${subscriptionService.handle}`}
                            className="w-full py-2.5 px-6 rounded-xl font-semibold text-sm text-center transition-all duration-300 bg-white/10 border border-white/15 text-white hover:bg-white/20 flex items-center justify-center gap-2"
                          >
                            View Details <ArrowRight size={16} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                )}
              </StaggerContainer>
            </div>
          </section>

          {/* ================================================================== */}
          {/* ADD-ONS — dark glass cards with BJJ belt icon colors */}
          {/* ================================================================== */}
          {addons.length > 0 && (
            <section className="py-24 scroll-mt-8 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
                <FadeIn direction="up">
                  <div className="mb-14">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-1 rounded-full bg-gradient-to-r from-gold-500 to-purple-500" />
                      <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">&Agrave; La Carte</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
                      Build your own.
                    </h2>
                    <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
                      Pick exactly what you need — nothing more, nothing less. Mix and match add-ons with any package.
                    </p>
                  </div>
                </FadeIn>

                <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {addons.map((addon, index) => {
                    const Icon = ADDON_ICONS[addon.handle] || FileText;
                    // Rotate BJJ belt colors for icon backgrounds
                    const iconColors = [
                      { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
                      { bg: 'bg-blue-500/20', text: 'text-blue-400' },
                      { bg: 'bg-purple-500/20', text: 'text-purple-400' },
                      { bg: 'bg-gold-500/20', text: 'text-gold-400' },
                    ];
                    const iconColor = iconColors[index % iconColors.length];

                    return (
                      <StaggerItem key={addon.id} className="h-full">
                        <div className="relative w-full h-full text-left rounded-2xl p-6 bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 flex flex-col">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${iconColor.bg}`}>
                            <Icon size={22} className={iconColor.text} />
                          </div>
                          <h3 className="font-bold text-base mb-2 text-white">
                            {addon.title}
                          </h3>
                          <p className="text-sm leading-relaxed mb-4 flex-grow text-slate-400">
                            {addon.description}
                          </p>
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                            <span className="text-2xl font-black text-white">
                              +${addon.price / 100}
                            </span>
                            <AddToCartButton
                              variantId={addon.variantId}
                              title={addon.title}
                              price={addon.price}
                              variant="dark-secondary"
                            />
                          </div>
                        </div>
                      </StaggerItem>
                    );
                  })}
                </StaggerContainer>

              </div>
            </section>
          )}

          {/* ================================================================== */}
          {/* CONSULTATION CTA */}
          {/* ================================================================== */}
          <section className="py-24">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
              <RevealSection>
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950 p-10 md:p-16 shadow-2xl">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
                  <div className="absolute -bottom-4 -right-2 text-[8rem] font-black text-white/[0.03] leading-none select-none pointer-events-none">?</div>

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-10">
                    <div className="max-w-lg">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-purple-400" />
                        <span className="text-sm font-semibold tracking-widest uppercase text-white/95">Free Consultation</span>
                      </div>
                      <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                        Not sure<br />what you need?
                      </h2>
                      <p className="text-lg text-white/90 leading-relaxed">
                        Book a free call. We&apos;ll help you figure out the right solution — no pressure, no commitment.
                      </p>
                    </div>

                    <div className="flex flex-col items-center md:items-start gap-4">
                      <Button
                        variant="green"
                        href="/contact#consultation"
                        size="lg"
                        className="shadow-lg shadow-emerald-500/25 whitespace-nowrap"
                      >
                        <span className="flex items-center gap-2">
                          <Calendar size={20} />
                          Book a Free Call
                        </span>
                      </Button>
                      <p className="text-sm text-white/95">
                        15, 30, or 45 minute sessions
                      </p>
                    </div>
                  </div>
                </div>
              </RevealSection>
            </div>
          </section>
        </>
      )}

      {/* ================================================================== */}
      {/* QUOTE BANNER — link to /quote */}
      {/* ================================================================== */}
      <section className="py-8 bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-6 px-8 rounded-2xl bg-white/5 border border-white/10">
            <FileText size={20} className="text-slate-500 flex-shrink-0" />
            <p className="text-slate-400 text-center sm:text-left">
              Already have a quote?
            </p>
            <Link
              href="/quote"
              className="inline-flex items-center gap-1.5 text-purple-400 font-semibold hover:text-purple-300 transition-colors whitespace-nowrap"
            >
              Authorize it here <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* PRICING FAQ */}
      {/* ================================================================== */}
      {/* Indexed by chatbot for payment/support questions. Last updated: 2026-02-12 */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <FadeIn direction="up" triggerOnScroll>
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-purple-400" />
                <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">FAQ</span>
              </div>
              <h2 className="font-playfair text-3xl sm:text-4xl font-black text-white tracking-tight">
                Common Questions
              </h2>
            </div>
          </FadeIn>

          <div className="space-y-4">
            {[
              {
                question: 'How does payment work?',
                answer: 'We collect a 50% deposit to get started, then the remaining 50% once you approve the finished site. No surprises, no hidden fees.',
                color: 'emerald',
              },
              {
                question: 'What if I need changes after delivery?',
                answer: 'Every package includes a support period\u200A\u2014\u200A30 days for Starter, 60 for Growth, and 90 for Pro. During that time, we handle fixes and tweaks at no extra cost. After that, monthly retainer plans keep things running smoothly.',
                color: 'blue',
              },
              {
                question: 'Can I start small and add more later?',
                answer: "Absolutely. Our services are designed to build on each other. Start with a Starter Site and add features like a blog, online store, or booking system whenever you\u2019re ready.",
                color: 'purple',
              },
            ].map((faq, index) => {
              const isExpanded = expandedFaq === index;
              const questionColorMap: Record<string, string> = {
                emerald: 'text-emerald-400',
                blue: 'text-blue-400',
                purple: 'text-purple-400',
              };
              const hoverRingMap: Record<string, string> = {
                emerald: 'hover:border-emerald-500/30',
                blue: 'hover:border-blue-500/30',
                purple: 'hover:border-purple-500/30',
              };

              return (
                <div
                  key={index}
                  className={`
                    bg-white/5 rounded-2xl backdrop-blur-sm
                    border ${isExpanded ? 'border-white/20' : 'border-white/10'}
                    ${hoverRingMap[faq.color]}
                    transition-all duration-300 ease-out
                    ${isExpanded ? 'shadow-lg shadow-black/20' : ''}
                  `}
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : index)}
                    className={`
                      w-full p-5 md:p-6
                      flex items-center gap-4
                      text-left cursor-pointer
                      transition-colors duration-200
                      ${isExpanded ? 'bg-white/5' : 'hover:bg-white/5'}
                      rounded-t-2xl
                      ${!isExpanded ? 'rounded-b-2xl' : ''}
                    `}
                    aria-expanded={isExpanded}
                  >
                    <span className={`flex-1 text-lg md:text-xl font-bold tracking-tight ${questionColorMap[faq.color]}`}>
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-5 h-5 text-slate-500" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 md:px-6 pb-5 md:pb-6 pt-2 border-t border-white/10">
                          <p className="text-slate-400 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/faq"
              className="text-purple-400 hover:text-purple-300 font-medium text-lg transition-colors"
            >
              Have more questions? See our full FAQ &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
