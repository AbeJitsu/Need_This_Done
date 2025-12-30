'use client';

import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { EditableSection, EditableItem } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import type { GuidePageContent } from '@/lib/page-content-types';
import { headingColors, formInputColors, accentColors, focusRingClasses } from '@/lib/colors';

// ============================================================================
// Guide Page Client - Universal Editing Version
// ============================================================================
// All content is rendered from content.sections[] and is fully editable.
// EditableSection wraps header, EditableItem wraps each section in the array.

interface GuidePageClientProps {
  initialContent: GuidePageContent;
}

export default function GuidePageClient({ initialContent }: GuidePageClientProps) {
  // Use content from universal provider (auto-loaded by route)
  const { pageContent } = useInlineEdit();
  // Check that pageContent has expected structure before using it
  const hasValidContent = pageContent && 'sections' in pageContent && 'header' in pageContent;
  const content = hasValidContent ? (pageContent as unknown as GuidePageContent) : initialContent;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header Section - Editable */}
      <EditableSection sectionKey="header" label="Page Header">
        <PageHeader
          title={content.header.title}
          description={content.header.description}
        />
      </EditableSection>

      {/* Quick Links */}
      <nav className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className={`font-semibold ${headingColors.secondary} mb-4`}>Quick Links</h2>
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link
              href="/shop"
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors bg-gray-100 dark:bg-gray-700 ${headingColors.primary} hover:bg-gray-200 dark:hover:bg-gray-600 ${focusRingClasses.purple}`}
            >
              🔍 Browse Consultations
            </Link>
          </li>
          <li>
            <Link
              href="/get-started"
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors bg-gray-100 dark:bg-gray-700 ${headingColors.primary} hover:bg-gray-200 dark:hover:bg-gray-600 ${focusRingClasses.purple}`}
            >
              🚀 Authorize a Project
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors bg-gray-100 dark:bg-gray-700 ${headingColors.primary} hover:bg-gray-200 dark:hover:bg-gray-600 ${focusRingClasses.purple}`}
            >
              💬 Contact Us
            </Link>
          </li>
        </ul>
      </nav>

      {/* Dynamic Sections - All from JSON and Editable */}
      <EditableSection sectionKey="sections" label="Guide Sections">
        <div className="space-y-8">
          {content.sections.map((section, index) => (
            <EditableItem
              key={index}
              sectionKey="sections"
              arrayField="sections"
              index={index}
              label={section.title}
              content={section as unknown as Record<string, unknown>}
            >
              <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6">
                  <h2 className={`text-xl font-bold ${headingColors.primary} mb-4`}>
                    {section.title}
                  </h2>
                  <div className={`space-y-4 ${formInputColors.helper} whitespace-pre-line`}>
                    {section.content}
                  </div>
                </div>
              </article>
            </EditableItem>
          ))}
        </div>
      </EditableSection>

      {/* Contact Section */}
      <div className="mt-12 text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <h2 className={`text-xl font-bold ${headingColors.primary} mb-2`}>Still have questions?</h2>
        <p className={`${formInputColors.helper} mb-4`}>
          We are here to help. Reach out and we will get back to you as soon as possible.
        </p>
        <Link
          href="/contact"
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${accentColors.blue.bg} ${accentColors.blue.text} ${accentColors.blue.hoverText} ${accentColors.blue.hoverBorder} ${focusRingClasses.blue}`}
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
