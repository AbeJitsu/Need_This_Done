import StepCard from '@/components/StepCard';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import CTASection from '@/components/CTASection';
import CircleBadge from '@/components/CircleBadge';
import Button from '@/components/Button';
import { getDefaultHowItWorksContent } from '@/lib/default-page-content';
import type { HowItWorksPageContent } from '@/lib/page-content-types';
import {
  formInputColors,
  titleColors,
  headingColors,
  checkmarkBgColors,
} from '@/lib/colors';

export const dynamic = 'force-dynamic';

// ============================================================================
// How It Works Page - The NeedThisDone Process
// ============================================================================
// Redesigned to feel inviting, supportive, and focused. Features:
// - Warm, benefit-focused headline
// - Trust badges for reassurance
// - Hero card for Step 1 (the clear starting point)
// - Condensed steps 2-4 in horizontal flow
// - Low-friction "Questions?" section for hesitant visitors

export const metadata = {
  title: 'How It Works - NeedThisDone',
  description:
    'Our simple process for getting your tasks done. Tell us what you need, and we take it from there.',
};

// ============================================================================
// Content Fetching
// ============================================================================

async function getContent(): Promise<HowItWorksPageContent> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/page-content/how-it-works`, {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      return data.content as HowItWorksPageContent;
    }
  } catch (error) {
    console.error('Failed to fetch how-it-works content:', error);
  }

  return getDefaultHowItWorksContent();
}

// ============================================================================
// Page Component
// ============================================================================

export default async function HowItWorksPage() {
  const content = await getContent();
  const [step1, ...remainingSteps] = content.steps;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header - Warm, benefit-focused */}
      <PageHeader
        title={content.header.title}
        description={content.header.description}
      />

      {/* Trust Badges - Reassurance before diving in */}
      {content.trustBadges && content.trustBadges.length > 0 && (
        <Card hoverColor="green" hoverEffect="glow" className="mb-10">
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {content.trustBadges.map((badge, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full ${checkmarkBgColors.green.bg} ${checkmarkBgColors.green.border} flex items-center justify-center flex-shrink-0`}
                >
                  <span className={`${checkmarkBgColors.green.icon} font-bold`}>
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
            ))}
          </div>
        </Card>
      )}

      {/* Hero Step 1 - The clear starting point */}
      {step1 && (
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
      )}

      {/* Steps 2-4 - Horizontal flow showing progression */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {remainingSteps.map((step) => (
          <StepCard key={step.number} {...step} />
        ))}
      </div>

      {/* Timeline Note */}
      <Card
        hoverColor={content.timeline.hoverColor || 'green'}
        hoverEffect="glow"
        className="mb-10"
      >
        <div className="flex items-center gap-4">
          <span className="text-2xl text-gray-700 dark:text-gray-200">⏱</span>
          <div>
            <h3 className={`font-semibold ${titleColors.green} mb-1`}>
              {content.timeline.title}
            </h3>
            <p className={formInputColors.helper}>{content.timeline.description}</p>
          </div>
        </div>
      </Card>

      {/* Questions Section - Low-friction CTA for hesitant visitors */}
      {content.questionsSection && (
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
      )}

      {/* Final CTA */}
      <CTASection
        title={content.cta.title}
        description={content.cta.description}
        buttons={content.cta.buttons}
        hoverColor={content.cta.hoverColor || 'orange'}
      />
    </div>
  );
}
