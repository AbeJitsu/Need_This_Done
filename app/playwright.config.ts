import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'node:url';

// ESM-compatible __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root .env.local for Supabase access in tests
// The root .env.local is one level up from the app directory
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// ============================================================================
// Playwright Configuration
// ============================================================================
// What: Configures end-to-end testing with Playwright.
// Why: Automates testing of all user flows so we don't have to test manually.
// How: Run `npm run test:e2e` (starts dev server automatically)

// Base URL for E2E tests
const baseURL = process.env.BASE_URL || 'http://localhost:3000';

export default defineConfig({
  // ============================================================================
  // Test Directory and Execution
  // ============================================================================

  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // ============================================================================
  // Reporting
  // ============================================================================

  reporter: 'html',

  // ============================================================================
  // Shared Settings for All Tests
  // ============================================================================

  use: {
    // Use BASE_URL env var or fall back to localhost (local dev)
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Accept self-signed certificates (nginx uses self-signed in dev)
    ignoreHTTPSErrors: true,
  },

  // ============================================================================
  // Screenshot Configuration
  // ============================================================================
  // Custom snapshot directory for visual regression testing
  snapshotDir: './e2e/visual-regression',

  // ============================================================================
  // Test Projects - Different Browsers/Devices
  // ============================================================================

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 12'],
        browserName: 'chromium',
      },
    },
  ],

  // ============================================================================
  // Development Server (only when running locally)
  // ============================================================================
  // When BASE_URL is set, skip starting a webServer - the app is already running.
  // Only start dev server for local runs.

  ...(process.env.BASE_URL || process.env.SKIP_WEBSERVER
    ? {}
    : {
        webServer: {
          command: 'npm run dev',
          url: 'http://localhost:3000',
          reuseExistingServer: true,
          timeout: 120 * 1000,
        },
      }),
});
