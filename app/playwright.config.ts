import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root .env.local for Supabase access in tests
// The root .env.local is one level up from the app directory
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// ============================================================================
// Playwright Configuration
// ============================================================================
// What: Configures end-to-end testing with Playwright.
// Why: Automates testing of all user flows so we don't have to test manually.
// How:
//   - Local: `npm run test:e2e` (starts dev server automatically)
//   - Docker: `npm run test:e2e:docker` (uses app container in Docker network)

// Base URL for E2E tests - always go through nginx
// Local: https://localhost (nginx on host)
// Docker: https://nginx (set by docker-compose.e2e.yml)
const baseURL = process.env.BASE_URL || 'https://localhost';

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
