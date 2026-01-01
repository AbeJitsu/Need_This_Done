'use client';

import PageHeader from '@/components/PageHeader';
import { EditableSection } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import type { ChangelogPageContent } from '@/lib/page-content-types';
import { headingColors, formInputColors, categoryBadgeColors } from '@/lib/colors';
import Image from 'next/image';

// ============================================================================
// Changelog Page Client - Universal Editing Version
// ============================================================================
// Uses universal content loading from InlineEditProvider.
// EditableSection wrappers provide click-to-select functionality.

interface ChangelogChange {
  what: string;
  why: string;
  where: string;
}

interface ChangelogEntry {
  title: string;
  slug: string;
  date: string;
  category: string;
  description: string;
  benefit: string;
  changes?: ChangelogChange[];
  howToUse: string[];
  screenshots: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
}

interface ChangelogPageClientProps {
  initialContent: ChangelogPageContent;
  entries: ChangelogEntry[];
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${categoryBadgeColors[category] || categoryBadgeColors.Public}`}
    >
      {category}
    </span>
  );
}

function ChangelogCard({ entry }: { entry: ChangelogEntry }) {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <CategoryBadge category={entry.category} />
          <time className={`text-sm ${formInputColors.helper}`}>{entry.date}</time>
        </div>
        <h2 className={`text-xl font-bold ${headingColors.primary} mb-2`}>{entry.title}</h2>
        <p className={`${formInputColors.helper}`}>{entry.description}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Changes - What/Why/Where format */}
        {entry.changes && entry.changes.length > 0 && (
          <div className="space-y-4">
            <h3 className={`font-semibold ${headingColors.secondary}`}>What Changed</h3>
            <div className="space-y-4">
              {entry.changes.map((change, index) => (
                <div
                  key={index}
                  className="pl-4 border-l-2 border-blue-500 dark:border-blue-400 space-y-1"
                >
                  <p className={`font-medium ${headingColors.primary}`}>{change.what}</p>
                  <p className={`text-sm ${formInputColors.helper}`}>{change.why}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{change.where}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Benefit */}
        {entry.benefit && (
          <div>
            <h3 className={`font-semibold ${headingColors.secondary} mb-2`}>Why It Matters</h3>
            <p className={formInputColors.helper}>{entry.benefit}</p>
          </div>
        )}

        {/* How to Use */}
        {entry.howToUse.length > 0 && (
          <div>
            <h3 className={`font-semibold ${headingColors.secondary} mb-2`}>Where to See It</h3>
            <ul className="list-disc list-inside space-y-1">
              {entry.howToUse.map((step, index) => (
                <li key={index} className={`${formInputColors.helper} text-sm`}>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Screenshots - only show if explicitly included */}
        {entry.screenshots && entry.screenshots.length > 0 && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="grid gap-4 md:grid-cols-2">
              {entry.screenshots.map((screenshot, index) => (
                <figure key={index} className="space-y-2">
                  <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <Image
                      src={screenshot.src}
                      alt={screenshot.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  {screenshot.caption && (
                    <figcaption className={`text-sm ${formInputColors.helper} text-center`}>
                      {screenshot.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default function ChangelogPageClient({ initialContent, entries }: ChangelogPageClientProps) {
  // Use content from universal provider (auto-loaded by route)
  const { pageContent } = useInlineEdit();
  // Check that pageContent has expected structure before using it
  const hasValidContent = pageContent && 'header' in pageContent && 'emptyState' in pageContent;
  const content = hasValidContent ? (pageContent as unknown as ChangelogPageContent) : initialContent;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      <EditableSection sectionKey="header" label="Page Header">
        <PageHeader
          title={content.header.title}
          description={content.header.description}
          color="teal"
        />
      </EditableSection>

      {entries.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4" aria-hidden="true">{content.emptyState.emoji}</div>
          <h2 className={`text-2xl font-bold ${headingColors.primary} mb-2`}>
            {content.emptyState.title}
          </h2>
          <p className={`${formInputColors.helper} max-w-md mx-auto`}>
            {content.emptyState.description}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {entries.map((entry) => (
            <ChangelogCard key={entry.slug} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
