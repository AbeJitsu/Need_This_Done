import PricingCard from '@/components/PricingCard';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import CircleBadge from '@/components/CircleBadge';
import { getDefaultContent } from '@/lib/default-page-content';
import type { PricingPageContent } from '@/lib/page-content-types';
import { formInputColors, headingColors, dividerColors, accentColors, accentBorderWidth } from '@/lib/colors';

export const dynamic = 'force-dynamic';

// ============================================================================
// Pricing Page - Service Pricing Tiers
// ============================================================================
// Displays pricing options for different service levels.
// Content is fetched from the database (if customized) or uses defaults.

export const metadata = {
  title: 'Pricing - NeedThisDone',
  description: 'Pick your perfect fit. Every project is different, so here\'s a starting point.',
};

// ============================================================================
// Content Fetching
// ============================================================================

async function getContent(): Promise<PricingPageContent> {
  try {
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/page-content/pricing`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (response.ok) {
      const data = await response.json();
      return data.content as PricingPageContent;
    }
  } catch (error) {
    console.error('Failed to fetch pricing content:', error);
  }

  // Fallback to defaults
  return getDefaultContent('pricing') as PricingPageContent;
}

// ============================================================================
// Page Component
// ============================================================================

export default async function PricingPage() {
  const content = await getContent();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">

        {/* Header */}
        <PageHeader
          title={content.header.title}
          description={content.header.description}
        />

        {/* Pricing Cards - staggered animation on load */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {content.tiers.map((tier, index) => {
            const delayClass = index === 0 ? 'motion-safe:animate-fade-in'
              : index === 1 ? 'motion-safe:animate-fade-in-delay-100'
              : 'motion-safe:animate-fade-in-delay-200';
            return (
              <div key={index} className={`opacity-0 translate-x-[-30px] motion-reduce:opacity-100 motion-reduce:translate-x-0 ${delayClass}`}>
                <PricingCard {...tier} />
              </div>
            );
          })}
        </div>

        {/* Choose Your Path - Two clear options */}
        <div className="text-center mb-8">
          <h2 className={`text-2xl font-bold ${headingColors.primary} mb-3`}>
            Ready to Move Forward?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            You&apos;ve seen what we offer. Pick the path that feels right for you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Path 1: Get a Quote (FREE) */}
          <Card hoverColor="green" hoverEffect="lift" className="h-full">
            <div className="p-8 h-full flex flex-col">
              <div className="mb-4">
                <span className={`inline-block px-4 py-1 ${accentColors.green.bg} ${accentColors.green.text} ${accentColors.green.border} ${accentBorderWidth} rounded-full text-sm font-semibold`}>
                  Free
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                Get a Quote
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Tell us about your project and get a custom quote
              </p>
              <ul className="space-y-3 mb-6 flex-grow">
                <li className="flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">Free, no obligation</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">Response in 2 business days</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">Custom pricing for your needs</span>
                </li>
              </ul>
              <Button variant="green" href="/contact" size="lg" className="w-full">
                Get a Quote
              </Button>
            </div>
          </Card>

          {/* Path 2: Book a Consultation (PAID) */}
          <Card hoverColor="purple" hoverEffect="lift" className="h-full">
            <div className="p-8 h-full flex flex-col">
              <div className="mb-4">
                <span className={`inline-block px-4 py-1 ${accentColors.purple.bg} ${accentColors.purple.text} ${accentColors.purple.border} ${accentBorderWidth} rounded-full text-sm font-semibold`}>
                  Expert Help
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                Book a Consultation
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Talk to an expert before you start
              </p>
              <ul className="space-y-3 mb-6 flex-grow">
                <li className="flex items-center gap-2">
                  <span className="text-purple-600 dark:text-purple-400">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">Expert guidance and advice</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-600 dark:text-purple-400">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">Immediate scheduling</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-600 dark:text-purple-400">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">Personalized recommendations</span>
                </li>
              </ul>
              <Button variant="purple" href="/shop" size="lg" className="w-full">
                Book a Consultation
              </Button>
            </div>
          </Card>
        </div>

        {/* Payment Structure Note */}
        {content.paymentNote.enabled && (
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
        )}

    </div>
  );
}
