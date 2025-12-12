import PricingCard from '@/components/PricingCard';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import CircleBadge from '@/components/CircleBadge';
import { getDefaultPricingContent } from '@/lib/default-page-content';
import type { PricingPageContent } from '@/lib/page-content-types';
import { formInputColors, headingColors, dividerColors } from '@/lib/colors';

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
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
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
  return getDefaultPricingContent();
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

        {/* Payment Structure Note */}
        {content.paymentNote.enabled && (
          <Card hoverColor="green" hoverEffect="glow" className="mb-10">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center sm:text-left">
              <div className="flex items-center gap-4">
                <CircleBadge text={content.paymentNote.depositPercent} color="green" size="md" shape="pill" />
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
                <CircleBadge text={content.paymentNote.deliveryPercent} color="blue" size="md" shape="pill" />
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

        {/* Custom Tasks + FAQ */}
        <Card hoverColor={content.customSection.hoverColor || 'orange'} hoverEffect="glow">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className={`text-2xl font-bold ${headingColors.primary} mb-4`}>
              {content.customSection.title}
            </h2>
            <p className={`${formInputColors.helper} mb-6`}>
              {content.customSection.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {content.customSection.buttons.map((button, index) => (
                <Button key={index} variant={button.variant} href={button.href}>
                  {button.text}
                </Button>
              ))}
            </div>
          </div>
        </Card>
    </div>
  );
}
