'use client';

import { useState } from 'react';
import Link from 'next/link';
import { faqColors, titleColors, formInputColors, cardBgColors, cardBorderColors } from '@/lib/colors';
import CircleBadge from '@/components/CircleBadge';
import PageHeader from '@/components/PageHeader';
import CTASection from '@/components/CTASection';
import { EditableSection, EditableItem, SortableItemsWrapper } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import type { FAQPageContent } from '@/lib/page-content-types';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';

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
  const { pageContent, isEditMode } = useInlineEdit();
  // Check that pageContent has expected structure before using it
  const hasValidContent = pageContent && 'items' in pageContent && 'header' in pageContent;
  const content = hasValidContent ? (pageContent as unknown as FAQPageContent) : initialContent;

  // Track which FAQ item is expanded
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpanded = (index: number) => {
    // Don't toggle in edit mode - let the click-to-edit work
    if (isEditMode) return;
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen">
      {/* ================================================================
          Hero Section - Centered gradient like homepage
          ================================================================ */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="relative overflow-hidden py-8">
            {/* Gradient orbs - constrained to max-w container like homepage */}
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-amber-100 to-gold-100 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-purple-100 to-violet-100 blur-2xl" />
            <div className="absolute top-20 left-1/4 w-32 h-32 rounded-full bg-amber-100 blur-xl" />

            {/* Content */}
            <div className="relative z-10">
              <EditableSection sectionKey="header" label="Page Header">
                <PageHeader
                  title={content.header.title}
                  description={content.header.description}
                  color="gold"
                />
              </EditableSection>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          FAQ List - White background section with premium cards
          ================================================================ */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Section intro */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-purple-100 mb-4">
              <MessageCircleQuestion className="w-6 h-6 text-amber-600" />
            </div>
            <p className={`${formInputColors.helper} max-w-lg mx-auto`}>
              Click any question to reveal the answer
            </p>
          </div>

          {/* FAQ List */}
          <EditableSection sectionKey="items" label="FAQ Items">
            <SortableItemsWrapper
              sectionKey="items"
              arrayField="items"
              itemIds={content.items.map((_, i) => `faq-item-${i}`)}
              className="space-y-4 mb-10"
            >
              {content.items.map((faq, index) => {
                // Cycle through colors: green, blue, purple, gold
                const colors = ['green', 'blue', 'purple', 'gold'] as const;
                const color = colors[index % 4];
                const styles = faqColors[color];
                const isExpanded = expandedIndex === index;

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
                      className={`
                        group
                        ${cardBgColors.base} rounded-2xl
                        border ${isExpanded ? 'border-gray-300 dark:border-gray-600' : cardBorderColors.subtle}
                        border-l-4 ${styles.border}
                        shadow-sm hover:shadow-md
                        transition-all duration-300 ease-out
                        ${isExpanded ? 'shadow-lg' : ''}
                      `}
                    >
                      {/* Question - clickable header */}
                      <button
                        onClick={() => toggleExpanded(index)}
                        className={`
                          w-full p-5 md:p-6
                          flex items-center gap-4
                          text-left
                          cursor-pointer
                          transition-colors duration-200
                          ${isExpanded ? 'bg-gray-50/50 dark:bg-gray-800/50' : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30'}
                          rounded-t-2xl
                          ${!isExpanded && 'rounded-b-2xl'}
                        `}
                        aria-expanded={isExpanded}
                      >
                        <CircleBadge number={index + 1} color={color} size="sm" />
                        <h2 className={`flex-1 text-lg md:text-xl font-semibold ${styles.text}`}>
                          {faq.question}
                        </h2>
                        <ChevronDown
                          className={`
                            w-5 h-5 text-gray-400
                            transition-transform duration-300 ease-out
                            ${isExpanded ? 'rotate-180' : ''}
                            group-hover:text-gray-600
                          `}
                        />
                      </button>

                      {/* Answer - expandable content */}
                      <div
                        className={`
                          overflow-hidden
                          transition-all duration-300 ease-out
                          ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                        `}
                      >
                        <div className="px-5 md:px-6 pb-5 md:pb-6 pt-2 ml-12 md:ml-14 border-t border-gray-100 dark:border-gray-800">
                          <p className={`${formInputColors.helper} leading-relaxed`}>
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
        </div>
      </section>

      {/* ================================================================
          CTA Section - Dark background for contrast
          ================================================================ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-20">
          <EditableSection sectionKey="cta" label="Call to Action">
            <CTASection
              title={content.cta.title}
              description={content.cta.description}
              buttons={content.cta.buttons}
              hoverColor={content.cta.hoverColor || 'gold'}
            />
          </EditableSection>
        </div>
      </section>
    </div>
  );
}
