import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// Admin Dashboard E2E Tests - Full Flow Through Nginx
// ============================================================================
// What: Tests the complete workflow: user submits -> admin views in dashboard
// Why: Proves the full round-trip works exactly like production
// How: Uses real test accounts, submits through the UI, admin verifies

// ============================================================================
// Test Configuration from Environment
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const adminEmail = process.env.TEST_ADMIN_EMAIL || '';
const adminPassword = process.env.TEST_ADMIN_PASSWORD || '';
const userEmail = process.env.TEST_USER_EMAIL || '';
const userPassword = process.env.TEST_USER_PASSWORD || '';

// Supabase client for cleanup
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// ============================================================================
// Test Helpers
// ============================================================================

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function cleanupUserProjects() {
  if (!supabase || !userEmail) return;

  // Delete any existing projects from test user
  const sanitizedEmail = userEmail.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');

  // Clean storage
  const { data: files } = await supabase.storage
    .from('project-attachments')
    .list(sanitizedEmail);

  if (files && files.length > 0) {
    const filePaths = files.map(f => `${sanitizedEmail}/${f.name}`);
    await supabase.storage.from('project-attachments').remove(filePaths);
  }

  // Clean database
  await supabase.from('projects').delete().eq('email', userEmail);
}

// ============================================================================
// Admin Dashboard Flow Tests
// ============================================================================

test.describe('Admin Dashboard Flow', () => {
  // Handle cloud database latency
  test.describe.configure({ retries: 2 });

  // Clean up before and after
  test.beforeAll(async () => {
    await cleanupUserProjects();
  });

  test.afterAll(async () => {
    await cleanupUserProjects();
  });

  // ==========================================================================
  // Full E2E Test: User Submits -> Admin Views
  // ==========================================================================

  test('user submits project with 3 attachments, admin views it in dashboard', async ({ page }) => {
    // Skip if credentials not configured
    test.skip(
      !adminEmail || !adminPassword || !userEmail || !userPassword,
      'Test accounts not configured in .env.local'
    );

    // ========================================================================
    // STEP 1: User logs in
    // ========================================================================

    await page.goto('/login');
    await page.getByLabel('Email Address').fill(userEmail);
    await page.getByLabel('Password').fill(userPassword);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    // Wait for login to complete (should redirect to dashboard or home)
    await expect(page).not.toHaveURL('/login', { timeout: 15000 });

    // ========================================================================
    // STEP 2: User submits a project with 3 attachments
    // ========================================================================

    await page.goto('/contact');

    // Fill the form with the test user's email
    await page.getByLabel(/What should we call you/).fill('E2E Test User');
    await page.getByLabel(/Where can we reach you/).fill(userEmail);
    await page.getByLabel(/Tell us what's on your mind/).fill(
      'This is an E2E test submission with 3 attachments. ' +
      'Created at: ' + new Date().toISOString()
    );
    await page.getByLabel(/What kind of help do you need/).selectOption('Website Services');

    // Upload 3 files
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      {
        name: 'e2e-test-doc-1.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('E2E Test Document 1 - Testing admin dashboard flow'),
      },
      {
        name: 'e2e-test-doc-2.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('E2E Test Document 2 - Testing admin dashboard flow'),
      },
      {
        name: 'e2e-test-doc-3.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('E2E Test Document 3 - Testing admin dashboard flow'),
      },
    ]);

    // Verify files are shown
    await expect(page.getByText('e2e-test-doc-1.txt')).toBeVisible();
    await expect(page.getByText('e2e-test-doc-2.txt')).toBeVisible();
    await expect(page.getByText('e2e-test-doc-3.txt')).toBeVisible();

    // Submit the form
    await page.getByRole('button', { name: 'Start the Conversation' }).click();

    // Wait for success message
    await expect(page.getByText('We got your message!')).toBeVisible({ timeout: 30000 });

    // ========================================================================
    // STEP 3: Clear session and switch to admin
    // ========================================================================

    // Clear browser state to log out (simpler than clicking through UI)
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    // ========================================================================
    // STEP 4: Admin logs in
    // ========================================================================

    await page.goto('/login');
    await page.getByLabel('Email Address').fill(adminEmail);
    await page.getByLabel('Password').fill(adminPassword);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    // Admin should be redirected to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });

    // ========================================================================
    // STEP 5: Admin verifies they see the admin dashboard
    // ========================================================================

    // Admin dashboard has "Project Dashboard" title and filters
    await expect(page.getByText('Project Dashboard')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Find what you need')).toBeVisible();

    // ========================================================================
    // STEP 6: Admin searches for the user's project
    // ========================================================================

    // Search by the test user's email
    await page.getByPlaceholder('Name or email...').fill(userEmail);

    // Wait for search to filter
    await delay(1500);

    // Should see the project from the test user (use .first() since search filtered)
    const projectCard = page.locator('button').filter({ hasText: userEmail }).first();
    await expect(projectCard).toBeVisible({ timeout: 10000 });

    // ========================================================================
    // STEP 7: Admin opens the project and verifies attachments
    // ========================================================================

    // Click the project card to open modal
    await projectCard.click();

    // Wait for modal and project to load (name appears instead of "Loading...")
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Wait for project data to load (title changes from "Loading..." to project name)
    await expect(dialog.getByRole('heading', { level: 2, name: 'E2E Test User' })).toBeVisible({ timeout: 15000 });

    // Verify attachments section shows 3 files (scoped to dialog)
    await expect(dialog.getByText(/^Attachments \(3\)$/)).toBeVisible();

    // Check all 3 files are listed as downloadable links (scoped to dialog)
    // Note: Server stores files with generated names, not original names
    const attachmentLinks = dialog.locator('a[href^="/api/files/"]');
    await expect(attachmentLinks).toHaveCount(3);
  });
});
