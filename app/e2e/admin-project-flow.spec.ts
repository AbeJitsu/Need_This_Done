import { test, expect } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// Admin Project Flow E2E Test
// ============================================================================
// What: Tests admin can see projects in the dashboard.
// How: Uses pre-authenticated session (no login = no emails).

// Fixed test data
const testEmail = 'e2e-admin-test@e2e-test.com';
const testName = 'E2E Admin Test Project';

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

test.describe('Admin Dashboard', () => {
  test.beforeAll(async () => {
    const db = getSupabase();
    await db.from('projects').delete().eq('email', testEmail);
    const { error } = await db.from('projects').insert({
      name: testName,
      email: testEmail,
      message: 'Test project for E2E admin dashboard verification.',
      service: 'Virtual Assistant',
      status: 'submitted',
    });
    if (error) {
      console.error('Failed to create test project:', error);
      throw new Error(`Setup failed: ${error.message}`);
    }
    console.log('Test project created successfully');
  });

  test.afterAll(async () => {
    const db = getSupabase();
    await db.from('projects').delete().eq('email', testEmail);
  });

  test('admin can view projects', async ({ page }) => {
    // Go directly to dashboard (session already authenticated via setup)
    await page.goto('/dashboard');

    // Verify dashboard loaded
    await expect(page.getByRole('heading', { name: 'Project Dashboard' })).toBeVisible({ timeout: 10000 });

    // Filter by email
    await page.getByPlaceholder(/Name or email/).fill(testEmail);
    await page.waitForTimeout(2000);

    // Verify project appears
    await expect(page.getByText(testName).first()).toBeVisible({ timeout: 15000 });
  });
});
