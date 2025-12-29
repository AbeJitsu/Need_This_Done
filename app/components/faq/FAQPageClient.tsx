'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { faqColors, titleColors, formInputColors, cardBgColors, cardBorderColors } from '@/lib/colors';
import CircleBadge from '@/components/CircleBadge';
import PageHeader from '@/components/PageHeader';
import CTASection from '@/components/CTASection';
import { EditableSection } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import { getDefaultContent } from '@/lib/default-page-content';
import type { FAQPageContent } from '@/lib/page-content-types';

// ============================================================================
// FAQ Page Client Component - Renders FAQ page with inline editing
// ============================================================================

interface FAQPageClientProps {
  content: FAQPageContent;
}

// Deep merge content with defaults to ensure all required sections exist
function mergeWithDefaults(content: Partial<FAQPageContent>): FAQPageContent {
  const defaults = getDefaultContent('faq') as FAQPageContent;
  return {
    header: content.header || defaults.header,
    items: content.items || defaults.items,
    cta: content.cta || defaults.cta,
  };
}

// Helper: Render Answer with Links
function renderAnswer(answer: string, links?: Array<{ text: string; href: string }>) {
  if (!links || links.length === 0) {
    return answer;
  }

  // Replace link text with actual links
  let result = answer;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;

  links.forEach((link, idx) => {
    const linkIndex = result.indexOf(link.text, lastIndex);
    if (linkIndex !== -1) {
      // Add text before the link
      if (linkIndex > lastIndex) {
        parts.push(result.slice(lastIndex, linkIndex));
      }
      // Add the link
      parts.push(
        <Link
          key={idx}
          href={link.href}
          className={`${titleColors.blue} font-medium hover:underline`}
        >
          {link.text}
        </Link>
      );
      lastIndex = linkIndex + link.text.length;
    }
  });

  // Add remaining text
  if (lastIndex < result.length) {
    parts.push(result.slice(lastIndex));
  }

  return parts.length > 0 ? parts : answer;
}

export default function FAQPageClient({ content: initialContent }: FAQPageClientProps) {
  const { setPageSlug, setPageContent, pageContent } = useInlineEdit();

  // Ensure content has all required sections by merging with defaults
  const safeInitialContent = mergeWithDefaults(initialContent);

  // Initialize the edit context when the component mounts
  useEffect(() => {
    setPageSlug('faq');
    setPageContent(safeInitialContent as unknown as Record<string, unknown>);
  }, [safeInitialContent, setPageSlug, setPageContent]);

  // Use pageContent from context if available (has pending edits), otherwise use initial
  const rawContent = (pageContent as unknown as FAQPageContent) || safeInitialContent;
  const content = mergeWithDefaults(rawContent);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header */}
      <EditableSection sectionKey="header" label="Page Header">
        <PageHeader
          title={content.header.title}
          description={content.header.description}
        />
      </EditableSection>

      {/* FAQ List */}
      <EditableSection sectionKey="items" label="FAQ Items">
        <div className="space-y-6 mb-10">
          {content.items.map((faq, index) => {
            // Cycle through colors: green, blue, purple, orange
            const colors = ['green', 'blue', 'purple', 'orange'] as const;
            const color = colors[index % 4];
            const styles = faqColors[color];
            return (
              <div
                key={index}
                className={`${cardBgColors.base} rounded-xl p-6 ${cardBorderColors.subtle} border-l-4 ${styles.border} ${styles.hover} transition-all hover:shadow-[0_0_8px_0px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_8px_0px_rgba(255,255,255,0.15)]`}
              >
                <div className="flex items-start gap-4">
                  <CircleBadge number={index + 1} color={color} size="sm" />
                  <div>
                    <h2 className={`text-xl font-semibold mb-2 ${styles.text}`}>
                      {faq.question}
                    </h2>
                    <p className={formInputColors.helper}>
                      {renderAnswer(faq.answer, faq.links)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </EditableSection>

      {/* Contact Section */}
      <EditableSection sectionKey="cta" label="Call to Action">
        <CTASection
          title={content.cta.title}
          description={content.cta.description}
          buttons={content.cta.buttons}
          hoverColor={content.cta.hoverColor || 'orange'}
        />
      </EditableSection>
    </div>
  );
}
