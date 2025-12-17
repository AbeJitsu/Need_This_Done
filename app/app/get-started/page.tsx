'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import Button from '@/components/Button';
import CTASection from '@/components/CTASection';
import CircleBadge from '@/components/CircleBadge';
import { accentColors, formInputColors, featureCardColors, stepBadgeColors, mutedTextColors } from '@/lib/colors';

// ============================================================================
// Get Started Page - Deposit Authorization
// ============================================================================
// What: Page for customers to authorize work with a 50% deposit
// Why: After receiving a quote, customers come here to get started
// How: Simple form for quote reference and payment processing

export default function GetStartedPage() {
  const [quoteRef, setQuoteRef] = useState('');
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // ============================================================================
  // Handle Form Submission
  // ============================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!quoteRef.trim()) {
      setError('Please enter your quote reference number');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    try {
      setIsProcessing(true);

      // TODO: Integrate with payment processing
      // For now, simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccess(true);
    } catch (err) {
      setError('Something went wrong. Please try again or contact us directly.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ============================================================================
  // Success State
  // ============================================================================
  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-12">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-green-100 dark:bg-green-900 rounded-full mb-4">
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
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className={`${stepBadgeColors.green} font-semibold`}>1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Confirmation Email</h3>
                  <p className={formInputColors.helper}>
                    Check your inbox for a receipt and project details.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className={`${stepBadgeColors.blue} font-semibold`}>2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">We Get to Work</h3>
                  <p className={formInputColors.helper}>
                    Your project moves to the front of our queue and work begins.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <span className={`${stepBadgeColors.purple} font-semibold`}>3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Stay in Touch</h3>
                  <p className={formInputColors.helper}>
                    We&apos;ll keep you updated on progress and reach out with any questions.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                  <span className={`${stepBadgeColors.orange} font-semibold`}>4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Review & Delivery</h3>
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
  // Main Form
  // ============================================================================
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-12">
      <PageHeader
        title="Ready to Get Started?"
        description="You've received a quote and you're ready to move forward. Let's make it official."
      />

      {/* How It Works */}
      <Card hoverColor="green" hoverEffect="glow" className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 text-center">
          How Payment Works
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <div className="flex items-center gap-4">
            <CircleBadge text="50%" color="green" size="md" shape="pill" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">To Start</p>
              <p className={`text-sm ${formInputColors.helper}`}>Deposit to begin work</p>
            </div>
          </div>
          <div className="hidden sm:block w-8 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center gap-4">
            <CircleBadge text="50%" color="blue" size="md" shape="pill" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">On Delivery</p>
              <p className={`text-sm ${formInputColors.helper}`}>When you approve the work</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Authorization Form */}
      <Card hoverEffect="none" className="mb-8">
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Authorize Your Project
          </h2>

          {error && (
            <div className={`mb-6 p-4 ${accentColors.red.bg} border ${accentColors.red.border} rounded-lg`}>
              <p className={`text-sm ${accentColors.red.text}`}>{error}</p>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${formInputColors.label}`}>
                Quote Reference Number
              </label>
              <input
                type="text"
                value={quoteRef}
                onChange={(e) => setQuoteRef(e.target.value)}
                placeholder="e.g., QT-2024-001"
                className={`w-full px-4 py-3 border rounded-lg ${formInputColors.base} ${formInputColors.placeholder} ${formInputColors.focus}`}
              />
              <p className={`mt-1 text-sm ${formInputColors.helper}`}>
                You&apos;ll find this in your quote email
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${formInputColors.label}`}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={`w-full px-4 py-3 border rounded-lg ${formInputColors.base} ${formInputColors.placeholder} ${formInputColors.focus}`}
              />
              <p className={`mt-1 text-sm ${formInputColors.helper}`}>
                Use the same email from your quote request
              </p>
            </div>
          </div>

          <Button
            variant="green"
            type="submit"
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? 'Processing...' : 'Authorize & Pay Deposit'}
          </Button>

          <p className={`mt-4 text-center text-sm ${mutedTextColors.light}`}>
            Secure payment processing. Your information is protected.
          </p>
        </form>
      </Card>

      {/* Don't have a quote yet? */}
      <CTASection
        title="Don't have a quote yet?"
        description="No worries! Tell us about your project and we'll send you a personalized quote."
        buttons={[
          { text: 'Get a Quote', href: '/contact', variant: 'orange' },
          { text: 'See Our Pricing', href: '/pricing', variant: 'blue' },
        ]}
      />
    </div>
  );
}
