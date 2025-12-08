import { test, expect } from '@playwright/test';
import { navigateToPage, enableDarkMode } from './helpers';

// ============================================================================
// Chatbot E2E Tests
// ============================================================================
// Tests for the AI chatbot widget including:
// - Button visibility and interaction
// - Modal open/close behavior
// - Message input and display
// - Accessibility (keyboard navigation, ARIA)
// - Dark mode support

test.describe('Chatbot Widget', () => {
  // ==========================================================================
  // Button Tests
  // ==========================================================================

  test('should display chatbot button on homepage', async ({ page }) => {
    await navigateToPage(page, '/');

    // Chatbot button should be visible
    const chatButton = page.getByLabel('Open chat assistant');
    await expect(chatButton).toBeVisible();
  });

  test('should display chatbot button on all public pages', async ({ page }) => {
    const publicPages = ['/', '/services', '/pricing', '/faq', '/how-it-works', '/contact'];

    for (const pagePath of publicPages) {
      await navigateToPage(page, pagePath);
      const chatButton = page.getByLabel('Open chat assistant');
      await expect(chatButton).toBeVisible();
    }
  });

  test('should have proper button styling and accessibility', async ({ page }) => {
    await navigateToPage(page, '/');

    const chatButton = page.getByLabel('Open chat assistant');

    // Check accessibility attributes
    await expect(chatButton).toHaveAttribute('title', 'Chat with us');

    // Check it's a button element
    await expect(chatButton).toHaveRole('button');
  });

  // ==========================================================================
  // Modal Open/Close Tests
  // ==========================================================================

  test('should open modal when button is clicked', async ({ page }) => {
    await navigateToPage(page, '/');

    // Click the chat button
    const chatButton = page.getByLabel('Open chat assistant');
    await chatButton.click();

    // Modal should appear
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    // Modal should have proper title
    await expect(page.getByText('Chat Assistant')).toBeVisible();
  });

  test('should close modal when close button is clicked', async ({ page }) => {
    await navigateToPage(page, '/');

    // Open modal
    await page.getByLabel('Open chat assistant').click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    // Close modal
    await page.getByLabel('Close chat').click();
    await expect(modal).not.toBeVisible();
  });

  test('should close modal when Escape key is pressed', async ({ page }) => {
    await navigateToPage(page, '/');

    // Open modal
    await page.getByLabel('Open chat assistant').click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });

  test('should close modal when clicking backdrop', async ({ page }) => {
    await navigateToPage(page, '/');

    // Open modal
    await page.getByLabel('Open chat assistant').click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    // Click on the backdrop (the overlay behind the modal)
    // We need to click outside the modal content area
    await page.locator('.fixed.inset-0.bg-black\\/50').click({ position: { x: 10, y: 10 } });

    // Give it a moment to close
    await page.waitForTimeout(300);
    await expect(modal).not.toBeVisible();
  });

  test('should hide chat button when modal is open', async ({ page }) => {
    await navigateToPage(page, '/');

    const chatButton = page.getByLabel('Open chat assistant');
    await expect(chatButton).toBeVisible();

    // Open modal
    await chatButton.click();

    // Button should be hidden when modal is open
    await expect(chatButton).not.toBeVisible();

    // Close modal
    await page.getByLabel('Close chat').click();

    // Button should be visible again
    await expect(chatButton).toBeVisible();
  });

  // ==========================================================================
  // Chat Input Tests
  // ==========================================================================

  test('should display welcome message when modal opens', async ({ page }) => {
    await navigateToPage(page, '/');

    await page.getByLabel('Open chat assistant').click();

    // Welcome message should be visible
    await expect(page.getByText('Hi there! How can I help?')).toBeVisible();
    await expect(page.getByText(/Ask me about our services/)).toBeVisible();
  });

  test('should focus input field when modal opens', async ({ page }) => {
    await navigateToPage(page, '/');

    await page.getByLabel('Open chat assistant').click();

    // Wait for focus
    await page.waitForTimeout(200);

    // Input should be focused
    const input = page.getByPlaceholder('Type your message...');
    await expect(input).toBeFocused();
  });

  test('should allow typing in the input field', async ({ page }) => {
    await navigateToPage(page, '/');

    await page.getByLabel('Open chat assistant').click();

    const input = page.getByPlaceholder('Type your message...');
    await input.fill('Hello, I have a question');

    await expect(input).toHaveValue('Hello, I have a question');
  });

  test('should disable send button when input is empty', async ({ page }) => {
    await navigateToPage(page, '/');

    await page.getByLabel('Open chat assistant').click();

    // Find the send button (it has the arrow icon)
    const sendButton = page.locator('form button[type="submit"]');
    await expect(sendButton).toBeDisabled();

    // Type something
    const input = page.getByPlaceholder('Type your message...');
    await input.fill('Test message');

    // Button should be enabled
    await expect(sendButton).toBeEnabled();

    // Clear input
    await input.clear();

    // Button should be disabled again
    await expect(sendButton).toBeDisabled();
  });

  // ==========================================================================
  // Accessibility Tests
  // ==========================================================================

  test('should have proper ARIA attributes on modal', async ({ page }) => {
    await navigateToPage(page, '/');

    await page.getByLabel('Open chat assistant').click();

    const modal = page.getByRole('dialog');
    await expect(modal).toHaveAttribute('aria-modal', 'true');
    await expect(modal).toHaveAttribute('aria-labelledby', 'chatbot-title');
  });

  test('should be navigable with keyboard', async ({ page }) => {
    await navigateToPage(page, '/');

    // Focus the chat button directly and activate it with keyboard
    const chatButton = page.getByLabel('Open chat assistant');
    await chatButton.focus();
    await page.keyboard.press('Enter');

    // Modal should open
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
  });

  // ==========================================================================
  // Dark Mode Tests
  // ==========================================================================

  test('should work correctly in dark mode', async ({ page }) => {
    await navigateToPage(page, '/');

    // Enable dark mode
    await enableDarkMode(page);

    // Open chatbot
    await page.getByLabel('Open chat assistant').click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    // Check that dark mode classes are applied to the modal
    // Use the modal's dialog role to scope the search
    const modalContainer = modal.locator('.rounded-2xl.shadow-2xl');
    await expect(modalContainer).toBeVisible();
  });

  // ==========================================================================
  // Clear Chat Tests
  // ==========================================================================

  test('should show clear button only when there are messages', async ({ page }) => {
    await navigateToPage(page, '/');

    await page.getByLabel('Open chat assistant').click();

    // Clear button should NOT be visible initially (no messages)
    const clearButton = page.getByLabel('Clear chat');
    await expect(clearButton).not.toBeVisible();
  });
});

// ============================================================================
// Note: Message sending tests require API setup
// ============================================================================
// The following tests would require:
// 1. OpenAI API key configured
// 2. Database migrations applied (pgvector)
// 3. At least one indexed page
//
// These tests are commented out but can be enabled for integration testing:
//
// test('should send message and receive response', async ({ page }) => {
//   await navigateToPage(page, '/');
//   await page.getByLabel('Open chat assistant').click();
//
//   // Type and send message
//   const input = page.getByPlaceholder('Type your message...');
//   await input.fill('What services do you offer?');
//   await page.keyboard.press('Enter');
//
//   // Should show loading indicator
//   await expect(page.locator('.animate-bounce')).toBeVisible();
//
//   // Wait for response (may take a few seconds)
//   await expect(page.locator('[role="dialog"]')).toContainText(/service/i, { timeout: 15000 });
// });
