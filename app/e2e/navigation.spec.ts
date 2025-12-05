import { test, expect } from '@playwright/test';
import { navigateToPage, enableDarkMode, disableDarkMode } from './helpers';

// ============================================================================
// Navigation E2E Tests
// ============================================================================
// What: Tests the site navigation works correctly across all pages.
// Why: Ensures visitors can navigate the site without issues.
// How: Clicks each nav link and verifies the correct page loads.

test.describe('Navigation', () => {
  // ==========================================================================
  // Desktop Navigation Tests
  // ==========================================================================

  test.describe('Desktop', () => {
    // Skip desktop-specific tests on mobile viewport
    test.skip(({ viewport }) => viewport?.width !== undefined && viewport.width < 768, 'Desktop only');

    test('all navigation links work', async ({ page }) => {
      await navigateToPage(page, '/');

      const links = [
        { name: 'Services', url: '/services' },
        { name: 'Pricing', url: '/pricing' },
        { name: 'How It Works', url: '/how-it-works' },
        { name: 'FAQ', url: '/faq' },
        { name: 'Contact', url: '/contact' },
      ];

      for (const link of links) {
        // Click the link in the nav
        await page.getByRole('link', { name: link.name }).first().click();

        // Verify we're on the right page
        await expect(page).toHaveURL(link.url);

        // Return to home for next iteration
        await navigateToPage(page, '/');
      }
    });

    test('logo links to homepage', async ({ page }) => {
      await navigateToPage(page, '/services');

      // Click the logo/brand name
      await page.getByRole('link', { name: 'Need This Done' }).click();

      // Should be on homepage
      await expect(page).toHaveURL('/');
    });

    test('active link is highlighted', async ({ page }) => {
      await navigateToPage(page, '/services');

      // The Services link should have the active styling (blue background)
      const servicesLink = page.getByRole('link', { name: 'Services' }).first();
      await expect(servicesLink).toHaveClass(/bg-blue-100/);
    });

    test('login link is visible when not authenticated', async ({ page }) => {
      await navigateToPage(page, '/');

      // Login link should be visible
      await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
    });
  });

  // ==========================================================================
  // Mobile Navigation Tests
  // ==========================================================================

  test.describe('Mobile', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('hamburger menu toggles navigation', async ({ page }) => {
      await navigateToPage(page, '/');

      // Desktop nav should be hidden
      const desktopNav = page.locator('.hidden.md\\:flex');
      await expect(desktopNav).toBeHidden();

      // Hamburger button should be visible
      const hamburger = page.getByLabel('Toggle menu');
      await expect(hamburger).toBeVisible();

      // Click hamburger to open menu
      await hamburger.click();

      // Mobile menu should now show Services link (use exact + first to avoid nav conflicts)
      await expect(page.getByRole('link', { name: 'Services', exact: true }).first()).toBeVisible();

      // Click hamburger again to close
      await hamburger.click();

      // Wait a moment for animation
      await page.waitForTimeout(300);

      // Mobile menu should be hidden (the container with mobile links)
      const mobileMenu = page.locator('.md\\:hidden').filter({ hasText: 'Services' });
      await expect(mobileMenu).toBeHidden();
    });

    test('clicking a link closes the mobile menu', async ({ page }) => {
      await navigateToPage(page, '/');

      // Open the mobile menu
      await page.getByLabel('Toggle menu').click();

      // Click the Services link in the mobile menu (use exact match + first)
      await page.getByRole('link', { name: 'Services', exact: true }).first().click();

      // Should navigate to the page
      await expect(page).toHaveURL('/services');

      // Mobile menu should be closed (hamburger should show menu icon, not X)
      await expect(page.getByLabel('Toggle menu')).toHaveAttribute(
        'aria-expanded',
        'false'
      );
    });

    test('all mobile nav links work', async ({ page }) => {
      const links = [
        { name: 'Services', url: '/services' },
        { name: 'Pricing', url: '/pricing' },
        { name: 'How It Works', url: '/how-it-works' },
        { name: 'FAQ', url: '/faq' },
        { name: 'Contact', url: '/contact' },
      ];

      for (const link of links) {
        await navigateToPage(page, '/');

        // Open the mobile menu
        await page.getByLabel('Toggle menu').click();

        // Click the link in the mobile menu (use exact match + first)
        await page.getByRole('link', { name: link.name, exact: true }).first().click();

        // Verify we're on the right page
        await expect(page).toHaveURL(link.url);
      }
    });
  });

  // ==========================================================================
  // Dark Mode Toggle Tests
  // ==========================================================================

  test.describe('Dark Mode', () => {
    test('dark mode toggle switches theme', async ({ page }) => {
      await navigateToPage(page, '/');

      // Find and click dark mode toggle (starts in light mode)
      await enableDarkMode(page);

      // Button should now say "Switch to light mode"
      await expect(page.getByLabel('Switch to light mode')).toBeVisible();

      // Click again to switch back to light mode
      await disableDarkMode(page);
    });

    test('dark mode preference persists across pages', async ({ page }) => {
      await navigateToPage(page, '/');

      // Enable dark mode
      await enableDarkMode(page);

      // Navigate to another page
      await page.getByRole('link', { name: 'Services' }).first().click();
      await expect(page).toHaveURL('/services');

      // Dark mode should still be active
      await expect(page.locator('html')).toHaveClass(/dark/);
    });
  });
});
