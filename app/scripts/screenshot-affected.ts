#!/usr/bin/env npx tsx
/**
 * Screenshot Affected Routes
 *
 * Detects which files have changed, maps them to affected routes,
 * runs Playwright to capture screenshots, and generates a changelog entry.
 *
 * Usage:
 *   npm run screenshot:affected
 *   npx tsx scripts/screenshot-affected.ts
 *
 * Output:
 *   - Screenshots in public/screenshots/<branch-name>/
 *   - Changelog template at content/changelog/<branch-name>.json
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Configuration
const COMPONENT_MAP_FILE = path.join(process.cwd(), 'component-route-map.json');
const SCREENSHOTS_DIR = path.join(process.cwd(), 'public', 'screenshots');
const CHANGELOG_DIR = path.join(process.cwd(), '..', 'content', 'changelog');
const AFFECTED_ROUTES_FILE = path.join(process.cwd(), 'affected-routes.json');

// Types
interface ComponentRouteMap {
  generatedAt: string;
  routes: Array<{ path: string; file: string; imports: string[] }>;
  componentToRoutes: { [key: string]: string[] };
  globalFiles: string[];
}

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
  // Internal fields for automation (not displayed on changelog page)
  _gitContext?: string;
  _affectedRoutes?: string[];
  _needsCompletion?: boolean;
}

/**
 * Get current git branch name
 */
function getCurrentBranch(): string {
  try {
    return execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
  } catch {
    return 'unknown';
  }
}

/**
 * Get list of changed files from git
 * Runs from repo root to get consistent paths
 */
function getChangedFiles(): string[] {
  try {
    // Run git commands from repo root (parent of app/)
    const repoRoot = path.join(process.cwd(), '..');
    const execOptions = { encoding: 'utf-8' as const, cwd: repoRoot };

    // Get staged changes
    const staged = execSync('git diff --cached --name-only', execOptions);
    // Get unstaged changes
    const unstaged = execSync('git diff --name-only', execOptions);
    // Get untracked files (new files not yet added to git)
    const untracked = execSync('git ls-files --others --exclude-standard', execOptions);

    const files = [
      ...staged.split('\n'),
      ...unstaged.split('\n'),
      ...untracked.split('\n'),
    ]
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    // Deduplicate
    return [...new Set(files)];
  } catch {
    return [];
  }
}

/**
 * Get git diff summary for changelog context
 * Returns a human-readable summary of what changed
 */
function getGitDiffSummary(): string {
  try {
    const repoRoot = path.join(process.cwd(), '..');
    const execOptions = { encoding: 'utf-8' as const, cwd: repoRoot, maxBuffer: 10 * 1024 * 1024 };

    // Get diff stat (shows files changed with +/- lines)
    const diffStat = execSync('git diff --stat HEAD 2>/dev/null || git diff --stat', execOptions).trim();

    // Get commit messages on this branch (if not main)
    let commitMessages = '';
    try {
      const branch = execSync('git branch --show-current', execOptions).trim();
      if (branch && branch !== 'main' && branch !== 'master') {
        const messages = execSync(`git log main..HEAD --oneline 2>/dev/null || echo ""`, execOptions).trim();
        if (messages) {
          commitMessages = `\nCommit messages:\n${messages}`;
        }
      }
    } catch {
      // Ignore if can't get commit messages
    }

    return diffStat + commitMessages;
  } catch {
    return 'Unable to get diff summary';
  }
}

/**
 * Check if a file is a frontend file that could affect visuals
 */
function isFrontendFile(file: string): boolean {
  // Files within app/ directory (the Next.js app project folder)
  if (!file.startsWith('app/')) {
    return false;
  }

  // Frontend patterns - match against the full path from repo root
  // Paths look like: app/app/page.tsx, app/components/Button.tsx, etc.
  const frontendPatterns = [
    /^app\/app\/.*\.tsx$/,          // Pages (app/app/**/page.tsx)
    /^app\/components\/.*\.tsx$/,   // Components
    /^app\/lib\/colors\.ts$/,       // Color system
    /^app\/app\/globals\.css$/,     // Global styles
    /\.css$/,                        // Any CSS file
    /^app\/lib\/.*\.tsx?$/,         // Lib files that might affect rendering
    /^app\/context\/.*\.tsx?$/,     // Context providers
  ];

  return frontendPatterns.some((pattern) => pattern.test(file));
}

