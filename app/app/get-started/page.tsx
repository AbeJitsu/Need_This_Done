'use client';

import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { accentColors, formInputColors, featureCardColors, stepBadgeColors, mutedTextColors, headingColors, checkmarkColors, alertColors } from '@/lib/colors';

// ============================================================================
// Get Started Page - Choose Your Path
// ============================================================================
// What: Page to help visitors choose their next step
// Why: Visitors may either want a quote or consultation, or already have a quote
// How: Two main path cards + authorization form for those with quotes

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
      setError('We need your quote reference number to get started');
      return;
    }

    if (!email.trim()) {
      setError('What\'s the email address on your quote?');
      return;
    }

    try {
      setIsProcessing(true);

      // TODO: Integrate with payment processing
      // For now, simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccess(true);
    } catch {
      setError('Hmm, something went wrong. Please try again or reach out to us - we\'re here to help.');
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
                <div className={`flex-shrink-0 w-8 h-8 ${accentColors.orange.bg} rounded-full flex items-center justify-center`}>
                  <span className={`${stepBadgeColors.orange} font-semibold`}>4</span>
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
  // Choose Your Path
  // ============================================================================
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-12">
      <PageHeader
        title="Ready to Get Started?"
        description="Choose the path that's right for you"
      />

      {/* Two Main Paths */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {/* Path 1: Get a Quote (FREE) */}
        <Card hoverColor="green" hoverEffect="lift" className="h-full">
          <div className="p-8 h-full grid grid-rows-[auto_auto_auto_1fr_auto]">
            <div className="pb-4">
              <span className={`inline-block px-4 py-1 ${accentColors.green.bg} ${accentColors.green.text} rounded-full text-sm font-semibold`}>
                Free
              </span>
            </div>
            <h2 className={`text-2xl font-bold ${headingColors.primary} pb-3`}>
              Get a Quote
            </h2>
            <p className={`${headingColors.secondary} pb-6`}>
              Tell us about your project and get a custom quote
            </p>
            <ul className="space-y-3 self-start">
              <li className="flex items-center gap-2">
                <span className={checkmarkColors.green.icon}>✓</span>
                <span className={headingColors.secondary}>Free, no obligation</span>
              </li>
              <li className="flex items-center gap-2">
                <span className={checkmarkColors.green.icon}>✓</span>
                <span className={headingColors.secondary}>Response in 2 business days</span>
              </li>
              <li className="flex items-center gap-2">
                <span className={checkmarkColors.green.icon}>✓</span>
                <span className={headingColors.secondary}>Custom pricing for your needs</span>
              </li>
            </ul>
            <Button variant="green" href="/contact" size="lg" className="w-full">
              Get a Quote
            </Button>
          </div>
        </Card>

        {/* Path 2: Book a Consultation (PAID) */}
        <Card hoverColor="purple" hoverEffect="lift" className="h-full">
          <div className="p-8 h-full grid grid-rows-[auto_auto_auto_1fr_auto]">
            <div className="pb-4">
              <span className={`inline-block px-4 py-1 ${accentColors.purple.bg} ${accentColors.purple.text} rounded-full text-sm font-semibold`}>
                Paid Service
              </span>
            </div>
            <h2 className={`text-2xl font-bold ${headingColors.primary} pb-3`}>
              Book a Consultation
            </h2>
            <p className={`${headingColors.secondary} pb-6`}>
              Talk to an expert before you start
            </p>
            <ul className="space-y-3 self-start">
              <li className="flex items-center gap-2">
                <span className={checkmarkColors.purple.icon}>✓</span>
                <span className={headingColors.secondary}>Expert guidance and advice</span>
              </li>
              <li className="flex items-center gap-2">
                <span className={checkmarkColors.purple.icon}>✓</span>
                <span className={headingColors.secondary}>Immediate scheduling</span>
              </li>
              <li className="flex items-center gap-2">
                <span className={checkmarkColors.purple.icon}>✓</span>
                <span className={headingColors.secondary}>Personalized recommendations</span>
              </li>
            </ul>
            <Button variant="purple" href="/shop" size="lg" className="w-full">
              Book a Consultation
            </Button>
          </div>
        </Card>
      </div>

      {/* Already Have a Quote - Simple divider */}
      <div className="text-center mb-10 py-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Already Have a Quote?
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Enter your quote details below to authorize your project.
        </p>
      </div>

      {/* Authorization Form */}
      <Card hoverEffect="none" id="authorize" className="mb-8">
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Let&apos;s Begin Your Project
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Enter your details and we&apos;ll process your deposit
          </p>

          {error && (
            <div className={`mb-6 p-4 ${alertColors.error.bg} ${alertColors.error.border} rounded-lg`}>
              <p className={`text-sm ${alertColors.error.text}`}>{error}</p>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="quoteRef" className={`block text-sm font-medium mb-2 ${formInputColors.label}`}>
                Quote Reference Number
              </label>
              <input
                type="text"
                id="quoteRef"
                autoComplete="off"
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
            {isProcessing ? 'Getting everything ready...' : 'Authorize & Pay Deposit'}
          </Button>

          <p className={`mt-4 text-center text-sm ${mutedTextColors.light}`}>
            Secure payment processing. Your information is protected.
          </p>
        </form>
      </Card>
    </div>
  );
}
