'use client';

import StepCard from '@/components/StepCard';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import CTASection from '@/components/CTASection';
import CircleBadge from '@/components/CircleBadge';
import Button from '@/components/Button';
import { EditableSection, EditableItem, SortableItemsWrapper } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import type { HowItWorksPageContent } from '@/lib/page-content-types';
import {
  formInputColors,
  titleColors,
  headingColors,
} from '@/lib/colors';
import { CheckmarkCircle } from '@/components/ui/icons/CheckmarkCircle';

// ============================================================================
// How It Works Page Client - Universal Editing Version
// ============================================================================
// Uses universal content loading from InlineEditProvider.
// EditableSection/EditableItem wrappers provide click-to-select functionality.

interface HowItWorksPageClientProps {
  content: HowItWorksPageContent;
}

export default function HowItWorksPageClient({ content: initialContent }: HowItWorksPageClientProps) {
  // Use content from universal provider (auto-loaded by route)
  const { pageContent } = useInlineEdit();
  // Check that pageContent has expected structure before using it
  const hasValidContent = pageContent && 'steps' in pageContent && 'header' in pageContent;
  const content = hasValidContent ? (pageContent as unknown as HowItWorksPageContent) : initialContent;
  const [step1, ...remainingSteps] = content.steps;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header - Warm, benefit-focused */}
      <EditableSection sectionKey="header" label="Page Header">
        <PageHeader
          title={content.header.title}
          description={content.header.description}
          color="green"
        />
      </EditableSection>

      {/* Trust Badges - Reassurance before diving in */}
      {content.trustBadges && content.trustBadges.length > 0 && (
        <EditableSection sectionKey="trustBadges" label="Trust Badges">
          <Card hoverColor="green" hoverEffect="glow" className="mb-10">
            <div className="flex justify-center">
              <SortableItemsWrapper
                sectionKey="trustBadges"
                arrayField="trustBadges"
                itemIds={content.trustBadges.map((_, i) => `badge-${i}`)}
                className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:justify-center sm:items-center sm:gap-6 md:gap-10"
              >
                {content.trustBadges.map((badge, index) => (
                  <EditableItem
                    key={`badge-${index}`}
                    sectionKey="trustBadges"
                    arrayField="trustBadges"
                    index={index}
                    label={badge.text}
                    content={badge as unknown as Record<string, unknown>}
                    sortable
                    sortId={`badge-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <CheckmarkCircle color="green" size="lg" showBorder />
                      <div>
                        <p className={`font-semibold ${headingColors.primary}`}>
                          {badge.text}
                        </p>
                        <p className={`text-sm ${formInputColors.helper}`}>
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  </EditableItem>
                ))}
              </SortableItemsWrapper>
            </div>
          </Card>
        </EditableSection>
      )}

      {/* Process Steps */}
      <EditableSection sectionKey="steps" label="Process Steps">
        {/* Hero Step 1 - The clear starting point */}
        {step1 && (
          <EditableItem
            sectionKey="steps"
            arrayField=""
            index={0}
            label={step1.title}
            content={step1 as unknown as Record<string, unknown>}
          >
            <Card hoverColor="green" hoverEffect="lift" className="mb-10">
              <div className="flex flex-col md:flex-row gap-6 items-center p-2">
                <CircleBadge number={step1.number} color="green" size="lg" />
                <div className="flex-1 text-center md:text-left">
                  <h2 className={`text-2xl font-bold ${titleColors.green} mb-3`}>
                    {step1.title}
                  </h2>
                  <p className={`${formInputColors.helper} mb-4 text-lg`}>
                    {step1.description}
                  </p>
                  {step1.buttonText && (
                    <Button variant="green" href={step1.href || '/contact'} size="lg">
                      {step1.buttonText}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </EditableItem>
        )}

        {/* Steps 2-4 - Horizontal flow showing progression */}
        <SortableItemsWrapper
          sectionKey="steps"
          arrayField="steps"
          itemIds={remainingSteps.map((_, i) => `step-${i + 1}`)}
          className="grid md:grid-cols-3 gap-6 mb-10"
        >
          {remainingSteps.map((step, index) => (
            <EditableItem
              key={`step-${index + 1}`}
              sectionKey="steps"
              arrayField="steps"
              index={index + 1}
              label={step.title}
              content={step as unknown as Record<string, unknown>}
              sortable
              sortId={`step-${index + 1}`}
            >
              <StepCard {...step} />
            </EditableItem>
          ))}
        </SortableItemsWrapper>
      </EditableSection>

      {/* Timeline Note */}
      <EditableSection sectionKey="timeline" label="Timeline">
        <Card
          hoverColor={content.timeline.hoverColor || 'green'}
          hoverEffect="glow"
          className="mb-10"
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl text-gray-700 dark:text-gray-200" aria-hidden="true">⏱</span>
            <div>
              <h3 className={`font-semibold ${titleColors.green} mb-1`}>
                {content.timeline.title}
              </h3>
              <p className={formInputColors.helper}>{content.timeline.description}</p>
            </div>
          </div>
        </Card>
      </EditableSection>

      {/* Questions Section - Low-friction CTA for hesitant visitors */}
      {content.questionsSection && (
        <EditableSection sectionKey="questionsSection" label="Questions Section">
          <Card
            hoverColor={content.questionsSection.hoverColor || 'blue'}
            hoverEffect="glow"
            className="mb-10"
          >
            <div className="text-center">
              <h3 className={`text-xl font-semibold ${headingColors.primary} mb-2`}>
                {content.questionsSection.title}
              </h3>
              <p className={`${formInputColors.helper} mb-6`}>
                {content.questionsSection.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant={content.questionsSection.primaryButton.variant}
                  href={content.questionsSection.primaryButton.href}
                  size="lg"
                >
                  {content.questionsSection.primaryButton.text}
                </Button>
                <Button
                  variant={content.questionsSection.secondaryButton.variant}
                  href={content.questionsSection.secondaryButton.href}
                  size="lg"
                >
                  {content.questionsSection.secondaryButton.text}
                </Button>
              </div>
            </div>
          </Card>
        </EditableSection>
      )}

      {/* Final CTA */}
      <EditableSection sectionKey="cta" label="Call to Action">
        <CTASection
          title={content.cta.title}
          description={content.cta.description}
          buttons={content.cta.buttons}
          hoverColor={content.cta.hoverColor || 'gold'}
        />
      </EditableSection>
    </div>
  );
}
