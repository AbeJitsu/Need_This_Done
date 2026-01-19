import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ============================================================================
// Changelog Cron Job - /api/cron/changelog
// ============================================================================
// What: Processes incomplete changelog entries daily
// Why: Automatically generates user-friendly content from git context
// How: Runs on schedule, finds entries with needs_completion=true, generates content
//
// Schedule: Daily at midnight via Vercel Cron
// Protection: Requires CRON_SECRET header in production

// ============================================================================
// Types
// ============================================================================

interface ChangelogChange {
  what: string;
  why: string;
  where: string;
}

interface ParsedCommit {
  type: 'feature' | 'fix' | 'refactor' | 'docs' | 'test' | 'config' | 'other';
  message: string;
}

// ============================================================================
// POST - Process Incomplete Entries
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (process.env.NODE_ENV === 'production' && cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Find entries needing completion
    const { data: incompleteEntries, error: fetchError } = await supabaseAdmin
      .from('changelog_entries')
      .select('*')
      .eq('needs_completion', true);

    if (fetchError) {
      console.error('Failed to fetch incomplete entries:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch entries' },
        { status: 500 }
      );
    }

    if (!incompleteEntries || incompleteEntries.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No entries need completion',
        processed: 0,
      });
    }

    const results = { processed: 0, completed: 0, errors: 0 };

    for (const entry of incompleteEntries) {
      try {
        // Parse git context
        const commits = parseCommitMessages(entry.git_context || '');
        const routes = entry.affected_routes || [];

        // Generate content
        const description = generateDescription(commits, routes, entry.category);
        const benefit = generateBenefit(commits, entry.category);
        const howToUse = generateHowToUse(routes, entry.category);
        const changes = generateChanges(commits, routes);

        // Update the entry
        const { error: updateError } = await supabaseAdmin
          .from('changelog_entries')
          .update({
            description,
            benefit,
            how_to_use: howToUse,
            changes,
            needs_completion: false,
            git_context: null, // Clear after processing
          })
          .eq('id', entry.id);

        if (updateError) {
          console.error(`Failed to update entry ${entry.slug}:`, updateError);
          results.errors++;
        } else {
          results.completed++;
        }

        results.processed++;
      } catch (error) {
        console.error(`Failed to process entry ${entry.slug}:`, error);
        results.errors++;
        results.processed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} entries`,
      ...results,
    });
  } catch (error) {
    console.error('Changelog cron error:', error);
    return NextResponse.json(
      { error: 'Failed to process changelog entries' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET - Check Cron Status
// ============================================================================

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Get stats
    const { data: incomplete } = await supabaseAdmin
      .from('changelog_entries')
      .select('id')
      .eq('needs_completion', true);

    const { data: total } = await supabaseAdmin
      .from('changelog_entries')
      .select('id');

    return NextResponse.json({
      status: 'ok',
      stats: {
        total: total?.length || 0,
        incomplete: incomplete?.length || 0,
        complete: (total?.length || 0) - (incomplete?.length || 0),
      },
    });
  } catch (error) {
    console.error('Changelog cron status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}

// ============================================================================
// Content Generation Helpers
// ============================================================================

function parseCommitMessages(gitContext: string): ParsedCommit[] {
  const commits: ParsedCommit[] = [];
  const lines = gitContext.split('\n');

  const prefixes: Record<string, ParsedCommit['type']> = {
    'Add:': 'feature',
    'Fix:': 'fix',
    'Refactor:': 'refactor',
    'Docs:': 'docs',
    'Test:': 'test',
    'Config:': 'config',
    'feat:': 'feature',
    'fix:': 'fix',
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.match(/^\d+ file/) || trimmed.includes('|')) continue;

    for (const [prefix, type] of Object.entries(prefixes)) {
      if (trimmed.startsWith(prefix)) {
        commits.push({
          type,
          message: trimmed.replace(prefix, '').trim(),
        });
        break;
      }
    }
  }

  return commits;
}

function generateDescription(
  commits: ParsedCommit[],
  routes: string[],
  category: string
): string {
  if (commits.length === 0) {
    return `Updates to ${category.toLowerCase()} features.`;
  }

  const features = commits.filter(c => c.type === 'feature');
  const fixes = commits.filter(c => c.type === 'fix');

  let desc = '';

  if (features.length > 0) {
    desc += `New: ${features.map(f => f.message).join(', ')}. `;
  }

  if (fixes.length > 0) {
    desc += `Fixes: ${fixes.map(f => f.message).join(', ')}.`;
  }

  if (!desc) {
    desc = `Improvements to ${routes.join(', ') || 'the site'}.`;
  }

  return desc.trim();
}

function generateBenefit(_commits: ParsedCommit[], category: string): string {
  const categoryBenefits: Record<string, string> = {
    Admin: 'Streamlined admin workflows save you time.',
    Shop: 'Enhanced shopping experience for customers.',
    Dashboard: 'Better visibility into what matters.',
    Content: 'Faster, more intuitive content updates.',
    Design: 'A more polished, professional experience.',
    Public: 'Improved experience across the site.',
  };

  return categoryBenefits[category] || 'A better experience for everyone.';
}

function generateHowToUse(routes: string[], category: string): string[] {
  if (routes.length === 0) {
    return [`Browse ${category.toLowerCase()} features to see the updates`];
  }

  return routes.slice(0, 3).map(route =>
    `Visit ${route === '/' ? 'the homepage' : route} to see the changes`
  );
}

function generateChanges(
  commits: ParsedCommit[],
  routes: string[]
): ChangelogChange[] {
  return commits.slice(0, 5).map((commit, index) => ({
    what: commit.message,
    why: commit.type === 'fix'
      ? 'Resolves an issue for better reliability'
      : 'Improves the user experience',
    where: routes[index] || 'Site-wide',
  }));
}
