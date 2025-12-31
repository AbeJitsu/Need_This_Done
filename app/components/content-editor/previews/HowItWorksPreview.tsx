import StepCard from '@/components/StepCard';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import CTASection from '@/components/CTASection';
import type { HowItWorksPageContent } from '@/lib/page-content-types';

// ============================================================================
// How It Works Preview Component
// ============================================================================
// What: Renders the How It Works page with provided content (not fetched)
// Why: Used in the content editor to show live preview of changes
// How: Same structure as the actual How It Works page, but takes content as props

interface HowItWorksPreviewProps {
  content: HowItWorksPageContent;
}

export default function HowItWorksPreview({ content }: HowItWorksPreviewProps) {
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
        <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
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
        hoverColor={content.cta.hoverColor || 'gold'}
      />
    </div>
  );
}
