#!/usr/bin/env npx tsx
/**
 * Complete Changelog Entries
 *
 * Finds changelog entries with _needsCompletion: true and generates
 * user-friendly content from the git context.
 *
 * Usage:
 *   npm run changelog:complete
 *   npx tsx scripts/complete-changelog.ts
 *   npx tsx scripts/complete-changelog.ts --dry-run
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Configuration
// ============================================================================

const CHANGELOG_DIR = path.join(process.cwd(), '..', 'content', 'changelog');
const DRY_RUN = process.argv.includes('--dry-run');

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
    caption: string;
  }>;
  _gitContext?: string;
  _affectedRoutes?: string[];
  _needsCompletion?: boolean;
}

interface ParsedCommit {
  type: 'feature' | 'fix' | 'refactor' | 'docs' | 'test' | 'config' | 'other';
  scope: string;
  message: string;
  filesChanged: number;
}

// ============================================================================
// Commit Message Parsing
// ============================================================================

/**
 * Parse commit messages from git context
 */
function parseCommitMessages(gitContext: string): ParsedCommit[] {
  const commits: ParsedCommit[] = [];

  // Look for commit message patterns
  const lines = gitContext.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and diff stats
    if (!trimmed || trimmed.match(/^\d+ file/) || trimmed.includes('|')) {
      continue;
    }

    // Parse conventional commit format or common prefixes
    const prefixes: Record<string, ParsedCommit['type']> = {
      'Add:': 'feature',
      'Fix:': 'fix',
      'Refactor:': 'refactor',
      'Docs:': 'docs',
      'Test:': 'test',
      'Config:': 'config',
      'feat:': 'feature',
      'fix:': 'fix',
      'refactor:': 'refactor',
      'docs:': 'docs',
      'test:': 'test',
      'chore:': 'config',
    };

    for (const [prefix, type] of Object.entries(prefixes)) {
      if (trimmed.startsWith(prefix)) {
        commits.push({
          type,
          scope: '',
          message: trimmed.replace(prefix, '').trim(),
          filesChanged: 0,
        });
        break;
      }
    }

    // Check for hash-prefixed commit format (from git log --oneline)
    const hashMatch = trimmed.match(/^[a-f0-9]{7,}\s+(.+)$/);
    if (hashMatch) {
      const msg = hashMatch[1];
      let type: ParsedCommit['type'] = 'other';

      for (const [prefix, t] of Object.entries(prefixes)) {
        if (msg.startsWith(prefix)) {
          type = t;
          break;
        }
      }

      commits.push({
        type,
        scope: '',
        message: msg,
        filesChanged: 0,
      });
    }
  }

  return commits;
}

/**
 * Extract file change stats from git context
 */
function parseFileChanges(gitContext: string): { files: string[]; totalChanges: number } {
  const files: string[] = [];
  let totalChanges = 0;

  const lines = gitContext.split('\n');

  for (const line of lines) {
    // Parse git diff --stat output: "file.tsx | 10 ++++"
    const statMatch = line.match(/^\s*(.+?)\s+\|\s+(\d+)/);
    if (statMatch) {
      files.push(statMatch[1].trim());
      totalChanges += parseInt(statMatch[2], 10);
    }
  }

  return { files, totalChanges };
}

// ============================================================================
// Auto-Log Integration
// ============================================================================

interface AutoLogEntry {
  hash: string;
  date: string;
  message: string;
  category: string;
  filesChanged: number;
}

/**
 * Get recent commits from auto-log.json for context
 */
