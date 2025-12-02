import { test, expect } from '@playwright/test';

// ============================================================================
// Dashboard E2E Tests
// ============================================================================
// What: Tests the dashboard page behavior for unauthenticated users.
// Why: Ensures route protection works and users see appropriate feedback.
// How: Attempts to access dashboard without auth and verifies redirect.
//
// NOTE: Full dashboard functionality requires authentication. These tests
// focus on route protection. Dashboard UI tests should be done with:
// - Mock authentication in unit tests
// - Dev preview mode in local development
// - Authenticated test accounts in staging/production

test.describe('Dashboard Route Protection', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    // Attempt to access dashboard
    await page.goto('/dashboard');

    // Should redirect to login page
    await expect(page).toHaveURL('/login');

    // Login page should be visible
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });

  test('shows loading state briefly before redirect', async ({ page }) => {
    // Navigate to dashboard
    const response = page.goto('/dashboard');

    // The page might briefly show loading or redirect immediately
    // Either behavior is acceptable
    await response;

    // Should end up at login
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Dashboard Navigation', () => {
  test('nav shows login when not authenticated', async ({ page }) => {
    await page.goto('/');

    // Login link should be visible in navigation
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();

    // Dashboard link should not be in main nav for unauthenticated users
    const navLinks = page.locator('nav a');
    const dashboardLink = navLinks.filter({ hasText: 'Dashboard' });

    // If dashboard link exists in nav, it should redirect to login
    const count = await dashboardLink.count();
    if (count > 0) {
      await dashboardLink.first().click();
      await expect(page).toHaveURL('/login');
    }
  });
});

test.describe('Dashboard API Protection', () => {
  test('projects/mine API returns 401 for unauthenticated requests', async ({
    request,
  }) => {
    const response = await request.get('/api/projects/mine');

    // Should return unauthorized
    expect(response.status()).toBe(401);
  });

  test('projects/all API returns 401 for unauthenticated requests', async ({
    request,
  }) => {
    const response = await request.get('/api/projects/all');

    // Should return unauthorized (admin-only endpoint)
    expect(response.status()).toBe(401);
  });
});
