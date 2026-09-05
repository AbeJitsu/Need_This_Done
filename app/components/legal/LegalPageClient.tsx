'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Check,
  FileText,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import {
  ContentCollection,
  ContentItem,
  ContentSection,
} from '@/components/content/ContentStructure';
import type { LegalPageContent } from '@/lib/page-content-types';

export type LegalDocumentKind = 'privacy' | 'terms';

interface LegalDocumentConfig {
  label: string;
  icon: LucideIcon;
  accent: {
    heroIcon: string;
    summaryIcon: string;
    sectionNumber: string;
    ctaIcon: string;
  };
  cta: {
    eyebrow: string;
    title: string;
    description: string;
    button: string;
    href: string;
  };
}

const LEGAL_DOCUMENT_CONFIG: Record<LegalDocumentKind, LegalDocumentConfig> = {
  privacy: {
    label: 'Privacy policy',
    icon: ShieldCheck,
    accent: {
      heroIcon: 'text-emerald-200',
      summaryIcon: 'text-[var(--public-green)]',
      sectionNumber: 'bg-[var(--public-soft)] text-[var(--public-green)]',
      ctaIcon: 'text-white',
    },
    cta: {
      eyebrow: 'Questions about privacy?',
      title: 'Keep the request clear.',
      description: 'Email your privacy question or correction or deletion request directly.',
      button: 'Email us',
      href: 'mailto:hello@needthisdone.com',
    },
  },
  terms: {
    label: 'Terms of service',
    icon: FileText,
    accent: {
      heroIcon: 'text-emerald-200',
      summaryIcon: 'text-[var(--public-green)]',
      sectionNumber: 'bg-[var(--public-soft)] text-[var(--public-green)]',
      ctaIcon: 'text-white',
    },
    cta: {
      eyebrow: 'Questions about the terms?',
      title: 'Make the next step explicit.',
      description: 'Share the context and we can clarify the scope, proposal, or decision point before work begins.',
      button: 'Email us',
      href: 'mailto:hello@needthisdone.com',
    },
  },
};

interface LegalPageClientProps {
  initialContent: LegalPageContent;
  document: LegalDocumentKind;
}

function LegalParagraphs({ content }: { content: string }) {
  return (
    <div className="max-w-[60ch] text-[1.05rem] leading-8 text-[var(--public-muted)]">
      {content
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph, index) => (
          <p key={`${paragraph.slice(0, 24)}-${index}`} className={index > 0 ? 'mt-5' : undefined}>
            {paragraph.split(/([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi).map((part, i) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(part) ? <a key={i} href={`mailto:${part}`} className="underline text-[var(--public-green)]">{part}</a> : part)}
          </p>
        ))}
    </div>
  );
}

