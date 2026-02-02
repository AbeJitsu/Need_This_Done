'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { FadeIn, StaggerContainer, StaggerItem, RevealSection } from '@/components/motion';
import CircleBadge from '@/components/CircleBadge';
import CTASection from '@/components/CTASection';
import { EditableSection, EditableItem, SortableItemsWrapper } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import type { FAQPageContent } from '@/lib/page-content-types';
import { ChevronDown } from 'lucide-react';

// ============================================================================
// FAQ Page Client - Dark Glass Redesign
// ============================================================================
// Dark hero → Dark glass accordion section → Dark CTA
// Preserves inline editing and Framer Motion accordion.

interface FAQPageClientProps {
  content: FAQPageContent;
}

// Color maps for dark-on-dark card styling (BJJ belt progression)
const cardHoverRing: Record<string, string> = {
  green: 'hover:border-emerald-500/40 hover:ring-1 hover:ring-emerald-500/20',
  blue: 'hover:border-blue-500/40 hover:ring-1 hover:ring-blue-500/20',
  purple: 'hover:border-purple-500/40 hover:ring-1 hover:ring-purple-500/20',
  gold: 'hover:border-amber-500/40 hover:ring-1 hover:ring-amber-500/20',
};

const questionText: Record<string, string> = {
  green: 'text-emerald-400',
  blue: 'text-blue-400',
  purple: 'text-purple-400',
  gold: 'text-amber-400',
};

// Helper: Render Answer with Links
function renderAnswer(answer: string, links?: Array<{ text: string; href: string }>) {
  if (!links || links.length === 0) {
    return answer;
  }

  const result = answer;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;

  links.forEach((link, idx) => {
    const linkIndex = result.indexOf(link.text, lastIndex);
    if (linkIndex !== -1) {
      if (linkIndex > lastIndex) {
        parts.push(result.slice(lastIndex, linkIndex));
      }
      parts.push(
        <Link
          key={idx}
          href={link.href}
          className="text-blue-400 font-medium hover:underline"
        >
          {link.text}
        </Link>
      );
      lastIndex = linkIndex + link.text.length;
    }
  });

  if (lastIndex < result.length) {
    parts.push(result.slice(lastIndex));
  }

  return parts.length > 0 ? parts : answer;
}

export default function FAQPageClient({ content: initialContent }: FAQPageClientProps) {
  const { pageContent, isEditMode } = useInlineEdit();
  const hasValidContent = pageContent && 'items' in pageContent && 'header' in pageContent;
  const content = hasValidContent ? (pageContent as unknown as FAQPageContent) : initialContent;

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpanded = (index: number) => {
    if (isEditMode) return;
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen">
      {/* ================================================================
          Hero Section - Dark Editorial
          ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Decorative blurs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-500/8 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-16 md:pt-24 pb-14 md:pb-20">
          <EditableSection sectionKey="header" label="Page Header">
            <FadeIn direction="up" triggerOnScroll={false}>
              {/* Accent line + label */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-1 rounded-full bg-gradient-to-r from-amber-400 to-purple-400" />
                <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
                  FAQ
                </span>
              </div>

              <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4">
                {content.header.title}
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
                {content.header.description}
              </p>
            </FadeIn>
          </EditableSection>
        </div>
      </section>

      {/* ================================================================
          FAQ List - Dark glass cards
          ================================================================ */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-slate-900 to-slate-900">
        {/* Subtle divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12 md:mb-20" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Section intro */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
            <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
              Click any question to reveal the answer
            </span>
          </div>

          {/* FAQ List */}
          <EditableSection sectionKey="items" label="FAQ Items">
            <StaggerContainer as="div">
            <SortableItemsWrapper
              sectionKey="items"
              arrayField="items"
              itemIds={content.items.map((_, i) => `faq-item-${i}`)}
              className="space-y-4 mb-10"
            >
              {content.items.map((faq, index) => {
                const colors = ['green', 'blue', 'purple', 'gold'] as const;
                const color = colors[index % 4];
                const isExpanded = expandedIndex === index;

                return (
                  <StaggerItem key={`faq-item-${index}`}>
                  <EditableItem
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
                        bg-white/5 rounded-2xl backdrop-blur-sm
                        border ${isExpanded ? 'border-white/20' : 'border-white/10'}
                        ${cardHoverRing[color]}
                        transition-all duration-300 ease-out
                        ${isExpanded ? 'shadow-lg shadow-black/20' : 'shadow-sm shadow-black/10'}
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
                          ${isExpanded ? 'bg-white/5' : 'hover:bg-white/5'}
                          rounded-t-2xl
                          ${!isExpanded && 'rounded-b-2xl'}
                        `}
                        aria-expanded={isExpanded}
                      >
                        <CircleBadge number={index + 1} color={color} size="sm" />
                        <h2 className={`flex-1 text-lg md:text-xl font-bold tracking-tight ${questionText[color]}`}>
                          {faq.question}
                        </h2>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown
                            className="w-5 h-5 text-slate-500 group-hover:text-slate-300"
                          />
                        </motion.div>
                      </button>

                      {/* Answer - expandable content */}
                      <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 md:px-6 pb-5 md:pb-6 pt-2 ml-12 md:ml-14 border-t border-white/10">
                            <p className="text-slate-400 leading-relaxed">
                              {renderAnswer(faq.answer, faq.links)}
                            </p>
                          </div>
                        </motion.div>
                      )}
                      </AnimatePresence>
                    </div>
                  </EditableItem>
                  </StaggerItem>
                );
              })}
            </SortableItemsWrapper>
            </StaggerContainer>
          </EditableSection>
        </div>
      </section>

      {/* ================================================================
          CTA Section - Dark Editorial
          ================================================================ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-24">
          <EditableSection sectionKey="cta" label="Call to Action">
            <RevealSection>
            <CTASection
              title={content.cta.title}
              description={content.cta.description}
              buttons={content.cta.buttons}
              hoverColor={content.cta.hoverColor || 'gold'}
            />
            </RevealSection>
          </EditableSection>
        </div>
      </section>
    </div>
  );
}
