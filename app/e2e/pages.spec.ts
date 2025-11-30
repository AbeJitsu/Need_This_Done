import { test, expect } from '@playwright/test';

// ============================================================================
// Public Pages E2E Tests
// ============================================================================
// What: Tests that all public pages load correctly and display expected content.
// Why: Ensures visitors can access all pages and see the right information.
// How: Visits each page and checks for key elements and text.

test.describe('Homepage', () => {
  test('displays hero section with tagline', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/NeedThisDone/);

    // Check hero section elements
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: 'See How It Works' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'View Services' })).toBeVisible();
  });

  test('displays services preview section', async ({ page }) => {
    await page.goto('/');

    // Check "What We Offer" section
    await expect(page.getByRole('heading', { name: 'What We Offer' })).toBeVisible();
  });

  test('displays How It Works preview section', async ({ page }) => {
    await page.goto('/');

    // Check process steps - use headings to be more specific
    await expect(page.getByRole('heading', { name: 'Simple Process' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tell Us What You Need' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Get a Response' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Task Complete' })).toBeVisible();
  });

  test('displays CTA section', async ({ page }) => {
    await page.goto('/');

    // Check CTA (use first() since text appears in multiple places)
    await expect(page.getByRole('heading', { name: 'Ready to Get Started?' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Tell Us What You Need' }).first()).toBeVisible();
  });

  test('How It Works preview links to full page', async ({ page }) => {
    await page.goto('/');

    // Click the "Learn more about our process" link
    await page.getByText('Learn more about our process').click();

    // Should navigate to how-it-works page
    await expect(page).toHaveURL('/how-it-works');
  });
});

test.describe('Services Page', () => {
  test('displays page header', async ({ page }) => {
    await page.goto('/services');

    await expect(page).toHaveTitle(/Services.*NeedThisDone/);
    await expect(page.getByRole('heading', { name: 'How We Can Help' })).toBeVisible();
  });

  test('displays all service cards', async ({ page }) => {
    await page.goto('/services');

    // Should show the main service categories (from site.config.ts)
    await expect(page.getByText('Virtual Assistant')).toBeVisible();
    await expect(page.getByText('Data & Documents')).toBeVisible();
    await expect(page.getByText('Website Services')).toBeVisible();
  });

  test('displays What You Can Expect section', async ({ page }) => {
    await page.goto('/services');

    await expect(page.getByRole('heading', { name: 'What You Can Expect' })).toBeVisible();
    await expect(page.getByText('Clear Communication')).toBeVisible();
    await expect(page.getByText('Quality Work')).toBeVisible();
    await expect(page.getByText('Fair Pricing')).toBeVisible();
    await expect(page.getByText('Timely Delivery')).toBeVisible();
  });

  test('CTA buttons navigate correctly', async ({ page }) => {
    await page.goto('/services');

    // Click How It Works button (use exact + first to avoid nav conflicts)
    await page.getByRole('link', { name: 'How It Works', exact: true }).first().click();
    await expect(page).toHaveURL('/how-it-works');
  });
});

test.describe('Pricing Page', () => {
  test('displays page header', async ({ page }) => {
    await page.goto('/pricing');

    await expect(page).toHaveTitle(/Pricing.*NeedThisDone/);
    await expect(page.getByRole('heading', { name: 'Pick Your Perfect Fit' })).toBeVisible();
  });

  test('displays all pricing tiers', async ({ page }) => {
    await page.goto('/pricing');

    // Check for pricing tier cards
    await expect(page.getByText('Quick Task')).toBeVisible();
    await expect(page.getByText('Standard Task')).toBeVisible();
    await expect(page.getByText('Premium Service')).toBeVisible();

    // Check for prices (PricingCard strips "From " prefix, use exact to avoid $50 matching $500)
    await expect(page.getByText('$50', { exact: true })).toBeVisible();
    await expect(page.getByText('$150', { exact: true })).toBeVisible();
    await expect(page.getByText('$500', { exact: true })).toBeVisible();
  });

  test('displays custom task section', async ({ page }) => {
    await page.goto('/pricing');

    await expect(page.getByRole('heading', { name: 'Something Else in Mind?' })).toBeVisible();
    await expect(page.getByRole('link', { name: "Let's Figure It Out" })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Read the FAQ' })).toBeVisible();
  });

  test('CTA buttons navigate correctly', async ({ page }) => {
    await page.goto('/pricing');

    // Click FAQ button
    await page.getByRole('link', { name: 'Read the FAQ' }).click();
    await expect(page).toHaveURL('/faq');
  });
});

test.describe('How It Works Page', () => {
  test('displays page header', async ({ page }) => {
    await page.goto('/how-it-works');

    await expect(page).toHaveTitle(/How It Works.*NeedThisDone/);
    await expect(page.getByRole('heading', { name: 'How It Works' })).toBeVisible();
  });

  test('displays all process steps', async ({ page }) => {
    await page.goto('/how-it-works');

    // Check for step titles
    await expect(page.getByRole('heading', { name: 'Tell Us What You Need' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'We Review & Respond' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'We Get to Work' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Review & Deliver' })).toBeVisible();
  });

  test('displays timeline note', async ({ page }) => {
    await page.goto('/how-it-works');

    await expect(page.getByText('Typical Timeline')).toBeVisible();
    await expect(page.getByText(/Most projects are completed within 1-2 weeks/)).toBeVisible();
  });

  test('CTA buttons navigate correctly', async ({ page }) => {
    await page.goto('/how-it-works');

    // Click Contact button
    await page.getByRole('link', { name: 'Get In Touch' }).click();
    await expect(page).toHaveURL('/contact');
  });
});

test.describe('FAQ Page', () => {
  test('displays page header', async ({ page }) => {
    await page.goto('/faq');

    await expect(page).toHaveTitle(/FAQ.*NeedThisDone/);
    await expect(page.getByRole('heading', { name: 'Frequently Asked Questions' })).toBeVisible();
  });

  test('displays FAQ questions', async ({ page }) => {
    await page.goto('/faq');

    // Check for some FAQ questions
    await expect(page.getByText('What types of tasks do you handle?')).toBeVisible();
    await expect(page.getByText('Do I need to be tech-savvy to work with you?')).toBeVisible();
    await expect(page.getByText('How much does it cost?')).toBeVisible();
    await expect(page.getByText('How do I get started?')).toBeVisible();
  });

  test('FAQ links navigate to correct pages', async ({ page }) => {
    await page.goto('/faq');

    // Click internal link to services page within FAQ answer
    await page.getByRole('link', { name: 'services page' }).click();
    await expect(page).toHaveURL('/services');
  });

  test('CTA section is visible', async ({ page }) => {
    await page.goto('/faq');

    await expect(page.getByRole('heading', { name: 'Still Have Questions?' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get In Touch' })).toBeVisible();
  });
});

test.describe('Cross-Page Navigation', () => {
  // Skip on mobile - navigation uses hamburger menu which is tested in navigation.spec.ts
  test.skip(({ viewport }) => viewport?.width !== undefined && viewport.width < 768, 'Desktop only');

  test('can navigate through entire site', async ({ page }) => {
    // Start at homepage
    await page.goto('/');

    // Go to Services
    await page.getByRole('link', { name: 'View Services' }).click();
    await expect(page).toHaveURL('/services');

    // Go to How It Works
    await page.getByRole('link', { name: 'How It Works' }).first().click();
    await expect(page).toHaveURL('/how-it-works');

    // Go to Contact
    await page.getByRole('link', { name: 'Get In Touch' }).click();
    await expect(page).toHaveURL('/contact');

    // Go to Pricing via nav
    await page.getByRole('link', { name: 'Pricing' }).first().click();
    await expect(page).toHaveURL('/pricing');

    // Go to FAQ
    await page.getByRole('link', { name: 'Read the FAQ' }).click();
    await expect(page).toHaveURL('/faq');
  });
});
