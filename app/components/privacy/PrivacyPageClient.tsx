'use client';

import Link from 'next/link';
import { EditableSection, EditableItem, SortableItemsWrapper } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import type { PrivacyPageContent } from '@/lib/page-content-types';
import { FadeIn, RevealSection, StaggerContainer, StaggerItem } from '@/components/motion';
import { Shield, Check, Mail, ArrowRight } from 'lucide-react';

// ============================================================================
// Privacy Page Client - Bold Editorial Design
// ============================================================================
// Dark hero with gradient accents, editorial headers, styled quick summary,
// FadeIn animations. Matches pricing/homepage aesthetic.

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
          Hero Section - Bold Dark Editorial
          ================================================================ */}
      <section className="pt-8 md:pt-12 pb-4">
        <div className="relative overflow-hidden py-16 md:py-20 md:max-w-5xl md:mx-auto md:rounded-3xl">
          {/* Dark gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950" />
          {/* Accent glows */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-slate-500/10 rounded-full blur-3xl" />
          {/* Watermark */}
          <div className="absolute -bottom-8 -right-4 text-[10rem] font-black text-white/[0.03] leading-none select-none pointer-events-none">🔒</div>

          <div className="relative z-10 px-6 sm:px-8 md:px-12">
            <EditableSection sectionKey="header" label="Page Header">
              <FadeIn direction="up" triggerOnScroll={false}>
                {/* Editorial header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-1 rounded-full bg-gradient-to-r from-blue-400 to-slate-400" />
                    <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">Legal</span>
                  </div>
                  <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[0.95] mb-4">
                    Your privacy<br />
                    <span className="bg-gradient-to-r from-blue-400 via-slate-300 to-blue-400 bg-clip-text text-transparent">matters to us.</span>
                  </h1>
                  <p className="text-xl text-slate-400 max-w-xl leading-relaxed">
                    {content.header.description}
                  </p>
                </div>
              </FadeIn>
            </EditableSection>

            {/* Last Updated badge */}
            <EditableSection sectionKey="lastUpdated" label="Last Updated">
              <FadeIn direction="up" delay={0.1}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-400 text-sm">
                  <Shield size={16} className="text-blue-400" />
                  Last updated: {content.lastUpdated}
                </div>
              </FadeIn>
            </EditableSection>
          </div>
        </div>
      </section>

      {/* ================================================================
          Quick Summary - Dark glass card
          ================================================================ */}
      <section className="py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
          <EditableSection sectionKey="quickSummary" label="Quick Summary">
            <RevealSection>
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-500/10 rounded-full blur-3xl" />

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
                    <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">Quick Summary</span>
                  </div>
                  <h2 className="text-2xl font-black text-white mb-6">
                    {content.quickSummary.title}
                  </h2>
                  <StaggerContainer className="grid sm:grid-cols-2 gap-4">
                    {content.quickSummary.items.map((item, index) => (
                      <StaggerItem key={index}>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5">
                            <Check size={12} className="text-emerald-400" strokeWidth={3} />
                          </div>
                          <span className="text-slate-300 text-sm leading-relaxed">{item}</span>
                        </div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              </div>
            </RevealSection>
          </EditableSection>
        </div>
      </section>

      {/* ================================================================
          Main Content - White background with editorial headers
          ================================================================ */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Dynamic Sections - All from JSON and Editable */}
          <EditableSection sectionKey="sections" label="Content Sections">
            <SortableItemsWrapper
              sectionKey="sections"
              arrayField="sections"
              itemIds={content.sections.map((_, i) => `section-${i}`)}
              className="space-y-12"
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
                  <FadeIn direction="up">
                    <div className="group">
                      {/* Editorial section header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-1 rounded-full bg-gradient-to-r from-blue-500 to-slate-400 group-hover:w-8 transition-all duration-300" />
                        <span className="text-xs font-semibold tracking-widest uppercase text-gray-400">Section {index + 1}</span>
                      </div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-4">
                        {section.title}
                      </h2>
                      <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                        {section.content}
                      </div>
                    </div>
                  </FadeIn>
                </EditableItem>
              ))}
            </SortableItemsWrapper>
          </EditableSection>

          {/* Contact CTA - Dark card */}
          <RevealSection>
            <div className="mt-16 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-1 rounded-full bg-gradient-to-r from-blue-400 to-slate-400" />
                    <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">Questions?</span>
                  </div>
                  <p className="text-lg text-slate-300">
                    Questions or concerns about your privacy?
                  </p>
                </div>
                <Link
                  href="mailto:hello@needthisdone.com"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-white text-gray-900 hover:bg-white/90 shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 whitespace-nowrap"
                >
                  <Mail size={18} />
                  Email Us <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}
