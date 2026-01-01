'use client';

import Link from 'next/link';
import { faqColors, titleColors, formInputColors, cardBgColors, cardBorderColors, shadowClasses } from '@/lib/colors';
import CircleBadge from '@/components/CircleBadge';
import PageHeader from '@/components/PageHeader';
import CTASection from '@/components/CTASection';
import { EditableSection, EditableItem, SortableItemsWrapper } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import type { FAQPageContent } from '@/lib/page-content-types';

// ============================================================================
// FAQ Page Client - Universal Editing Version
// ============================================================================
// Uses universal content loading from InlineEditProvider.
// EditableSection/EditableItem wrappers provide click-to-select functionality.

interface FAQPageClientProps {
  content: FAQPageContent;
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
  // Use content from universal provider (auto-loaded by route)
  const { pageContent } = useInlineEdit();
  // Check that pageContent has expected structure before using it
  const hasValidContent = pageContent && 'items' in pageContent && 'header' in pageContent;
  const content = hasValidContent ? (pageContent as unknown as FAQPageContent) : initialContent;

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
        <SortableItemsWrapper
          sectionKey="items"
          arrayField="items"
          itemIds={content.items.map((_, i) => `faq-item-${i}`)}
          className="space-y-6 mb-10"
        >
          {content.items.map((faq, index) => {
            // Cycle through colors: green, blue, purple, gold
            const colors = ['green', 'blue', 'purple', 'gold'] as const;
            const color = colors[index % 4];
            const styles = faqColors[color];
            return (
              <EditableItem
                key={`faq-item-${index}`}
                sectionKey="items"
                arrayField="items"
                index={index}
                label={faq.question}
                content={faq as unknown as Record<string, unknown>}
                sortable
                sortId={`faq-item-${index}`}
              >
                <div
                  className={`${cardBgColors.base} rounded-xl p-6 ${cardBorderColors.subtle} border-l-4 ${styles.border} ${styles.hover} transition-all ${shadowClasses.cardHover}`}
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
              </EditableItem>
            );
          })}
        </SortableItemsWrapper>
      </EditableSection>

      {/* Contact Section */}
      <EditableSection sectionKey="cta" label="Call to Action">
        <CTASection
          title={content.cta.title}
          description={content.cta.description}
          buttons={content.cta.buttons}
          hoverColor={content.cta.hoverColor || 'gold'}
        />
      </EditableSection>
    </div>
  );
}
