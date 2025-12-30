import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Inline Edit Coverage: Auto-Discovery Test
// ============================================================================
// This test AUTOMATICALLY discovers all content pages and verifies
// they support inline editing. No manual page list to maintain.
//
// How it works:
// 1. Scans the app/ directory for page.tsx files
// 2. Excludes functional pages (admin, auth, checkout, etc)
// 3. Tests remaining pages for edit mode support
//
// This prevents the "forgot to add EditableSection" bug.

async function enableEditMode(page: Page) {
  const editToggle = page.locator('button[aria-label="Edit this page"]');
  await editToggle.waitFor({ state: 'visible', timeout: 10000 });
  await editToggle.click();
  await page.getByText('Edit Mode', { exact: true }).waitFor({ state: 'visible', timeout: 5000 });
}

// Dynamically discover all page routes that should be editable
function discoverEditablePages(): string[] {
  const appDir = path.join(__dirname, '../app');
  const pages: string[] = [];

  function scanDirectory(dir: string, basePath: string = '') {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      const routePath = basePath + '/' + item.name;

      if (item.isDirectory()) {
        // Skip non-route directories
        if (['api', '_', 'components', 'lib', 'context', 'e2e', '__tests__', 'node_modules', 'hooks', 'types', 'utils'].includes(item.name)) {
          continue;
        }
        // Skip dynamic routes (require specific IDs)
        if (item.name.startsWith('[')) {
          continue;
        }
        scanDirectory(fullPath, routePath);
      } else if (item.name === 'page.tsx') {
        const route = basePath || '/';
        pages.push(route);
      }
    }
  }

  scanDirectory(appDir);

  // Exclude functional pages that don't need inline editing
  // These are app functionality, not content pages
  const excludePatterns = [
    '/admin',      // Admin dashboard - has own editing UI
    '/cart',       // Shopping cart - data driven
    '/checkout',   // Payment flow - data driven
    '/login',      // Auth - functional
    '/dashboard',  // User dashboard - data driven
    '/shop',       // Product listing - data from Medusa
  ];

  return pages.filter(p => !excludePatterns.some(exclude => p.startsWith(exclude)));
}

// Get all editable pages
const EDITABLE_PAGES = discoverEditablePages();

test.describe('Inline Edit Coverage', () => {

  // ============================================================================
  // Core Test: Every content page must support edit mode
  // ============================================================================
  test.describe('All content pages support edit mode', () => {
    for (const pagePath of EDITABLE_PAGES) {
      test(`${pagePath}: has edit toggle and opens sidebar on click`, async ({ page }) => {
        await page.goto(pagePath);

        // Wait for page to load
        await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });

        // Must have edit toggle (proves page has InlineEditProvider)
        const editToggle = page.locator('button[aria-label="Edit this page"]');
        await expect(editToggle).toBeVisible({
          timeout: 5000,
        });

        // Enable edit mode
        await enableEditMode(page);

        // Click the main heading - sidebar should open WITH CONTENT
        await page.locator('h1').first().click();

        const sidebar = page.locator('[data-testid="admin-sidebar"]');
        await expect(sidebar).toBeVisible({ timeout: 5000 });

        // CRITICAL: Sidebar must have LOADED CONTENT, not just "Click a section to edit"
        // If it shows "Click a section to edit:", clicking did NOT work
        const emptyState = sidebar.getByText('Click a section to edit');
        await expect(emptyState).not.toBeVisible({ timeout: 2000 });

        // Must show actual editing fields (input, textarea, or field labels)
        const hasEditableFields = await sidebar.locator('input, textarea, select, [data-field]').count();
        expect(hasEditableFields).toBeGreaterThan(0);
      });
    }
  });

  // ============================================================================
  // Deep Test: Click elements inside EditableSection wrappers
  // ============================================================================
  // This catches the bug where EditableSection exists but doesn't trigger
  test.describe('All editable sections are clickable', () => {
    for (const pagePath of EDITABLE_PAGES) {
      test(`${pagePath}: clicking editable section content opens editor`, async ({ page }) => {
        await page.goto(pagePath);
        await expect(page.locator('h1').first()).toBeVisible();
        await enableEditMode(page);

        // Find all EditableSection wrappers
        const editableSections = page.locator('[data-editable-section]');
        const sectionCount = await editableSections.count();

        if (sectionCount === 0) {
          // Page has no editable sections - this is caught by the core test
          return;
        }

        // Click inside the SECOND section if it exists (first is usually header, already tested)
        const targetSection = sectionCount > 1 ? editableSections.nth(1) : editableSections.first();

        // Find clickable content inside the section
        const clickableContent = targetSection.locator('h2, h3, p, span').first();
        if (await clickableContent.count() > 0) {
          await clickableContent.scrollIntoViewIfNeeded();
          await clickableContent.click();

          // Sidebar must open WITH CONTENT
          const sidebar = page.locator('[data-testid="admin-sidebar"]');
          await expect(sidebar).toBeVisible({ timeout: 5000 });

          // Must NOT show empty state
          const emptyState = sidebar.getByText('Click a section to edit');
          await expect(emptyState).not.toBeVisible({ timeout: 2000 });
        }
      });
    }
  });

  // ============================================================================
  // Regression Test: Page must show correct content in editor
  // ============================================================================
  test.describe('Editor shows correct page context', () => {
    for (const pagePath of EDITABLE_PAGES) {
      test(`${pagePath}: editor shows matching page name`, async ({ page }) => {
        await page.goto(pagePath);
        await expect(page.locator('h1').first()).toBeVisible();
        await enableEditMode(page);

        // Click title to open editor
        await page.locator('h1').first().click();

        const sidebar = page.locator('[data-testid="admin-sidebar"]');
        await expect(sidebar).toBeVisible();

        // Get the expected page name from the path
        const pageName = pagePath === '/' ? 'home' : pagePath.replace('/', '').replace(/-/g, ' ');

        // The sidebar should contain some reference to the current page
        // (This catches the bug where /contact showed "Editing: how it works")
        // We check that it does NOT contain other page names
        const otherPages = EDITABLE_PAGES
          .filter(p => p !== pagePath && p !== '/')
          .map(p => p.replace('/', '').replace(/-/g, ' '));

        for (const otherPage of otherPages) {
          // Skip if other page name is a substring of current (e.g., "services" in "services")
          if (pageName.includes(otherPage) || otherPage.includes(pageName)) continue;

          // Sidebar should not be showing a different page's name
          const sidebarText = await sidebar.textContent();
          if (sidebarText?.toLowerCase().includes(`editing: ${otherPage}`)) {
            throw new Error(
              `Content mismatch! On ${pagePath} but sidebar shows "Editing: ${otherPage}". ` +
              `This means the wrong page content is being loaded.`
            );
          }
        }
      });
    }
  });

  // ============================================================================
  // Discovery Verification: Log what pages were found
  // ============================================================================
  test('reports discovered pages', async () => {
    console.log('\n=== DISCOVERED EDITABLE PAGES ===');
    console.log(`Found ${EDITABLE_PAGES.length} pages:`);
    EDITABLE_PAGES.forEach(p => console.log(`  - ${p}`));
    console.log('=================================\n');

    // This test always passes - it's just for visibility
    expect(EDITABLE_PAGES.length).toBeGreaterThan(0);
  });
});
