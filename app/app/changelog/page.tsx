import PageHeader from '@/components/PageHeader';
import { headingColors, formInputColors, categoryBadgeColors } from '@/lib/colors';
import Image from 'next/image';
import * as fs from 'fs';
import * as path from 'path';

export const dynamic = 'force-dynamic';

// ============================================================================
// Changelog Page - Feature Updates and Improvements
// ============================================================================
// Displays all feature updates with screenshots, descriptions, and how-to guides.
// Entries are stored as JSON files in content/changelog/

export const metadata = {
  title: 'Changelog - NeedThisDone',
  description:
    'See what\'s new! Browse recent features, improvements, and updates to NeedThisDone.',
};

// ============================================================================
// Types
// ============================================================================

interface ChangelogEntry {
  title: string;
  slug: string;
  date: string;
  category: string;
  description: string;
  benefit: string;
  howToUse: string[];
  screenshots: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
}

// ============================================================================
// Data Fetching
// ============================================================================

async function getChangelogEntries(): Promise<ChangelogEntry[]> {
  try {
    const changelogDir = path.join(process.cwd(), '..', 'content', 'changelog');

    if (!fs.existsSync(changelogDir)) {
      return [];
    }

    const files = fs.readdirSync(changelogDir).filter((f) => f.endsWith('.json'));

    const entries: ChangelogEntry[] = [];

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(changelogDir, file), 'utf-8');
        const entry = JSON.parse(content) as ChangelogEntry;

        // Only include entries with title and description (skip empty templates)
        if (entry.title && entry.description) {
          entries.push(entry);
        }
      } catch {
        // Skip invalid files
      }
    }

    // Sort by date (newest first)
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch {
    return [];
  }
}

// ============================================================================
// Category Badge Component
// ============================================================================

function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${categoryBadgeColors[category] || categoryBadgeColors.Public}`}
    >
      {category}
    </span>
  );
}

// ============================================================================
// Changelog Entry Card Component
// ============================================================================

function ChangelogCard({ entry }: { entry: ChangelogEntry }) {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <CategoryBadge category={entry.category} />
          <time className={`text-sm ${formInputColors.helper}`}>{entry.date}</time>
        </div>
        <h2 className={`text-xl font-bold ${headingColors.primary} mb-2`}>{entry.title}</h2>
        <p className={`${formInputColors.helper}`}>{entry.description}</p>
      </div>

      {/* Screenshots */}
      {entry.screenshots.length > 0 && (
        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
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

      {/* Benefit & How To Use */}
      <div className="p-6 space-y-4">
        {/* Benefit */}
        {entry.benefit && (
          <div className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden="true">✨</span>
            <div>
              <h3 className={`font-semibold ${headingColors.secondary} mb-1`}>Why You&apos;ll Love It</h3>
              <p className={formInputColors.helper}>{entry.benefit}</p>
            </div>
          </div>
        )}

        {/* How To Use */}
        {entry.howToUse.length > 0 && (
          <div className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden="true">📖</span>
            <div>
              <h3 className={`font-semibold ${headingColors.secondary} mb-2`}>How to Use</h3>
              <ol className="list-decimal list-inside space-y-1">
                {entry.howToUse.map((step, index) => (
                  <li key={index} className={formInputColors.helper}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

// ============================================================================
// Page Component
// ============================================================================

export default async function ChangelogPage() {
  const entries = await getChangelogEntries();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header */}
      <PageHeader
        title="What's New"
        description="Stay up to date with the latest features, improvements, and updates to NeedThisDone."
      />

      {entries.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16">
          <div className="text-6xl mb-4" aria-hidden="true">🚀</div>
          <h2 className={`text-2xl font-bold ${headingColors.primary} mb-2`}>
            Building Something Great
          </h2>
          <p className={`${formInputColors.helper} max-w-md mx-auto`}>
            We're constantly working on new features and improvements. Check back soon to see
            what's new!
          </p>
        </div>
      ) : (
        /* Changelog Entries */
        <div className="space-y-8">
          {entries.map((entry) => (
            <ChangelogCard key={entry.slug} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
