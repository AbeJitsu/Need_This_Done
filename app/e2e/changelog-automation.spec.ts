import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { waitForPageReady, setDarkMode } from './helpers';

// ============================================================================
// Changelog Automation E2E Tests
// ============================================================================
// Tests the full changelog automation system:
// 1. Changelog page displays entries correctly
// 2. Screenshot-affected script generates proper changelog templates
// 3. Entries with _needsCompletion flag are processed correctly
//
// Usage:
//   npx playwright test e2e/changelog-automation.spec.ts --project=e2e-bypass

const CHANGELOG_DIR = path.join(process.cwd(), '..', 'content', 'changelog');

interface ChangelogEntry {
  title: string;
  slug: string;
  date: string;
  category: string;
  description: string;
  benefit: string;
  howToUse: string[];
  screenshots: Array<{ src: string; alt: string; caption: string }>;
  _gitContext?: string;
  _affectedRoutes?: string[];
  _needsCompletion?: boolean;
}

// ============================================================================
// Changelog Page Display Tests
// ============================================================================

test.describe('Changelog Page', () => {
  test('loads and displays changelog entries', async ({ page }) => {
    await page.goto('/changelog');
    await waitForPageReady(page);

    // Page should have the title
    await expect(page.locator('h1')).toContainText("What's New");

    // Should show either entries or empty state
    const hasEntries = await page.locator('article').count() > 0;
    const hasEmptyState = await page.locator('text=Building Something Great').count() > 0;

    expect(hasEntries || hasEmptyState).toBe(true);
  });

  test('changelog entries have required elements', async ({ page }) => {
    await page.goto('/changelog');
    await waitForPageReady(page);

    const articles = page.locator('article');
    const count = await articles.count();

    if (count === 0) {
      test.skip(true, 'No changelog entries to test');
      return;
    }

    // Check first entry has required elements
    const firstEntry = articles.first();

    // Should have category badge
    await expect(firstEntry.locator('span').first()).toBeVisible();

    // Should have title
    await expect(firstEntry.locator('h2')).toBeVisible();

    // Should have description
    await expect(firstEntry.locator('p').first()).toBeVisible();
  });

  test('changelog page works in dark mode', async ({ page }) => {
    await page.goto('/changelog');
    await setDarkMode(page);
    await waitForPageReady(page);

    // Verify dark mode class is applied
    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('dark');

    // Page should still be functional
    await expect(page.locator('h1')).toContainText("What's New");
  });

  test('changelog page is accessible', async ({ page }) => {
    await page.goto('/changelog');
    await waitForPageReady(page);

    // Basic accessibility checks
    // 1. Page has proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);

    // 2. Images have alt text (if any exist)
    const images = page.locator('article img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });
});

// ============================================================================
// Changelog Template Generation Tests
// ============================================================================

test.describe('Changelog Template Generation', () => {
  test('existing changelog entries have valid JSON structure', async () => {
    if (!fs.existsSync(CHANGELOG_DIR)) {
      test.skip(true, 'No changelog directory');
      return;
    }

    const files = fs.readdirSync(CHANGELOG_DIR).filter(f => f.endsWith('.json'));

    if (files.length === 0) {
      test.skip(true, 'No changelog files to test');
      return;
    }

    for (const file of files) {
      const content = fs.readFileSync(path.join(CHANGELOG_DIR, file), 'utf-8');
      const entry = JSON.parse(content) as ChangelogEntry;

      // Required fields
      expect(entry.title).toBeDefined();
      expect(entry.slug).toBeDefined();
      expect(entry.date).toBeDefined();
      expect(entry.category).toBeDefined();
      expect(Array.isArray(entry.screenshots)).toBe(true);

      // Category should be valid (known categories from existing entries)
      const validCategories = ['Admin', 'Shop', 'Public', 'Dashboard', 'Content', 'Design'];
      expect(validCategories).toContain(entry.category);

      // Date should be valid format (YYYY-MM-DD)
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  test('completed entries have no underscore-prefixed fields', async () => {
    if (!fs.existsSync(CHANGELOG_DIR)) {
      test.skip(true, 'No changelog directory');
      return;
    }

    const files = fs.readdirSync(CHANGELOG_DIR).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const content = fs.readFileSync(path.join(CHANGELOG_DIR, file), 'utf-8');
      const entry = JSON.parse(content) as ChangelogEntry;

      // If entry has description (is completed), should not have internal fields
      if (entry.description && entry.description.length > 0) {
        expect(entry._needsCompletion).toBeUndefined();
        // _gitContext and _affectedRoutes should also be removed for completed entries
      }
    }
  });
});

// ============================================================================
// Screenshot-Affected Script Tests
// ============================================================================

test.describe('Screenshot Affected Script', () => {
  const TEST_CHANGELOG_FILE = path.join(CHANGELOG_DIR, 'test-automation.json');

  test.afterEach(() => {
    // Clean up test file
    if (fs.existsSync(TEST_CHANGELOG_FILE)) {
      fs.unlinkSync(TEST_CHANGELOG_FILE);
    }
  });

  test('script generates changelog with automation fields', async () => {
    // This test verifies the script output format
    // We'll run it in dry mode (--skip-playwright) to just generate the template

    try {
      // Modify a file that's actually used by routes (colors.ts is a global file)
      const colorsFile = path.join(process.cwd(), 'lib', 'colors.ts');
      const originalContent = fs.readFileSync(colorsFile, 'utf-8');

      // Add a harmless comment to trigger change detection
      fs.writeFileSync(colorsFile, originalContent + '\n// e2e test marker\n');

      // Run the screenshot script in skip mode
      const output = execSync('npx tsx scripts/screenshot-affected.ts --skip-playwright', {
        cwd: process.cwd(),
        encoding: 'utf-8',
        env: { ...process.env },
      });

      // Restore original file
      fs.writeFileSync(colorsFile, originalContent);

      // Verify output contains expected markers
      expect(output).toContain('CHANGELOG_NEEDS_COMPLETION');
      expect(output).toContain('GIT CONTEXT:');

    } catch (error) {
      // If no changes detected or no routes affected, skip
      const errorOutput = (error as { stdout?: string }).stdout || '';
      if (
        errorOutput.includes('No changes detected') ||
        errorOutput.includes('No frontend files changed') ||
        errorOutput.includes('No routes affected')
      ) {
        test.skip(true, 'No mapped routes to test with');
        return;
      }
      throw error;
    }
  });

  test('generated changelog has _needsCompletion flag', async () => {
    // Find any changelog with _needsCompletion flag
    if (!fs.existsSync(CHANGELOG_DIR)) {
      test.skip(true, 'No changelog directory');
      return;
    }

    const files = fs.readdirSync(CHANGELOG_DIR).filter(f => f.endsWith('.json'));

    // Look for files that are incomplete (have empty description)
    for (const file of files) {
      const content = fs.readFileSync(path.join(CHANGELOG_DIR, file), 'utf-8');
      const entry = JSON.parse(content) as ChangelogEntry;

      // If it's an incomplete entry, it should have the completion flag
      if (!entry.description || entry.description.length === 0) {
        // New entries should have automation fields
        if (entry._needsCompletion !== undefined) {
          expect(entry._needsCompletion).toBe(true);
          expect(entry._gitContext).toBeDefined();
          expect(entry._affectedRoutes).toBeDefined();
        }
      }
    }
  });
});

// ============================================================================
// Integration Test: Full Changelog Flow
// ============================================================================

test.describe('Changelog Integration', () => {
  test('changelog page dynamically picks up new entries', async ({ page }) => {
    // Count current entries
    await page.goto('/changelog');
    await waitForPageReady(page);

    const initialCount = await page.locator('article').count();

    // Create a test changelog entry
    const testEntry: ChangelogEntry = {
      title: 'Test Automation Entry',
      slug: 'test-automation-e2e',
      date: new Date().toISOString().split('T')[0],
      category: 'Public',
      description: 'This is a test entry created by e2e tests to verify dynamic loading.',
      benefit: 'Ensures the changelog system works correctly.',
      howToUse: ['Run tests', 'Verify entries appear'],
      screenshots: [],
    };

    const testFile = path.join(CHANGELOG_DIR, 'test-automation-e2e.json');

    try {
      // Ensure directory exists
      if (!fs.existsSync(CHANGELOG_DIR)) {
        fs.mkdirSync(CHANGELOG_DIR, { recursive: true });
      }

      // Write test entry
      fs.writeFileSync(testFile, JSON.stringify(testEntry, null, 2));

      // Reload page and verify entry appears
      await page.reload();
      await waitForPageReady(page);

      const newCount = await page.locator('article').count();
      expect(newCount).toBe(initialCount + 1);

      // Verify our entry is visible
      await expect(page.locator('text=Test Automation Entry')).toBeVisible();

    } finally {
      // Clean up
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    }
  });
});
