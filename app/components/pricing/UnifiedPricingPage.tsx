'use client';

import { useState, useRef } from 'react';
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
  ChevronDown,
} from 'lucide-react';
import Button from '@/components/Button';
import {
  headingColors,
  formInputColors,
  accentColors,
  cardBgColors,
  cardBorderColors,
} from '@/lib/colors';
import { accentText } from '@/lib/contrast';

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

  // Section refs for smooth scrolling
  const websitesRef = useRef<HTMLElement>(null);
  const automationRef = useRef<HTMLElement>(null);
  const customRef = useRef<HTMLElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  return (
    <div className="min-h-screen">
      {/* ================================================================== */}
      {/* HERO SECTION - Edge-to-edge on mobile, contained on desktop */}
      {/* ================================================================== */}
      <section className="py-8 md:py-12">
        {/* Gradient container - full width on mobile, contained on desktop */}
        <div className="relative overflow-hidden py-12 md:py-16 md:max-w-6xl md:mx-auto md:rounded-3xl">
            {/* Gradient orbs - purple/blue/cyan for warmth */}
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-purple-100 to-purple-100 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-blue-100 to-blue-100 blur-2xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-br from-gold-50 to-gold-50 blur-2xl opacity-60" />

            {/* Text container - always padded */}
            <div className="relative z-10 text-center px-4 sm:px-6 md:px-8">
              {/* Headline - bold, unified hero style */}
              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${headingColors.primary} mb-4 animate-slide-up`}>
                Simple Pricing
              </h1>
              <p className={`text-xl ${formInputColors.helper} max-w-2xl mx-auto mb-10 animate-slide-up animate-delay-100`}>
                Pick a package or build exactly what you need. No hidden fees.
              </p>

              {/* Quick navigation cards - BJJ belt progression: green → blue → purple → gold */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto animate-slide-up animate-delay-200">
                <button
                  onClick={() => scrollToSection(websitesRef)}
                  className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-400 hover:border-green-300 hover:shadow-lg transition-all"
                >
                  <Globe size={24} className={`${accentColors.green.text} group-hover:scale-110 transition-transform`} />
                  <span className={`font-medium ${headingColors.primary}`}>Websites</span>
                  <span className={`text-sm ${accentColors.green.text}`}>from $500</span>
                </button>

                <button
                  onClick={() => scrollToSection(automationRef)}
                  className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-400 hover:border-blue-300 hover:shadow-lg transition-all"
                >
                  <Zap size={24} className={`${accentColors.blue.text} group-hover:scale-110 transition-transform`} />
                  <span className={`font-medium ${headingColors.primary}`}>Automation</span>
                  <span className={`text-sm ${accentColors.blue.text}`}>$150/workflow</span>
                </button>

                <button
                  onClick={() => scrollToSection(automationRef)}
                  className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-400 hover:border-purple-300 hover:shadow-lg transition-all"
                >
                  <Bot size={24} className={`${accentColors.purple.text} group-hover:scale-110 transition-transform`} />
                  <span className={`font-medium ${headingColors.primary}`}>AI Agents</span>
                  <span className={`text-sm ${accentColors.purple.text}`}>$500/month</span>
                </button>

                <button
                  onClick={() => scrollToSection(customRef)}
                  className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-400 hover:border-gold-300 hover:shadow-lg transition-all"
                >
                  <Puzzle size={24} className={`${accentColors.gold.text} group-hover:scale-110 transition-transform`} />
                  <span className={`font-medium ${headingColors.primary}`}>Custom</span>
                  <span className={`text-sm ${accentColors.gold.text}`}>you decide</span>
                </button>
              </div>

              {/* Scroll hint */}
              <div className="mt-8 animate-bounce">
                <ChevronDown size={24} className="mx-auto text-gray-400" />
              </div>
            </div>
          </div>
      </section>

      {/* ================================================================== */}
      {/* WEBSITES SECTION */}
      {/* ================================================================== */}
      <section ref={websitesRef} id="websites" className="py-16 scroll-mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <h2 className={`text-sm font-semibold uppercase tracking-wider ${formInputColors.helper} mb-6`}>
            Packages
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {PACKAGES.map((pkg, index) => {
              const isLoading = checkingOutPackage === pkg.id;

              return (
                <div
                  key={pkg.id}
                  className={`
                    relative ${cardBgColors.base} rounded-2xl border transition-all
                    p-8 hover:shadow-lg
                    ${pkg.popular ? 'ring-2 ring-blue-200' : cardBorderColors.subtle}
                    animate-slide-up animate-delay-${(index + 1) * 100}
                  `}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-6">
                      <span className={`${accentColors.blue.bg} ${accentColors.blue.text} text-xs font-medium px-3 py-1 rounded-full`}>
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className={`text-2xl font-bold ${accentColors[pkg.color].titleText} mb-1`}>
                      {pkg.name}
                    </h3>
                    <div className={`text-3xl font-bold ${headingColors.primary}`}>
                      ${pkg.price.toLocaleString()}
                      <span className={`text-base font-normal ${formInputColors.helper} ml-2`}>
                        one-time
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <Check size={18} className={accentColors[pkg.color].text} strokeWidth={2.5} />
                        <span className={formInputColors.helper}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePackageCheckout(pkg.id, pkg.price)}
                    disabled={checkingOutPackage !== null}
                    className={`
                      w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2
                      ${pkg.color === 'blue'
                        ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl
                    `}
                  >
                    {isLoading ? (
                      <><Loader2 size={18} className="animate-spin" /> Processing...</>
                    ) : (
                      <>Start for ${pkg.deposit} <ArrowRight size={18} /></>
                    )}
                  </button>
                  <p className={`text-center text-sm ${formInputColors.helper} mt-2`}>
                    50% deposit, remainder on delivery
                  </p>
                </div>
              );
            })}
          </div>

          {checkoutError && (
            <p className="mt-4 text-center text-red-600">{checkoutError}</p>
          )}
        </div>
      </section>

      {/* ================================================================== */}
      {/* AUTOMATION & AI SECTION */}
      {/* ================================================================== */}
      <section ref={automationRef} id="automation" className="py-16 scroll-mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <h2 className={`text-sm font-semibold uppercase tracking-wider ${formInputColors.helper} mb-6`}>
            Automation & AI
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Automation */}
            <div className={`${cardBgColors.base} rounded-2xl border ${cardBorderColors.subtle} p-8 hover:shadow-lg transition-all`}>
              <div className={`w-12 h-12 rounded-xl ${accentColors.purple.bg} flex items-center justify-center mb-4`}>
                <Zap size={24} className={accentColors.purple.text} />
              </div>
              <h3 className={`text-2xl font-bold ${accentColors.purple.titleText} mb-1`}>
                Automation Setup
              </h3>
              <p className={`${formInputColors.helper} mb-4`}>
                Connect your tools. Stop doing repetitive work.
              </p>
              <div className="mb-6">
                <span className={`text-3xl font-bold ${headingColors.primary}`}>$150</span>
                <span className={`text-sm ${formInputColors.helper} ml-2`}>per workflow</span>
              </div>
              <Button variant="purple" href="/contact#consultation" className="w-full">
                Book a Call
              </Button>
            </div>

            {/* Managed AI */}
            <div className={`${cardBgColors.base} rounded-2xl border ${cardBorderColors.subtle} p-8 hover:shadow-lg transition-all`}>
              <div className={`w-12 h-12 rounded-xl ${accentColors.gold.bg} flex items-center justify-center mb-4`}>
                <Bot size={24} className={accentColors.gold.text} />
              </div>
              <h3 className={`text-2xl font-bold ${accentColors.gold.titleText} mb-1`}>
                Managed AI
              </h3>
              <p className={`${formInputColors.helper} mb-4`}>
                AI agents that work while you sleep.
              </p>
              <div className="mb-6">
                <span className={`text-3xl font-bold ${headingColors.primary}`}>$500</span>
                <span className={`text-sm ${formInputColors.helper} ml-2`}>per month</span>
              </div>
              <Button variant="gold" href="/contact#consultation" className="w-full">
                Book a Call
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* CUSTOM BUILD SECTION - Like shop page "Add-ons" */}
      {/* ================================================================== */}
      <section ref={customRef} id="custom" className="py-16 scroll-mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <h2 className={`text-sm font-semibold uppercase tracking-wider ${formInputColors.helper} mb-6`}>
            Build Your Own
          </h2>

          {/* Add-ons list - clean table style like shop page */}
          <div className={`${cardBgColors.base} rounded-2xl border ${cardBorderColors.subtle} divide-y ${cardBorderColors.subtle} overflow-hidden`}>
            {ADDONS.map((addon, index) => {
              const isSelected = selectedAddons.has(addon.id);
              const Icon = addon.icon;

              return (
                <button
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  className={`
                    w-full flex items-center justify-between p-5 text-left transition-colors
                    ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                    ${index === 0 ? 'rounded-t-2xl' : ''}
                    ${index === ADDONS.length - 1 ? 'rounded-b-2xl' : ''}
                  `}
                >
                  <div className="flex items-center gap-4">
                    {/* Checkbox */}
                    <div className={`
                      w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors
                      ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-400'}
                    `}>
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>

                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <Icon size={20} className={isSelected ? accentText.blue : 'text-gray-500'} />
                    </div>

                    {/* Text */}
                    <div>
                      <h3 className={`font-semibold ${headingColors.primary}`}>
                        {addon.name}
                      </h3>
                      <p className={`text-sm ${formInputColors.helper}`}>
                        {addon.description}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className={`text-xl font-bold ${isSelected ? accentColors.blue.text : accentColors.purple.text} whitespace-nowrap ml-4`}>
                    ${addon.price}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Total & Checkout - appears when items selected */}
          {selectedAddons.size > 0 && (
            <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-purple-50 via-white to-blue-50 border border-gray-400 animate-slide-up">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className={`text-sm ${formInputColors.helper} mb-1`}>
                    {selectedAddons.size} item{selectedAddons.size > 1 ? 's' : ''} selected
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold ${headingColors.primary}`}>
                      ${customTotal.toLocaleString()}
                    </span>
                    <span className={`${formInputColors.helper}`}>
                      total
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleCustomCheckout}
                  disabled={isCheckingOut}
                  className="
                    px-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2
                    bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600
                    text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-100
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  {isCheckingOut ? (
                    <><Loader2 size={18} className="animate-spin" /> Processing...</>
                  ) : (
                    <>Start for ${customDeposit} <ArrowRight size={18} /></>
                  )}
                </button>
              </div>
              <p className={`text-sm ${formInputColors.helper} mt-3`}>
                50% deposit to start, remainder on delivery
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ================================================================== */}
      {/* CONSULTATION CTA - At bottom, warm dark section */}
      {/* ================================================================== */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 via-white to-blue-50 border border-gray-400 p-8 md:p-12 text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-100/50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />

            <div className="relative">
              <h2 className={`text-2xl md:text-3xl font-bold ${headingColors.primary} mb-3`}>
                Not sure what you need?
              </h2>
              <p className={`text-lg ${formInputColors.helper} mb-8 max-w-xl mx-auto`}>
                Book a free consultation. We&apos;ll help you figure out the right solution — no pressure.
              </p>

              <a
                href="/contact#consultation"
                className={`
                  inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold
                  ${accentColors.purple.bg} ${accentColors.purple.text} border ${accentColors.purple.border}
                  hover:scale-105 transition-transform shadow-lg shadow-purple-500/20
                `}
              >
                <Calendar size={20} />
                Book a Free Consultation
              </a>

              <p className={`text-sm ${formInputColors.helper} mt-6`}>
                15, 30, or 45 minute sessions • No commitment required
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
