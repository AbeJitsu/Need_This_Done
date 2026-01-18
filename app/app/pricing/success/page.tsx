import { Metadata } from 'next';
import { accentText } from '@/lib/contrast';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Mail } from 'lucide-react';
import { getStripe } from '@/lib/stripe';
import {
  headingColors,
  formInputColors,
  accentColors,
  cardBgColors,
  cardBorderColors,
} from '@/lib/colors';

// ============================================================================
// Pricing Success Page - Deposit Confirmation
// ============================================================================
// What: Confirmation page after successful deposit payment
// Why: Confirms the order and sets expectations for next steps
// How: Retrieves session from Stripe and displays order details

export const metadata: Metadata = {
  title: 'Deposit Received - NeedThisDone',
  description: 'Your deposit has been received. We\'ll be in touch within 24 hours.',
};

// Feature display names
const FEATURE_NAMES: Record<string, string> = {
  'additional-page': 'Additional Page',
  'blog-setup': 'Blog Setup',
  'contact-form-files': 'File Upload Form',
  'calendar-booking': 'Calendar Booking',
  'payment-integration': 'Payment Integration',
  'cms-integration': 'CMS Integration',
};

// Package definitions
const PACKAGES: Record<string, { name: string; features: string[] }> = {
  'launch-site': {
    name: 'Launch Site',
    features: ['3-5 pages', 'Custom design', 'Mobile responsive', 'Contact form', 'Basic SEO', '30 days support'],
  },
  'growth-site': {
    name: 'Growth Site',
    features: ['5-8 pages', 'Blog with CMS', 'Content editing', 'Enhanced SEO', 'Analytics setup', '60 days support'],
  },
};

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function PricingSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const sessionId = params.session_id;

  // Fetch session details from Stripe
  let session = null;
  let orderType: 'package' | 'custom' = 'custom';
  let packageId = '';
  let packageName = '';
  let features: string[] = [];
  let depositAmount = 0;
  let remainingAmount = 0;
  let customerEmail = '';

  if (sessionId) {
    try {
      const stripe = getStripe();
      session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.metadata) {
        orderType = session.metadata.type === 'package' ? 'package' : 'custom';
        packageId = session.metadata.package_id || '';
        depositAmount = parseInt(session.metadata.deposit_cents || '0', 10);
        remainingAmount = parseInt(session.metadata.remaining_cents || '0', 10);
        customerEmail = session.metadata.customer_email || session.customer_email || '';

        if (orderType === 'package' && packageId && PACKAGES[packageId]) {
          packageName = PACKAGES[packageId].name;
          features = PACKAGES[packageId].features;
        } else {
          features = session.metadata.features?.split(',').filter(Boolean) || [];
        }
      }
    } catch (error) {
      console.error('Failed to retrieve session:', error);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-16">
      {/* Success Icon */}
      <div className="text-center mb-8 animate-slide-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
          <CheckCircle2 size={40} className={accentText.emerald} />
        </div>
        <h1 className={`text-3xl md:text-4xl font-bold ${headingColors.primary} mb-3`}>
          Deposit Received!
        </h1>
        <p className={`text-lg ${formInputColors.helper}`}>
          Thank you for your payment. We&apos;re excited to build your site.
        </p>
      </div>

      {/* Order Summary */}
      {session && (
        <div className={`${cardBgColors.base} rounded-2xl border ${cardBorderColors.subtle} p-6 mb-8 animate-slide-up animate-delay-100`}>
          <h2 className={`text-lg font-semibold ${headingColors.primary} mb-4`}>
            Order Summary
          </h2>

          {/* Package name if applicable */}
          {orderType === 'package' && packageName && (
            <div className="mb-4">
              <p className={`text-sm font-medium ${formInputColors.helper} mb-1`}>
                Package
              </p>
              <p className={`text-lg font-semibold ${headingColors.primary}`}>
                {packageName}
              </p>
            </div>
          )}

          {/* Features */}
          {features.length > 0 && (
            <div className="mb-4">
              <p className={`text-sm font-medium ${formInputColors.helper} mb-2`}>
                {orderType === 'package' ? 'Included:' : 'Features included:'}
              </p>
              <ul className="space-y-1">
                {features.map((feature) => (
                  <li key={feature} className={`text-sm ${headingColors.primary}`}>
                    • {FEATURE_NAMES[feature] || feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Payment breakdown */}
          <div className={`border-t ${cardBorderColors.subtle} pt-4 mt-4`}>
            <div className="flex justify-between mb-2">
              <span className={formInputColors.helper}>Deposit paid</span>
              <span className={`font-semibold ${accentColors.green.text}`}>
                ${(depositAmount / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={formInputColors.helper}>Due on delivery</span>
              <span className={`font-semibold ${headingColors.primary}`}>
                ${(remainingAmount / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* What's Next */}
      <div className={`${cardBgColors.base} rounded-2xl border ${cardBorderColors.subtle} p-6 mb-8 animate-slide-up animate-delay-200`}>
        <h2 className={`text-lg font-semibold ${headingColors.primary} mb-4`}>
          What happens next?
        </h2>
        <ol className="space-y-4">
          <li className="flex gap-4">
            <span className={`flex-shrink-0 w-7 h-7 rounded-full ${accentColors.blue.bg} ${accentColors.blue.text} flex items-center justify-center text-sm font-semibold`}>
              1
            </span>
            <div>
              <p className={`font-medium ${headingColors.primary}`}>
                We&apos;ll reach out within 24 hours
              </p>
              <p className={`text-sm ${formInputColors.helper}`}>
                To discuss your project details and timeline.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className={`flex-shrink-0 w-7 h-7 rounded-full ${accentColors.blue.bg} ${accentColors.blue.text} flex items-center justify-center text-sm font-semibold`}>
              2
            </span>
            <div>
              <p className={`font-medium ${headingColors.primary}`}>
                Development begins
              </p>
              <p className={`text-sm ${formInputColors.helper}`}>
                We&apos;ll share progress and gather feedback along the way.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className={`flex-shrink-0 w-7 h-7 rounded-full ${accentColors.blue.bg} ${accentColors.blue.text} flex items-center justify-center text-sm font-semibold`}>
              3
            </span>
            <div>
              <p className={`font-medium ${headingColors.primary}`}>
                Final delivery & remaining payment
              </p>
              <p className={`text-sm ${formInputColors.helper}`}>
                Once you&apos;re happy with everything, we&apos;ll collect the remaining balance.
              </p>
            </div>
          </li>
        </ol>
      </div>

      {/* Confirmation email note */}
      {customerEmail && (
        <div className={`flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 mb-8 animate-slide-up animate-delay-300`}>
          <Mail size={20} className={accentColors.blue.text} />
          <p className={`text-sm ${headingColors.primary}`}>
            A confirmation email has been sent to <strong>{customerEmail}</strong>
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="text-center animate-slide-up animate-delay-400">
        <Link
          href="/"
          className={`inline-flex items-center gap-2 ${accentColors.blue.text} hover:underline font-medium`}
        >
          Return to homepage
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
