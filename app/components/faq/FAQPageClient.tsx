'use client';

import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ChevronDown, HelpCircle } from 'lucide-react';
import { ContentSection, ContentItem, ContentCollection } from '@/components/content/ContentStructure';
import { RevealSection } from '@/components/motion';
import type { FAQPageContent } from '@/lib/page-content-types';

interface FAQPageClientProps {
  content: FAQPageContent;
}

function renderAnswer(answer: string, links?: Array<{ text: string; href: string }>): ReactNode {
  if (!links || links.length === 0) return answer;

  const parts: ReactNode[] = [];
  let lastIndex = 0;

  links.forEach((link, index) => {
    const linkIndex = answer.indexOf(link.text, lastIndex);
    if (linkIndex === -1) return;

    if (linkIndex > lastIndex) parts.push(answer.slice(lastIndex, linkIndex));
    parts.push(
      <Link
        key={`${link.href}-${index}`}
        href={link.href}
        className="font-bold text-[#126b4e] underline decoration-[#126b4e]/30 underline-offset-4 transition hover:decoration-[#126b4e]"
      >
        {link.text}
      </Link>,
    );
    lastIndex = linkIndex + link.text.length;
  });

  if (lastIndex < answer.length) parts.push(answer.slice(lastIndex));
  return parts.length > 0 ? parts : answer;
}

export default function FAQPageClient({ content }: FAQPageClientProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <main id="main-content" className="bg-[#f7f4ed] text-[#183229]">
      <section className="relative overflow-hidden border-b border-[#183229]/10 bg-[#18372e] text-white">
        <div className="pointer-events-none absolute -right-40 -top-48 h-[34rem] w-[34rem] rounded-full bg-emerald-300/15 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-56 left-1/3 h-[28rem] w-[28rem] rounded-full bg-[#d9b96e]/20 blur-3xl" aria-hidden="true" />

        <div className="relative mx-auto grid max-w-7xl items-end gap-12 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[1.05fr_.95fr] lg:gap-20 lg:px-12">
          <ContentSection sectionKey="header" label="Page Header">
            <div className="max-w-3xl">
                <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-emerald-200">
                  <HelpCircle className="h-4 w-4" aria-hidden="true" />
                  FAQ
                </p>
                <h1 className="mt-6 max-w-3xl font-playfair text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
                  {content.header.title}
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-8 text-emerald-50/75 md:text-xl">
                  {content.header.description}
                </p>
            </div>
          </ContentSection>

          <aside className="rounded-[2rem] border border-white/15 bg-white/[.08] p-6 backdrop-blur-sm sm:p-8" aria-labelledby="faq-overview-heading">
            <div className="flex items-center gap-3 text-emerald-200">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-300 text-[#18372e]">
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="text-xs font-bold uppercase tracking-[.2em]">A clear starting point</p>
            </div>
            <h2 id="faq-overview-heading" className="mt-6 font-playfair text-3xl font-black">Know what stays visible.</h2>
            <p className="mt-3 leading-7 text-emerald-50/70">
              The useful answer is usually the one that makes the next decision easier.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                ['01', 'Commitment', 'What is included?'],
                ['02', 'Boundary', 'What needs review?'],
                ['03', 'Next step', 'What happens after?'],
              ].map(([number, title, description]) => (
                <div key={number} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <span className="text-xs font-bold text-emerald-300">{number}</span>
                  <p className="mt-3 text-sm font-bold text-white">{title}</p>
                  <p className="mt-1 text-sm leading-5 text-emerald-50/65">{description}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:py-24 xl:grid-cols-[.72fr_1.28fr] xl:gap-20 lg:px-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">The short version</p>
          <h2 className="mt-4 font-playfair text-4xl font-black leading-tight md:text-5xl">Keep the open questions small.</h2>
          <p className="mt-5 max-w-md text-lg leading-8 text-[#50675e]">
            Open a question when you need it. Each answer is written to clarify the work, the boundary, or the next useful move.
          </p>
          <div className="mt-8 rounded-[1.5rem] border border-[#183229]/10 bg-[#e4eee6] p-5">
            <p className="text-sm font-bold text-[#183229]">Still unsure?</p>
            <p className="mt-2 text-sm leading-6 text-[#50675e]">Share the context you have and we can clarify the right starting point.</p>
            <Link href="/contact" className="mt-5 inline-flex items-center gap-2 font-bold text-[#126b4e]">
              Share your vision <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <ContentSection sectionKey="items" label="FAQ Items">
            <ContentCollection
              sectionKey="items"
              arrayField="items"
              itemIds={content.items.map((_, index) => `faq-item-${index}`)}
              className="space-y-4"
            >
              {content.items.map((faq, index) => {
                const isExpanded = expandedIndex === index;
                const answerId = `faq-answer-${index}`;

                return (
                  <div key={`faq-item-${index}`}>
                    <ContentItem
                      sectionKey="items"
                      arrayField="items"
                      index={index}
                      label={faq.question}
                      content={faq as unknown as Record<string, unknown>}
                      sortable
                      sortId={`faq-item-${index}`}
                    >
                      <article className={`overflow-hidden rounded-[1.5rem] border bg-white transition ${isExpanded ? 'border-[#126b4e]/40 shadow-lg shadow-emerald-950/5' : 'border-[#183229]/10 hover:border-[#126b4e]/35'}`}>
                        <button
                          type="button"
                          onClick={() => setExpandedIndex(isExpanded ? null : index)}
                          className="flex min-h-20 w-full items-center gap-4 px-5 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#126b4e] sm:px-7"
                          aria-expanded={isExpanded}
                          aria-controls={answerId}
                        >
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e4eee6] text-xs font-black text-[#126b4e]">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="flex-1 text-lg font-black leading-7 text-[#183229] sm:text-xl">{faq.question}</span>
                          <ChevronDown className={`h-5 w-5 shrink-0 text-[#126b4e] transition-transform ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                        </button>

                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              id={answerId}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: 'easeOut' }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-[#183229]/10 px-5 pb-6 pt-5 sm:px-7 sm:pl-[6.75rem]">
                                <p className="max-w-2xl text-base leading-8 text-[#50675e]">{renderAnswer(faq.answer, faq.links)}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </article>
                    </ContentItem>
                  </div>
                );
              })}
            </ContentCollection>
        </ContentSection>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 md:pb-24 lg:px-12">
        <ContentSection sectionKey="cta" label="Call to Action">
          <RevealSection>
            <div className="overflow-hidden rounded-[2rem] bg-[#18372e] p-8 text-white sm:p-12">
              <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-200">The next useful move</p>
                  <h2 className="mt-4 font-playfair text-4xl font-black leading-tight md:text-5xl">{content.cta.title}</h2>
                  {content.cta.description && <p className="mt-4 text-lg leading-8 text-emerald-50/75">{content.cta.description}</p>}
                </div>
                <div className="flex flex-wrap gap-3">
                  {content.cta.buttons.map((button, index) => (
                    <Link
                      key={`${button.href}-${index}`}
                      href={button.href}
                      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 py-3 font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#18372e] ${index === 0 ? 'bg-emerald-300 text-[#18372e] hover:bg-emerald-200' : 'border border-white/20 text-white hover:bg-white/10'}`}
                    >
                      {button.text} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </RevealSection>
        </ContentSection>
      </section>
    </main>
  );
}
