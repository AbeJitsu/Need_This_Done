'use client';

import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import Button from '@/components/Button';
import CTASection from '@/components/CTASection';
import { EditableSection, EditableItem } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import type { GuidePageContent } from '@/lib/page-content-types';
import {
  headingColors,
  formInputColors,
  faqColors,
  titleColors,
  cardBgColors,
  cardBorderColors,
  shadowClasses,
  focusRingClasses,
} from '@/lib/colors';

// ============================================================================
// Guide Page Client - Redesigned with Visual Hierarchy
// ============================================================================
// Content is organized into logical groups with cycling accent colors,
// icons for scannability, and a featured first section.

interface GuidePageClientProps {
  initialContent: GuidePageContent;
}

// Section groupings for visual organization
const SECTION_GROUPS = [
  { id: 'getting-started', title: 'Getting Started', indices: [0, 1, 2], color: 'green' as const },
  { id: 'account', title: 'Your Account', indices: [3, 4], color: 'blue' as const },
  { id: 'explore', title: 'Explore & Customize', indices: [5, 6], color: 'purple' as const },
];

export default function GuidePageClient({ initialContent }: GuidePageClientProps) {
  // Use content from universal provider (auto-loaded by route)
  const { pageContent } = useInlineEdit();
  // Check that pageContent has expected structure before using it
  const hasValidContent = pageContent && 'sections' in pageContent && 'header' in pageContent;
  const content = hasValidContent ? (pageContent as unknown as GuidePageContent) : initialContent;

  // Split sections: first is hero, last is CTA
  const heroSection = content.sections[0];
  const ctaSection = content.sections[content.sections.length - 1];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header Section - Editable */}
      <EditableSection sectionKey="header" label="Page Header">
        <PageHeader
          title={content.header.title}
          description={content.header.description}
        />
      </EditableSection>

      {/* Quick Navigation - Jump Links */}
      <nav className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`text-sm font-medium ${formInputColors.helper}`}>Jump to:</span>
          {SECTION_GROUPS.map((group) => (
            <a
              key={group.id}
              href={`#${group.id}`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors bg-gray-100 dark:bg-gray-700 ${headingColors.primary} hover:bg-gray-200 dark:hover:bg-gray-600 ${focusRingClasses.purple}`}
            >
              {group.title}
            </a>
          ))}
          <a
            href="#support"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors bg-gray-100 dark:bg-gray-700 ${headingColors.primary} hover:bg-gray-200 dark:hover:bg-gray-600 ${focusRingClasses.purple}`}
          >
            Support
          </a>
        </div>
      </nav>

      {/* All Sections - Single EditableSection for all content */}
      <EditableSection sectionKey="sections" label="Guide Sections">
        {/* Hero Section - Featured First Section */}
        {heroSection && (
          <EditableItem
            sectionKey="sections"
            arrayField="sections"
            index={0}
            label={heroSection.title}
            content={heroSection as unknown as Record<string, unknown>}
          >
            <Card hoverColor="green" hoverEffect="lift" className="mb-10">
              <div className="flex flex-col md:flex-row gap-6 items-center p-2">
                <div className="text-5xl" aria-hidden="true">
                  {heroSection.icon || '🔍'}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className={`text-2xl font-bold ${titleColors.green} mb-3`}>
                    {heroSection.title}
                  </h2>
                  <div className={`${formInputColors.helper} mb-4 whitespace-pre-line`}>
                    {heroSection.content}
                  </div>
                  <Button variant="green" href="/services" size="lg">
                    Explore Services
                  </Button>
                </div>
              </div>
            </Card>
          </EditableItem>
        )}

        {/* Grouped Sections */}
        {SECTION_GROUPS.map((group) => (
          <section key={group.id} id={group.id} className="mb-10">
            <h2 className={`text-lg font-semibold ${titleColors[group.color]} mb-4 flex items-center gap-2`}>
              <span className={`w-2 h-2 rounded-full bg-${group.color}-500`} aria-hidden="true" />
              {group.title}
            </h2>
            <div className="space-y-4">
              {group.indices.map((sectionIndex) => {
                const section = content.sections[sectionIndex];
                if (!section) return null;

                const colorIndex = sectionIndex % 4;
                const colors = ['green', 'blue', 'purple', 'gold'] as const;
                const color = colors[colorIndex];
                const styles = faqColors[color];

                return (
                  <EditableItem
                    key={sectionIndex}
                    sectionKey="sections"
                    arrayField="sections"
                    index={sectionIndex}
                    label={section.title}
                    content={section as unknown as Record<string, unknown>}
                  >
                    <article
                      className={`${cardBgColors.base} rounded-xl p-5 ${cardBorderColors.subtle} border-l-4 ${styles.border} ${styles.hover} transition-all ${shadowClasses.cardHover}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-2xl flex-shrink-0" aria-hidden="true">
                          {section.icon || '📄'}
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold mb-2 ${styles.text}`}>
                            {section.title}
                          </h3>
                          <div className={`${formInputColors.helper} whitespace-pre-line text-sm`}>
                            {section.content}
                          </div>
                        </div>
                      </div>
                    </article>
                  </EditableItem>
                );
              })}
            </div>
          </section>
        ))}

        {/* Support Section - CTA */}
        <section id="support">
          {ctaSection && (
            <EditableItem
              sectionKey="sections"
              arrayField="sections"
              index={content.sections.length - 1}
              label={ctaSection.title}
              content={ctaSection as unknown as Record<string, unknown>}
            >
              <CTASection
                title={ctaSection.title}
                description={ctaSection.content.split('\n')[0]}
                buttons={[
                  { text: 'Contact Us', href: '/contact', variant: 'gold' },
                  { text: 'View FAQ', href: '/faq', variant: 'gray' },
                ]}
                hoverColor="gold"
              />
            </EditableItem>
          )}
        </section>
      </EditableSection>
    </div>
  );
}
