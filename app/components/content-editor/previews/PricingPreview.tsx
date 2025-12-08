import PricingCard from '@/components/PricingCard';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import CircleBadge from '@/components/CircleBadge';
import type { PricingPageContent } from '@/lib/page-content-types';

// ============================================================================
// Pricing Preview Component
// ============================================================================
// What: Renders the Pricing page with provided content (not fetched)
// Why: Used in the content editor to show live preview of changes
// How: Same structure as the actual Pricing page, but takes content as props

interface PricingPreviewProps {
  content: PricingPageContent;
}

export default function PricingPreview({ content }: PricingPreviewProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header */}
      <PageHeader
        title={content.header.title}
        description={content.header.description}
      />

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {content.tiers.map((tier, index) => (
          <div key={index}>
            <PricingCard {...tier} />
          </div>
        ))}
      </div>

      {/* Payment Structure Note */}
      {content.paymentNote.enabled && (
        <Card hoverColor="green" hoverEffect="glow" className="mb-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center sm:text-left">
            <div className="flex items-center gap-4">
              <CircleBadge text={content.paymentNote.depositPercent} color="green" size="md" shape="pill" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {content.paymentNote.depositLabel}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {content.paymentNote.depositDescription}
                </p>
              </div>
            </div>
            <div className="hidden sm:block w-8 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center gap-4">
              <CircleBadge text={content.paymentNote.deliveryPercent} color="blue" size="md" shape="pill" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {content.paymentNote.deliveryLabel}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {content.paymentNote.deliveryDescription}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Custom Section */}
      <Card hoverColor={content.customSection.hoverColor || 'orange'} hoverEffect="glow">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {content.customSection.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
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
