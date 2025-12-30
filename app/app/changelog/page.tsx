import { getDefaultContent } from '@/lib/default-page-content';
import type { ChangelogPageContent } from '@/lib/page-content-types';
import ChangelogPageClient from '@/components/changelog/ChangelogPageClient';
import * as fs from 'fs';
import * as path from 'path';

export const dynamic = 'force-dynamic';

// ============================================================================
// Changelog Page - Feature Updates and Improvements
// ============================================================================
// Displays all feature updates with screenshots, descriptions, and how-to guides.
// Entries are stored as JSON files in content/changelog/
//
// INLINE EDITING: This page supports inline editing for admins.
// Click the floating pencil button to open the edit sidebar,
// then click on any section to edit its content directly.

export const metadata = {
  title: 'Changelog - NeedThisDone',
  description:
    "See what's new! Browse recent features, improvements, and updates to NeedThisDone.",
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

async function getContent(): Promise<ChangelogPageContent> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/page-content/changelog`, {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      return data.content as ChangelogPageContent;
    }
  } catch (error) {
    console.error('Failed to fetch changelog content:', error);
  }

  return getDefaultContent('changelog') as ChangelogPageContent;
}

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

        if (entry.title && entry.description) {
          entries.push(entry);
        }
      } catch {
        // Skip invalid files
      }
    }

    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch {
    return [];
  }
}

// ============================================================================
// Page Component
// ============================================================================

export default async function ChangelogPage() {
  const [content, entries] = await Promise.all([getContent(), getChangelogEntries()]);

  return <ChangelogPageClient initialContent={content} entries={entries} />;
}
