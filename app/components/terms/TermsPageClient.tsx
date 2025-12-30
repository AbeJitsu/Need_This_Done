'use client';

import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { EditableSection, EditableItem } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import type { TermsPageContent } from '@/lib/page-content-types';
import {
  headingColors,
  formInputColors,
  alertColors,
} from '@/lib/colors';

// ============================================================================
// Terms Page Client - Universal Editing Version
// ============================================================================
// All content is rendered from content.sections[] and is fully editable.
// EditableSection wraps header, EditableItem wraps each section in the array.

interface TermsPageClientProps {
  initialContent: TermsPageContent;
}

export default function TermsPageClient({ initialContent }: TermsPageClientProps) {
  // Use content from universal provider (auto-loaded by route)
  const { pageContent } = useInlineEdit();
  // Check that pageContent has expected structure before using it
  const hasValidContent = pageContent && 'sections' in pageContent && 'header' in pageContent;
  const content = hasValidContent ? (pageContent as unknown as TermsPageContent) : initialContent;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header Section - Editable */}
      <EditableSection sectionKey="header" label="Page Header">
        <PageHeader
          title={content.header.title}
          description={content.header.description}
        />
      </EditableSection>

      {/* Last Updated - Editable */}
      <EditableSection sectionKey="lastUpdated" label="Last Updated">
        <p className={`text-center mb-10 ${formInputColors.helper}`}>
          Last updated: {content.lastUpdated}
        </p>
      </EditableSection>

      {/* Quick Summary Box */}
      <div className={`${alertColors.info.bg} ${alertColors.info.border} rounded-xl p-6 mb-10`}>
        <h2 className={`text-lg font-semibold mb-3 ${alertColors.info.text}`}>
          The Short Version
        </h2>
        <ul className={`space-y-2 ${alertColors.info.text} list-disc list-inside`}>
          <li>Be respectful and use our services lawfully</li>
          <li>Pay for services you book</li>
          <li>We&apos;ll do our best to help you get things done</li>
          <li>Either party can end the relationship anytime</li>
        </ul>
      </div>

      {/* Dynamic Sections - All from JSON and Editable */}
      <EditableSection sectionKey="sections" label="Content Sections">
        <div className="space-y-10">
          {content.sections.map((section, index) => (
            <EditableItem
              key={index}
              sectionKey="sections"
              arrayField="sections"
              index={index}
              label={section.title}
              content={section as unknown as Record<string, unknown>}
            >
              <section className="mb-10">
                <h2 className={`text-2xl font-semibold mb-4 ${headingColors.primary}`}>
                  {section.title}
                </h2>
                <div className={`space-y-4 ${formInputColors.helper} whitespace-pre-line`}>
                  {section.content}
                </div>
              </section>
            </EditableItem>
          ))}
        </div>
      </EditableSection>

      {/* Contact Section */}
      <section className="mt-10 pt-10 border-t border-gray-200 dark:border-gray-700">
        <p className={formInputColors.helper}>
          Questions about these terms? Email us at{' '}
          <Link href="mailto:hello@needthisdone.com" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            hello@needthisdone.com
          </Link>
        </p>
      </section>
    </div>
  );
}
