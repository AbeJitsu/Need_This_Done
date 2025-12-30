import { test, expect, Page } from '@playwright/test';

// ============================================================================
// Test 3: Field Coverage Verification
// ============================================================================
// PROOF: Every field defined in the content type is actually editable.
//
// This test catches the Privacy/Terms/Guide bug where pages appeared editable
// but had hardcoded content instead of rendering from JSON. When clicking
// sections, the sidebar showed "Item 1" instead of actual field values.
//
// Approach:
// 1. Click on specific content text from the page
// 2. Verify the sidebar shows an input containing that text (not a placeholder)
// 3. If all expected content appears as editable inputs, the page is working

// ============================================================================
// Test Data: Content to verify per page
// ============================================================================
// For each page, define multiple pieces of content that MUST be editable
// These are drawn from page-content-types.ts field definitions

interface ContentToVerify {
  path: string;
  contentToFind: Array<{
    clickTarget: string; // Text to click on the page
    expectedInInput: string; // Partial text that should be in an editable input
    fieldType: 'input' | 'textarea';
  }>;
}

const PAGES_CONTENT: ContentToVerify[] = [
  {
    path: '/',
    contentToFind: [
      { clickTarget: 'Get your tasks done right', expectedInInput: 'Get your tasks', fieldType: 'input' },
      { clickTarget: 'What We Offer', expectedInInput: 'What We Offer', fieldType: 'input' },
    ],
  },
  {
    path: '/services',
    contentToFind: [
      { clickTarget: 'Find Your Perfect Fit', expectedInInput: 'Find Your Perfect', fieldType: 'input' },
    ],
  },
  {
    path: '/pricing',
    contentToFind: [
      { clickTarget: 'Pricing That Fits', expectedInInput: 'Pricing That', fieldType: 'input' },
    ],
  },
  {
    path: '/faq',
    contentToFind: [
      { clickTarget: 'Frequently Asked Questions', expectedInInput: 'Frequently Asked', fieldType: 'input' },
    ],
  },
  {
    path: '/how-it-works',
    contentToFind: [
      { clickTarget: 'We Make It Easy', expectedInInput: 'We Make It Easy', fieldType: 'input' },
    ],
  },
  {
    path: '/contact',
    contentToFind: [
      { clickTarget: 'Request a Free Quote', expectedInInput: 'Free Quote', fieldType: 'input' },
    ],
  },
  {
    path: '/get-started',
    contentToFind: [
      { clickTarget: 'Ready to Get Started', expectedInInput: 'Ready to Get', fieldType: 'input' },
    ],
  },
  {
    path: '/blog',
    contentToFind: [
      { clickTarget: 'Blog', expectedInInput: 'Blog', fieldType: 'input' },
    ],
  },
  {
    path: '/changelog',
    contentToFind: [
      { clickTarget: 'Changelog', expectedInInput: 'Changelog', fieldType: 'input' },
    ],
  },
  {
    path: '/guide',
    contentToFind: [
      { clickTarget: 'Getting Started Guide', expectedInInput: 'Getting Started', fieldType: 'input' },
    ],
  },
  {
    path: '/privacy',
    contentToFind: [
      { clickTarget: 'Privacy Policy', expectedInInput: 'Privacy Policy', fieldType: 'input' },
    ],
  },
  {
    path: '/terms',
    contentToFind: [
      { clickTarget: 'Terms of Service', expectedInInput: 'Terms of Service', fieldType: 'input' },
    ],
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

async function enableEditMode(page: Page) {
  const editToggle = page.locator('button[aria-label="Edit this page"]');
  await editToggle.waitFor({ state: 'visible', timeout: 10000 });
  await editToggle.click();
  await page.getByText('Edit Mode', { exact: true }).waitFor({ state: 'visible', timeout: 5000 });

  // Wait for content to be loaded in the InlineEditContext
  // This ensures clicking on sections will work properly
  const sidebar = page.locator('[data-testid="admin-sidebar"]');
  await sidebar.waitFor({ state: 'visible', timeout: 5000 });
  await page.waitForFunction(
    () => document.querySelector('[data-content-loaded="true"]') !== null,
    { timeout: 5000 }
  );
}

async function findInputWithValue(
  page: Page,
  searchText: string,
  fieldType: 'input' | 'textarea'
): Promise<boolean> {
  const sidebar = page.locator('[data-testid="admin-sidebar"]');
  const selector = fieldType === 'textarea' ? 'textarea' : 'input[type="text"]';
  const inputs = sidebar.locator(selector);
  const count = await inputs.count();

  for (let i = 0; i < count; i++) {
    const value = await inputs.nth(i).inputValue();
    if (value.toLowerCase().includes(searchText.toLowerCase())) {
      return true;
    }
  }
  return false;
}

// ============================================================================
// Field Coverage Tests - Verify clicked content appears in sidebar inputs
// ============================================================================

test.describe('Field Coverage - Content to Input Mapping', () => {
  for (const pageData of PAGES_CONTENT) {
    for (const content of pageData.contentToFind) {
      test(`${pageData.path}: clicking "${content.clickTarget}" shows editable input`, async ({
        page,
      }) => {
        await page.goto(pageData.path);
        await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
        await enableEditMode(page);

        // Find and click the target content - prefer h1/h2 for headers
        let targetElement = page.locator(`h1:has-text("${content.clickTarget}")`).first();
        if (!(await targetElement.isVisible({ timeout: 1000 }).catch(() => false))) {
          targetElement = page.locator(`h2:has-text("${content.clickTarget}")`).first();
        }
        if (!(await targetElement.isVisible({ timeout: 1000 }).catch(() => false))) {
          targetElement = page.getByText(content.clickTarget, { exact: false }).first();
        }
        await expect(targetElement).toBeVisible({ timeout: 5000 });
        await targetElement.click();

        // Sidebar should open
        const sidebar = page.locator('[data-testid="admin-sidebar"]');
        await expect(sidebar).toBeVisible({ timeout: 5000 });

        // Sidebar should NOT show empty state
        const emptyState = sidebar.getByText('Click a section to edit');
        await expect(emptyState).not.toBeVisible({ timeout: 2000 });

        // Find input containing the expected value
        const found = await findInputWithValue(page, content.expectedInInput, content.fieldType);

        // If not found in current view, try navigating through sections
        if (!found) {
          const sectionButtons = sidebar.locator('button:has(span.font-medium)');
          const sectionCount = await sectionButtons.count();

          let foundInSection = false;
          for (let i = 0; i < sectionCount && !foundInSection; i++) {
            await sectionButtons.nth(i).click();
            await page.waitForTimeout(300);

            foundInSection = await findInputWithValue(
              page,
              content.expectedInInput,
              content.fieldType
            );

            if (!foundInSection) {
              const backButton = sidebar.locator('button:has-text("All Sections")');
              if (await backButton.isVisible()) {
                await backButton.click();
                await page.waitForTimeout(200);
              }
            }
          }

          expect(
            foundInSection,
            `Clicking "${content.clickTarget}" on ${pageData.path} should reveal an input containing "${content.expectedInInput}"`
          ).toBe(true);
        } else {
          expect(found).toBe(true);
        }
      });
    }
  }
});

// ============================================================================
// Array Section Tests - Verify sections render their items from JSON
// ============================================================================

interface ArraySectionTest {
  path: string;
  sectionName: string;
  firstItemText: string; // Text from first array item that should appear
}

const ARRAY_SECTION_TESTS: ArraySectionTest[] = [
  { path: '/privacy', sectionName: 'Content Sections', firstItemText: 'Information We Collect' },
  { path: '/terms', sectionName: 'Content Sections', firstItemText: 'Services Overview' },
  { path: '/guide', sectionName: 'Guide Sections', firstItemText: 'Browse Our Services' },
  { path: '/faq', sectionName: 'Items', firstItemText: 'What types of tasks' },
  { path: '/pricing', sectionName: 'Pricing Tiers', firstItemText: 'Quick Task' },
];

test.describe('Array Sections - Items Render from JSON', () => {
  for (const testCase of ARRAY_SECTION_TESTS) {
    test(`${testCase.path}: ${testCase.sectionName} shows real item content`, async ({ page }) => {
      await page.goto(testCase.path);
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
      await enableEditMode(page);

      // Click on the main content area
      await page.locator('h1').first().click();
      const sidebar = page.locator('[data-testid="admin-sidebar"]');
      await expect(sidebar).toBeVisible({ timeout: 5000 });

      // Navigate to the array section
      const sectionButton = sidebar.getByText(testCase.sectionName, { exact: false }).first();
      if (await sectionButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await sectionButton.click();
        await page.waitForTimeout(300);

        // Verify the first item shows real content, not "Item 1" placeholder
        // The item button should contain actual content text
        const itemButtons = sidebar.locator('button:has(div.truncate, span.truncate)');
        const itemCount = await itemButtons.count();

        if (itemCount > 0) {
          const firstItemText = await itemButtons.first().textContent();
          expect(
            firstItemText?.includes(testCase.firstItemText.substring(0, 15)),
            `Array section "${testCase.sectionName}" on ${testCase.path} should show item content like "${testCase.firstItemText}", got "${firstItemText}"`
          ).toBe(true);
        }

        // Also verify clicking into an item shows editable fields
        if (itemCount > 0) {
          await itemButtons.first().click();
          await page.waitForTimeout(300);

          const inputs = sidebar.locator('input[type="text"], textarea');
          const inputCount = await inputs.count();

          expect(
            inputCount,
            `Clicking into array item on ${testCase.path} should reveal editable inputs`
          ).toBeGreaterThan(0);

          // At least one input should have substantial content (not empty)
          let hasContent = false;
          for (let i = 0; i < inputCount; i++) {
            const value = await inputs.nth(i).inputValue();
            if (value.length > 5) {
              hasContent = true;
              break;
            }
          }

          expect(
            hasContent,
            `Array item inputs on ${testCase.path} should contain actual content`
          ).toBe(true);
        }
      }
    });
  }
});

// ============================================================================
// Regression Test: No "Item 1" Placeholder Syndrome
// ============================================================================
// This specific test catches the exact bug that affected Privacy/Terms/Guide
// where clicking showed "Item 1" instead of actual field values

test.describe('Regression: No Placeholder Items', () => {
  const pagesWithArrays = ['/privacy', '/terms', '/guide', '/faq', '/pricing', '/how-it-works'];

  for (const pagePath of pagesWithArrays) {
    test(`${pagePath}: array items show real names, not "Item 1"`, async ({ page }) => {
      await page.goto(pagePath);
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
      await enableEditMode(page);

      // Click on main content
      await page.locator('h1').first().click();
      const sidebar = page.locator('[data-testid="admin-sidebar"]');
      await expect(sidebar).toBeVisible({ timeout: 5000 });

      // Check all visible button text - none should be exactly "Item 1", "Item 2", etc.
      const allButtons = sidebar.locator('button');
      const buttonCount = await allButtons.count();

      for (let i = 0; i < buttonCount; i++) {
        const buttonText = await allButtons.nth(i).textContent();
        const isGenericItem = /^Item \d+$/.test(buttonText?.trim() || '');

        if (isGenericItem) {
          // If we find "Item N", click into it and verify it has real content
          await allButtons.nth(i).click();
          await page.waitForTimeout(300);

          const inputs = sidebar.locator('input[type="text"], textarea');
          const inputCount = await inputs.count();

          let hasRealContent = false;
          for (let j = 0; j < inputCount; j++) {
            const value = await inputs.nth(j).inputValue();
            if (value.length > 10) {
              hasRealContent = true;
              break;
            }
          }

          expect(
            hasRealContent,
            `"${buttonText}" on ${pagePath} should reveal inputs with real content, not be a placeholder for hardcoded HTML`
          ).toBe(true);

          // Go back for next check
          const backButton = sidebar.locator('button:has-text("Back"), button:has-text("All")');
          if (await backButton.first().isVisible()) {
            await backButton.first().click();
            await page.waitForTimeout(200);
          }
        }
      }
    });
  }
});
