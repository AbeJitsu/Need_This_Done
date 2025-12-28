import { test, expect } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// Blog E2E Tests
// ============================================================================
// What: Tests the blog post creation and management flow
// Why: Ensures admins can create, edit, and manage blog posts
// How: Walks through the blog creation wizard verifying each step
//
// RUN LOCALLY:
// 1. Set NEXT_PUBLIC_E2E_ADMIN_BYPASS=true in app/.env.local
// 2. Start dev server: npm run dev
// 3. Run tests: SKIP_WEBSERVER=true npx playwright test e2e/blog.spec.ts --project=e2e-bypass
//
// ⚠️  WARNING: E2E_ADMIN_BYPASS Security
// ============================================================================
// The E2E_ADMIN_BYPASS flag should ONLY be used with LOCAL Supabase instances.
// NEVER enable this flag on production or staging databases.
// This flag bypasses authentication entirely - anyone could access admin routes.
// ============================================================================

// Supabase client for cleanup - created lazily after env vars are loaded
let supabase: SupabaseClient | null = null;

// Track timestamps of created posts for cleanup
const createdPostTimestamps: number[] = [];

function getSupabase(): SupabaseClient | null {
  if (supabase) return supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.warn('Supabase credentials not set - cleanup will be skipped');
    return null;
  }

  supabase = createClient(url, key);
  return supabase;
}

