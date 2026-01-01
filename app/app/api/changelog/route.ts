import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// ============================================================================
// Changelog API Route - /api/changelog
// ============================================================================
// GET: Fetches all public changelog entries (sorted by date)
//
// What: Returns changelog entries for the /changelog page
// Why: Enables database-driven changelog with automatic updates
// How: Queries changelog_entries table, excludes incomplete entries

// ============================================================================
// Types
// ============================================================================

interface ChangelogChange {
  what: string;
  why: string;
  where: string;
}

interface ChangelogEntry {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: string;
  description: string;
  benefit: string;
  changes: ChangelogChange[];
  howToUse: string[];
  screenshots: Array<{ src: string; alt: string; caption?: string }>;
}

// ============================================================================
// GET - Fetch All Changelog Entries
// ============================================================================

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Fetch all completed entries, sorted by date (newest first)
    const { data, error } = await supabaseAdmin
      .from('changelog_entries')
      .select('*')
      .eq('needs_completion', false)
      .order('date', { ascending: false });

    if (error) {
      console.error('Failed to fetch changelog entries:', error);
      return NextResponse.json(
        { error: 'Failed to fetch changelog entries' },
        { status: 500 }
      );
    }

    // Transform to match expected format (camelCase)
    const entries: ChangelogEntry[] = (data || []).map(entry => ({
      id: entry.id,
      slug: entry.slug,
      title: entry.title,
      date: entry.date,
      category: entry.category,
      description: entry.description || '',
      benefit: entry.benefit || '',
      changes: entry.changes || [],
      howToUse: entry.how_to_use || [],
      screenshots: entry.screenshots || [],
    }));

    return NextResponse.json({
      entries,
      count: entries.length,
    });
  } catch (error) {
    console.error('Changelog API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch changelog' },
      { status: 500 }
    );
  }
}