/**
 * Map changed files to affected routes
 */
function getAffectedRoutes(changedFiles: string[], map: ComponentRouteMap): string[] {
  const affectedRoutes = new Set<string>();

  // Check for global file changes
  for (const file of changedFiles) {
    const relativePath = file.replace('app/', '');

    // Global files affect all routes
    if (map.globalFiles.some((gf) => relativePath.includes(gf.replace('app/', '').replace('components/', '')))) {
      console.log(`  ⚠️  Global file changed: ${file} → ALL routes affected`);
      return map.routes.map((r) => r.path);
    }
  }

  // Check component changes
  for (const file of changedFiles) {
    const relativePath = file.replace('app/', '');

    // Check if it's a page file
    if (relativePath.startsWith('app/') && relativePath.endsWith('/page.tsx')) {
      // Extract route from page file path
      const route = '/' + relativePath.replace('app/', '').replace('/page.tsx', '');
      affectedRoutes.add(route === '/' ? '/' : route);
      console.log(`  📄 Page changed: ${file} → ${route}`);
      continue;
    }

    // Check if it's a component that maps to routes
    for (const [componentPath, routes] of Object.entries(map.componentToRoutes)) {
      if (relativePath.includes(componentPath.replace('.tsx', ''))) {
        routes.forEach((route) => affectedRoutes.add(route));
        console.log(`  🧩 Component changed: ${file} → ${routes.length} routes`);
        break;
      }
    }
  }

  return [...affectedRoutes];
}

/**
 * Determine category from affected routes
 */
function getCategory(routes: string[]): string {
  const adminRoutes = routes.filter((r) => r.startsWith('/admin'));
  const shopRoutes = routes.filter((r) => r.includes('shop') || r.includes('cart') || r.includes('checkout'));
  const dashboardRoutes = routes.filter((r) => r.startsWith('/dashboard'));
  const contentRoutes = routes.filter((r) => r.includes('blog') || r.includes('changelog'));
  const designRoutes = routes.filter((r) => r.includes('design') || r.includes('style') || r.includes('theme'));

  if (adminRoutes.length > routes.length / 2) return 'Admin';
  if (shopRoutes.length > routes.length / 2) return 'Shop';
  if (dashboardRoutes.length > 0) return 'Dashboard';
  if (contentRoutes.length > routes.length / 2) return 'Content';
  if (designRoutes.length > routes.length / 2) return 'Design';
  return 'Public';
}

/**
 * Generate changelog entry template
 */
