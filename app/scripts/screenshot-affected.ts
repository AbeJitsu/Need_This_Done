#!/usr/bin/env npx tsx
/**
 * Screenshot Affected Routes
 *
 * Detects which files have changed, maps them to affected routes,
 * and runs Playwright to capture screenshots.
 *
 * Usage:
 *   npm run screenshot:affected
 *   npx tsx scripts/screenshot-affected.ts
 *
 * Output:
 *   - Screenshots in public/screenshots/<branch-name>/
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Configuration
const COMPONENT_MAP_FILE = path.join(process.cwd(), 'component-route-map.json');
const SCREENSHOTS_DIR = path.join(process.cwd(), 'public', 'screenshots');
const AFFECTED_ROUTES_FILE = path.join(process.cwd(), 'affected-routes.json');

// Types
interface ComponentRouteMap {
  generatedAt: string;
  routes: Array<{ path: string; file: string; imports: string[] }>;
  componentToRoutes: { [key: string]: string[] };
  globalFiles: string[];
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
 * Check if a file is a frontend file that could affect visuals
 */
function isFrontendFile(file: string): boolean {
  // Files within app/ directory (the Next.js app project folder)
  if (!file.startsWith('app/')) {
    return false;
  }

  // Frontend patterns - match against the full path from repo root
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
}

main().catch(console.error);
