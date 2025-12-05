import { test, expect } from '@playwright/test';
import { navigateToPage, fillFormField } from './helpers';

// ============================================================================
// Authentication E2E Tests
// ============================================================================
// What: Tests the login page UI and authentication flows.
// Why: Ensures users can access login, switch modes, and protected routes work.
// How: Tests form interactions, mode switching, and route protection.

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPage(page, '/login');
  });

  // ==========================================================================
  // Page Layout Tests
  // ==========================================================================

  test('displays login form with all elements', async ({ page }) => {
    // Check page header
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await expect(page.getByText('Sign in to view your project status')).toBeVisible();

    // Check form fields
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();

    // Check buttons (use exact: true to avoid matching "Sign in with Google")
    await expect(page.getByRole('button', { name: 'Sign In', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible();

    // Check mode toggle
    await expect(page.getByText("Don't have an account? Sign up")).toBeVisible();

    // Check back to home link
    await expect(page.getByRole('link', { name: 'Back to Home' })).toBeVisible();
  });

  test('sign in button is disabled without email and password', async ({ page }) => {
    const signInButton = page.getByRole('button', { name: 'Sign In', exact: true });
    await expect(signInButton).toBeDisabled();
  });

  test('sign in button enables with email and password', async ({ page }) => {
    await fillFormField(page, 'Email Address', 'test@example.com');
    await fillFormField(page, 'Password', 'password123');

    const signInButton = page.getByRole('button', { name: 'Sign In', exact: true });
    await expect(signInButton).toBeEnabled();
  });

  // ==========================================================================
  // Mode Switching Tests
  // ==========================================================================

  test('can switch to sign up mode', async ({ page }) => {
    // Click to switch to sign up mode
    await page.getByText("Don't have an account? Sign up").click();

    // Check header changed
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
    await expect(page.getByText('Sign up to track your projects')).toBeVisible();

    // Check button text changed
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();

    // Check toggle text changed
    await expect(page.getByText('Already have an account? Sign in')).toBeVisible();
  });

  test('can switch back to sign in mode from sign up', async ({ page }) => {
    // Go to sign up mode
    await page.getByText("Don't have an account? Sign up").click();
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();

    // Switch back to sign in
    await page.getByText('Already have an account? Sign in').click();
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });

  test('can switch to forgot password mode', async ({ page }) => {
    // Click forgot password
    await page.getByText('Forgot your password?').click();

    // Check header changed
    await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible();
    await expect(page.getByText('Enter your email to receive a reset link')).toBeVisible();

    // Password field should be hidden
    await expect(page.getByLabel('Password')).not.toBeVisible();

    // Check button text changed
    await expect(page.getByRole('button', { name: 'Send Reset Link' })).toBeVisible();

    // Check back to sign in link
    await expect(page.getByText('Back to Sign In')).toBeVisible();
  });

  test('can switch back to sign in from forgot password', async ({ page }) => {
    // Go to forgot password mode
    await page.getByText('Forgot your password?').click();
    await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible();

    // Switch back to sign in
    await page.getByText('Back to Sign In').click();
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

    // Password field should be visible again
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  // ==========================================================================
  // Form Validation Tests
  // ==========================================================================

  test('shows error for short password on sign up', async ({ page }) => {
    // Switch to sign up mode
    await page.getByText("Don't have an account? Sign up").click();

    // Fill with short password
    await fillFormField(page, 'Email Address', 'test@example.com');
    await fillFormField(page, 'Password', '12345'); // Less than 6 characters

    // Submit
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Should show error
    await expect(page.getByText('Password must be at least 6 characters')).toBeVisible();
  });

  // ==========================================================================
  // Navigation Tests
  // ==========================================================================

  test('back to home link works', async ({ page }) => {
    await page.getByRole('link', { name: 'Back to Home' }).click();
    await expect(page).toHaveURL('/');
  });

  test('login link in navigation works', async ({ page }) => {
    await navigateToPage(page, '/');
    await page.getByRole('link', { name: 'Login' }).click();
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Protected Routes', () => {
  test('dashboard redirects to login when not authenticated', async ({ page }) => {
    // Try to access dashboard directly
    await navigateToPage(page, '/dashboard');

    // Should redirect to login page
    await expect(page).toHaveURL('/login');
  });

  test('login page shows correct state for unauthenticated users', async ({ page }) => {
    await navigateToPage(page, '/login');

    // Should show login form (not redirect or show dashboard)
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });
});

test.describe('Login Page - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('login form displays correctly on mobile', async ({ page }) => {
    await navigateToPage(page, '/login');

    // Form should be visible and properly laid out
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible();
  });

  test('can interact with form on mobile', async ({ page }) => {
    await navigateToPage(page, '/login');

    // Fill form
    await fillFormField(page, 'Email Address', 'test@example.com');
    await fillFormField(page, 'Password', 'password123');

    // Button should be enabled
    await expect(page.getByRole('button', { name: 'Sign In', exact: true })).toBeEnabled();

    // Mode switching should work
    await page.getByText("Don't have an account? Sign up").click();
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
  });
});
