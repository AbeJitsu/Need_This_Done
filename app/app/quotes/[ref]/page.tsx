'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { containerBg, headingColors, mutedTextColors, formInputColors, alertColors, dividerColors } from '@/lib/colors';

// ============================================================================
// Quote Authorization Page - /quotes/[ref]
// ============================================================================
// What: Customer-facing page to authorize quote and pay deposit
// Why: Converts quotes to paid projects (revenue flow)
// How: Look up quote by reference, collect email, show payment form

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Quote {
  id: string;
  referenceNumber: string;
  customerName: string;
  totalAmount: number;
  depositAmount: number;
  lineItems: Array<{ description: string; amount: number }>;
  expiresAt: string;
}

interface QuoteAuthState {
  step: 'lookup' | 'payment' | 'success' | 'error';
  email: string;
  quote: Quote | null;
  clientSecret: string | null;
  paymentIntentId: string | null;
  error: string | null;
  loading: boolean;
}

// ============================================================================
// Payment Form Component (inside Elements provider)
// ============================================================================
function PaymentForm({
  quote,
  onSuccess
}: {
  quote: Quote;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/quotes/${quote.referenceNumber}/success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setPaymentError(error.message || 'Payment failed');
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      <div className={`p-4 rounded-lg ${formInputColors.bg} border ${formInputColors.border}`}>
        <h3 className={`text-lg font-semibold mb-3 ${headingColors.base}`}>
          Deposit Amount
        </h3>
        <div className="flex justify-between items-center">
          <span className={mutedTextColors.normal}>50% Deposit to Start</span>
          <span className={`text-2xl font-bold ${headingColors.base}`}>
            {formatCurrency(quote.depositAmount)}
          </span>
        </div>
        <div className={`mt-3 pt-3 border-t ${dividerColors.base}`}>
          <div className="flex justify-between text-sm">
            <span className={mutedTextColors.normal}>Total Project Cost</span>
            <span className={mutedTextColors.normal}>{formatCurrency(quote.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className={mutedTextColors.normal}>Balance Due on Completion</span>
            <span className={mutedTextColors.normal}>
              {formatCurrency(quote.totalAmount - quote.depositAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Element */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${headingColors.base}`}>
          Payment Information
        </label>
        <PaymentElement />
      </div>

      {/* Payment Error */}
      {paymentError && (
        <div className={`p-4 rounded-lg ${alertColors.error.bg} border ${alertColors.error.border}`}>
          <p className={alertColors.error.text}>{paymentError}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="green"
        size="lg"
        disabled={!stripe || isProcessing}
        isLoading={isProcessing}
        loadingText="Processing Payment..."
        className="w-full"
      >
        {isProcessing ? 'Processing...' : `Pay ${formatCurrency(quote.depositAmount)} Deposit`}
      </Button>

      <p className={`text-xs text-center ${mutedTextColors.dim}`}>
        Your payment is secure and encrypted. You'll receive a confirmation email after payment.
      </p>
    </form>
  );
}

// ============================================================================
// Main Quote Authorization Component
// ============================================================================
export default function QuoteAuthorizationPage() {
  const params = useParams();
  const quoteRef = params?.ref as string;

  const [state, setState] = useState<QuoteAuthState>({
    step: 'lookup',
    email: '',
    quote: null,
    clientSecret: null,
    paymentIntentId: null,
    error: null,
    loading: false,
  });

  // Auto-load from URL hash if present (e.g., /quotes/QT-001?email=user@example.com)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const emailParam = urlParams.get('email');
      if (emailParam) {
        setState(prev => ({ ...prev, email: emailParam }));
      }
    }
  }, []);

  // ========================================================================
  // Step 1: Look up quote and authorize payment
  // ========================================================================
  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/quotes/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteRef: quoteRef.toUpperCase(),
          email: state.email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to authorize quote');
      }

      setState(prev => ({
        ...prev,
        step: 'payment',
        quote: data.quote,
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load quote',
        loading: false,
      }));
    }
  };

  // ========================================================================
  // Step 3: Handle successful payment
  // ========================================================================
  const handlePaymentSuccess = () => {
    setState(prev => ({ ...prev, step: 'success' }));
  };

  // ========================================================================
  // Format helpers
  // ========================================================================
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // ========================================================================
  // Render: Step 1 - Email Lookup
  // ========================================================================
  if (state.step === 'lookup') {
    return (
      <div className={`min-h-screen py-16 ${containerBg}`}>
        <div className="max-w-xl mx-auto px-4">
          <Card>
            <div className="text-center mb-8">
              <h1 className={`text-3xl font-bold mb-2 ${headingColors.base}`}>
                Authorize Quote
              </h1>
              <p className={mutedTextColors.normal}>
                Reference: <span className="font-mono font-semibold">{quoteRef}</span>
              </p>
            </div>

            <form onSubmit={handleAuthorize} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className={`block text-sm font-medium mb-2 ${headingColors.base}`}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={state.email}
                  onChange={(e) => setState(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter the email the quote was sent to"
                  className={`w-full px-4 py-3 rounded-lg border ${formInputColors.border} ${formInputColors.bg} ${formInputColors.text} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors`}
                />
                <p className={`mt-2 text-sm ${mutedTextColors.dim}`}>
                  This must match the email address on your quote.
                </p>
              </div>

              {state.error && (
                <div className={`p-4 rounded-lg ${alertColors.error.bg} border ${alertColors.error.border}`}>
                  <p className={alertColors.error.text}>{state.error}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="blue"
                size="lg"
                disabled={state.loading || !state.email}
                isLoading={state.loading}
                loadingText="Verifying..."
                className="w-full"
              >
                Continue to Payment
              </Button>
            </form>

            <div className={`mt-6 pt-6 border-t ${dividerColors.base}`}>
              <p className={`text-sm ${mutedTextColors.dim}`}>
                <strong>Need help?</strong> Contact us at{' '}
                <a href="mailto:hello@needthisdone.com" className="text-blue-600 hover:underline">
                  hello@needthisdone.com
                </a>
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ========================================================================
  // Render: Step 2 - Payment Form
  // ========================================================================
  if (state.step === 'payment' && state.quote && state.clientSecret) {
    const expiresAt = new Date(state.quote.expiresAt);
    const isExpiringSoon = expiresAt.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000; // 7 days

    return (
      <div className={`min-h-screen py-16 ${containerBg}`}>
        <div className="max-w-3xl mx-auto px-4">
          <Card>
            {/* Header */}
            <div className="mb-8">
              <h1 className={`text-3xl font-bold mb-2 ${headingColors.base}`}>
                Pay Deposit to Start Project
              </h1>
              <p className={mutedTextColors.normal}>
                Quote {state.quote.referenceNumber} for {state.quote.customerName}
              </p>
            </div>

            {/* Expiration Warning */}
            {isExpiringSoon && (
              <div className={`mb-6 p-4 rounded-lg ${alertColors.warning.bg} border ${alertColors.warning.border}`}>
                <p className={alertColors.warning.text}>
                  <strong>Expires:</strong> {formatDate(state.quote.expiresAt)}
                </p>
              </div>
            )}

            {/* Line Items */}
            {state.quote.lineItems && state.quote.lineItems.length > 0 && (
              <div className="mb-8">
                <h2 className={`text-xl font-semibold mb-4 ${headingColors.base}`}>
                  Project Scope
                </h2>
                <div className={`rounded-lg border ${dividerColors.base} divide-y ${dividerColors.base}`}>
                  {state.quote.lineItems.map((item, index) => (
                    <div key={index} className="p-4 flex justify-between items-start">
                      <span className={mutedTextColors.normal}>{item.description}</span>
                      <span className={`font-semibold ${headingColors.base}`}>
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Form */}
            <Elements stripe={stripePromise} options={{ clientSecret: state.clientSecret }}>
              <PaymentForm quote={state.quote} onSuccess={handlePaymentSuccess} />
            </Elements>
          </Card>
        </div>
      </div>
    );
  }

  // ========================================================================
  // Render: Step 3 - Success
  // ========================================================================
  if (state.step === 'success' && state.quote) {
    return (
      <div className={`min-h-screen py-16 ${containerBg}`}>
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h1 className={`text-3xl font-bold mb-4 ${headingColors.base}`}>
                Payment Successful!
              </h1>

              <p className={`text-lg mb-8 ${mutedTextColors.normal}`}>
                Thank you for your deposit payment. We'll begin work on your project right away.
              </p>

              <div className={`p-6 rounded-lg ${formInputColors.bg} border ${formInputColors.border} mb-8`}>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={mutedTextColors.normal}>Quote Reference:</span>
                    <span className={`font-mono font-semibold ${headingColors.base}`}>
                      {state.quote.referenceNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={mutedTextColors.normal}>Deposit Paid:</span>
                    <span className={`font-semibold ${headingColors.base}`}>
                      {formatCurrency(state.quote.depositAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={mutedTextColors.normal}>Total Project Cost:</span>
                    <span className={mutedTextColors.normal}>
                      {formatCurrency(state.quote.totalAmount)}
                    </span>
                  </div>
                  <div className={`pt-3 border-t ${dividerColors.base} flex justify-between`}>
                    <span className={mutedTextColors.normal}>Balance Due on Completion:</span>
                    <span className={`font-semibold ${headingColors.base}`}>
                      {formatCurrency(state.quote.totalAmount - state.quote.depositAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className={`text-xl font-semibold ${headingColors.base}`}>What's Next?</h2>
                <ul className={`space-y-2 text-left ${mutedTextColors.normal}`}>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>You'll receive a confirmation email with your receipt</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>We'll contact you within 1 business day to schedule a kickoff call</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Balance payment will be due when the project is completed</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Button
                  variant="blue"
                  size="lg"
                  href="/"
                  className="inline-block"
                >
                  Return to Home
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Fallback loading state
  return (
    <div className={`min-h-screen flex items-center justify-center ${containerBg}`}>
      <p className={mutedTextColors.normal}>Loading...</p>
    </div>
  );
}
