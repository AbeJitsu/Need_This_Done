import { test, expect, Page } from '@playwright/test';

// ============================================================================
// Screenshot Proof - Capture visual evidence of click-to-edit working
// ============================================================================

async function enableEditMode(page: Page): Promise<void> {
  const editToggle = page.locator('button[aria-label="Edit this page"]');
  await editToggle.waitFor({ state: 'visible', timeout: 10000 });
  await editToggle.click();
  await page.getByText('Edit Mode', { exact: true }).waitFor({ state: 'visible', timeout: 5000 });
}

test.describe('Screenshot Proof - Click to Edit Works', () => {
  test('FAQ: clicking question opens sidebar with editable fields', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });

    // Screenshot 1: Before edit mode
    await page.screenshot({ path: 'screenshots/proof-01-faq-before-edit.png', fullPage: false });

    await enableEditMode(page);

    // Screenshot 2: Edit mode enabled
    await page.screenshot({ path: 'screenshots/proof-02-faq-edit-mode.png', fullPage: false });

    // Click on FAQ question
    const question = page.getByText('What types of tasks do you handle', { exact: false }).first();
    await question.click();
    await page.waitForTimeout(500);

    // Screenshot 3: After clicking - sidebar shows real content
    await page.screenshot({ path: 'screenshots/proof-03-faq-sidebar-with-fields.png', fullPage: false });

    // Verify inputs are visible with actual content
    const sidebar = page.locator('[data-testid="admin-sidebar"]');
    const inputs = sidebar.locator('input[type="text"], textarea');
    const inputCount = await inputs.count();

    console.log(`FAQ sidebar has ${inputCount} editable inputs`);
    expect(inputCount).toBeGreaterThan(0);
  });

  test('Privacy: clicking section shows editable title and content', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
    await enableEditMode(page);

    // Click on section
    const section = page.getByText('1. Information We Collect', { exact: false }).first();
    await section.click();
    await page.waitForTimeout(500);

    // Screenshot: Sidebar with section content
    await page.screenshot({ path: 'screenshots/proof-04-privacy-sidebar-with-fields.png', fullPage: false });

    // Verify inputs
    const sidebar = page.locator('[data-testid="admin-sidebar"]');
    const inputs = sidebar.locator('input[type="text"], textarea');
    const inputCount = await inputs.count();

    console.log(`Privacy sidebar has ${inputCount} editable inputs`);
    expect(inputCount).toBeGreaterThan(0);

    // Verify title input contains the section title
    let foundTitle = false;
    for (let i = 0; i < inputCount; i++) {
      const value = await inputs.nth(i).inputValue();
      if (value.includes('Information We Collect')) {
        foundTitle = true;
        console.log(`Found title input with value: ${value}`);
        break;
      }
    }
    expect(foundTitle).toBe(true);
  });
});
