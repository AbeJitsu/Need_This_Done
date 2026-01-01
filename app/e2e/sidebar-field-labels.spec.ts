import { test, expect, Page } from '@playwright/test';

// ============================================================================
// Test: Sidebar Field Labels - No Generic "Item X" Labels
// ============================================================================
// PROOF: When editing array items, the sidebar shows actual content values,
// not generic "Item 1", "Item 2" labels.
//
// This catches the bug where:
// - Privacy/Terms/Guide pages showed "Item 1" instead of section titles
// - FAQ items showed "item 1" instead of the actual question text
// - Any array without proper label extraction shows generic placeholders

// ============================================================================
// Test Data
// ============================================================================

interface ArrayItemTest {
  path: string;
  pageName: string;
  // Text to click on that represents an array item
  clickText: string;
  // Text that should appear in sidebar (the actual content, not "Item X")
  expectedInSidebar: string;
  // Text that should NOT appear (generic labels)
  shouldNotContain: string[];
}

const ARRAY_ITEM_TESTS: ArrayItemTest[] = [
  {
    path: '/faq',
    pageName: 'FAQ',
    // First FAQ question
    clickText: 'What types of tasks do you handle',
    expectedInSidebar: 'What types of tasks',
    shouldNotContain: ['Item 1', 'item 1'],
  },
  {
    path: '/privacy',
    pageName: 'Privacy',
    // First section in privacy.sections array
    clickText: '1. Information We Collect',
    expectedInSidebar: 'Information We Collect',
    shouldNotContain: ['Item 1', 'item 1', 'Section 1', 'section 1'],
  },
  {
    path: '/terms',
    pageName: 'Terms',
    // First section in terms.sections array
    clickText: '1. Acceptance of Terms',
    expectedInSidebar: 'Acceptance of Terms',
    shouldNotContain: ['Item 1', 'item 1', 'Section 1', 'section 1'],
  },
  {
    path: '/pricing',
    pageName: 'Pricing',
    // Second tier (has a name field)
    clickText: 'Standard Task',
    expectedInSidebar: 'Standard Task',
    shouldNotContain: ['Item 1', 'item 1', 'Tier 1', 'tier 1'],
  },
  {
    path: '/how-it-works',
    pageName: 'How It Works',
    // First step in process
    clickText: 'Get Your Quote',
    expectedInSidebar: 'Get Your Quote',
    shouldNotContain: ['Item 1', 'item 1', 'Step 1'],
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

async function enableEditMode(page: Page): Promise<void> {
  const editToggle = page.locator('button[aria-label="Edit this page"]');
  await editToggle.waitFor({ state: 'visible', timeout: 10000 });
  await editToggle.click();
  await page.getByText('Edit Mode', { exact: true }).waitFor({ state: 'visible', timeout: 5000 });
}

async function getSidebarText(page: Page): Promise<string> {
  const sidebar = page.locator('[data-testid="admin-sidebar"]');
  await sidebar.waitFor({ state: 'visible', timeout: 5000 });
  return (await sidebar.textContent()) || '';
}

// ============================================================================
// Tests
// ============================================================================

test.describe('Sidebar Field Labels - Real Content, Not Generic', () => {
  for (const testCase of ARRAY_ITEM_TESTS) {
    test(`${testCase.path} shows "${testCase.expectedInSidebar}" not generic labels`, async ({
      page,
    }) => {
      // Navigate and enable edit mode
      await page.goto(testCase.path);
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
      await enableEditMode(page);

      // Click on the array item text
      const targetElement = page.getByText(testCase.clickText, { exact: false }).first();
      await expect(targetElement).toBeVisible({ timeout: 5000 });
      await targetElement.click();

      // Wait for sidebar to update
      await page.waitForTimeout(500);

      // Get sidebar content
      const sidebarText = await getSidebarText(page);

      // Should contain the actual content
      expect(
        sidebarText.includes(testCase.expectedInSidebar),
        `Sidebar should show "${testCase.expectedInSidebar}" but got: ${sidebarText.substring(0, 200)}...`
      ).toBe(true);

      // Should NOT contain generic labels
      for (const generic of testCase.shouldNotContain) {
        expect(
          sidebarText.includes(generic),
          `Sidebar should NOT show "${generic}" for ${testCase.pageName} page`
        ).toBe(false);
      }
    });
  }
});

// ============================================================================
// Additional Test: Verify editable inputs appear for array items
// ============================================================================

test.describe('Array Item Editability', () => {
  test('/faq question text should be editable', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
    await enableEditMode(page);

    // Click on first FAQ question
    const question = page.getByText('What types of tasks do you handle', { exact: false }).first();
    await expect(question).toBeVisible({ timeout: 5000 });
    await question.click();
    await page.waitForTimeout(500);

    // Sidebar should contain editable input or textarea with the question text
    const sidebar = page.locator('[data-testid="admin-sidebar"]');
    const inputs = sidebar.locator('input[type="text"], textarea');
    const inputCount = await inputs.count();

    expect(inputCount).toBeGreaterThan(0);

    // At least one input should contain part of the question
    let foundQuestionInput = false;
    for (let i = 0; i < inputCount; i++) {
      const value = await inputs.nth(i).inputValue();
      if (value.includes('What types of tasks')) {
        foundQuestionInput = true;
        break;
      }
    }

    expect(
      foundQuestionInput,
      'Should find an input containing the FAQ question text'
    ).toBe(true);
  });

  test('/privacy section content should be editable', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
    await enableEditMode(page);

    // Click on first section title (has numbered prefix)
    const section = page.getByText('1. Information We Collect', { exact: false }).first();
    await expect(section).toBeVisible({ timeout: 5000 });
    await section.click();
    await page.waitForTimeout(500);

    // Sidebar should have inputs with section content
    const sidebar = page.locator('[data-testid="admin-sidebar"]');
    const inputs = sidebar.locator('input[type="text"], textarea');
    const inputCount = await inputs.count();

    expect(inputCount).toBeGreaterThan(0);

    // One input should have the title
    let foundTitleInput = false;
    for (let i = 0; i < inputCount; i++) {
      const value = await inputs.nth(i).inputValue();
      if (value.includes('Information We Collect')) {
        foundTitleInput = true;
        break;
      }
    }

    expect(
      foundTitleInput,
      'Should find an input containing the section title'
    ).toBe(true);
  });
});
