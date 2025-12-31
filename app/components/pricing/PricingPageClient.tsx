'use client';

import PricingCard from '@/components/PricingCard';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import CircleBadge from '@/components/CircleBadge';
import { EditableSection, EditableItem, SortableItemsWrapper } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import type { PricingPageContent } from '@/lib/page-content-types';
import { formInputColors, headingColors, dividerColors, accentColors, accentBorderWidth } from '@/lib/colors';

// ============================================================================
// Pricing Page Client - Universal Editing Version
// ============================================================================
// Uses universal content loading from InlineEditProvider.
// EditableSection/EditableItem wrappers provide click-to-select functionality.

interface PricingPageClientProps {
  content: PricingPageContent;
}

export default function PricingPageClient({ content: initialContent }: PricingPageClientProps) {
  // Use content from universal provider (auto-loaded by route)
  const { pageContent } = useInlineEdit();
  // Check that pageContent has expected structure before using it
  const hasValidContent = pageContent && 'tiers' in pageContent && 'header' in pageContent;
  const content = hasValidContent ? (pageContent as unknown as PricingPageContent) : initialContent;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header */}
      <EditableSection sectionKey="header" label="Page Header">
        <PageHeader
          title={content.header.title}
          description={content.header.description}
        />
      </EditableSection>

      {/* Pricing Cards */}
      <EditableSection sectionKey="tiers" label="Pricing Tiers">
        <SortableItemsWrapper
          sectionKey="tiers"
          arrayField="tiers"
          itemIds={content.tiers.map((_, i) => `tier-${i}`)}
          className="grid md:grid-cols-3 gap-6 mb-8"
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
              >
                <div className={`opacity-0 translate-x-[-30px] motion-reduce:opacity-100 motion-reduce:translate-x-0 ${delayClass}`}>
                  <PricingCard {...tier} />
                </div>
              </EditableItem>
            );
          })}
        </SortableItemsWrapper>
      </EditableSection>

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
                <span className="text-green-600 dark:text-green-400" aria-hidden="true">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Free, no obligation</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600 dark:text-green-400" aria-hidden="true">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Response in 2 business days</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600 dark:text-green-400" aria-hidden="true">✓</span>
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
                <span className="text-purple-600 dark:text-purple-400" aria-hidden="true">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Expert guidance and advice</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-600 dark:text-purple-400" aria-hidden="true">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Immediate scheduling</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-600 dark:text-purple-400" aria-hidden="true">✓</span>
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
    </div>
  );
}
