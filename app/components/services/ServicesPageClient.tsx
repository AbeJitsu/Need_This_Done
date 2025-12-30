'use client';

import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { ServiceModalProvider } from '@/context/ServiceModalContext';
import ServiceDetailModal from '@/components/service-modal/ServiceDetailModal';
import ScenarioMatcher from '@/components/services/ScenarioMatcher';
import ServiceComparisonTable from '@/components/services/ServiceComparisonTable';
import ServiceDeepDive from '@/components/services/ServiceDeepDive';
import { EditableSection, EditableItem } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import type { ServicesPageContent } from '@/lib/page-content-types';
import {
  formInputColors,
  headingColors,
  checkmarkBgColors,
  groupHoverColors,
  accentColors,
  accentBorderWidth,
  focusRingClasses,
  AccentVariant,
} from '@/lib/colors';

// ============================================================================
// Services Page Client - Universal Editing Version
// ============================================================================
// Uses universal content loading from InlineEditProvider.
// EditableSection/EditableItem wrappers provide click-to-select functionality.

interface ServicesPageClientProps {
  content: ServicesPageContent;
}

export default function ServicesPageClient({ content: initialContent }: ServicesPageClientProps) {
  // Use content from universal provider (auto-loaded by route)
  const { pageContent } = useInlineEdit();
  // Check that pageContent has expected structure before using it
  const hasValidContent = pageContent && 'header' in pageContent && 'chooseYourPath' in pageContent;
  const content = hasValidContent ? (pageContent as unknown as ServicesPageContent) : initialContent;

  return (
    <ServiceModalProvider>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        {/* 1. Hero/Header - Decision-focused */}
        <EditableSection sectionKey="header" label="Page Header">
          <PageHeader
            title={content.header.title}
            description={content.header.description}
          />
        </EditableSection>

        {/* 2. Scenario Matcher - "Does this sound like you?" */}
        {content.scenarioMatcher && (
          <EditableSection sectionKey="scenarioMatcher" label="Scenario Matcher">
            <ScenarioMatcher
              title={content.scenarioMatcher.title}
              description={content.scenarioMatcher.description}
              scenarios={content.scenarioMatcher.scenarios}
            />
          </EditableSection>
        )}

        {/* 3. Comparison Table - Side-by-side view */}
        {content.comparison && (
          <EditableSection sectionKey="comparison" label="Comparison Table">
            <ServiceComparisonTable
              title={content.comparison.title}
              description={content.comparison.description}
              columns={content.comparison.columns}
              rows={content.comparison.rows}
            />
          </EditableSection>
        )}

        {/* 4. Service Deep-Dives - Expandable details */}
        <ServiceDeepDive />

        {/* 5. Choose Your Path - Two clear options */}
        {content.chooseYourPath && (
          <EditableSection sectionKey="chooseYourPath" label="Choose Your Path">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {content.chooseYourPath.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {content.chooseYourPath.description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-10">
              {content.chooseYourPath.paths.map((path, index) => (
                <EditableItem
                  key={index}
                  sectionKey="chooseYourPath"
                  arrayField="paths"
                  index={index}
                  label={path.title}
                  content={path as unknown as Record<string, unknown>}
                >
                  <Card hoverColor={path.hoverColor} hoverEffect="lift">
                    <div className="p-8">
                      {/* Badge */}
                      <div className="mb-4">
                        <span className={`inline-block px-4 py-1 ${accentColors[path.hoverColor as AccentVariant].bg} ${accentColors[path.hoverColor as AccentVariant].text} ${accentColors[path.hoverColor as AccentVariant].border} ${accentBorderWidth} rounded-full text-sm font-semibold`}>
                          {path.badge}
                        </span>
                      </div>
                      {/* Title + Description */}
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                        {path.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {path.description}
                      </p>
                      {/* Bullets */}
                      <ul className="space-y-3 mb-6">
                        {path.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className={accentColors[path.hoverColor as AccentVariant].text} aria-hidden="true">✓</span>
                            <span className="text-gray-700 dark:text-gray-300">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                      {/* Button */}
                      <Button
                        variant={path.button.variant}
                        href={path.button.href}
                        size={path.button.size || 'lg'}
                        className="w-full"
                      >
                        {path.button.text}
                      </Button>
                    </div>
                  </Card>
                </EditableItem>
              ))}
            </div>
          </EditableSection>
        )}

        {/* 6. Trust Signals - What You Can Expect */}
        <EditableSection sectionKey="expectations" label="What You Can Expect">
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
                      className={`w-8 h-8 rounded-full ${checkmarkBgColors.green.bg} ${checkmarkBgColors.green.border} flex items-center justify-center flex-shrink-0`}
                    >
                      <span className={`${checkmarkBgColors.green.icon} font-bold`} aria-hidden="true">
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
                          <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
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
                    <EditableItem
                      key={index}
                      sectionKey="expectations"
                      arrayField=""
                      index={index}
                      label={item.title}
                      content={item as unknown as Record<string, unknown>}
                    >
                      <Link href={item.link.href} className={`flex gap-4 group rounded-lg ${focusRingClasses.blue}`}>
                        {itemContent}
                      </Link>
                    </EditableItem>
                  );
                }

                return (
                  <EditableItem
                    key={index}
                    sectionKey="expectations"
                    arrayField=""
                    index={index}
                    label={item.title}
                    content={item as unknown as Record<string, unknown>}
                  >
                    <div className="flex gap-4">
                      {itemContent}
                    </div>
                  </EditableItem>
                );
              })}
            </div>
          </Card>
        </EditableSection>
      </div>

      {/* Modal for scenario clicks */}
      <ServiceDetailModal />
    </ServiceModalProvider>
  );
}
