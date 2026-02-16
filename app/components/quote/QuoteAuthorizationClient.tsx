'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import PaymentForm from '@/components/PaymentForm';
import { StripeElementsWrapper } from '@/context/StripeContext';
import {
  headingColors,
  formInputColors,
  accentColors,
  stepBadgeColors,
  mutedTextColors,
  alertColors,
} from '@/lib/colors';

// ============================================================================
// Quote Authorization Client
// ============================================================================
// Extracted from UnifiedPricingPage to live at /quote.
// Handles: quote lookup by reference + email → Stripe deposit payment → success.

interface AuthorizedQuote {
  id: string;
  referenceNumber: string;
  customerName: string;
  totalAmount: number;
  depositAmount: number;
  lineItems: Array<{ description: string; amount: number }>;
  expiresAt: string;
}

export default function QuoteAuthorizationClient() {
  const [quoteRef, setQuoteRef] = useState('');
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [authorizedQuote, setAuthorizedQuote] = useState<AuthorizedQuote | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // ========================================================================
  // Format currency for display
  // ========================================================================
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  // ========================================================================
  // Handle Quote Authorization Form Submission
  // ========================================================================
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

      setAuthorizedQuote(data.quote);
      setClientSecret(data.clientSecret);
    } catch {
      setError("Hmm, something went wrong. Please try again or reach out to us - we're here to help.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ========================================================================
  // Handle Payment Success
  // ========================================================================
  const handlePaymentSuccess = async (paymentIntentId: string) => {
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

  // ========================================================================
  // Success State
  // ========================================================================
  if (success) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-16">
        <div className="text-center mb-8">
          <div className={`inline-block p-4 ${accentColors.green.bg} rounded-full mb-4`}>
            <svg className="w-10 h-10 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            You&apos;re All Set!
          </h2>
          <p className={`text-lg ${formInputColors.helper}`}>
            We&apos;ve received your deposit and we&apos;re excited to get started.
          </p>
        </div>

        <Card hoverEffect="none" className="mb-8">
          <div className="p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
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
    );
  }

  // ========================================================================
  // Authorization + Payment Form
  // ========================================================================
  return (
    <div className="relative overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-green-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-20">
        {/* Editorial header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-gold-400 to-emerald-400" />
            <span className="text-sm font-semibold tracking-widest uppercase text-white/95">Authorize</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
            Authorize your quote.
          </h1>
          <p className="text-lg text-white/90 max-w-lg leading-relaxed">
            Enter your reference number to review your quote and pay the 50% deposit to get started.
          </p>
        </div>

        {/* Authorization Form or Payment Form */}
        <Card hoverEffect="none" className="mb-8">
          {clientSecret && authorizedQuote ? (
            // Payment form after authorization
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Pay Your Deposit
              </h3>
              <p className="text-gray-600 mb-6">
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
                  returnUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/quote`}
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
                &larr; Use a different quote
              </button>
            </div>
          ) : (
            // Authorization form
            <form onSubmit={handleSubmit} className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Find Your Quote
              </h3>
              <p className="text-gray-600 mb-6">
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
    </div>
  );
}
