'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  FileText,
  PenTool,
  Upload,
  Calendar,
  CreditCard,
  Edit3,
  Loader2,
  ArrowRight,
  Zap,
  Bot,
} from 'lucide-react';
import Button from '@/components/Button';
import {
  headingColors,
  formInputColors,
  accentColors,
  cardBgColors,
  cardBorderColors,
} from '@/lib/colors';

// ============================================================================
// Unified Pricing Page - All Services with Checkout
// ============================================================================
// Single page for all pricing:
// - Website packages (Launch/Growth) with 50% deposit checkout
// - Automation and Managed AI (book a call)
// - Custom build configurator with checkout

// ============================================================================
// Data Definitions
// ============================================================================

interface Package {
  id: string;
  name: string;
  price: number;
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
  { id: 'additional-page', name: 'Additional Page', price: 100, description: 'Add another page', icon: FileText },
  { id: 'blog-setup', name: 'Blog Setup', price: 300, description: 'Full blog with SEO', icon: PenTool },
  { id: 'contact-form-files', name: 'File Upload Form', price: 150, description: 'Accept attachments', icon: Upload },
  { id: 'calendar-booking', name: 'Calendar Booking', price: 200, description: 'Scheduling integration', icon: Calendar },
  { id: 'payment-integration', name: 'Payments', price: 400, description: 'Stripe integration', icon: CreditCard },
  { id: 'cms-integration', name: 'CMS', price: 500, description: 'Edit content yourself', icon: Edit3 },
];

// ============================================================================
// Component
// ============================================================================

