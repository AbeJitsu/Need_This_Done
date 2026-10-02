import { readFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('task board connects editing, filtering, persistence, and recovery', async ({ page }) => {
  await page.goto('/examples');
  const board = page.locator('#react');
  await expect(board.getByRole('progressbar')).toHaveAttribute('value', '1');
  await board.getByRole('textbox', { name: 'New task' }).fill('Check the release preview');
  await board.getByRole('button', { name: 'Add task', exact: true }).click();
  const status = board.getByRole('combobox', { name: 'Status for Check the release preview' });
  await status.selectOption('done');
  await expect(board.getByRole('progressbar')).toHaveAttribute('value', '2');
  await board.getByRole('combobox', { name: 'Show tasks' }).selectOption('done');
  await expect(board.locator('.pf-task-list li')).toHaveCount(2);
  await page.reload();
  await expect(status).toHaveValue('done');
  await board.getByRole('button', { name: 'Delete Check the release preview' }).click();
  await expect(status).toHaveCount(0);
  await page.evaluate(() => localStorage.setItem('ntd-portfolio-task-board-v1', 'corrupted'));
  await page.reload();
  await expect(board.locator('.pf-task-list li')).toHaveCount(4);
  await expect(board.getByRole('status')).toContainText('Sample tasks have been restored.');
  await board.getByRole('button', { name: 'Reset example' }).click();
  await expect(board.getByRole('progressbar')).toHaveAttribute('value', '1');
});

test('import inspector uses the real API and explains invalid and duplicate rows', async ({ page }) => {
  await page.goto('/examples#import');
  const inspector = page.locator('#import');
  const run = inspector.getByRole('button', { name: 'Run server validation' });
  const response = page.waitForResponse(r => r.url().endsWith('/api/examples/import') && r.request().method() === 'POST');
  await run.click();
  expect((await response).status()).toBe(200);
  await expect(inspector.getByRole('heading', { name: 'Ready to use.' })).toBeVisible();
  await expect(inspector.locator('.pf-valid-records')).toContainText('alex@example.com');
  const downloaded = page.waitForEvent('download');
  await inspector.getByRole('button', { name: 'Download clean JSON' }).click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toBe('validated-contacts.json');
  expect(JSON.parse(await readFile((await download.path())!, 'utf8'))).toEqual([
    { name: 'Alex Rivera', email: 'alex@example.com' },
    { name: 'Sam Chen', email: 'sam@example.com' },
  ]);
  await inspector.getByRole('button', { name: 'Invalid fields', exact: true }).click();
  await run.click();
  await expect(inspector.locator('.pf-response-code')).toHaveText('HTTP 422');
  await expect(inspector.locator('.pf-import-issues')).toContainText('Row 2 / name');
  await expect(inspector.locator('.pf-import-issues')).toContainText('Row 2 / email');
  await expect(inspector.getByRole('button', { name: 'Download clean JSON' })).toHaveCount(0);
  await inspector.getByRole('button', { name: 'Duplicate emails', exact: true }).click();
  await run.click();
  await expect(inspector.locator('.pf-import-issues')).toContainText('Duplicate email after normalization.');
  await expect(inspector.locator('.pf-valid-records li')).toHaveCount(1);
  await inspector.getByRole('textbox', { name: 'Contact records' }).fill('{invalid');
  await run.click();
  await expect(inspector.getByRole('alert')).toHaveText('Provide valid JSON.');
  await inspector.getByRole('button', { name: 'Clean data', exact: true }).click();
  await run.click();
  await expect(inspector.getByRole('heading', { name: 'Ready to use.' })).toBeVisible();
});

test('import inspector preserves input after a network failure and can retry', async ({ page }) => {
  await page.goto('/examples#import');
  await page.route('**/api/examples/import', route => route.abort());
  const inspector = page.locator('#import');
  const input = await inspector.getByRole('textbox', { name: 'Contact records' }).inputValue();
  await inspector.getByRole('button', { name: 'Run server validation' }).click();
  await expect(inspector.getByRole('alert')).toContainText('Your input is still here');
  await expect(inspector.getByRole('textbox', { name: 'Contact records' })).toHaveValue(input);
  await page.unroute('**/api/examples/import');
  await inspector.getByRole('button', { name: 'Run server validation' }).click();
  await expect(inspector.getByRole('heading', { name: 'Ready to use.' })).toBeVisible();
});

test('debugging example computes the comparison result and supports keyboard selection', async ({ page }) => {
  await page.goto('/examples#debugging');
  const lab = page.locator('#debugging');
  await expect(lab.getByRole('heading', { name: 'Duplicate missed.' })).toBeVisible();
  const fixed = lab.getByRole('button', { name: 'Normalize first' });
  await fixed.focus();
  await page.keyboard.press('Enter');
  await expect(fixed).toHaveAttribute('aria-pressed', 'true');
  await expect(lab.getByRole('heading', { name: 'Duplicate detected.' })).toBeVisible();
  await lab.getByRole('button', { name: 'Original comparison' }).click();
  await expect(lab.getByRole('heading', { name: 'Duplicate missed.' })).toBeVisible();
});

test('examples remain accessible with validation issues visible', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'public', 'Axe scan runs in the desktop project.');
  await page.goto('/examples');
  await page.getByRole('button', { name: 'Invalid fields', exact: true }).click();
  await page.getByRole('button', { name: 'Run server validation' }).click();
  await expect(page.locator('.pf-response-code')).toHaveText('HTTP 422');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
