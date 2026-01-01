import { getDefaultContent } from '@/lib/default-page-content';
import type { ChangelogPageContent } from '@/lib/page-content-types';
import ChangelogPageClient from '@/components/changelog/ChangelogPageClient';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// ============================================================================
// Changelog Page - Feature Updates and Improvements
// ============================================================================
// Displays all feature updates with screenshots, descriptions, and how-to guides.
// Entries are stored in the changelog_entries Supabase table.
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
  changes?: Array<{ what: string; why: string; where: string }>;
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
    const supabaseAdmin = getSupabaseAdmin();

    // Fetch from database instead of JSON files
    const { data, error } = await supabaseAdmin
      .from('changelog_entries')
      .select('*')
      .eq('needs_completion', false)
      .order('date', { ascending: false });

    if (error) {
      console.error('Failed to fetch changelog entries:', error);
      return [];
    }

    // Transform to expected format
    return (data || []).map(entry => ({
      title: entry.title,
      slug: entry.slug,
      date: entry.date,
      category: entry.category,
      description: entry.description || '',
      benefit: entry.benefit || '',
      changes: entry.changes || [],
      howToUse: entry.how_to_use || [],
      screenshots: entry.screenshots || [],
    }));
  } catch (error) {
    console.error('Failed to fetch changelog entries:', error);
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
