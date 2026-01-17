'use client';

import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { EditableSection, EditableItem, SortableItemsWrapper } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import type { PrivacyPageContent } from '@/lib/page-content-types';
import {
  headingColors,
  formInputColors,
  alertColors,
} from '@/lib/colors';

// ============================================================================
// Privacy Page Client - Universal Editing Version
// ============================================================================
// All content is rendered from content.sections[] and is fully editable.
// EditableSection wraps header, EditableItem wraps each section in the array.

interface PrivacyPageClientProps {
  initialContent: PrivacyPageContent;
}

export default function PrivacyPageClient({ initialContent }: PrivacyPageClientProps) {
  // Use content from universal provider (auto-loaded by route)
  const { pageContent } = useInlineEdit();
  // Check that pageContent has expected structure before using it
  const hasValidContent = pageContent && 'sections' in pageContent && 'header' in pageContent && 'quickSummary' in pageContent;
  const content = hasValidContent ? (pageContent as unknown as PrivacyPageContent) : initialContent;

  return (
    <div className="min-h-screen">
      {/* ================================================================
          Hero Section - Full-bleed gradient background
          ================================================================ */}
      <section className="relative overflow-hidden py-12 md:py-16">
        {/* Full-bleed gradient orbs - positioned relative to viewport edges */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-slate-200 to-gray-200 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-blue-100 to-slate-100 blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-gradient-to-r from-slate-100/60 via-white/40 to-blue-50/60 blur-3xl" />

        {/* Content container - padded text stays readable */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header Section - Editable */}
          <EditableSection sectionKey="header" label="Page Header">
            <PageHeader
              title={content.header.title}
              description={content.header.description}
            />
          </EditableSection>

          {/* Last Updated - Editable */}
          <EditableSection sectionKey="lastUpdated" label="Last Updated">
            <p className={`text-center mb-0 ${formInputColors.helper}`}>
              Last updated: {content.lastUpdated}
            </p>
          </EditableSection>
        </div>
      </section>

      {/* ================================================================
          Main Content Section - White background
          ================================================================ */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Quick Summary Box - Editable */}
          <EditableSection sectionKey="quickSummary" label="Quick Summary">
            <div className={`${alertColors.info.bg} ${alertColors.info.border} rounded-xl p-6 mb-10`}>
              <h2 className={`text-lg font-semibold mb-3 ${alertColors.info.text}`}>
                {content.quickSummary.title}
              </h2>
              <ul className={`space-y-2 ${alertColors.info.text} list-disc list-inside`}>
                {content.quickSummary.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </EditableSection>

          {/* Dynamic Sections - All from JSON and Editable */}
          <EditableSection sectionKey="sections" label="Content Sections">
            <SortableItemsWrapper
              sectionKey="sections"
              arrayField="sections"
              itemIds={content.sections.map((_, i) => `section-${i}`)}
              className="space-y-10"
            >
              {content.sections.map((section, index) => (
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
                  <div className="mb-10">
                    <h2 className={`text-2xl font-semibold mb-4 ${headingColors.primary}`}>
                      {section.title}
                    </h2>
                    <div className={`space-y-4 ${formInputColors.helper} whitespace-pre-line`}>
                      {section.content}
                    </div>
                  </div>
                </EditableItem>
              ))}
            </SortableItemsWrapper>
          </EditableSection>

          {/* Contact Section */}
          <div className="mt-10 pt-10 border-t border-gray-200 dark:border-gray-700">
            <p className={formInputColors.helper}>
              Questions or concerns about your privacy? Email us at{' '}
              <Link href="mailto:hello@needthisdone.com" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                hello@needthisdone.com
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
