'use client';

import PageHeader from '@/components/PageHeader';
import { EditableSection } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import type { GuidePageContent } from '@/lib/page-content-types';
import { headingColors, formInputColors, accentColors, focusRingClasses } from '@/lib/colors';
import Image from 'next/image';
import Link from 'next/link';

// ============================================================================
// Guide Page Client - Universal Editing Version
// ============================================================================
// Uses universal content loading from InlineEditProvider.
// EditableSection wrappers provide click-to-select functionality.

interface GuideStep {
  number: number;
  title: string;
  description: string;
}

interface Guide {
  id: string;
  title: string;
  description: string;
  icon: string;
  steps: GuideStep[];
  screenshot?: {
    src: string;
    alt: string;
  };
  ctaText: string;
  ctaLink: string;
}

interface GuidePageClientProps {
  initialContent: GuidePageContent;
  guides: Guide[];
}

function GuideCard({ guide }: { guide: Guide }) {
  return (
    <article
      id={guide.id}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl" aria-hidden="true">{guide.icon}</span>
          <div>
            <h2 className={`text-xl font-bold ${headingColors.primary}`}>{guide.title}</h2>
            <p className={formInputColors.helper}>{guide.description}</p>
          </div>
        </div>
      </div>

      {guide.screenshot && (
        <div className="p-6 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
          <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <Image
              src={guide.screenshot.src}
              alt={guide.screenshot.alt}
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        </div>
      )}

      <div className="p-6">
        <h3 className={`font-semibold ${headingColors.secondary} mb-4`}>How it works</h3>
        <ol className="space-y-4">
          {guide.steps.map((step) => (
            <li key={step.number} className="flex gap-4">
              <span
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${accentColors.purple.bg} ${accentColors.purple.text}`}
              >
                {step.number}
              </span>
              <div>
                <p className={`font-medium ${headingColors.primary}`}>{step.title}</p>
                <p className={`text-sm ${formInputColors.helper}`}>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
          <Link
            href={guide.ctaLink}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${accentColors.purple.bg} ${accentColors.purple.text} ${accentColors.purple.hoverText} ${accentColors.purple.hoverBorder} ${focusRingClasses.purple}`}
          >
            {guide.ctaText}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

function QuickLinks({ guides }: { guides: Guide[] }) {
  return (
    <nav className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
      <h2 className={`font-semibold ${headingColors.secondary} mb-4`}>Jump to a guide</h2>
      <ul className="flex flex-wrap gap-2">
        {guides.map((guide) => (
          <li key={guide.id}>
            <a
              href={`#${guide.id}`}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors bg-gray-100 dark:bg-gray-700 ${headingColors.primary} hover:bg-gray-200 dark:hover:bg-gray-600 ${focusRingClasses.purple}`}
            >
              <span aria-hidden="true">{guide.icon}</span>
              {guide.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function GuidePageClient({ initialContent, guides }: GuidePageClientProps) {
  // Use content from universal provider (auto-loaded by route)
  const { pageContent } = useInlineEdit();
  const content = (pageContent as unknown as GuidePageContent) || initialContent;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      <EditableSection sectionKey="header" label="Page Header">
        <PageHeader
          title={content.header.title}
          description={content.header.description}
        />
      </EditableSection>

      <QuickLinks guides={guides} />

      <div className="space-y-8">
        {guides.map((guide) => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </div>

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