export default function LegalPageClient({ initialContent, document }: LegalPageClientProps) {
  const content = initialContent;
  const config = LEGAL_DOCUMENT_CONFIG[document];
  const PageIcon = config.icon;

  return (
    <main id="main-content" className="min-h-screen bg-[var(--public-cream)] text-[var(--public-ink)]">
      <section aria-labelledby="legal-page-title" className="bg-[var(--public-dark)] text-white">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
            <ContentSection sectionKey="header" label="Page Header">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-emerald-200">
                  <PageIcon className={`h-4 w-4 ${config.accent.heroIcon}`} aria-hidden="true" />
                  {config.label}
                </div>
                <h1 id="legal-page-title" className="mt-6 max-w-4xl font-playfair text-5xl font-black leading-[1.04] tracking-tight sm:text-6xl md:text-7xl">
                  {content.header.title}
                </h1>
                <p className="mt-7 max-w-[60ch] text-lg leading-8 text-emerald-50/75 md:text-xl">
                  {content.header.description}
                </p>
              </div>
            </ContentSection>

            <ContentSection sectionKey="quickSummary" label="Quick Summary">
              <section id="at-a-glance" data-legal-panel="summary" aria-labelledby="at-a-glance-heading" className="min-w-0 rounded-[1.75rem] bg-[var(--public-cream)] p-6 text-[var(--public-ink)] shadow-xl shadow-black/10 sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[.2em] text-[var(--public-green)]">At a glance</p>
                <h2 id="at-a-glance-heading" className="mt-3 font-playfair text-3xl font-black">
                  {content.quickSummary.title}
                </h2>
                <ul className="mt-6 space-y-4">
                  {content.quickSummary.items.map((item, index) => (
                    <li key={`${item}-${index}`} className="flex items-start gap-3 text-sm leading-6 text-[#40564e]">
                      <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--public-soft)]">
                        <Check className={`h-3.5 w-3.5 ${config.accent.summaryIcon}`} strokeWidth={3} aria-hidden="true" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </ContentSection>
          </div>

          <ContentSection sectionKey="lastUpdated" label="Last Updated">
            <div className="mt-9 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-emerald-50/80">
              <PageIcon className={`h-4 w-4 ${config.accent.heroIcon}`} aria-hidden="true" />
              <span>Last updated: {content.lastUpdated}</span>
            </div>
          </ContentSection>
        </div>
      </section>

      <section aria-labelledby="legal-content-heading" className="bg-[var(--public-cream)]">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 md:py-20">
          <h2 id="legal-content-heading" className="sr-only">
            {content.header.title} details
          </h2>

          <div className="grid gap-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16">
            <nav aria-labelledby="on-this-page-heading" className="self-start lg:sticky lg:top-28">
              <p id="on-this-page-heading" className="text-xs font-bold uppercase tracking-[.2em] text-[var(--public-green)]">On this page</p>
              <ol className="mt-4 space-y-2 border-l border-[var(--public-ink)]/15 pl-4">
                {content.sections.map((section, index) => (
                  <li key={`index-${index}`}>
                    <a
                      href={`#legal-section-${index + 1}`}
                      className="text-sm leading-6 text-[var(--public-muted)] transition-colors hover:text-[var(--public-green)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-green)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--public-cream)]"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <ContentSection sectionKey="sections" label="Content Sections">
              <ContentCollection
                sectionKey="sections"
                arrayField="sections"
                itemIds={content.sections.map((_, index) => `section-${index}`)}
                className="space-y-5"
              >
                {content.sections.map((section, index) => (
                  <ContentItem
                    key={`section-${index}`}
                    sectionKey="sections"
                    arrayField="sections"
                    index={index}
                    label={section.title}
                    content={section as unknown as Record<string, unknown>}
                    sortable
                    sortId={`section-${index}`}
                  >
                    <article id={`legal-section-${index + 1}`} data-legal-panel="section" aria-labelledby={`legal-section-heading-${index + 1}`} className="scroll-mt-28 rounded-[1.75rem] border border-[var(--public-ink)]/10 bg-white p-6 shadow-sm sm:p-8">
                      <div className="flex items-start gap-4">
                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-black ${config.accent.sectionNumber}`} aria-hidden="true">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <h3 id={`legal-section-heading-${index + 1}`} className="pt-1 font-playfair text-2xl font-black leading-tight sm:text-3xl">
                          {section.title}
                        </h3>
                      </div>
                      <div className="mt-6">
                        <LegalParagraphs content={section.content} />
                      </div>
                    </article>
                  </ContentItem>
                ))}
              </ContentCollection>
            </ContentSection>
          </div>

          <section data-legal-panel="cta" aria-labelledby="legal-cta-heading" className="mt-12 rounded-[2rem] border border-[var(--public-ink)]/10 bg-[var(--public-soft)] p-7 sm:p-9">
            <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[.2em] text-[var(--public-green)]">{config.cta.eyebrow}</p>
                <h2 id="legal-cta-heading" className="mt-3 font-playfair text-3xl font-black sm:text-4xl">{config.cta.title}</h2>
                <p className="mt-3 max-w-[60ch] leading-7 text-[var(--public-muted)]">{config.cta.description}</p>
              </div>
              <Link
                href={config.cta.href}
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--public-green)] px-7 py-3 font-bold text-white transition hover:bg-[#0c563e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-green)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--public-soft)]"
              >
                {config.cta.button}
                <ArrowRight className={`h-4 w-4 ${config.accent.ctaIcon}`} aria-hidden="true" />
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
