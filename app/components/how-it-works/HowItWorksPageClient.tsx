'use client';

import StepCard from '@/components/StepCard';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import CTASection from '@/components/CTASection';
import CircleBadge from '@/components/CircleBadge';
import Button from '@/components/Button';
import { EditableSection, EditableItem } from '@/components/InlineEditor';
import { useEditableContent } from '@/hooks/useEditableContent';
import type { HowItWorksPageContent } from '@/lib/page-content-types';
import {
  formInputColors,
  titleColors,
  headingColors,
  checkmarkBgColors,
} from '@/lib/colors';

// ============================================================================
// How It Works Page Client Component - Renders page with inline editing
// ============================================================================

interface HowItWorksPageClientProps {
  content: HowItWorksPageContent;
}

export default function HowItWorksPageClient({ content: initialContent }: HowItWorksPageClientProps) {
  // Auto-detects slug from URL
  const { content } = useEditableContent<HowItWorksPageContent>(initialContent);
  const [step1, ...remainingSteps] = content.steps;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header - Warm, benefit-focused */}
      <EditableSection sectionKey="header" label="Page Header">
        <PageHeader
          title={content.header.title}
          description={content.header.description}
        />
      </EditableSection>

      {/* Trust Badges - Reassurance before diving in */}
      {content.trustBadges && content.trustBadges.length > 0 && (
        <EditableSection sectionKey="trustBadges" label="Trust Badges">
          <Card hoverColor="green" hoverEffect="glow" className="mb-10">
            <div className="flex justify-center">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:justify-center sm:items-center sm:gap-6 md:gap-10">
                {content.trustBadges.map((badge, index) => (
                  <EditableItem
                    key={index}
                    sectionKey="trustBadges"
                    arrayField=""
                    index={index}
                    label={badge.text}
                    content={badge as unknown as Record<string, unknown>}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full ${checkmarkBgColors.green.bg} ${checkmarkBgColors.green.border} flex items-center justify-center flex-shrink-0`}
                      >
                        <span className={`${checkmarkBgColors.green.icon} font-bold`} aria-hidden="true">
                          ✓
                        </span>
                      </div>
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
              </div>
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
                  <Button variant="green" href={step1.href || '/contact'} size="lg">
                    Get Started
                  </Button>
                </div>
              </div>
            </Card>
          </EditableItem>
        )}

        {/* Steps 2-4 - Horizontal flow showing progression */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {remainingSteps.map((step, index) => (
            <EditableItem
              key={step.number}
              sectionKey="steps"
              arrayField=""
              index={index + 1}
              label={step.title}
              content={step as unknown as Record<string, unknown>}
            >
              <StepCard {...step} />
            </EditableItem>
          ))}
        </div>
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
          hoverColor={content.cta.hoverColor || 'orange'}
        />
      </EditableSection>
    </div>
  );
}
