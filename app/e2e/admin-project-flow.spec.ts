import { test, expect } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// Admin Project Flow E2E Test
// ============================================================================
// What: Tests the complete admin workflow - view, click, update status, comment.
// How: Uses pre-authenticated session and direct DB setup (no emails).

// Fixed test data
const testEmail = 'e2e-admin-test@e2e-test.com';
const testName = 'E2E Admin Test Project';
const testMessage = 'Test project for E2E admin dashboard verification.';
const testService = 'Website Builds';

// Supabase client created lazily (after env vars are loaded)
let supabase: SupabaseClient;

function getSupabase() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabase;
}

test.describe.serial('Admin Dashboard - Complete Workflow', () => {
  // ==========================================================================
  // Setup: Create test project directly in database
  // ==========================================================================

  test.beforeAll(async () => {
    const db = getSupabase();

    // Clean up any existing test data
    const { data: existingProject } = await db
      .from('projects')
      .select('id')
      .eq('email', testEmail)
      .single();

    if (existingProject) {
      await db.from('project_comments').delete().eq('project_id', existingProject.id);
    }
    await db.from('projects').delete().eq('email', testEmail);

    // Create fresh test project
    const { error } = await db.from('projects').insert({
      name: testName,
      email: testEmail,
      message: testMessage,
      service: testService,
      status: 'submitted',
    });

    if (error) {
      console.error('Failed to create test project:', error);
      throw new Error(`Setup failed: ${error.message}`);
    }
    console.log('Test project created successfully');
  });

  // ==========================================================================
  // Note: No afterAll cleanup - data persists until next test run
  // ==========================================================================
  // This prevents race conditions where cleanup happens before tests complete.
  // The beforeAll will clean up stale data from previous runs.

  // ==========================================================================
  // Test 1: Admin can view projects in dashboard
  // ==========================================================================

  test('admin can view projects in dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Verify dashboard loaded
    await expect(
      page.getByRole('heading', { name: 'Project Dashboard' })
    ).toBeVisible({ timeout: 10000 });

    // Filter by email to find our test project
    await page.getByPlaceholder(/Name or email/).fill(testEmail);
    await page.waitForTimeout(2000); // Wait for debounced search

    // Verify project appears in list
    await expect(page.getByText(testName).first()).toBeVisible({ timeout: 15000 });
  });

  // ==========================================================================
  // Test 2: Admin can click project and see full details in modal
  // ==========================================================================

  test('admin can open project modal and see details', async ({ page }) => {
    await page.goto('/dashboard');

    // Filter to find test project
    await page.getByPlaceholder(/Name or email/).fill(testEmail);
    await page.waitForTimeout(2000);

    // Click on the project card
    await page.getByText(testName).first().click();

    // Verify modal opens
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Wait for modal content to load (not "Loading...")
    await expect(modal.getByText('Loading...')).not.toBeVisible({ timeout: 10000 });

    // Verify project name in modal header
    await expect(modal.getByText(testName)).toBeVisible({ timeout: 5000 });

    // Verify email is displayed
    await expect(modal.getByText(testEmail)).toBeVisible();

    // Verify service is displayed
    await expect(modal.getByText(testService)).toBeVisible();

    // Verify full message is displayed
    await expect(modal.getByText(testMessage)).toBeVisible();

    // Verify status badge shows "Submitted"
    await expect(modal.locator('text=Submitted').first()).toBeVisible();

    // Verify "Update Status" section is visible (admin-only)
    await expect(modal.getByRole('heading', { name: 'Update Status' })).toBeVisible();

    // Verify "Comments & Updates" section is visible
    await expect(modal.getByRole('heading', { name: 'Comments & Updates' })).toBeVisible();
  });

  // ==========================================================================
  // Test 3: Admin can update project status
  // ==========================================================================

  test('admin can update project status', async ({ page }) => {
    await page.goto('/dashboard');

    // Filter and open test project
    await page.getByPlaceholder(/Name or email/).fill(testEmail);
    await page.waitForTimeout(2000);
    await page.getByText(testName).first().click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Wait for modal content to load
    await expect(modal.getByText('Loading...')).not.toBeVisible({ timeout: 10000 });

    // Change status to "In Review"
    await modal.getByRole('combobox').selectOption('in_review');

    // Add a status note
    const noteText = 'E2E Test: Moving to review';
    await modal.getByPlaceholder(/Add a note/).fill(noteText);

    // Click Update Status button
    await modal.getByRole('button', { name: 'Update Status' }).click();

    // Wait for update to complete (button changes back from "Updating...")
    await expect(
      modal.getByRole('button', { name: 'Update Status' })
    ).toBeVisible({ timeout: 10000 });

    // Verify status badge now shows "In Review"
    await expect(modal.locator('text=In Review').first()).toBeVisible({ timeout: 5000 });

    // Verify status update appears as a comment (use .first() since parallel workers may create multiple)
    await expect(modal.getByText(/Status changed to In Review/i).first()).toBeVisible({ timeout: 5000 });
  });

  // ==========================================================================
  // Test 4: Admin can add a comment
  // ==========================================================================

  test('admin can add a comment', async ({ page }) => {
    await page.goto('/dashboard');

    // Filter and open test project
    await page.getByPlaceholder(/Name or email/).fill(testEmail);
    await page.waitForTimeout(2000);
    await page.getByText(testName).first().click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Wait for modal content to load
    await expect(modal.getByText('Loading...')).not.toBeVisible({ timeout: 10000 });

    // Write a comment
    const commentText = 'E2E Test Comment: Verifying comment functionality works.';
    await modal.getByPlaceholder('Add a comment...').fill(commentText);

    // Click Send Comment button
    await modal.getByRole('button', { name: 'Send Comment' }).click();

    // Verify comment appears in the thread (primary success indicator)
    await expect(modal.getByText(commentText)).toBeVisible({ timeout: 10000 });
  });

  // ==========================================================================
  // Test 5: Admin can add an internal note (not visible to client)
  // ==========================================================================

  test('admin can add an internal note', async ({ page }) => {
    await page.goto('/dashboard');

    // Filter and open test project
    await page.getByPlaceholder(/Name or email/).fill(testEmail);
    await page.waitForTimeout(2000);
    await page.getByText(testName).first().click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Wait for modal content to load
    await expect(modal.getByText('Loading...')).not.toBeVisible({ timeout: 10000 });

    // Write an internal note
    const internalNote = 'E2E Internal Note: This should not be visible to client.';
    await modal.getByPlaceholder('Add a comment...').fill(internalNote);

    // Check the "Internal note" checkbox
    await modal.getByLabel(/Internal note/).check();

    // Click Send Comment button
    await modal.getByRole('button', { name: 'Send Comment' }).click();

    // Verify internal note appears (primary success indicator)
    await expect(modal.getByText(internalNote)).toBeVisible({ timeout: 10000 });

    // Verify it has "Internal" badge
    await expect(modal.getByText('Internal').last()).toBeVisible();
  });

  // ==========================================================================
  // Test 6: Admin can close modal by clicking X or pressing Escape
  // ==========================================================================

  test('admin can close modal', async ({ page }) => {
    await page.goto('/dashboard');

    // Filter and open test project
    await page.getByPlaceholder(/Name or email/).fill(testEmail);
    await page.waitForTimeout(2000);
    await page.getByText(testName).first().click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Wait for modal content to load
    await expect(modal.getByText('Loading...')).not.toBeVisible({ timeout: 10000 });

    // Close by clicking the X button
    await modal.getByRole('button', { name: '✕' }).click();

    // Verify modal is closed
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // Reopen modal
    await page.getByText(testName).first().click();
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Close by pressing Escape
    await page.keyboard.press('Escape');

    // Verify modal is closed
    await expect(modal).not.toBeVisible({ timeout: 5000 });
  });
});
