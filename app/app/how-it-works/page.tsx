import StepCard from '@/components/StepCard';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import CTASection from '@/components/CTASection';
import { getDefaultHowItWorksContent } from '@/lib/default-page-content';
import type { HowItWorksPageContent } from '@/lib/page-content-types';

// ============================================================================
// How It Works Page - The NeedThisDone Process
// ============================================================================
// Explains the step-by-step process for clients from submission to completion.
// Content is fetched from the database (if customized) or uses defaults.

export const metadata = {
  title: 'How It Works - NeedThisDone',
  description: 'Our simple process for getting your tasks done. Tell us what you need, and we take it from there.',
};

// ============================================================================
// Content Fetching
// ============================================================================

async function getContent(): Promise<HowItWorksPageContent> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8">

        {/* Header */}
        <PageHeader
          title={content.header.title}
          description={content.header.description}
        />

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {content.steps.map((step) => (
            <StepCard key={step.number} {...step} />
          ))}
        </div>

        {/* Timeline Note */}
        <Card hoverColor={content.timeline.hoverColor || 'blue'} hoverEffect="glow" className="mb-10">
          <h3 className="font-semibold text-blue-600 dark:text-blue-300 mb-2">
            {content.timeline.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {content.timeline.description}
          </p>
        </Card>

        {/* CTA */}
        <CTASection
          title={content.cta.title}
          description={content.cta.description}
          buttons={content.cta.buttons}
          hoverColor={content.cta.hoverColor || 'orange'}
        />
    </div>
  );
}
