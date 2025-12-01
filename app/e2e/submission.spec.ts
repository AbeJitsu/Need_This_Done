import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// Contact Form Submission E2E Tests - With Attachments
// ============================================================================
// What: Tests the full submission flow with 0, 1, 2, and 3 file attachments.
// Why: Proves submissions work end-to-end through nginx and store correctly.
// How: Submits via UI, verifies data in Supabase directly.

// ============================================================================
// Supabase Client for Database Verification
// ============================================================================
// Uses service role key to bypass RLS and verify submissions landed correctly.

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// Test Helpers
// ============================================================================

// Small delay to allow cloud database to commit
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function deleteTestProject(email: string) {
  await supabase.from('projects').delete().eq('email', email);
}

async function getProjectByEmail(email: string, retries = 3): Promise<any> {
  // Retry a few times with delay for cloud DB eventual consistency
  for (let i = 0; i < retries; i++) {
    await delay(1000); // Wait 1 second before each query
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('email', email)
      .single();

    if (data) return data;
    if (i < retries - 1) {
      console.log(`Retry ${i + 1}/${retries} for email: ${email}`);
    }
  }
  return null;
}

// ============================================================================
// Submission Tests
// ============================================================================

test.describe('Contact Form Submission Flow', () => {
  // Unique emails for each test to avoid conflicts
  const testEmails = {
    noAttachments: 'test-no-files@e2e-submission.com',
    oneAttachment: 'test-1-file@e2e-submission.com',
    twoAttachments: 'test-2-files@e2e-submission.com',
    threeAttachments: 'test-3-files@e2e-submission.com',
    adminRetrieval: 'test-admin-retrieval@e2e-submission.com',
  };

  // Clean up test data before running
  test.beforeAll(async () => {
    for (const email of Object.values(testEmails)) {
      await deleteTestProject(email);
    }
  });

  // Clean up after all tests complete
  test.afterAll(async () => {
    for (const email of Object.values(testEmails)) {
      await deleteTestProject(email);
    }
  });

  // ==========================================================================
  // Test 1: Submit WITHOUT attachments
  // ==========================================================================

  test('submits request WITHOUT attachments', async ({ page }) => {
    await page.goto('/contact');

    // Fill required fields
    await page.getByLabel(/What should we call you/).fill('Test User No Files');
    await page.getByLabel(/Where can we reach you/).fill(testEmails.noAttachments);
    await page.getByLabel(/Tell us what's on your mind/).fill(
      'E2E test submission without any attachments. This verifies basic form submission works.'
    );

    // Select a service
    await page.getByLabel(/What kind of help do you need/).selectOption('Virtual Assistant');

    // Submit the form
    await page.getByRole('button', { name: 'Start the Conversation' }).click();

    // Wait for success message
    await expect(page.getByText('We got your message!')).toBeVisible({ timeout: 15000 });

    // Verify in database
    const project = await getProjectByEmail(testEmails.noAttachments);
    expect(project).toBeTruthy();
    expect(project.name).toBe('Test User No Files');
    expect(project.service).toBe('Virtual Assistant');
    // API stores null (not []) when no files attached
    expect(project.attachments).toBeNull();
    expect(project.status).toBe('submitted');
  });

  // ==========================================================================
  // Test 2: Submit WITH 1 attachment
  // ==========================================================================

  test('submits request WITH 1 attachment', async ({ page }) => {
    await page.goto('/contact');

    // Fill required fields
    await page.getByLabel(/What should we call you/).fill('Test User One File');
    await page.getByLabel(/Where can we reach you/).fill(testEmails.oneAttachment);
    await page.getByLabel(/Tell us what's on your mind/).fill(
      'E2E test submission with 1 attachment. This verifies single file upload works.'
    );

    // Select a service
    await page.getByLabel(/What kind of help do you need/).selectOption('Data & Documents');

    // Upload 1 file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-document-1.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Test file content for single file upload test.'),
    });

    // Submit the form
    await page.getByRole('button', { name: 'Start the Conversation' }).click();

    // Wait for success message (longer timeout for file upload)
    await expect(page.getByText('We got your message!')).toBeVisible({ timeout: 20000 });

    // Verify in database
    const project = await getProjectByEmail(testEmails.oneAttachment);
    expect(project).toBeTruthy();
    expect(project.name).toBe('Test User One File');
    expect(project.service).toBe('Data & Documents');
    expect(project.attachments).toHaveLength(1);
    // File path format: {sanitized_email}/{timestamp}_{random}.{ext}
    expect(project.attachments[0]).toMatch(/\.txt$/);
  });

  // ==========================================================================
  // Test 3: Submit WITH 2 attachments
  // ==========================================================================

  test('submits request WITH 2 attachments', async ({ page }) => {
    await page.goto('/contact');

    // Fill required fields
    await page.getByLabel(/What should we call you/).fill('Test User Two Files');
    await page.getByLabel(/Where can we reach you/).fill(testEmails.twoAttachments);
    await page.getByLabel(/Tell us what's on your mind/).fill(
      'E2E test submission with 2 attachments. This verifies multiple file upload works.'
    );

    // Select a service
    await page.getByLabel(/What kind of help do you need/).selectOption('Website Services');

    // Upload 2 files
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      {
        name: 'test-document-1.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('Test file content 1 for multiple file upload test.'),
      },
      {
        name: 'test-document-2.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('Test file content 2 for multiple file upload test.'),
      },
    ]);

    // Submit the form
    await page.getByRole('button', { name: 'Start the Conversation' }).click();

    // Wait for success message
    await expect(page.getByText('We got your message!')).toBeVisible({ timeout: 20000 });

    // Verify in database
    const project = await getProjectByEmail(testEmails.twoAttachments);
    expect(project).toBeTruthy();
    expect(project.name).toBe('Test User Two Files');
    expect(project.service).toBe('Website Services');
    expect(project.attachments).toHaveLength(2);
  });

  // ==========================================================================
  // Test 4: Submit WITH 3 attachments (maximum allowed)
  // ==========================================================================

  test('submits request WITH 3 attachments (max allowed)', async ({ page }) => {
    await page.goto('/contact');

    // Fill required fields
    await page.getByLabel(/What should we call you/).fill('Test User Three Files');
    await page.getByLabel(/Where can we reach you/).fill(testEmails.threeAttachments);
    await page.getByLabel(/Tell us what's on your mind/).fill(
      'E2E test submission with 3 attachments. This verifies maximum file limit works correctly.'
    );

    // Select a service (using same service as test 1 for consistency)
    await page.getByLabel(/What kind of help do you need/).selectOption('Virtual Assistant');

    // Upload 3 files (the maximum allowed)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      {
        name: 'test-document-1.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('Test file content 1 for max file upload test.'),
      },
      {
        name: 'test-document-2.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('Test file content 2 for max file upload test.'),
      },
      {
        name: 'test-document-3.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('Test file content 3 for max file upload test.'),
      },
    ]);

    // Submit the form
    await page.getByRole('button', { name: 'Start the Conversation' }).click();

    // Wait for success message
    await expect(page.getByText('We got your message!')).toBeVisible({ timeout: 25000 });

    // Verify in database
    const project = await getProjectByEmail(testEmails.threeAttachments);
    expect(project).toBeTruthy();
    expect(project.name).toBe('Test User Three Files');
    expect(project.service).toBe('Virtual Assistant');
    expect(project.attachments).toHaveLength(3);
    expect(project.status).toBe('submitted');
  });

  // ==========================================================================
  // Test 5: Admin can retrieve uploaded attachments via API
  // ==========================================================================
  // Proves the full round-trip: submit with file -> stored in Supabase ->
  // retrievable via /api/files endpoint

  test('admin can retrieve uploaded attachment via API', async ({ page, request }) => {
    await page.goto('/contact');

    // Fill required fields
    await page.getByLabel(/What should we call you/).fill('Admin Retrieval Test');
    await page.getByLabel(/Where can we reach you/).fill(testEmails.adminRetrieval);
    await page.getByLabel(/Tell us what's on your mind/).fill(
      'E2E test for admin file retrieval. This verifies the download API works.'
    );

    // Select a service
    await page.getByLabel(/What kind of help do you need/).selectOption('Virtual Assistant');

    // Upload a file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'admin-test-file.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Content for admin retrieval test - proving full round-trip works.'),
    });

    // Submit the form
    await page.getByRole('button', { name: 'Start the Conversation' }).click();

    // Wait for success message
    await expect(page.getByText('We got your message!')).toBeVisible({ timeout: 20000 });

    // Get the project from database to find the attachment path
    const project = await getProjectByEmail(testEmails.adminRetrieval);
    expect(project).toBeTruthy();
    expect(project.attachments).toHaveLength(1);

    // Verify we can retrieve the file via the API
    const filePath = project.attachments[0];
    const response = await request.get(`/api/files/${filePath}`, {
      maxRedirects: 0, // Don't follow redirect, just check we get one
    });

    // Should redirect to signed Supabase URL (302 or 307)
    expect([302, 307]).toContain(response.status());

    // The location header should point to a Supabase signed URL
    const location = response.headers()['location'];
    expect(location).toBeTruthy();
    expect(location).toContain('supabase');
  });
});
