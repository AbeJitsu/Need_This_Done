'use client';

import { useEffect } from 'react';
import PricingCard from '@/components/PricingCard';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import CircleBadge from '@/components/CircleBadge';
import { EditableSection, EditableItem } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import { getDefaultContent } from '@/lib/default-page-content';
import type { PricingPageContent } from '@/lib/page-content-types';
import { formInputColors, headingColors, dividerColors, accentColors, accentBorderWidth } from '@/lib/colors';

// ============================================================================
// Pricing Page Client Component - Renders pricing page with inline editing
// ============================================================================

interface PricingPageClientProps {
  content: PricingPageContent;
}

// Deep merge content with defaults to ensure all required sections exist
function mergeWithDefaults(content: Partial<PricingPageContent>): PricingPageContent {
  const defaults = getDefaultContent('pricing') as PricingPageContent;
  return {
    header: content.header || defaults.header,
    tiers: content.tiers || defaults.tiers,
    paymentNote: content.paymentNote || defaults.paymentNote,
    customSection: content.customSection ?? defaults.customSection,
  };
}

export default function PricingPageClient({ content: initialContent }: PricingPageClientProps) {
  const { setPageSlug, setPageContent, pageContent } = useInlineEdit();

  // Ensure content has all required sections by merging with defaults
  const safeInitialContent = mergeWithDefaults(initialContent);

  // Initialize the edit context when the component mounts
  useEffect(() => {
    setPageSlug('pricing');
    setPageContent(safeInitialContent as unknown as Record<string, unknown>);
  }, [safeInitialContent, setPageSlug, setPageContent]);

  // Use pageContent from context if available (has pending edits), otherwise use initial
  const rawContent = (pageContent as unknown as PricingPageContent) || safeInitialContent;
  const content = mergeWithDefaults(rawContent);

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
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {content.tiers.map((tier, index) => {
            const delayClass = index === 0 ? 'motion-safe:animate-fade-in'
              : index === 1 ? 'motion-safe:animate-fade-in-delay-100'
              : 'motion-safe:animate-fade-in-delay-200';
            return (
              <EditableItem
                key={index}
                sectionKey="tiers"
                arrayField=""
                index={index}
                label={tier.name}
                content={tier as unknown as Record<string, unknown>}
              >
                <div className={`opacity-0 translate-x-[-30px] motion-reduce:opacity-100 motion-reduce:translate-x-0 ${delayClass}`}>
                  <PricingCard {...tier} />
                </div>
              </EditableItem>
            );
          })}
        </div>
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
