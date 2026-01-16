'use client';

import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import Button from '@/components/Button';
import PaymentForm from '@/components/PaymentForm';
import { StripeElementsWrapper } from '@/context/StripeContext';
import { EditableSection, EditableItem, SortableItemsWrapper } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import type { GetStartedPageContent } from '@/lib/page-content-types';
import {
  accentColors,
  formInputColors,
  featureCardColors,
  stepBadgeColors,
  mutedTextColors,
  headingColors,
  alertColors,
} from '@/lib/colors';
import { FileText, Video, Check, Sparkles } from 'lucide-react';

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

// ============================================================================
// Get Started Page Client - Universal Editing Version
// ============================================================================
// Uses universal content loading from InlineEditProvider.
// EditableSection wrappers provide click-to-select functionality.

interface GetStartedPageClientProps {
  content: GetStartedPageContent;
}

export default function GetStartedPageClient({ content: initialContent }: GetStartedPageClientProps) {
  // Use content from universal provider (auto-loaded by route)
  const { pageContent } = useInlineEdit();
  // Check that pageContent has expected structure before using it
  const hasValidContent = pageContent && 'paths' in pageContent && 'header' in pageContent;
  const content = hasValidContent ? (pageContent as unknown as GetStartedPageContent) : initialContent;

  // Form state
  const [quoteRef, setQuoteRef] = useState('');
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Quote authorization state
  const [authorizedQuote, setAuthorizedQuote] = useState<AuthorizedQuote | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

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

  // ============================================================================
  // Success State
  // ============================================================================
  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-12">
        <div className="text-center mb-8">
          <div className={`inline-block p-4 ${accentColors.green.bg} rounded-full mb-4`}>
            <svg className={`w-10 h-10 ${featureCardColors.success.icon}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            You&apos;re All Set!
          </h1>
          <p className={`text-lg ${formInputColors.helper}`}>
            We&apos;ve received your deposit and we&apos;re excited to get started.
          </p>
        </div>

        <Card hoverEffect="none" className="mb-8">
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              What Happens Next
            </h2>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className={`flex-shrink-0 w-8 h-8 ${accentColors.green.bg} rounded-full flex items-center justify-center`}>
                  <span className={`${stepBadgeColors.green} font-semibold`}>1</span>
                </div>
                <div>
                  <h3 className={`font-semibold ${headingColors.primary}`}>Confirmation Email</h3>
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
                  <h3 className={`font-semibold ${headingColors.primary}`}>We Get to Work</h3>
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
                  <h3 className={`font-semibold ${headingColors.primary}`}>Stay in Touch</h3>
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
                  <h3 className={`font-semibold ${headingColors.primary}`}>Review & Delivery</h3>
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
    );
  }

  // ============================================================================
  // Path Icons Configuration
  // ============================================================================
  const pathIcons = [FileText, Video];
  const pathIconColors = [
    { bg: 'bg-gradient-to-br from-green-500 to-emerald-600', text: 'text-white' },
    { bg: 'bg-gradient-to-br from-purple-500 to-violet-600', text: 'text-white' },
  ];

  // ============================================================================
  // Main Page Content
  // ============================================================================
  return (
    <div className="min-h-screen">
      {/* ================================================================
          Hero Section - Centered gradient like homepage
          ================================================================ */}
      <section className="py-16 md:py-20">
        {/* Gradient container: full-width on mobile, centered on desktop */}
        <div className="relative overflow-hidden py-8 md:max-w-5xl md:mx-auto">
          {/* Gradient orbs - left color → white middle → right color */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-amber-100 to-gold-100 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-green-100 to-teal-100 blur-2xl" />

          {/* Content - always has padding */}
          <div className="relative z-10 px-4 sm:px-6 md:px-8">
            <EditableSection sectionKey="header" label="Page Header">
              <PageHeader
                title={content.header.title}
                description={content.header.description}
                color="gold"
              />
            </EditableSection>
          </div>
        </div>
      </section>

      {/* ================================================================
          Path Options Section - Separate from hero
          ================================================================ */}
      <section className="pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Two Main Paths - Premium Card Design */}
          <EditableSection sectionKey="paths" label="Path Options">
            <SortableItemsWrapper
              sectionKey="paths"
              arrayField="paths"
              itemIds={content.paths.map((_, i) => `path-${i}`)}
              className="grid md:grid-cols-2 gap-8"
            >
              {content.paths.map((path, index) => {
                const IconComponent = pathIcons[index] || Sparkles;
                const iconStyle = pathIconColors[index] || pathIconColors[0];

                return (
                  <EditableItem
                    key={`path-${index}`}
                    sectionKey="paths"
                    arrayField="paths"
                    index={index}
                    label={path.title}
                    content={path as unknown as Record<string, unknown>}
                    sortable
                    sortId={`path-${index}`}
                  >
                    <div className="group h-full">
                      <div className={`
                        h-full flex flex-col
                        bg-white dark:bg-gray-900
                        rounded-2xl overflow-hidden
                        border-2 border-gray-100 dark:border-gray-800
                        shadow-lg hover:shadow-xl
                        transition-all duration-300
                        hover:-translate-y-1
                      `}>
                        {/* Colored Top Accent Bar */}
                        <div className={`h-1.5 ${index === 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-purple-500 to-violet-500'}`} />

                        <div className="p-8 flex flex-col flex-grow">
                          {/* Icon + Badge Row */}
                          <div className="flex items-center justify-between mb-6">
                            <div className={`w-14 h-14 rounded-xl ${iconStyle.bg} flex items-center justify-center shadow-lg`}>
                              <IconComponent className={`w-7 h-7 ${iconStyle.text}`} />
                            </div>
                            <span className={`
                              px-4 py-1.5 rounded-full text-sm font-bold
                              ${index === 0 ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}
                            `}>
                              {path.badge}
                            </span>
                          </div>

                          {/* Title + Description */}
                          <h2 className={`text-2xl font-bold ${headingColors.primary} mb-3`}>
                            {path.title}
                          </h2>
                          <p className={`${headingColors.secondary} mb-6`}>
                            {path.description}
                          </p>

                          {/* Features List with Premium Checkmarks */}
                          <ul className="space-y-3 mb-8 flex-grow">
                            {path.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <div className={`
                                  flex-shrink-0 w-5 h-5 rounded-full mt-0.5
                                  flex items-center justify-center
                                  ${index === 0 ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}
                                `}>
                                  <Check className="w-3 h-3" strokeWidth={3} />
                                </div>
                                <span className={headingColors.secondary}>{feature}</span>
                              </li>
                            ))}
                          </ul>

                          {/* CTA Button */}
                          <Button
                            variant={path.button.variant}
                            href={path.button.href}
                            size="lg"
                            className="w-full"
                          >
                            {path.button.text}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </EditableItem>
                );
              })}
            </SortableItemsWrapper>
          </EditableSection>
        </div>
      </section>

      {/* ================================================================
          Quote Authorization Section - Dark background for contrast
          ================================================================ */}
      <section className="relative overflow-hidden">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-green-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-20">
          {/* Already Have a Quote Section */}
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              {content.quoteSection.title}
            </h3>
            <p className="text-slate-300 text-lg max-w-xl mx-auto">
              {content.quoteSection.description}
            </p>
          </div>

          {/* Authorization Form or Payment Form */}
          <Card hoverEffect="none" id="authorize" className="mb-8">
        {clientSecret && authorizedQuote ? (
          // Show payment form after authorization
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Pay Your Deposit
            </h2>
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
                returnUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/get-started?payment=success`}
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {content.authForm.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {content.authForm.description}
            </p>

            {error && (
              <div className={`mb-6 p-4 ${alertColors.error.bg} ${alertColors.error.border} rounded-lg`}>
                <p className={`text-sm ${alertColors.error.text}`}>{error}</p>
              </div>
            )}

            <div className="space-y-4 mb-6 max-w-sm mx-auto">
              <div>
                <label htmlFor="quoteRef" className={`block text-sm font-medium mb-2 ${formInputColors.label}`}>
                  {content.authForm.quoteRefLabel}
                </label>
                <input
                  type="text"
                  id="quoteRef"
                  autoComplete="off"
                  value={quoteRef}
                  onChange={(e) => setQuoteRef(e.target.value)}
                  placeholder={content.authForm.quoteRefPlaceholder}
                  className={`w-full px-4 py-3 border rounded-lg ${formInputColors.base} ${formInputColors.placeholder} ${formInputColors.focus}`}
                />
                <p className={`mt-1 text-sm ${formInputColors.helper}`}>
                  {content.authForm.quoteRefHelper}
                </p>
              </div>

              <div>
                <label htmlFor="email" className={`block text-sm font-medium mb-2 ${formInputColors.label}`}>
                  {content.authForm.emailLabel}
                </label>
                <input
                  type="email"
                  id="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={content.authForm.emailPlaceholder}
                  className={`w-full px-4 py-3 border rounded-lg ${formInputColors.base} ${formInputColors.placeholder} ${formInputColors.focus}`}
                />
                <p className={`mt-1 text-sm ${formInputColors.helper}`}>
                  {content.authForm.emailHelper}
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
                {isProcessing ? content.authForm.processingText : content.authForm.submitButton}
              </Button>
            </div>

            <p className={`mt-4 text-center text-sm ${mutedTextColors.light}`}>
              {content.authForm.securityNote}
            </p>
          </form>
        )}
          </Card>
        </div>
      </section>
    </div>
  );
}
