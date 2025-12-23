import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'node:url';

// ============================================================================
// Auth Setup - Login Once, Reuse Session
// ============================================================================
// What: Logs in as admin and saves the session for other tests to reuse.
// Why: Avoids logging in on every test (faster, no sign-in emails).
// How: Playwright's storageState saves cookies/localStorage to a file.

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

// Where to save the authenticated state
export const ADMIN_AUTH_FILE = path.join(__dirname, '../.auth/admin.json');

setup('authenticate as admin', async ({ page }) => {
  setup.skip(!adminEmail || !adminPassword, 'Admin credentials required');

  // Login
  await page.goto('/login');
  await page.getByLabel('Email Address').fill(adminEmail!);
  await page.getByLabel('Password').fill(adminPassword!);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();

  // Wait for successful login
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await expect(page.getByRole('heading', { name: 'Project Dashboard' })).toBeVisible({ timeout: 10000 });

  // Save session state (cookies, localStorage)
  await page.context().storageState({ path: ADMIN_AUTH_FILE });
});
