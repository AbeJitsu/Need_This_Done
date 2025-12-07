import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env.local for Supabase access in tests
dotenv.config({ path: '.env.local' });

// ============================================================================
// Playwright Configuration
// ============================================================================
// What: Configures end-to-end testing with Playwright.
// Why: Automates testing of all user flows so we don't have to test manually.
// How:
//   - Local: `npm run test:e2e` (starts dev server automatically)
//   - Docker: `npm run test:e2e:docker` (uses app container in Docker network)

const baseURL = process.env.BASE_URL;

// Validate that BASE_URL is set (required for all E2E test runs)
if (!baseURL) {
  throw new Error(
    'BASE_URL environment variable is required.\n' +
    'Local dev: Set BASE_URL=http://localhost:3000\n' +
    'Docker: Set BASE_URL=https://nginx (done automatically by docker-compose.e2e.yml)'
  );
}

// Warn if not using nginx in Docker/CI environments
if (process.env.CI && !baseURL.includes('nginx')) {
  console.warn('⚠️  Warning: E2E tests should use nginx in Docker/CI environments');
}

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
    // Use BASE_URL env var (Docker) or fall back to localhost (local dev)
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Accept self-signed certificates (nginx uses self-signed in dev)
    ignoreHTTPSErrors: true,
  },

  // ============================================================================
  // Test Projects - Different Browsers/Devices
  // ============================================================================

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Mobile tests disabled for faster iteration - uncomment when desktop tests pass
    // {
    //   name: 'mobile',
    //   // Use iPhone 12 viewport but with Chromium (WebKit not installed in Docker)
    //   use: {
    //     ...devices['iPhone 12'],
    //     browserName: 'chromium',
    //   },
    // },
  ],

  // ============================================================================
  // Development Server (only when running locally)
  // ============================================================================
  // When BASE_URL is set (Docker), skip starting a webServer - the app is
  // already running in the Docker network. Only start dev server for local runs.

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