function generateChangelogEntry(
  branchName: string,
  routes: string[],
  _screenshotDir: string,
  gitContext: string
): ChangelogEntry {
  const date = new Date().toISOString().split('T')[0];
  const category = getCategory(routes);

  // Generate screenshot entries
  const screenshots: ChangelogEntry['screenshots'] = [];
  for (const route of routes.slice(0, 5)) {
    // Limit to first 5 routes
    const routeName = route === '/' ? 'home' : route.replace(/\//g, '-').replace(/^-/, '');
    screenshots.push({
      src: `/screenshots/${branchName}/${routeName}-desktop-light.png`,
      alt: `Screenshot of ${route}`,
      caption: '', // Claude fills this in
    });
  }

  return {
    title: branchName
      .replace('claude/', '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    slug: branchName.replace('claude/', ''),
    date,
    category,
    description: '', // Claude fills this in
    benefit: '', // Claude fills this in
    howToUse: [], // Claude fills this in
    screenshots,
    // Internal fields for automation
    _gitContext: gitContext,
    _affectedRoutes: routes,
    _needsCompletion: true,
  };
}

/**
 * Check for --skip-playwright flag
 */
const skipPlaywright = process.argv.includes('--skip-playwright');

/**
 * Main function
 */
async function main() {
  console.log('📸 Screenshot Affected Routes\n');

  // Load component map
  if (!fs.existsSync(COMPONENT_MAP_FILE)) {
    console.error('❌ Component map not found. Run: npm run screenshot:map');
    process.exit(1);
  }

  const map: ComponentRouteMap = JSON.parse(fs.readFileSync(COMPONENT_MAP_FILE, 'utf-8'));

  // Get changed files
  console.log('🔍 Detecting changed files...');
  const changedFiles = getChangedFiles();

  if (changedFiles.length === 0) {
    console.log('  No changes detected. Commit your changes first or stage them with git add.');
    process.exit(0);
  }

  console.log(`  Found ${changedFiles.length} changed files\n`);

  // Filter to frontend files
  const frontendFiles = changedFiles.filter(isFrontendFile);
  console.log('📁 Frontend files changed:');
  frontendFiles.forEach((f) => console.log(`  - ${f}`));

  if (frontendFiles.length === 0) {
    console.log('  No frontend files changed. Nothing to screenshot.');
    process.exit(0);
  }

  // Get affected routes
  console.log('\n🗺️  Mapping to routes...');
  const affectedRoutes = getAffectedRoutes(frontendFiles, map);

  if (affectedRoutes.length === 0) {
    console.log('  No routes affected. The changed files may not be imported by any page.');
    process.exit(0);
  }

  console.log(`\n📍 Affected routes (${affectedRoutes.length}):`);
  affectedRoutes.forEach((r) => console.log(`  - ${r}`));

  // Get branch name
  const branchName = getCurrentBranch();
  const safebranchName = branchName.replace(/\//g, '-');

  // Create screenshot directory
  const screenshotDir = path.join(SCREENSHOTS_DIR, safebranchName);
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  // Write affected routes for Playwright to read
  fs.writeFileSync(
    AFFECTED_ROUTES_FILE,
    JSON.stringify(
      {
        routes: affectedRoutes,
        branch: branchName,
        screenshotDir: safebranchName,
        generatedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );

  console.log(`\n📷 Routes saved to affected-routes.json`);
  console.log(`   Screenshots will be saved to: public/screenshots/${safebranchName}/`);

  // Generate changelog entry with git context
  console.log('\n📝 Generating changelog template...');
  const gitContext = getGitDiffSummary();

  // Ensure changelog directory exists
  if (!fs.existsSync(CHANGELOG_DIR)) {
    fs.mkdirSync(CHANGELOG_DIR, { recursive: true });
  }

  const changelogEntry = generateChangelogEntry(safebranchName, affectedRoutes, screenshotDir, gitContext);
  const changelogFile = path.join(CHANGELOG_DIR, `${safebranchName}.json`);

  fs.writeFileSync(changelogFile, JSON.stringify(changelogEntry, null, 2));

  console.log(`   Changelog template: content/changelog/${safebranchName}.json`);

  // Run Playwright (if spec exists and not skipped)
  if (skipPlaywright) {
    console.log('\n⏭️  Skipping Playwright (--skip-playwright flag)');
    console.log('   Run `npm run screenshot:affected` with dev server for screenshots.');
  } else {
    console.log('\n🎭 Running Playwright...');
    try {
      execSync('npx playwright test e2e/targeted-screenshots.spec.ts --project=e2e-bypass', {
        cwd: process.cwd(),
        stdio: 'inherit',
        env: {
          ...process.env,
          AFFECTED_ROUTES_FILE: AFFECTED_ROUTES_FILE,
          SKIP_WEBSERVER: 'true', // Use existing dev server if running
        },
      });
      console.log('\n✅ Screenshots captured successfully!');
    } catch (error) {
      console.log('\n⚠️  Playwright test not found or failed. Create e2e/targeted-screenshots.spec.ts');
      console.log('   You can still manually capture screenshots at the affected routes.');
    }
  }

  console.log('\n📋 Summary:');
  console.log(`   Branch: ${branchName}`);
  console.log(`   Routes: ${affectedRoutes.length}`);
  console.log(`   Screenshots: public/screenshots/${safebranchName}/`);
  console.log(`   Changelog: content/changelog/${safebranchName}.json`);

  // Output completion marker for Claude automation
  // This special format tells Claude to complete the changelog entry
  console.log('\n' + '═'.repeat(60));
  console.log('CHANGELOG_NEEDS_COMPLETION');
  console.log('═'.repeat(60));
  console.log(`FILE: content/changelog/${safebranchName}.json`);
  console.log(`ROUTES: ${affectedRoutes.join(', ')}`);
  console.log('─'.repeat(60));
  console.log('GIT CONTEXT:');
  console.log(gitContext);
  console.log('═'.repeat(60));
  console.log('\n📸 NEXT STEP: Run /document to visually review screenshots');
  console.log('   The /document skill will:');
  console.log('   - Look at each screenshot image');
  console.log('   - Write accurate captions based on what is visible');
  console.log('   - Remove invalid/stale screenshots');
  console.log('   - Complete the changelog entry');
}

main().catch(console.error);
