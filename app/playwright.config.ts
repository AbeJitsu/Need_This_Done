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

// Auth state file path
const ADMIN_AUTH_FILE = path.join(__dirname, '.auth/admin.json');

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
  // Test Projects - Auth Setup + Browser Testing
  // ============================================================================

  projects: [
    // Setup project: logs in once, saves session
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // Desktop Chrome - uses saved auth session
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: ADMIN_AUTH_FILE,
      },
      dependencies: ['setup'],
      // Exclude auth setup and accessibility tests (run a11y separately)
      testIgnore: [/auth\.setup\.ts/, /\.a11y\.test\.ts$/],
    },

    // Mobile - uses saved auth session
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 12'],
        browserName: 'chromium',
        storageState: ADMIN_AUTH_FILE,
      },
      dependencies: ['setup'],
      // Exclude auth setup and accessibility tests (run a11y separately)
      testIgnore: [/auth\.setup\.ts/, /\.a11y\.test\.ts$/],
    },

    // E2E Bypass mode - no auth required (for local dev with NEXT_PUBLIC_E2E_ADMIN_BYPASS=true)
    {
      name: 'e2e-bypass',
      use: {
        ...devices['Desktop Chrome'],
      },
      // Exclude auth setup and accessibility tests (run a11y separately via test:a11y:e2e)
      testIgnore: [/auth\.setup\.ts/, /\.a11y\.test\.ts$/],
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
          // SKIP_CACHE=true disables Redis caching during E2E tests
          // This prevents stale cache issues when tests create/modify data
          command: 'SKIP_CACHE=true npm run dev',
          url: 'http://localhost:3000',
          reuseExistingServer: false, // Always start fresh server with SKIP_CACHE
          timeout: 120 * 1000,
        },
      }),
});
