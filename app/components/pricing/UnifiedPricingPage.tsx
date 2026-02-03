'use client';

import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  Globe,
  Zap,
  Bot,
  Puzzle,
  FileText,
  PenTool,
  Upload,
  Calendar,
  CreditCard,
  Edit3,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { FadeIn, StaggerContainer, StaggerItem, RevealSection } from '@/components/motion';
import PaymentForm from '@/components/PaymentForm';
import { StripeElementsWrapper } from '@/context/StripeContext';
import {
  headingColors,
  formInputColors,
  accentColors,
  featureCardColors,
  stepBadgeColors,
  mutedTextColors,
  alertColors,
} from '@/lib/colors';
import { scrollToRef } from '@/lib/scroll-utils';

// ============================================================================
// Unified Pricing Page - Warm, inviting design with smooth scroll navigation
// ============================================================================
// Design: Inspired by the shop page's welcoming aesthetic
// - Hero with gradient orbs + bold headline
// - Clear service categories with smooth scroll
// - No email required upfront (collected at Stripe)
// - Consultation CTA at bottom

// ============================================================================
// Data Definitions
// ============================================================================

interface AuthorizedQuote {
  id: string;
  referenceNumber: string;
  customerName: string;
  totalAmount: number;
  depositAmount: number;
  lineItems: Array<{ description: string; amount: number }>;
  expiresAt: string;
}

interface Package {
  id: string;
  name: string;
  price: number;
  deposit: number;
  description: string;
  features: string[];
  color: 'green' | 'blue';
  popular?: boolean;
}

interface Addon {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: React.ElementType;
}

const PACKAGES: Package[] = [
  {
    id: 'launch-site',
    name: 'Launch Site',
    price: 500,
    deposit: 250,
    description: 'Get online fast with a professional site.',
    color: 'green',
    features: [
      '3-5 pages',
      'Custom design',
      'Mobile responsive',
      'Contact form',
      'Basic SEO',
      '30 days support',
    ],
  },
  {
    id: 'growth-site',
    name: 'Growth Site',
    price: 1200,
    deposit: 600,
    description: 'Scale your online presence.',
    color: 'blue',
    popular: true,
    features: [
      '5-8 pages',
      'Everything in Launch',
      'Blog with CMS',
      'Content editing',
      'Enhanced SEO',
      '60 days support',
    ],
  },
];

const ADDONS: Addon[] = [
  { id: 'additional-page', name: 'Extra Page', price: 100, description: 'Add another page to your site', icon: FileText },
  { id: 'blog-setup', name: 'Blog', price: 300, description: 'Full blog with SEO optimization', icon: PenTool },
  { id: 'contact-form-files', name: 'File Uploads', price: 150, description: 'Accept file attachments', icon: Upload },
  { id: 'calendar-booking', name: 'Booking', price: 200, description: 'Calendar scheduling integration', icon: Calendar },
  { id: 'payment-integration', name: 'Payments', price: 400, description: 'Stripe payment integration', icon: CreditCard },
  { id: 'cms-integration', name: 'CMS', price: 500, description: 'Edit your content yourself', icon: Edit3 },
];

// ============================================================================
// Component
// ============================================================================

