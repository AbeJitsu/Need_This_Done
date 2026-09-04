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
const playwrightPort = Number(process.env.PLAYWRIGHT_PORT || '3100');
const baseURL = process.env.BASE_URL || `http://127.0.0.1:${playwrightPort}`;
const playwrightDistDir = process.env.PLAYWRIGHT_NEXT_DIST_DIR || '.next-playwright';

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
  // Intentional browser contracts
  // ============================================================================

  projects: [
    {
      name: 'public',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: /(retained-core-smoke|ai-employee-product|browser-harness)\.spec\.ts/,
    },

    {
      name: 'public-mobile',
      use: {
        ...devices['iPhone 12'],
        browserName: 'chromium',
      },
      testMatch: /(retained-core-smoke|ai-employee-product)\.spec\.ts/,
    },

    // No saved state: these specs create real local Supabase sessions or mock
    // only the display payload when the test is strictly a layout contract.
    {
      name: 'auth-contract',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: /(authenticated-employee-workspace|ai-employee-workspace|prospecting-workspace|daily-cockpit|hermes-plan-preview)\.spec\.ts/,
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
          // Use a dedicated dist directory instead of deleting .next. This
          // lets browser checks run beside a local developer server. Polling
          // avoids macOS file-watch exhaustion in large worktrees.
          command: `NODE_ENV=development NEXT_DIST_DIR=${playwrightDistDir} NEXT_TSCONFIG=tsconfig.playwright.json WATCHPACK_POLLING=true SKIP_CACHE=true SKIP_EMAILS=true npx next dev --webpack --hostname 127.0.0.1 --port ${playwrightPort}`,
          url: baseURL,
          reuseExistingServer: false, // Always start fresh server with SKIP_CACHE
          timeout: 120 * 1000,
        },
      }),
});
