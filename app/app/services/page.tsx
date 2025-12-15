import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import CTASection from '@/components/CTASection';
import { ServiceModalProvider } from '@/context/ServiceModalContext';
import ServiceDetailModal from '@/components/service-modal/ServiceDetailModal';
import ScenarioMatcher from '@/components/services/ScenarioMatcher';
import ServiceComparisonTable from '@/components/services/ServiceComparisonTable';
import ServiceDeepDive from '@/components/services/ServiceDeepDive';
import LowFrictionCTA from '@/components/services/LowFrictionCTA';
import { getDefaultServicesContent } from '@/lib/default-page-content';
import type { ServicesPageContent } from '@/lib/page-content-types';
import {
  formInputColors,
  successCheckmarkColors,
  headingColors,
  checkmarkBgColors,
  groupHoverColors,
} from '@/lib/colors';

export const dynamic = 'force-dynamic';

// ============================================================================
// Services Page - Decision Accelerator
// ============================================================================
// Redesigned to help visitors pick the right service through:
// 1. Scenario matching ("Does this sound like you?")
// 2. Side-by-side comparison table
// 3. Deep-dive content (reusing modal content)
// 4. Low-friction CTA for undecided visitors

export const metadata = {
  title: 'Services - NeedThisDone',
  description:
    'Find the right service for your needs. Compare our Virtual Assistant, Data & Documents, and Website Services.',
};

// ============================================================================
// Content Fetching
// ============================================================================

async function getContent(): Promise<ServicesPageContent> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/page-content/services`, {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      return data.content as ServicesPageContent;
    }
  } catch (error) {
    console.error('Failed to fetch services content:', error);
  }

  return getDefaultServicesContent();
}

// ============================================================================
// Page Component
// ============================================================================

export default async function ServicesPage() {
  const content = await getContent();

  return (
    <ServiceModalProvider>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        {/* 1. Hero/Header - Decision-focused */}
        <PageHeader
          title={content.header.title}
          description={content.header.description}
        />

        {/* 2. Scenario Matcher - "Does this sound like you?" */}
        {content.scenarioMatcher && (
          <ScenarioMatcher
            title={content.scenarioMatcher.title}
            description={content.scenarioMatcher.description}
            scenarios={content.scenarioMatcher.scenarios}
          />
        )}

        {/* 3. Comparison Table - Side-by-side view */}
        {content.comparison && (
          <ServiceComparisonTable
            title={content.comparison.title}
            description={content.comparison.description}
            columns={content.comparison.columns}
            rows={content.comparison.rows}
          />
        )}

        {/* 4. Service Deep-Dives - Expandable details */}
        <ServiceDeepDive />

        {/* 5. "Still Not Sure?" - Low-friction CTA */}
        {content.stillUnsure && (
          <LowFrictionCTA
            title={content.stillUnsure.title}
            description={content.stillUnsure.description}
            primaryButton={content.stillUnsure.primaryButton}
            secondaryButton={content.stillUnsure.secondaryButton}
          />
        )}

        {/* 6. Trust Signals - What You Can Expect */}
        <Card hoverColor="green" hoverEffect="glow" className="mb-10">
          <h2
            className={`text-2xl font-bold ${headingColors.primary} mb-6 text-center`}
          >
            {content.expectationsTitle}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {content.expectations.map((item, index) => {
              const itemContent = (
                <>
                  <div
                    className={`w-8 h-8 rounded-full ${checkmarkBgColors.green} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className={`${successCheckmarkColors.iconAlt} font-bold`}>
                      ✓
                    </span>
                  </div>
                  <div>
                    <h3
                      className={`font-semibold ${headingColors.primary} mb-1 ${
                        item.link ? `${groupHoverColors.blue} transition-colors` : ''
                      }`}
                    >
                      {item.title}
                      {item.link && (
                        <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          {' '}
                          →
                        </span>
                      )}
                    </h3>
                    <p className={`${formInputColors.helper} text-sm`}>
                      {item.description}
                    </p>
                  </div>
                </>
              );

              if (item.link) {
                return (
                  <Link key={index} href={item.link.href} className="flex gap-4 group">
                    {itemContent}
                  </Link>
                );
              }

              return (
                <div key={index} className="flex gap-4">
                  {itemContent}
                </div>
              );
            })}
          </div>
        </Card>

        {/* 7. Final CTA */}
        <CTASection
          title={content.cta.title}
          description={content.cta.description}
          buttons={content.cta.buttons}
          hoverColor={content.cta.hoverColor || 'orange'}
        />
      </div>

      {/* Modal for scenario clicks */}
      <ServiceDetailModal />
    </ServiceModalProvider>
  );
}
