'use client';

import PricingCard from '@/components/PricingCard';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import CircleBadge from '@/components/CircleBadge';
import { EditableSection, EditableItem, SortableItemsWrapper } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import type { PricingPageContent, AccentVariant } from '@/lib/page-content-types';
import { formInputColors, headingColors, dividerColors, accentColors, accentBorderWidth, checkmarkColors } from '@/lib/colors';

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
  const hasValidContent = pageContent && 'tiers' in pageContent && 'header' in pageContent && 'ctaPaths' in pageContent;
  const content = hasValidContent ? (pageContent as unknown as PricingPageContent) : initialContent;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header */}
      <EditableSection sectionKey="header" label="Page Header">
        <PageHeader
          title={content.header.title}
          description={content.header.description}
          color="purple"
        />
      </EditableSection>

      {/* Pricing Cards */}
      <EditableSection sectionKey="tiers" label="Pricing Tiers">
        <SortableItemsWrapper
          sectionKey="tiers"
          arrayField="tiers"
          itemIds={content.tiers.map((_, i) => `tier-${i}`)}
          className="grid md:grid-cols-3 gap-6 mb-8 items-stretch"
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
                className="h-full"
              >
                <div className={`h-full opacity-0 translate-x-[-30px] motion-reduce:opacity-100 motion-reduce:translate-x-0 ${delayClass}`}>
                  <PricingCard {...tier} />
                </div>
              </EditableItem>
            );
          })}
        </SortableItemsWrapper>
      </EditableSection>

      {/* Choose Your Path - CTA Section Header */}
      <EditableSection sectionKey="ctaSection" label="CTA Section">
        <div className="text-center mb-8">
          <h2 className={`text-2xl font-bold ${headingColors.primary} mb-3`}>
            {content.ctaSection.title}
          </h2>
          <p className={`${formInputColors.helper} max-w-2xl mx-auto`}>
            {content.ctaSection.description}
          </p>
        </div>
      </EditableSection>

      {/* CTA Path Cards */}
      <EditableSection sectionKey="ctaPaths" label="CTA Paths">
        <SortableItemsWrapper
          sectionKey="ctaPaths"
          arrayField="ctaPaths"
          itemIds={content.ctaPaths.map((_, i) => `path-${i}`)}
          className="grid md:grid-cols-2 gap-6 mb-10 items-stretch"
        >
          {content.ctaPaths.map((path, index) => {
            const colorKey = path.hoverColor as keyof typeof checkmarkColors;
            const checkmarkClass = checkmarkColors[colorKey]?.icon || checkmarkColors.green.icon;

            return (
              <EditableItem
                key={`path-${index}`}
                sectionKey="ctaPaths"
                arrayField="ctaPaths"
                index={index}
                label={path.title}
                content={path as unknown as Record<string, unknown>}
                sortable
                sortId={`path-${index}`}
                className="h-full"
              >
                <Card hoverColor={path.hoverColor} hoverEffect="lift" className="h-full">
                  <div className="p-8 h-full flex flex-col">
                    <div className="mb-4">
                      <span className={`inline-block px-4 py-1 ${accentColors[path.hoverColor as AccentVariant].bg} ${accentColors[path.hoverColor as AccentVariant].text} ${accentColors[path.hoverColor as AccentVariant].border} ${accentBorderWidth} rounded-full text-sm font-semibold`}>
                        {path.badge}
                      </span>
                    </div>
                    <h3 className={`text-2xl font-bold ${headingColors.primary} mb-3`}>
                      {path.title}
                    </h3>
                    <p className={`${formInputColors.helper} mb-6`}>
                      {path.description}
                    </p>
                    <ul className="space-y-3 mb-6 flex-grow">
                      {path.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <span className={checkmarkClass} aria-hidden="true">✓</span>
                          <span className={headingColors.secondary}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={path.button.variant}
                      href={path.button.href}
                      size="lg"
                      className="w-full"
                    >
                      {path.button.text}
                    </Button>
                  </div>
                </Card>
              </EditableItem>
            );
          })}
        </SortableItemsWrapper>
      </EditableSection>

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