function getRecentAutoLogCommits(limit: number = 10): AutoLogEntry[] {
  try {
    const autoLogPath = path.join(CHANGELOG_DIR, 'auto-log.json');
    if (!fs.existsSync(autoLogPath)) return [];

    const content = fs.readFileSync(autoLogPath, 'utf-8');
    const entries = JSON.parse(content) as AutoLogEntry[];

    // Return most recent entries (already sorted by date desc)
    return entries.slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * Find relevant commits from auto-log based on category
 */
function findRelatedCommits(
  _category: string,
  autoLogEntries: AutoLogEntry[]
): AutoLogEntry[] {
  // Filter for substantive commits (not just docs/config)
  return autoLogEntries.filter(entry => {
    return ['Features', 'Fixes', 'Refactoring', 'Other'].includes(entry.category);
  }).slice(0, 5);
}

// ============================================================================
// Content Generation
// ============================================================================

/**
 * Generate user-friendly description from commits and file changes
 */
function generateDescription(
  commits: ParsedCommit[],
  routes: string[],
  category: string,
  files: string[]
): string {
  // Try to get context from auto-log if no commits parsed
  if (commits.length === 0) {
    const autoLogCommits = getRecentAutoLogCommits(10);
    const relatedCommits = findRelatedCommits(category, autoLogCommits);

    if (relatedCommits.length > 0) {
      // Use the most recent relevant commit message
      const mainCommit = relatedCommits[0];
      const cleanMessage = mainCommit.message
        .replace(/^(Add|Fix|Refactor|Docs|Test|Config):\s*/i, '')
        .replace(/\s*\(.*\)$/, ''); // Remove parenthetical notes

      if (relatedCommits.length > 1) {
        return `${cleanMessage}. Also includes ${relatedCommits.length - 1} other recent improvement${relatedCommits.length > 2 ? 's' : ''}.`;
      }
      return cleanMessage + '.';
    }

    // Fallback based on routes and files
    const keyFiles = files
      .filter(f => f.includes('.tsx') || f.includes('.ts'))
      .filter(f => !f.includes('.test.') && !f.includes('screenshot'))
      .slice(0, 3);

    if (keyFiles.length > 0) {
      const components = keyFiles.map(f => {
        const name = path.basename(f, path.extname(f));
        return name.replace(/([A-Z])/g, ' $1').trim();
      });

      return `Updates to ${components.join(', ').toLowerCase()} with improved functionality and visual polish.`;
    }

    if (routes.length === 1) {
      return `Updates to the ${routes[0].replace('/', '') || 'homepage'} page with improved functionality and design.`;
    }
    return `Updates across ${routes.length} pages with improvements to the ${category.toLowerCase()} experience.`;
  }

  // Group by type
  const features = commits.filter(c => c.type === 'feature');
  const fixes = commits.filter(c => c.type === 'fix');
  const refactors = commits.filter(c => c.type === 'refactor');

  const parts: string[] = [];

  if (features.length > 0) {
    const featureList = features.map(f => f.message).slice(0, 2);
    parts.push(featureList.join('. '));
  }

  if (fixes.length > 0 && parts.length === 0) {
    parts.push(`Fixed ${fixes.length} issue${fixes.length > 1 ? 's' : ''} including ${fixes[0].message.toLowerCase()}`);
  }

  if (refactors.length > 0 && parts.length === 0) {
    parts.push(`Improved code quality and maintainability with ${refactors.length} refactoring update${refactors.length > 1 ? 's' : ''}`);
  }

  if (parts.length === 0) {
    // Generic fallback
    const mainCommit = commits[0];
    return mainCommit.message.replace(/^(Add|Fix|Refactor|Update|Improve):\s*/i, '');
  }

  return parts.join('. ') + '.';
}

/**
 * Generate benefit statement
 */
function generateBenefit(
  commits: ParsedCommit[],
  _routes: string[],
  category: string
): string {
  const hasFeatures = commits.some(c => c.type === 'feature');
  const hasFixes = commits.some(c => c.type === 'fix');

  // Category-specific benefits
  const categoryBenefits: Record<string, string> = {
    Admin: 'Streamlined admin workflows save you time when managing content and users.',
    Shop: 'Enhanced shopping experience makes it easier for customers to find and purchase products.',
    Dashboard: 'Better dashboard visibility helps you track what matters most.',
    Content: 'Improved content management makes updates faster and more intuitive.',
    Design: 'Refined visual design creates a more polished, professional experience.',
    Public: 'A better user experience for everyone visiting the site.',
  };

  if (hasFeatures) {
    return categoryBenefits[category] || 'New capabilities that make your workflow more efficient.';
  }

  if (hasFixes) {
    return 'Resolved issues that were affecting the user experience.';
  }

  return categoryBenefits[category] || 'Continued improvements to the platform experience.';
}

/**
 * Generate how-to-use steps based on routes and changes
 */
function generateHowToUse(
  commits: ParsedCommit[],
  routes: string[],
  category: string
): string[] {
  const steps: string[] = [];

  // Add navigation step
  if (routes.length === 1) {
    const route = routes[0];
    if (route === '/') {
      steps.push('Visit the homepage to see the changes');
    } else if (route.startsWith('/admin')) {
      steps.push(`Navigate to ${route} in the admin panel`);
    } else {
      steps.push(`Go to ${route} to see the updates`);
    }
  } else {
    steps.push(`Changes affect ${routes.length} pages across the ${category.toLowerCase()} section`);
  }

  // Add action steps based on commit types
  const hasFeatures = commits.some(c => c.type === 'feature');
  const hasFixes = commits.some(c => c.type === 'fix');

  if (hasFeatures) {
    steps.push('Try out the new functionality');
  }

  if (hasFixes) {
    steps.push('Previously reported issues should now be resolved');
  }

  // Add generic follow-up
  if (steps.length === 1) {
    steps.push('The improvements are applied automatically');
  }

  return steps;
}

// ============================================================================
// Main Completion Logic
// ============================================================================

/**
 * Complete a single changelog entry
 */
function completeEntry(entry: ChangelogEntry): ChangelogEntry {
  const gitContext = entry._gitContext || '';
  const routes = entry._affectedRoutes || [];

  // Parse the git context
  const commits = parseCommitMessages(gitContext);
  const { files, totalChanges } = parseFileChanges(gitContext);

  // Get auto-log commits for additional context
  const autoLogCommits = getRecentAutoLogCommits(10);
  const relatedAutoLogCommits = findRelatedCommits(entry.category, autoLogCommits);

  console.log(`    📝 Parsed ${commits.length} commits, ${files.length} files, ${totalChanges} changes`);
  if (relatedAutoLogCommits.length > 0) {
    console.log(`    📋 Found ${relatedAutoLogCommits.length} related commits from auto-log`);
  }

  // Generate content
  const description = generateDescription(commits, routes, entry.category, files);
  const benefit = generateBenefit(commits, routes, entry.category);
  const howToUse = generateHowToUse(commits, routes, entry.category);
  // Screenshots deprecated in favor of text-focused approach
  const screenshots: ChangelogEntry['screenshots'] = [];

  // Return completed entry without internal fields
  const { _gitContext, _affectedRoutes, _needsCompletion, ...cleanEntry } = entry;

  return {
    ...cleanEntry,
    description,
    benefit,
    howToUse,
    screenshots,
  };
}

/**
 * Find and complete all incomplete entries
 */
async function main() {
  console.log('📋 Changelog Auto-Completion\n');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN - No files will be modified\n');
  }

  // Check directory exists
  if (!fs.existsSync(CHANGELOG_DIR)) {
    console.log('❌ Changelog directory not found:', CHANGELOG_DIR);
    process.exit(1);
  }

  // Find all JSON files
  const files = fs.readdirSync(CHANGELOG_DIR).filter(f => f.endsWith('.json'));
  console.log(`📁 Found ${files.length} changelog files\n`);

  let completed = 0;
  let skipped = 0;

  for (const file of files) {
    const filePath = path.join(CHANGELOG_DIR, file);

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const entry = JSON.parse(content) as ChangelogEntry;

      // Skip auto-log.json (technical changelog)
      if (file === 'auto-log.json') {
        console.log(`⏭️  ${file} - Technical changelog (skipped)`);
        skipped++;
        continue;
      }

      // Check if needs completion
      if (!entry._needsCompletion) {
        console.log(`✅ ${file} - Already complete`);
        skipped++;
        continue;
      }

      console.log(`🔧 ${file} - Completing...`);

      const completedEntry = completeEntry(entry);

      if (DRY_RUN) {
        console.log('    Would generate:');
        console.log(`      Description: ${completedEntry.description.substring(0, 60)}...`);
        console.log(`      Benefit: ${completedEntry.benefit.substring(0, 60)}...`);
        console.log(`      Steps: ${completedEntry.howToUse.length} items`);
      } else {
        fs.writeFileSync(filePath, JSON.stringify(completedEntry, null, 2) + '\n');
        console.log('    ✓ Written');
      }

      completed++;

    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log(`📊 Summary: ${completed} completed, ${skipped} skipped`);

  if (DRY_RUN && completed > 0) {
    console.log('\n💡 Run without --dry-run to apply changes');
  }
}

main().catch(console.error);
