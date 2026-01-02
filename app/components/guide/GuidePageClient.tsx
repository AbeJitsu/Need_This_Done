'use client';

import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import Button from '@/components/Button';
import CTASection from '@/components/CTASection';
import { EditableSection, EditableItem, SortableItemsWrapper } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import type { GuidePageContent, GuideGroup, GuideSection } from '@/lib/page-content-types';
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

// Group configuration - maps group IDs to display info
const GROUP_CONFIG: Record<GuideGroup, { title: string; color: 'green' | 'blue' | 'purple' | 'gold' }> = {
  'getting-started': { title: 'Getting Started', color: 'green' },
  'account': { title: 'Your Account', color: 'blue' },
  'explore': { title: 'Explore & Customize', color: 'purple' },
  'admin': { title: 'For Admins', color: 'gold' },
  'support': { title: 'Support', color: 'gold' },
};

// Order for displaying groups
const GROUP_ORDER: GuideGroup[] = ['getting-started', 'account', 'explore', 'admin'];

// Helper to group sections by their group field
function groupSections(sections: GuideSection[]): Map<GuideGroup, Array<{ section: GuideSection; index: number }>> {
  const grouped = new Map<GuideGroup, Array<{ section: GuideSection; index: number }>>();
  sections.forEach((section, index) => {
    const group = section.group;
    if (!grouped.has(group)) {
      grouped.set(group, []);
    }
    grouped.get(group)!.push({ section, index });
  });
  return grouped;
}

export default function GuidePageClient({ initialContent }: GuidePageClientProps) {
  // Use content from universal provider (auto-loaded by route)
  const { pageContent } = useInlineEdit();
  // Check that pageContent has expected structure before using it
  const hasValidContent = pageContent && 'sections' in pageContent && 'header' in pageContent;
  const content = hasValidContent ? (pageContent as unknown as GuidePageContent) : initialContent;

  // Group sections dynamically by their group field
  const grouped = groupSections(content.sections);

  // Hero = first section in 'getting-started' group
  const gettingStartedSections = grouped.get('getting-started') || [];
  const heroItem = gettingStartedSections[0];
  const remainingGettingStarted = gettingStartedSections.slice(1);

  // CTA = all sections in 'support' group
  const supportSections = grouped.get('support') || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header Section - Editable */}
      <EditableSection sectionKey="header" label="Page Header">
        <PageHeader
          title={content.header.title}
          description={content.header.description}
          color="green"
        />
      </EditableSection>

      {/* Quick Navigation - Jump Links */}
      <nav className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`text-sm font-medium ${formInputColors.helper}`}>Jump to:</span>
          {GROUP_ORDER.map((groupId) => (
            <a
              key={groupId}
              href={`#${groupId}`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors bg-gray-100 dark:bg-gray-700 ${headingColors.primary} hover:bg-gray-200 dark:hover:bg-gray-600 ${focusRingClasses.purple}`}
            >
              {GROUP_CONFIG[groupId].title}
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

      {/* All Sections - Single EditableSection with SortableItemsWrapper */}
      <EditableSection sectionKey="sections" label="Guide Sections">
        <SortableItemsWrapper
          sectionKey="sections"
          arrayField="sections"
          itemIds={content.sections.map((_, i) => `section-${i}`)}
          className="space-y-10"
        >
          {/* Hero Section - First section in getting-started group */}
          {heroItem && (
            <EditableItem
              key={`section-${heroItem.index}`}
              sectionKey="sections"
              arrayField="sections"
              index={heroItem.index}
              label={heroItem.section.title}
              content={heroItem.section as unknown as Record<string, unknown>}
              sortable
              sortId={`section-${heroItem.index}`}
            >
              <Card hoverColor="green" hoverEffect="lift" className="mb-0">
                <div className="flex flex-col md:flex-row gap-6 items-center p-2">
                  <div className="text-5xl" aria-hidden="true">
                    {heroItem.section.icon || '🔍'}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className={`text-2xl font-bold ${titleColors.green} mb-3`}>
                      {heroItem.section.title}
                    </h2>
                    <div className={`${formInputColors.helper} mb-4 whitespace-pre-line`}>
                      {heroItem.section.content}
                    </div>
                    <Button variant="green" href="/services" size="lg">
                      Explore Services
                    </Button>
                  </div>
                </div>
              </Card>
            </EditableItem>
          )}

          {/* Grouped Sections - Dynamically computed from section.group field */}
          {GROUP_ORDER.map((groupId) => {
            const config = GROUP_CONFIG[groupId];
            // Get sections for this group, excluding hero (first getting-started item)
            const sectionsInGroup = groupId === 'getting-started'
              ? remainingGettingStarted
              : (grouped.get(groupId) || []);

            if (sectionsInGroup.length === 0) return null;

            return (
              <section key={groupId} id={groupId} className="mb-0">
                <h2 className={`text-lg font-semibold ${titleColors[config.color]} mb-4 flex items-center gap-2`}>
                  <span className={`w-2 h-2 rounded-full bg-${config.color}-500`} aria-hidden="true" />
                  {config.title}
                </h2>
                <div className="space-y-4">
                  {sectionsInGroup.map(({ section, index }) => {
                    const styles = faqColors[config.color];

                    return (
                      <EditableItem
                        key={`section-${index}`}
                        sectionKey="sections"
                        arrayField="sections"
                        index={index}
                        label={section.title}
                        content={section as unknown as Record<string, unknown>}
                        sortable
                        sortId={`section-${index}`}
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
            );
          })}

          {/* Support Section - CTA */}
          <section id="support" className="mb-0">
            {supportSections.map(({ section, index }) => (
              <EditableItem
                key={`section-${index}`}
                sectionKey="sections"
                arrayField="sections"
                index={index}
                label={section.title}
                content={section as unknown as Record<string, unknown>}
                sortable
                sortId={`section-${index}`}
              >
                <CTASection
                  title={section.title}
                  description={section.content.split('\n')[0]}
                  buttons={[
                    { text: 'Contact Us', href: '/contact', variant: 'gold' },
                    { text: 'View FAQ', href: '/faq', variant: 'gray' },
                  ]}
                  hoverColor="gold"
                />
              </EditableItem>
            ))}
          </section>
        </SortableItemsWrapper>
      </EditableSection>
    </div>
  );
}