export default function UnifiedPricingPage() {
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkingOutPackage, setCheckingOutPackage] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState('');

  // Quote authorization state
  const [quoteRef, setQuoteRef] = useState('');
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [authorizedQuote, setAuthorizedQuote] = useState<AuthorizedQuote | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Section refs for smooth scrolling
  const websitesRef = useRef<HTMLElement>(null);
  const automationRef = useRef<HTMLElement>(null);
  const customRef = useRef<HTMLElement>(null);
  const quoteAuthRef = useRef<HTMLElement>(null);

  // Scroll helper that respects prefers-reduced-motion preference
  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    scrollToRef(ref, { block: 'start' });
  };

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const customTotal = ADDONS.filter((a) => selectedAddons.has(a.id)).reduce((sum, a) => sum + a.price, 0);
  const customDeposit = Math.round(customTotal / 2);

  // Package checkout - redirects to Stripe (email collected there)
  const handlePackageCheckout = async (packageId: string, price: number) => {
    setCheckingOutPackage(packageId);
    setCheckoutError('');

    try {
      const response = await fetch('/api/stripe/create-build-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'package', packageId, total: price }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create checkout');
      window.location.href = data.url;
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Something went wrong');
      setCheckingOutPackage(null);
    }
  };

  // Custom build checkout
  const handleCustomCheckout = async () => {
    if (selectedAddons.size === 0) return;
    setIsCheckingOut(true);
    setCheckoutError('');

    try {
      const response = await fetch('/api/stripe/create-build-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'custom', features: Array.from(selectedAddons), total: customTotal }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create checkout');
      window.location.href = data.url;
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Something went wrong');
      setIsCheckingOut(false);
    }
  };

  // ============================================================================
  // Handle Quote Authorization Form Submission
  // ============================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!quoteRef.trim()) {
      setError('We need your quote reference number to get started');
      return;
    }

    if (!email.trim()) {
      setError("What's the email address on your quote?");
      return;
    }

    try {
      setIsProcessing(true);

      // Call the authorize API
      const response = await fetch('/api/quotes/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteRef: quoteRef.trim(), email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      // Store the quote data and client secret for payment
      setAuthorizedQuote(data.quote);
      setClientSecret(data.clientSecret);
    } catch {
      setError("Hmm, something went wrong. Please try again or reach out to us - we're here to help.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ============================================================================
  // Handle Payment Success
  // ============================================================================
  const handlePaymentSuccess = async (paymentIntentId: string) => {
    // Update quote status to deposit_paid
    try {
      await fetch('/api/quotes/deposit-confirmed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: authorizedQuote?.id,
          paymentIntentId,
        }),
      });
    } catch (err) {
      console.error('Failed to update quote status:', err);
      // Don't fail the user - payment was successful
    }

    setSuccess(true);
  };

  // ============================================================================
  // Format currency for display
  // ============================================================================
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <div className="min-h-screen pb-16 md:pb-24">
      {/* ================================================================== */}
      {/* HERO SECTION - Edge-to-edge on mobile, contained on desktop */}
      {/* ================================================================== */}
      <section className="pt-8 md:pt-12 pb-4">
        <div className="relative overflow-hidden py-16 md:py-20 md:max-w-6xl md:mx-auto md:rounded-3xl">
          {/* Dark gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950" />
          {/* Accent glows */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          {/* Watermark */}
          <div className="absolute -bottom-8 -right-4 text-[10rem] font-black text-white/[0.03] leading-none select-none pointer-events-none">$</div>

          <div className="relative z-10 px-6 sm:px-8 md:px-12">
            {/* Editorial header */}
            <FadeIn direction="up" triggerOnScroll={false}>
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-purple-400" />
                  <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">Pricing</span>
                </div>
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[0.95] mb-4">
                  Invest in what<br />
                  <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">moves you forward.</span>
                </h1>
                <p className="text-xl text-slate-400 max-w-xl leading-relaxed">
                  Transparent packages. No hidden fees. Pick what fits or build your own.
                </p>
              </div>
            </FadeIn>

            {/* Quick navigation — horizontal pills */}
            <StaggerContainer staggerDelay={0.06} className="flex flex-wrap gap-3">
              {[
                { label: 'Websites', price: 'from $500', icon: Globe, ref: websitesRef, color: 'emerald' },
                { label: 'Automation', price: '$150/workflow', icon: Zap, ref: automationRef, color: 'blue' },
                { label: 'AI Agents', price: '$500/month', icon: Bot, ref: automationRef, color: 'purple' },
                { label: 'Custom', price: 'you decide', icon: Puzzle, ref: customRef, color: 'amber' },
                { label: 'Have a Quote?', price: 'authorize', icon: FileText, ref: quoteAuthRef, color: 'slate' },
              ].map((item) => {
                const colorMap: Record<string, string> = {
                  emerald: 'hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400',
                  blue: 'hover:border-blue-500/50 hover:bg-blue-500/10 text-blue-400',
                  purple: 'hover:border-purple-500/50 hover:bg-purple-500/10 text-purple-400',
                  amber: 'hover:border-amber-500/50 hover:bg-amber-500/10 text-amber-400',
                  slate: 'hover:border-slate-500/50 hover:bg-slate-500/10 text-slate-400',
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
        </div>
      </section>

      {/* ================================================================== */}
      {/* WEBSITES SECTION */}
      {/* ================================================================== */}
      <section ref={websitesRef} id="websites" className="py-24 scroll-mt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Editorial section header */}
          <FadeIn direction="up">
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500" />
              <span className="text-sm font-semibold tracking-widest uppercase text-gray-500">Websites</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">
              Your site, built right.
            </h2>
            <p className="text-lg text-gray-500 max-w-lg">
              Professional websites that get you online fast — designed to grow with you.
            </p>
          </div>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-2 gap-6">
            {PACKAGES.map((pkg) => {
              const isLoading = checkingOutPackage === pkg.id;
              const isPopular = pkg.popular;

              // Color maps for dark card variants
              const cardStyles = pkg.color === 'blue'
                ? {
                    bg: 'bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950',
                    glow1: 'bg-blue-500/15',
                    glow2: 'bg-blue-400/10',
                    check: 'bg-blue-500/20 text-blue-400',
                    accent: 'text-blue-400',
                    badge: 'from-blue-500 to-blue-600',
                    shadow: 'shadow-blue-500/25',
                  }
                : {
                    bg: 'bg-gradient-to-br from-emerald-800 via-emerald-800 to-emerald-900',
                    glow1: 'bg-emerald-400/15',
                    glow2: 'bg-emerald-300/10',
                    check: 'bg-emerald-500/20 text-emerald-400',
                    accent: 'text-emerald-400',
                    badge: 'from-emerald-500 to-emerald-600',
                    shadow: 'shadow-emerald-500/25',
                  };

              return (
                <StaggerItem key={pkg.id}>
                <div
                  className={`
                    relative rounded-3xl overflow-hidden transition-all duration-300
                    p-8 lg:p-10 hover:-translate-y-2
                    ${cardStyles.bg}
                    ${isPopular ? 'ring-2 ring-blue-400/50 shadow-2xl shadow-blue-500/20 md:scale-[1.03]' : 'shadow-xl'}
                  `}
                >
                  {/* Accent glows */}
                  <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full ${cardStyles.glow1} blur-3xl`} />
                  <div className={`absolute -bottom-10 -left-10 w-40 h-40 rounded-full ${cardStyles.glow2} blur-2xl`} />

                  <div className="relative z-10">
                    {isPopular && (
                      <div className="mb-5">
                        <span className={`inline-block bg-gradient-to-r ${cardStyles.badge} text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg ${cardStyles.shadow}`}>
                          Most Popular
                        </span>
                      </div>
                    )}

                    <h3 className="text-2xl font-black text-white tracking-tight mb-2">
                      {pkg.name}
                    </h3>
                    <p className="text-sm text-white/60 mb-6">{pkg.description}</p>

                    <div className="flex items-baseline gap-2 mb-8">
                      <span className="text-5xl font-black text-white">
                        ${pkg.price.toLocaleString()}
                      </span>
                      <span className="text-base font-medium text-white/50">
                        one-time
                      </span>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <div className={`flex-shrink-0 w-5 h-5 rounded-full ${cardStyles.check} flex items-center justify-center`}>
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <span className="text-sm text-white/80">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handlePackageCheckout(pkg.id, pkg.price)}
                      disabled={checkingOutPackage !== null}
                      className={`w-full py-3.5 px-6 rounded-xl font-semibold text-base transition-all duration-300 bg-white text-gray-900 hover:bg-white/90 shadow-lg ${cardStyles.shadow} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 size={18} className="animate-spin" /> Processing...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Start for ${pkg.deposit} <ArrowRight size={18} />
                        </span>
                      )}
                    </button>
                    <p className="text-center text-sm text-white/40 mt-3">
                      50% deposit, remainder on delivery
                    </p>
                  </div>
                </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          {checkoutError && (
            <p className="mt-4 text-center text-red-600">{checkoutError}</p>
          )}
        </div>
      </section>

      {/* ================================================================== */}
      {/* AUTOMATION & AI SECTION */}
      {/* ================================================================== */}
      <section ref={automationRef} id="automation" className="py-24 scroll-mt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Editorial section header */}
          <FadeIn direction="up">
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-1 rounded-full bg-gradient-to-r from-purple-500 to-gold-500" />
              <span className="text-sm font-semibold tracking-widest uppercase text-gray-500">Automation & AI</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">
              Let the machines handle it.
            </h2>
            <p className="text-lg text-gray-500 max-w-lg">
              Work smarter with intelligent automation that runs while you sleep.
            </p>
          </div>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-2 gap-6">
            {/* Automation Setup */}
            <StaggerItem>
            <div className="relative flex flex-col rounded-3xl overflow-hidden p-8 lg:p-10 bg-gradient-to-br from-purple-700 via-purple-800 to-purple-900 shadow-xl hover:-translate-y-2 transition-all duration-300 h-full">
              {/* Accent glows */}
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-purple-400/20 blur-3xl" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-purple-300/15 blur-2xl" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center mb-6 border border-white/10">
                  <Zap size={24} className="text-purple-200" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-2">
                  Automation Setup
                </h3>
                <p className="text-purple-200 mb-6 leading-relaxed">
                  Connect your tools and eliminate repetitive work. We build workflows that save you hours every week.
                </p>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-5xl font-black text-white">$150</span>
                  <span className="text-base font-medium text-white/50">per workflow</span>
                </div>
                <Button variant="purple" href="/contact#consultation" className="w-full mt-auto bg-white/15 border border-white/20 text-white hover:bg-white/25 shadow-lg shadow-purple-500/25">
                  Book a Call
                </Button>
              </div>
            </div>
            </StaggerItem>

            {/* Managed AI */}
            <StaggerItem>
            <div className="relative flex flex-col rounded-3xl overflow-hidden p-8 lg:p-10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 shadow-xl hover:-translate-y-2 transition-all duration-300 h-full">
              {/* Accent glows */}
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gold-500/15 blur-3xl" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-gold-400/10 blur-2xl" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center mb-6 border border-gold-500/20">
                  <Bot size={24} className="text-gold-400" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-2">
                  Managed AI
                </h3>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  AI agents that handle customer support, data entry, and internal ops — around the clock.
                </p>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-5xl font-black text-white">$500</span>
                  <span className="text-base font-medium text-white/50">per month</span>
                </div>
                <Button variant="gold" href="/contact#consultation" className="w-full mt-auto bg-white/10 border border-white/15 text-white hover:bg-white/20 shadow-lg shadow-gold-500/25">
                  Book a Call
                </Button>
              </div>
            </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* ================================================================== */}
      {/* CUSTOM BUILD SECTION */}
      {/* ================================================================== */}
      <section ref={customRef} id="custom" className="py-24 scroll-mt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Editorial section header */}
          <FadeIn direction="up">
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-1 rounded-full bg-gradient-to-r from-gold-500 to-purple-500" />
              <span className="text-sm font-semibold tracking-widest uppercase text-gray-500">À La Carte</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">
              Build your own.
            </h2>
            <p className="text-lg text-gray-500 max-w-lg">
              Pick exactly what you need — nothing more, nothing less.
            </p>
          </div>
          </FadeIn>

          {/* Add-ons grid - selectable tiles */}
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ADDONS.map((addon) => {
              const isSelected = selectedAddons.has(addon.id);
              const Icon = addon.icon;

              return (
                <StaggerItem key={addon.id}>
                <button
                  onClick={() => toggleAddon(addon.id)}
                  className={`
                    relative w-full text-left rounded-2xl p-6 transition-all duration-300 group
                    ${isSelected
                      ? 'bg-gradient-to-br from-slate-900 to-slate-800 shadow-xl shadow-gold-500/10 ring-2 ring-gold-500/50 -translate-y-1'
                      : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg hover:-translate-y-1'
                    }
                  `}
                >
                  {/* Checkbox indicator */}
                  <div className={`
                    absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200
                    ${isSelected
                      ? 'bg-gradient-to-br from-gold-500 to-purple-500 text-white shadow-md'
                      : 'border-2 border-gray-300 group-hover:border-gray-400'
                    }
                  `}>
                    {isSelected && <Check size={14} strokeWidth={3} />}
                  </div>

                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors duration-200 ${isSelected ? 'bg-gold-500/20' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                    <Icon size={22} className={isSelected ? 'text-gold-400' : 'text-gray-500'} />
                  </div>

                  {/* Text */}
                  <h3 className={`font-bold text-base mb-1 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                    {addon.name}
                  </h3>
                  <p className={`text-sm mb-4 ${isSelected ? 'text-white/60' : 'text-gray-500'}`}>
                    {addon.description}
                  </p>

                  {/* Price */}
                  <div className={`text-2xl font-black ${isSelected ? 'text-gold-400' : 'text-gray-900'}`}>
                    +${addon.price}
                  </div>
                </button>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          {/* Total & Checkout - bold dark card */}
          <AnimatePresence>
          {selectedAddons.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="mt-8 relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 p-8 shadow-2xl">
              {/* Accent glow */}
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gold-500/15 blur-3xl" />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <p className="text-sm font-medium text-white/50 mb-2">
                    {selectedAddons.size} item{selectedAddons.size > 1 ? 's' : ''} selected
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white">
                      ${customTotal.toLocaleString()}
                    </span>
                    <span className="text-lg text-white/50">
                      total
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleCustomCheckout}
                  disabled={isCheckingOut}
                  className="py-3.5 px-8 rounded-xl font-semibold text-base transition-all duration-300 bg-white text-gray-900 hover:bg-white/90 shadow-lg shadow-gold-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckingOut ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={18} className="animate-spin" /> Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Start for ${customDeposit} <ArrowRight size={18} />
                    </span>
                  )}
                </button>
              </div>
              <p className="text-sm text-white/40 mt-4">
                50% deposit to start, remainder on delivery
              </p>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </section>

      {/* ================================================================== */}
      {/* CONSULTATION CTA - Bold dark treatment */}
      {/* ================================================================== */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
          <RevealSection>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950 p-10 md:p-16 shadow-2xl">
            {/* Accent glows */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
            {/* Watermark */}
            <div className="absolute -bottom-4 -right-2 text-[8rem] font-black text-white/[0.03] leading-none select-none pointer-events-none">?</div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-10">
              <div className="max-w-lg">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-purple-400" />
                  <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">Free Consultation</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                  Not sure<br />what you need?
                </h2>
                <p className="text-lg text-slate-400 leading-relaxed">
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
                <p className="text-sm text-slate-500">
                  15, 30, or 45 minute sessions
                </p>
              </div>
            </div>
          </div>
          </RevealSection>
        </div>
      </section>

      {/* ================================================================== */}
      {/* QUOTE AUTHORIZATION SECTION - Dark background */}
      {/* ================================================================== */}
      {success ? (
        <section ref={quoteAuthRef} id="quote-authorization" className="py-16 scroll-mt-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="text-center mb-8">
              <div className={`inline-block p-4 ${accentColors.green.bg} rounded-full mb-4`}>
                <svg className={`w-10 h-10 ${featureCardColors.success.icon}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                You&apos;re All Set!
              </h2>
              <p className={`text-lg ${formInputColors.helper}`}>
                We&apos;ve received your deposit and we&apos;re excited to get started.
              </p>
            </div>

            <Card hoverEffect="none" className="mb-8">
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  What Happens Next
                </h3>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 ${accentColors.green.bg} rounded-full flex items-center justify-center`}>
                      <span className={`${stepBadgeColors.green} font-semibold`}>1</span>
                    </div>
                    <div>
                      <h4 className={`font-semibold ${headingColors.primary}`}>Confirmation Email</h4>
                      <p className={formInputColors.helper}>
                        Check your inbox for a receipt and project details.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 ${accentColors.blue.bg} rounded-full flex items-center justify-center`}>
                      <span className={`${stepBadgeColors.blue} font-semibold`}>2</span>
                    </div>
                    <div>
                      <h4 className={`font-semibold ${headingColors.primary}`}>We Get to Work</h4>
                      <p className={formInputColors.helper}>
                        Your project moves to the front of our queue and work begins.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 ${accentColors.purple.bg} rounded-full flex items-center justify-center`}>
                      <span className={`${stepBadgeColors.purple} font-semibold`}>3</span>
                    </div>
                    <div>
                      <h4 className={`font-semibold ${headingColors.primary}`}>Stay in Touch</h4>
                      <p className={formInputColors.helper}>
                        We&apos;ll keep you updated on progress and reach out with any questions.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 ${accentColors.gold.bg} rounded-full flex items-center justify-center`}>
                      <span className={`${stepBadgeColors.gold} font-semibold`}>4</span>
                    </div>
                    <div>
                      <h4 className={`font-semibold ${headingColors.primary}`}>Review & Delivery</h4>
                      <p className={formInputColors.helper}>
                        Once complete, you&apos;ll review the work. Final 50% is due upon approval.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="text-center">
              <Button variant="blue" href="/">
                Back to Home
              </Button>
            </div>
          </div>
        </section>
      ) : (
        <section ref={quoteAuthRef} id="quote-authorization" className="scroll-mt-8 relative overflow-hidden rounded-3xl">
          {/* Dark gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-green-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-20">
            {/* Editorial header on dark bg */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-1 rounded-full bg-gradient-to-r from-gold-400 to-emerald-400" />
                <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">Authorize</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
                Already have a quote?
              </h2>
              <p className="text-lg text-slate-400 max-w-lg">
                Authorize your project and pay your deposit to get started.
              </p>
            </div>

            {/* Authorization Form or Payment Form */}
            <Card hoverEffect="none" id="authorize" className="mb-8">
              {clientSecret && authorizedQuote ? (
                // Show payment form after authorization
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Pay Your Deposit
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Hi {authorizedQuote.customerName.split(' ')[0]}! Your quote is ready. Pay your 50% deposit to get started.
                  </p>

                  {/* Quote Summary */}
                  <div className={`mb-6 p-4 ${accentColors.blue.bg} rounded-lg`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={headingColors.secondary}>Quote Reference</span>
                      <span className={`font-mono font-semibold ${headingColors.primary}`}>{authorizedQuote.referenceNumber}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className={headingColors.secondary}>Total Project</span>
                      <span className={headingColors.primary}>{formatCurrency(authorizedQuote.totalAmount)}</span>
                    </div>
                    <div className={`flex justify-between items-center pt-2 border-t ${accentColors.blue.border}`}>
                      <span className={`font-semibold ${headingColors.primary}`}>Deposit Due Today</span>
                      <span className={`text-xl font-bold ${accentColors.green.text}`}>{formatCurrency(authorizedQuote.depositAmount)}</span>
                    </div>
                  </div>

                  {/* Stripe Payment Form */}
                  <StripeElementsWrapper clientSecret={clientSecret}>
                    <PaymentForm
                      onSuccess={handlePaymentSuccess}
                      onError={(err) => setError(err)}
                      returnUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/pricing#quote-authorization`}
                      submitText={`Pay ${formatCurrency(authorizedQuote.depositAmount)} Deposit`}
                      processingText="Processing payment..."
                    />
                  </StripeElementsWrapper>

                  {/* Back button */}
                  <button
                    type="button"
                    onClick={() => {
                      setClientSecret(null);
                      setAuthorizedQuote(null);
                    }}
                    className={`mt-4 w-full text-center text-sm ${mutedTextColors.light} hover:underline`}
                  >
                    ← Use a different quote
                  </button>
                </div>
              ) : (
                // Show authorization form
                <form onSubmit={handleSubmit} className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Authorize Your Quote
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Enter your quote reference and email to access your quote and pay your deposit.
                  </p>

                  {error && (
                    <div className={`mb-6 p-4 ${alertColors.error.bg} ${alertColors.error.border} rounded-lg`}>
                      <p className={`text-sm ${alertColors.error.text}`}>{error}</p>
                    </div>
                  )}

                  <div className="space-y-5 mb-8 max-w-sm mx-auto">
                    <div>
                      <label htmlFor="quoteRef" className={`block text-sm font-semibold mb-2.5 ${formInputColors.label}`}>
                        Quote Reference
                      </label>
                      <input
                        type="text"
                        id="quoteRef"
                        autoComplete="off"
                        value={quoteRef}
                        onChange={(e) => setQuoteRef(e.target.value)}
                        placeholder="e.g., NTD-010126-1430"
                        className={`w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white/50 backdrop-blur-sm transition-all focus:outline-none focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-100 ${formInputColors.placeholder}`}
                      />
                      <p className={`mt-2 text-xs ${formInputColors.helper}`}>
                        You'll find this in your quote email
                      </p>
                    </div>

                    <div>
                      <label htmlFor="email" className={`block text-sm font-semibold mb-2.5 ${formInputColors.label}`}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className={`w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white/50 backdrop-blur-sm transition-all focus:outline-none focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-100 ${formInputColors.placeholder}`}
                      />
                      <p className={`mt-2 text-xs ${formInputColors.helper}`}>
                        The email address on your quote
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      variant="purple"
                      type="submit"
                      disabled={isProcessing}
                      size="lg"
                      className="min-w-56"
                    >
                      {isProcessing ? 'Authorizing...' : 'Authorize Quote'}
                    </Button>
                  </div>

                  <p className={`mt-4 text-center text-sm ${mutedTextColors.light}`}>
                    Your information is secure. We use industry-standard encryption.
                  </p>
                </form>
              )}
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
