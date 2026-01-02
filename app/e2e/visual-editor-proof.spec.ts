import { test, expect } from '@playwright/test';
import { waitForPageReady } from './helpers';

// One test: verify bottom panel opens when clicking text in edit mode
test('Bottom panel opens on text click', async ({ page }) => {
  await page.goto('/');
  await waitForPageReady(page);

  // Dismiss tutorial by setting localStorage after page load
  await page.evaluate(() => {
    localStorage.setItem('edit-mode-tutorial-dismissed', 'true');
  });

  // Enter edit mode
  const editButton = page.locator('button[title="Edit this page"]');
  await editButton.click();
  await page.waitForTimeout(300);

  // Click on heading
  const heading = page.locator('main h1').first();
  const box = await heading.boundingBox();
  if (box) {
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(400);
  }

  // Verify bottom panel appeared (fixed at bottom with z-50)
  const bottomPanel = page.locator('.fixed.bottom-0.left-0.right-0.z-50');
  expect(await bottomPanel.isVisible()).toBe(true);
});
