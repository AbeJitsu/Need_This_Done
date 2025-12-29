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

  // Navigate to login page
  await page.goto('/login');

  // Wait for either login form or dashboard (if already logged in)
  // The page may redirect if there's an existing session
  try {
    // Try to find login form first (fast check)
    const emailField = page.getByLabel('Email Address');
    await emailField.waitFor({ state: 'visible', timeout: 5000 });

    // Login form visible - perform login
    await emailField.fill(adminEmail!);
    await page.getByLabel('Password').fill(adminPassword!);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    // Wait for successful login
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  } catch {
    // Login form not found - check if we're already on dashboard
    if (!page.url().includes('/dashboard')) {
      // Wait for possible redirect
      await page.waitForURL('**/dashboard', { timeout: 10000 });
    }
  }

  // Verify we're on the dashboard
  await expect(page.getByRole('heading', { name: 'Project Dashboard' })).toBeVisible({ timeout: 10000 });

  // Save session state (cookies, localStorage)
  await page.context().storageState({ path: ADMIN_AUTH_FILE });
});
