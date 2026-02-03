'use client';

import { useState } from 'react';
import PricingCard from '@/components/PricingCard';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import CircleBadge from '@/components/CircleBadge';
import PaymentForm from '@/components/PaymentForm';
import { StripeElementsWrapper } from '@/context/StripeContext';
import { EditableSection, EditableItem, SortableItemsWrapper } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import type { PricingPageContent, AccentVariant } from '@/lib/page-content-types';
import { formInputColors, headingColors, dividerColors, accentColors, accentBorderWidth, checkmarkColors, featureCardColors, stepBadgeColors, mutedTextColors, alertColors } from '@/lib/colors';
import { scrollToId } from '@/lib/scroll-utils';

// ============================================================================
// Pricing Page Client - Universal Editing Version
// ============================================================================
// Uses universal content loading from InlineEditProvider.
// EditableSection/EditableItem wrappers provide click-to-select functionality.

// Quote data returned from authorization API
interface AuthorizedQuote {
  id: string;
  referenceNumber: string;
  customerName: string;
  totalAmount: number;
  depositAmount: number;
  lineItems: Array<{ description: string; amount: number }>;
  expiresAt: string;
}

interface PricingPageClientProps {
  content: PricingPageContent;
}

export default function PricingPageClient({ content: initialContent }: PricingPageClientProps) {
  // Use content from universal provider (auto-loaded by route)
  const { pageContent } = useInlineEdit();
  // Check that pageContent has expected structure and non-null values before using it
  const hasValidContent = pageContent &&
    'tiers' in pageContent && pageContent.tiers != null &&
    'header' in pageContent && pageContent.header != null &&
    'ctaPaths' in pageContent && pageContent.ctaPaths != null &&
    'ctaSection' in pageContent && pageContent.ctaSection != null;
  const content = hasValidContent ? (pageContent as unknown as PricingPageContent) : initialContent;

  // ============================================================================
  // Quote Authorization State
  // ============================================================================
  const [quoteRef, setQuoteRef] = useState('');
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [authorizedQuote, setAuthorizedQuote] = useState<AuthorizedQuote | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // ============================================================================
  // Scroll Helper for Quick Navigation
  // ============================================================================
  // Uses scrollToId utility which respects prefers-reduced-motion preference
  const scrollTo = (id: string) => scrollToId(id, { block: 'start' });

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header */}
      {content.header && (
        <EditableSection sectionKey="header" label="Page Header">
          <PageHeader
            title={content.header.title}
            description={content.header.description}
            color="purple"
          />
        </EditableSection>
      )}

      {/* Quick Navigation Pills */}
      <div className="sticky top-20 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 py-4 mb-12 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8">
        <div className="flex gap-2 justify-center flex-wrap">
          <button
            onClick={() => scrollTo('packages')}
            className="px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-medium transition-colors text-sm"
          >
            Packages
          </button>
          <button
            onClick={() => scrollTo('build-your-own')}
            className="px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-medium transition-colors text-sm"
          >
            Build Your Own
          </button>
          <button
            onClick={() => scrollTo('services')}
            className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium transition-colors text-sm"
          >
            Services
          </button>
          <button
            onClick={() => scrollTo('custom')}
            className="px-4 py-2 rounded-full bg-gold-100 text-gold-700 hover:bg-gold-200 font-medium transition-colors text-sm"
          >
            Custom
          </button>
          <button
            onClick={() => scrollTo('quote-authorization')}
            className="px-4 py-2 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 font-medium transition-colors text-sm"
          >
            Have a Quote?
          </button>
        </div>
      </div>

      {/* Pricing Cards - Website Packages Section */}
      <div id="packages" className="scroll-mt-24">
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold ${headingColors.primary} mb-3`}>
            Ready to Go Packages
          </h2>
          <p className={`${formInputColors.helper}`}>
            Purchase a website package online right now
          </p>
        </div>
        <EditableSection sectionKey="tiers" label="Pricing Tiers">
          <SortableItemsWrapper
          sectionKey="tiers"
          arrayField="tiers"
          itemIds={content.tiers.map((_, i) => `tier-${i}`)}
          className="grid md:grid-cols-3 gap-6 mb-8 items-stretch"
        >
          {content.tiers.map((tier, index) => {
            const delayClass = index === 0 ? 'motion-safe:animate-fade-in'
              : index === 1 ? 'motion-safe:animate-fade-in-delay-100'
              : 'motion-safe:animate-fade-in-delay-200';
            return (
              <EditableItem
                key={`tier-${index}`}
                sectionKey="tiers"
                arrayField="tiers"
                index={index}
                label={tier.name}
                content={tier as unknown as Record<string, unknown>}
                sortable
                sortId={`tier-${index}`}
                className="h-full"
              >
                <div className={`h-full opacity-0 translate-x-[-30px] motion-reduce:opacity-100 motion-reduce:translate-x-0 ${delayClass}`}>
                  <PricingCard {...tier} />
                </div>
              </EditableItem>
            );
          })}
        </SortableItemsWrapper>
        </EditableSection>
      </div>

      {/* Section Divider */}
      <div className="my-16 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

      {/* Build Your Own Section */}
      <div id="build-your-own" className="scroll-mt-24 mb-16">
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold ${headingColors.primary} mb-3`}>
            Build Your Own Package
          </h2>
          <p className={`${formInputColors.helper}`}>
            Customize your website with add-ons
          </p>
        </div>
      </div>

      {/* Section Divider */}
      <div className="my-16 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

      {/* Choose Your Path - CTA Section Header (Services) */}
      <div id="services" className="scroll-mt-24">
        {content.ctaSection && (
          <EditableSection sectionKey="ctaSection" label="CTA Section">
            <div className="text-center mb-8">
              <h2 className={`text-3xl font-bold ${headingColors.primary} mb-3`}>
                Ongoing Services
              </h2>
              <p className={`${formInputColors.helper} max-w-2xl mx-auto`}>
                Let's discuss your service needs
              </p>
            </div>
          </EditableSection>
        )}
      </div>

      {/* Section Divider */}
      <div className="my-16 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

      {/* Custom Work Section */}
      <div id="custom" className="scroll-mt-24">
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold ${headingColors.primary} mb-3`}>
            Need Something Different?
          </h2>
          <p className={`${formInputColors.helper}`}>
            Explore custom solutions and consultations
          </p>
        </div>

        {/* CTA Path Cards */}
        {content.ctaPaths && content.ctaPaths.length > 0 && (
        <EditableSection sectionKey="ctaPaths" label="CTA Paths">
        <SortableItemsWrapper
          sectionKey="ctaPaths"
          arrayField="ctaPaths"
          itemIds={content.ctaPaths.map((_, i) => `path-${i}`)}
          className="grid md:grid-cols-2 gap-6 mb-10 items-stretch"
        >
          {content.ctaPaths.map((path, index) => {
            const colorKey = path.hoverColor as keyof typeof checkmarkColors;
            const checkmarkClass = checkmarkColors[colorKey]?.icon || checkmarkColors.green.icon;

            return (
              <EditableItem
                key={`path-${index}`}
                sectionKey="ctaPaths"
                arrayField="ctaPaths"
                index={index}
                label={path.title}
                content={path as unknown as Record<string, unknown>}
                sortable
                sortId={`path-${index}`}
                className="h-full"
              >
                <Card hoverColor={path.hoverColor} hoverEffect="lift" className="h-full">
                  <div className="p-8 h-full flex flex-col">
                    <div className="mb-4">
                      <span className={`inline-block px-4 py-1 ${accentColors[path.hoverColor as AccentVariant].bg} ${accentColors[path.hoverColor as AccentVariant].text} ${accentColors[path.hoverColor as AccentVariant].border} ${accentBorderWidth} rounded-full text-sm font-semibold`}>
                        {path.badge}
                      </span>
                    </div>
                    <h3 className={`text-2xl font-bold ${headingColors.primary} mb-3`}>
                      {path.title}
                    </h3>
                    <p className={`${formInputColors.helper} mb-6`}>
                      {path.description}
                    </p>
                    <ul className="space-y-3 mb-6 flex-grow">
                      {path.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <span className={checkmarkClass} aria-hidden="true">✓</span>
                          <span className={headingColors.secondary}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={path.button.variant}
                      href={path.button.href}
                      size="lg"
                      className="w-full"
                    >
                      {path.button.text}
                    </Button>
                  </div>
                </Card>
              </EditableItem>
            );
          })}
        </SortableItemsWrapper>
      </EditableSection>
      )}
      </div>

      {/* Payment Structure Note */}
      {content.paymentNote?.enabled && (
        <EditableSection sectionKey="paymentNote" label="Payment Structure">
          <Card hoverColor="purple" hoverEffect="glow" className="mb-10">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center sm:text-left">
              <div className="flex items-center gap-4">
                <CircleBadge text={content.paymentNote.depositPercent} color="purple" size="md" shape="pill" />
                <div>
                  <p className={`font-semibold ${headingColors.primary}`}>
                    {content.paymentNote.depositLabel}
                  </p>
                  <p className={`text-sm ${formInputColors.helper}`}>
                    {content.paymentNote.depositDescription}
                  </p>
                </div>
              </div>
              <div className={`hidden sm:block w-8 h-0.5 ${dividerColors.subtle}`}></div>
              <div className="flex items-center gap-4">
                <CircleBadge text={content.paymentNote.deliveryPercent} color="green" size="md" shape="pill" />
                <div>
                  <p className={`font-semibold ${headingColors.primary}`}>
                    {content.paymentNote.deliveryLabel}
                  </p>
                  <p className={`text-sm ${formInputColors.helper}`}>
                    {content.paymentNote.deliveryDescription}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </EditableSection>
      )}

      {/* Section Divider */}
      <div className="my-16 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

      {/* Quote Authorization Section - Dark background */}
      {success ? (
        <div id="quote-authorization" className="scroll-mt-24">
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
      ) : (
        <section id="quote-authorization" className="scroll-mt-24 relative overflow-hidden rounded-3xl">
          {/* Dark gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-green-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

          <div className="relative py-16 md:py-20">
            {/* Already Have a Quote Section */}
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Already Received a Quote?
              </h2>
              <p className="text-slate-300 text-lg max-w-xl mx-auto">
                Authorize your project and pay your deposit below
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

                  <div className="space-y-4 mb-6 max-w-sm mx-auto">
                    <div>
                      <label htmlFor="quoteRef" className={`block text-sm font-medium mb-2 ${formInputColors.label}`}>
                        Quote Reference
                      </label>
                      <input
                        type="text"
                        id="quoteRef"
                        autoComplete="off"
                        value={quoteRef}
                        onChange={(e) => setQuoteRef(e.target.value)}
                        placeholder="e.g., NTD-010126-1430"
                        className={`w-full px-4 py-3 border rounded-lg ${formInputColors.base} ${formInputColors.placeholder} ${formInputColors.focus}`}
                      />
                      <p className={`mt-1 text-sm ${formInputColors.helper}`}>
                        You'll find this in your quote email
                      </p>
                    </div>

                    <div>
                      <label htmlFor="email" className={`block text-sm font-medium mb-2 ${formInputColors.label}`}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className={`w-full px-4 py-3 border rounded-lg ${formInputColors.base} ${formInputColors.placeholder} ${formInputColors.focus}`}
                      />
                      <p className={`mt-1 text-sm ${formInputColors.helper}`}>
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