export default function UnifiedPricingPage() {
  const [email, setEmail] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkingOutPackage, setCheckingOutPackage] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState('');

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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

  // Package checkout
  const handlePackageCheckout = async (packageId: string, price: number) => {
    if (!isValidEmail) return;
    setCheckingOutPackage(packageId);
    setCheckoutError('');

    try {
      const response = await fetch('/api/stripe/create-build-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'package', packageId, total: price, email }),
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
    if (!isValidEmail || selectedAddons.size === 0) return;
    setIsCheckingOut(true);
    setCheckoutError('');

    try {
      const response = await fetch('/api/stripe/create-build-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'custom', features: Array.from(selectedAddons), total: customTotal, email }),
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-8 animate-slide-up">
        <h1 className={`text-4xl md:text-5xl font-bold ${headingColors.primary} mb-4`}>
          Simple Pricing
        </h1>
        <p className={`text-xl ${formInputColors.helper} max-w-2xl mx-auto`}>
          Pick a service. Pay 50% to start. No surprises.
        </p>
      </div>

      {/* Email Input */}
      <div className="max-w-md mx-auto mb-12 animate-slide-up animate-delay-100">
        <label className={`block text-sm font-medium ${formInputColors.helper} mb-2 text-center`}>
          Enter your email to get started
        </label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`
            w-full px-4 py-3 rounded-xl border text-center transition-colors text-lg
            ${formInputColors.bg} ${formInputColors.text}
            ${email && !isValidEmail ? 'border-red-300' : `${cardBorderColors.subtle} focus:border-blue-400`}
            focus:outline-none focus:ring-2 focus:ring-blue-500/20
          `}
        />
        {checkoutError && (
          <p className="mt-2 text-sm text-red-600 text-center">{checkoutError}</p>
        )}
      </div>

      {/* ================================================================== */}
      {/* WEBSITES Section */}
      {/* ================================================================== */}
      <section className="mb-16 animate-slide-up animate-delay-200">
        <h2 className={`text-sm font-semibold uppercase tracking-wider ${formInputColors.helper} mb-6`}>
          Websites
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {PACKAGES.map((pkg) => {
            const deposit = Math.round(pkg.price / 2);
            const isLoading = checkingOutPackage === pkg.id;

            return (
              <div
                key={pkg.id}
                className={`
                  relative ${cardBgColors.base} rounded-2xl border ${cardBorderColors.subtle}
                  p-8 transition-all hover:shadow-lg
                  ${pkg.popular ? 'ring-2 ring-blue-500' : ''}
                `}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-6">
                    <span className={`${accentColors.blue.bg} ${accentColors.blue.text} text-xs font-medium px-3 py-1 rounded-full`}>
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className={`text-2xl font-bold ${accentColors[pkg.color].titleText} mb-1`}>
                  {pkg.name}
                </h3>
                <p className={`${formInputColors.helper} mb-4`}>{pkg.description}</p>

                <div className="mb-6">
                  <span className={`text-4xl font-bold ${headingColors.primary}`}>
                    ${pkg.price.toLocaleString()}
                  </span>
                </div>

                <ul className="space-y-2 mb-6">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check size={16} className={accentColors[pkg.color].text} />
                      <span className={`text-sm ${formInputColors.helper}`}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePackageCheckout(pkg.id, pkg.price)}
                  disabled={!isValidEmail || checkingOutPackage !== null}
                  className={`
                    w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2
                    ${isValidEmail && !checkingOutPackage
                      ? pkg.color === 'blue'
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {isLoading ? (
                    <><Loader2 size={18} className="animate-spin" /> Processing...</>
                  ) : (
                    <>Pay ${deposit} to Start <ArrowRight size={18} /></>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================================== */}
      {/* AUTOMATION & AI Section */}
      {/* ================================================================== */}
      <section className="mb-16 animate-slide-up animate-delay-300">
        <h2 className={`text-sm font-semibold uppercase tracking-wider ${formInputColors.helper} mb-6`}>
          Automation & AI
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Automation */}
          <div className={`${cardBgColors.base} rounded-2xl border ${cardBorderColors.subtle} p-8`}>
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
            <Button variant="purple" href="/contact" className="w-full">
              Book a Call
            </Button>
          </div>

          {/* Managed AI */}
          <div className={`${cardBgColors.base} rounded-2xl border ${cardBorderColors.subtle} p-8`}>
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
            <Button variant="gold" href="/contact" className="w-full">
              Book a Call
            </Button>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* CUSTOM BUILD Section */}
      {/* ================================================================== */}
      <section className="animate-slide-up animate-delay-400">
        <h2 className={`text-sm font-semibold uppercase tracking-wider ${formInputColors.helper} mb-6`}>
          Need Something Custom?
        </h2>

        <div className={`${cardBgColors.base} rounded-2xl border ${cardBorderColors.subtle} p-8`}>
          <p className={`${formInputColors.helper} mb-6`}>
            Build exactly what you need with add-ons:
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {ADDONS.map((addon) => {
              const isSelected = selectedAddons.has(addon.id);
              const Icon = addon.icon;

              return (
                <button
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  className={`
                    flex items-center gap-3 p-4 rounded-xl border text-left transition-all
                    ${isSelected
                      ? 'bg-gray-50 border-gray-400 dark:bg-gray-800'
                      : `bg-white dark:bg-gray-800 ${cardBorderColors.subtle} hover:border-gray-300`
                    }
                  `}
                >
                  <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${isSelected ? 'bg-gray-800 border-gray-800 text-white' : 'border-gray-300'}
                  `}>
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                  <Icon size={18} className="text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <span className={`font-medium ${headingColors.primary}`}>{addon.name}</span>
                  </div>
                  <span className={`font-semibold ${headingColors.primary}`}>
                    ${addon.price}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom Total - only show when addons selected */}
          {selectedAddons.size > 0 && (
            <div className={`flex items-center justify-between mt-6 p-6 rounded-xl bg-gray-50 dark:bg-gray-800 border ${cardBorderColors.subtle}`}>
              <div>
                <span className={`text-lg ${formInputColors.helper}`}>Total: </span>
                <span className={`text-3xl font-bold ${headingColors.primary}`}>${customTotal}</span>
                <span className={`text-sm ${formInputColors.helper} ml-3`}>
                  (${customDeposit} deposit to start)
                </span>
              </div>
              <button
                onClick={handleCustomCheckout}
                disabled={!isValidEmail || isCheckingOut}
                className={`
                  px-8 py-4 rounded-xl font-semibold transition-all flex items-center gap-2
                  ${isValidEmail && !isCheckingOut
                    ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isCheckingOut ? (
                  <><Loader2 size={18} className="animate-spin" /> Processing...</>
                ) : (
                  <>Pay ${customDeposit} to Start <ArrowRight size={18} /></>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Bottom Note */}
      <p className={`text-center mt-12 ${formInputColors.helper}`}>
        Questions?{' '}
        <Link href="/contact" className={`${accentColors.blue.text} hover:underline font-medium`}>
          Book a free consultation
        </Link>
        {' '}— no commitment required.
      </p>
    </div>
  );
}
