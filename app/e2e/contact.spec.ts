import { test, expect } from '@playwright/test';

// ============================================================================
// Contact Form E2E Tests
// ============================================================================
// What: Tests the contact form functionality including validation and submission.
// Why: Ensures visitors can submit inquiries and receive feedback.
// How: Fills out form fields, tests validation, and verifies submission flow.

test.describe('Contact Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  // ==========================================================================
  // Page Layout Tests
  // ==========================================================================

  test('displays page header and form', async ({ page }) => {
    // Page title uses site name (NeedThisDone)
    await expect(page).toHaveTitle(/NeedThisDone/i);
    await expect(page.getByRole('heading', { name: "Let's Talk" })).toBeVisible();
    await expect(page.getByText(/We'll get back to you within 2 business days/)).toBeVisible();
  });

  test('displays all form fields', async ({ page }) => {
    // Required fields
    await expect(page.getByLabel(/What should we call you/)).toBeVisible();
    await expect(page.getByLabel(/Where can we reach you/)).toBeVisible();
    await expect(page.getByLabel(/Tell us what's on your mind/)).toBeVisible();

    // Optional fields
    await expect(page.getByLabel(/Company/)).toBeVisible();
    await expect(page.getByLabel(/What kind of help do you need/)).toBeVisible();

    // File upload area
    await expect(page.getByText(/Drop files here or click to browse/)).toBeVisible();

    // Submit button
    await expect(page.getByRole('button', { name: 'Start the Conversation' })).toBeVisible();
  });

  test('displays alternative contact options', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Want to learn more first?' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'View Our Services' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Read the FAQ' })).toBeVisible();
  });

  // ==========================================================================
  // Form Interaction Tests
  // ==========================================================================

  test('can fill out all form fields', async ({ page }) => {
    // Fill in required fields
    await page.getByLabel(/What should we call you/).fill('Test User');
    await page.getByLabel(/Where can we reach you/).fill('test@example.com');
    await page.getByLabel(/Tell us what's on your mind/).fill('This is a test message for E2E testing purposes.');

    // Fill in optional fields (use actual service name from site.config.ts)
    await page.getByLabel(/Company/).fill('Test Company');
    await page.getByLabel(/What kind of help do you need/).selectOption('Data & Documents');

    // Verify fields are filled
    await expect(page.getByLabel(/What should we call you/)).toHaveValue('Test User');
    await expect(page.getByLabel(/Where can we reach you/)).toHaveValue('test@example.com');
    await expect(page.getByLabel(/Tell us what's on your mind/)).toHaveValue('This is a test message for E2E testing purposes.');
    await expect(page.getByLabel(/Company/)).toHaveValue('Test Company');
    await expect(page.getByLabel(/What kind of help do you need/)).toHaveValue('Data & Documents');
  });

  test('service dropdown shows all options', async ({ page }) => {
    const serviceSelect = page.getByLabel(/What kind of help do you need/);

    // Check dropdown has expected options (Default + 3 services + Other)
    await expect(serviceSelect.locator('option')).toHaveCount(5);

    // Check for specific service options (from site.config.ts)
    await expect(serviceSelect.locator('option', { hasText: 'Virtual Assistant' })).toBeAttached();
    await expect(serviceSelect.locator('option', { hasText: 'Data & Documents' })).toBeAttached();
    await expect(serviceSelect.locator('option', { hasText: 'Website Services' })).toBeAttached();
    await expect(serviceSelect.locator('option', { hasText: 'Other / Not Sure' })).toBeAttached();
  });

  // ==========================================================================
  // Form Validation Tests
  // ==========================================================================

  test('prevents submission with empty required fields', async ({ page }) => {
    // Try to submit without filling required fields
    await page.getByRole('button', { name: 'Start the Conversation' }).click();

    // Form should not submit - browser validation should show
    // The page should still be on contact
    await expect(page).toHaveURL('/contact');
  });

  test('prevents submission with invalid email', async ({ page }) => {
    // Fill in name and message but use invalid email
    await page.getByLabel(/What should we call you/).fill('Test User');
    await page.getByLabel(/Where can we reach you/).fill('not-an-email');
    await page.getByLabel(/Tell us what's on your mind/).fill('Test message');

    // Try to submit
    await page.getByRole('button', { name: 'Start the Conversation' }).click();

    // Should stay on contact page due to browser email validation
    await expect(page).toHaveURL('/contact');
  });

  // ==========================================================================
  // File Upload UI Tests
  // ==========================================================================

  test('file upload area is clickable', async ({ page }) => {
    // The file upload area should be visible
    const uploadArea = page.getByText(/Drop files here or click to browse/);
    await expect(uploadArea).toBeVisible();

    // The hidden file input should exist
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
  });

  test('shows file size and type restrictions', async ({ page }) => {
    await expect(page.getByText(/up to 3 files, 5MB each/)).toBeVisible();
    await expect(page.getByText(/Images, PDFs, or docs/)).toBeVisible();
  });

  // ==========================================================================
  // Form Submission Test
  // ==========================================================================

  test('submits form successfully with valid data', async ({ page }) => {
    // Use unique email to avoid duplicate entries
    const timestamp = Date.now();
    const testEmail = `e2e-test-${timestamp}@example.com`;

    // Fill in required fields with test data
    await page.getByLabel(/What should we call you/).fill('E2E Test User');
    await page.getByLabel(/Where can we reach you/).fill(testEmail);
    await page.getByLabel(/Tell us what's on your mind/).fill(
      `E2E Test submission at ${new Date().toISOString()}. This is an automated test and can be safely deleted.`
    );

    // Submit the form
    await page.getByRole('button', { name: 'Start the Conversation' }).click();

    // Wait for submission to complete (button text changes to "Sending...")
    await expect(page.getByRole('button', { name: 'Sending...' })).toBeVisible();

    // Wait for success message
    await expect(page.getByText('We got your message!')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Thanks for reaching out/)).toBeVisible();

    // Should show option to send another message
    await expect(page.getByText('Send another message')).toBeVisible();
  });

  test('can send another message after successful submission', async ({ page }) => {
    // Submit a form first
    const timestamp = Date.now();
    const testEmail = `e2e-test-${timestamp}@example.com`;

    await page.getByLabel(/What should we call you/).fill('E2E Test User');
    await page.getByLabel(/Where can we reach you/).fill(testEmail);
    await page.getByLabel(/Tell us what's on your mind/).fill('E2E Test submission');

    await page.getByRole('button', { name: 'Start the Conversation' }).click();

    // Wait for success
    await expect(page.getByText('We got your message!')).toBeVisible({ timeout: 10000 });

    // Click "Send another message"
    await page.getByText('Send another message').click();

    // Form should be visible again with empty fields
    await expect(page.getByLabel(/What should we call you/)).toBeVisible();
    await expect(page.getByLabel(/What should we call you/)).toHaveValue('');
    await expect(page.getByRole('button', { name: 'Start the Conversation' })).toBeVisible();
  });
});

test.describe('Contact Page - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('form displays correctly on mobile', async ({ page }) => {
    await page.goto('/contact');

    // Form should be visible
    await expect(page.getByLabel(/What should we call you/)).toBeVisible();
    await expect(page.getByLabel(/Where can we reach you/)).toBeVisible();
    await expect(page.getByLabel(/Tell us what's on your mind/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start the Conversation' })).toBeVisible();
  });

  test('can fill and submit form on mobile', async ({ page }) => {
    await page.goto('/contact');

    const timestamp = Date.now();
    const testEmail = `e2e-test-mobile-${timestamp}@example.com`;

    // Fill form on mobile
    await page.getByLabel(/What should we call you/).fill('Mobile Test User');
    await page.getByLabel(/Where can we reach you/).fill(testEmail);
    await page.getByLabel(/Tell us what's on your mind/).fill('Mobile E2E test submission');

    // Submit
    await page.getByRole('button', { name: 'Start the Conversation' }).click();

    // Wait for success
    await expect(page.getByText('We got your message!')).toBeVisible({ timeout: 10000 });
  });
});