test.describe('Blog Post Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to blog admin and verify we have access
    await page.goto('/admin/blog');

    // If redirected to login, skip these tests (auth not configured)
    if (page.url().includes('/login')) {
      test.skip(true, 'Admin authentication required - set NEXT_PUBLIC_E2E_ADMIN_BYPASS=true');
    }
  });

  // ==========================================================================
  // Cleanup: Delete any blog posts created during tests
  // ==========================================================================
  // Only runs if posts were actually created (tracked via timestamps)
  // Uses service role key to bypass RLS and delete directly

  test.afterAll(async () => {
    if (createdPostTimestamps.length === 0) {
      console.log('No blog posts created during tests - skipping cleanup');
      return;
    }

    const db = getSupabase();
    if (!db) {
      console.warn('Cannot cleanup: Supabase client not available');
      return;
    }

    console.log(`Cleaning up ${createdPostTimestamps.length} test blog posts...`);

    for (const timestamp of createdPostTimestamps) {
      // Delete posts where title contains the test timestamp
      // Matches patterns like "E2E Test Post 1703712345678" and "Published E2E Post 1703712345678"
      const { error, count } = await db
        .from('blog_posts')
        .delete({ count: 'exact' })
        .like('title', `%${timestamp}%`);

      if (error) {
        console.error(`Failed to delete posts with timestamp ${timestamp}:`, error.message);
      } else if (count && count > 0) {
        console.log(`Deleted ${count} post(s) with timestamp ${timestamp}`);
      }
    }

    // Clear the tracked timestamps
    createdPostTimestamps.length = 0;
  });

  // ==========================================================================
  // Test 1: Can navigate to new blog post page
  // ==========================================================================

  test('can navigate to new blog post page', async ({ page }) => {
    // Find and click the "New Post" button
    await page.getByRole('link', { name: /new post/i }).click();

    // Should be on the new post page
    await expect(page).toHaveURL('/admin/blog/new');
    await expect(page.getByRole('heading', { name: 'Create New Post' })).toBeVisible();
  });

  // ==========================================================================
  // Test 2: Create a draft blog post
  // ==========================================================================

  test('can create a draft blog post', async ({ page }) => {
    // Navigate to new post page
    await page.goto('/admin/blog/new');

    // Generate unique title with timestamp to avoid slug conflicts
    const timestamp = Date.now();
    createdPostTimestamps.push(timestamp); // Track for cleanup
    const testTitle = `E2E Test Post ${timestamp}`;
    const testContent = `This is an automated test post created at ${new Date().toISOString()}.\n\nIt tests the blog creation flow using Playwright.`;

    // Fill in required fields
    await page.getByLabel('Title *').fill(testTitle);
    await page.getByLabel('Content *').fill(testContent);

    // Verify excerpt was auto-generated
    const excerptField = page.getByLabel(/excerpt/i);
    await expect(excerptField).not.toBeEmpty();

    // Select a category
    await page.getByLabel('Category').selectOption('tips');

    // Add some tags
    await page.getByLabel(/tags/i).fill('e2e-test, automated, playwright');

    // Click "Save as Draft" (default button when not publishing immediately)
    await page.getByRole('button', { name: /save as draft/i }).click();

    // Should redirect to blog admin page
    await expect(page).toHaveURL('/admin/blog');

    // Should see success toast
    await expect(page.getByText(/draft saved successfully/i)).toBeVisible();

    // The new post should appear in the list
    await expect(page.getByText(testTitle)).toBeVisible();
  });

  // ==========================================================================
  // Test 3: Create and publish a blog post immediately
  // ==========================================================================

  test('can create and publish a blog post immediately', async ({ page }) => {
    await page.goto('/admin/blog/new');

    const timestamp = Date.now();
    createdPostTimestamps.push(timestamp); // Track for cleanup
    const testTitle = `Published E2E Post ${timestamp}`;
    const testContent = `This is a published test post.\n\nCreated and published immediately via E2E test.`;

    // Fill in required fields
    await page.getByLabel('Title *').fill(testTitle);
    await page.getByLabel('Content *').fill(testContent);

    // Check "Publish immediately"
    await page.getByLabel('Publish immediately').check();

    // Button should now say "Publish Post"
    await expect(page.getByRole('button', { name: /publish post/i })).toBeVisible();

    // Click publish
    await page.getByRole('button', { name: /publish post/i }).click();

    // Should redirect and show success
    await expect(page).toHaveURL('/admin/blog');
    await expect(page.getByText(/post published successfully/i)).toBeVisible();
  });

  // ==========================================================================
  // Test 4: LinkedIn paste detection works
  // ==========================================================================

  test('auto-detects LinkedIn content when pasted', async ({ page }) => {
    await page.goto('/admin/blog/new');

    // Simulate LinkedIn content (short with hashtags)
    const linkedInContent = `5 things I learned about productivity this year:

1. Start with the hardest task first
2. Take regular breaks
3. Say no more often
4. Batch similar tasks together
5. Protect your focus time

What productivity tips work for you?

#productivity #worklife #business`;

    // Focus the content field
    const contentField = page.getByLabel('Content *');
    await contentField.focus();

    // Use clipboard API to simulate paste (triggers onPaste event)
    await page.evaluate(async (text) => {
      const clipboardData = new DataTransfer();
      clipboardData.setData('text/plain', text);

      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: clipboardData,
        bubbles: true,
        cancelable: true,
      });

      document.activeElement?.dispatchEvent(pasteEvent);
      // Also set the value manually since the event doesn't actually paste
      if (document.activeElement instanceof HTMLTextAreaElement) {
        document.activeElement.value = text;
        document.activeElement.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, linkedInContent);

    // Wait for auto-detection to happen
    await page.waitForTimeout(500);

    // Title should be auto-populated with first line
    const titleField = page.getByLabel('Title *');
    await expect(titleField).toHaveValue(/5 things I learned/);
  });

  // ==========================================================================
  // Test 5: Form validation works
  // ==========================================================================

  test('shows validation error when title is empty but content is filled', async ({ page }) => {
    await page.goto('/admin/blog/new');

    // Fill content but leave title empty (bypasses HTML5 required on content)
    await page.getByLabel('Content *').fill('Some test content here');

    // Clear the title field to ensure it's empty
    await page.getByLabel('Title *').clear();

    // Try to submit - browser will show HTML5 validation on title
    await page.getByRole('button', { name: /save as draft/i }).click();

    // Should still be on the same page (form didn't submit due to validation)
    await expect(page).toHaveURL('/admin/blog/new');

    // Title field should be invalid
    const titleField = page.getByLabel('Title *');
    await expect(titleField).toHaveAttribute('required', '');
  });

  // ==========================================================================
  // Test 6: Advanced options can be expanded
  // ==========================================================================

  test('can expand advanced options', async ({ page }) => {
    await page.goto('/admin/blog/new');

    // Click "Advanced Options"
    await page.getByText('Advanced Options').click();

    // Should see slug and featured image fields
    await expect(page.getByLabel('URL Slug')).toBeVisible();
    await expect(page.getByLabel('Featured Image URL')).toBeVisible();
  });

  // ==========================================================================
  // Test 7: Content source selection works
  // ==========================================================================

  test('can select content source', async ({ page }) => {
    await page.goto('/admin/blog/new');

    // Default should be "Original"
    const originalButton = page.getByRole('button', { name: 'Original' });
    await expect(originalButton).toHaveClass(/bg-blue/);

    // Click LinkedIn source
    await page.getByRole('button', { name: 'LinkedIn' }).click();

    // Should show source URL field
    await expect(page.getByLabel('Original Post URL')).toBeVisible();
  });
});

test.describe('Blog Post Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/blog');

    if (page.url().includes('/login')) {
      test.skip(true, 'Admin authentication required');
    }
  });

  // ==========================================================================
  // Test: Blog admin page loads correctly
  // ==========================================================================

  test('blog admin page shows post list', async ({ page }) => {
    // Should see the blog management heading (exact match to avoid matching post titles)
    await expect(page.getByRole('heading', { name: 'Blog Posts' })).toBeVisible();

    // Should see the "New Post" button
    await expect(page.getByRole('link', { name: /new post/i })).toBeVisible();

    // Should see status filter options
    await expect(page.getByText('All')).toBeVisible();
  });
});
