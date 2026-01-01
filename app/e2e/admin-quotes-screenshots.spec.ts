import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { waitForPageReady, setDarkMode } from './helpers';

// ============================================================================
// Admin Quotes UI Screenshot Test
// ============================================================================
// Takes screenshots of every step in the quotes admin flow for visual QA.
// This is an E2E test because it requires a real browser to render the UI.
//
// NOTE: Uses e2e-bypass mode (NEXT_PUBLIC_E2E_ADMIN_BYPASS=true)
// Admin pages are directly accessible without login.
//
// Usage:
//   SKIP_WEBSERVER=true npx playwright test e2e/admin-quotes-screenshots.spec.ts --project=e2e-bypass
//
// Screenshots saved to: public/screenshots/admin-quotes/

const SCREENSHOT_DIR = path.join(process.cwd(), 'public', 'screenshots', 'admin-quotes');

// Ensure screenshot directory exists
test.beforeAll(() => {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
});

// Helper to take a screenshot with a descriptive name
async function screenshot(page: import('@playwright/test').Page, name: string) {
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${name}.png`),
    fullPage: true,
  });
}

test.describe('Admin Quotes - Visual QA Screenshots', () => {
  // In e2e-bypass mode, admin pages are accessible without login

  test('quotes page UI - light mode', async ({ page }) => {
    // Step 1: Navigate to quotes page
    await page.goto('/admin/quotes');
    await waitForPageReady(page);
    await screenshot(page, '01-quotes-list-empty');

    // Step 2: Click "New Quote" button to open form
    await page.click('text=+ New Quote');
    await waitForPageReady(page);
    await screenshot(page, '02-create-form-empty');

    // Step 3: Fill in the form (just for UI screenshot, no submission)
    await page.fill('#customerName', 'Jane Smith');
    await page.fill('#customerEmail', 'jane@example.com');
    await page.fill('#totalAmount', '1500.00');
    await page.fill('#notes', 'Website redesign with mobile optimization');
    await screenshot(page, '03-create-form-filled');

    // Step 4: Show the deposit calculation
    await expect(page.locator('text=Deposit: $750.00 (50%)')).toBeVisible();
    await screenshot(page, '04-deposit-calculation');

    // Step 5: Check filter buttons are visible
    await expect(page.locator('button:has-text("All")')).toBeVisible();
    await expect(page.locator('button:has-text("Draft")')).toBeVisible();
    await expect(page.locator('button:has-text("Sent")')).toBeVisible();
    await screenshot(page, '05-filter-buttons');

    // Step 6: Cancel the form
    await page.click('button:has-text("Cancel")');
    await waitForPageReady(page);
    await screenshot(page, '06-form-cancelled');
  });

  test('quotes page UI - dark mode', async ({ page }) => {
    // Navigate and enable dark mode
    await page.goto('/admin/quotes');
    await setDarkMode(page);
    await waitForPageReady(page);
    await screenshot(page, '07-quotes-list-dark');

    // Open create form
    await page.click('text=+ New Quote');
    await waitForPageReady(page);
    await screenshot(page, '08-create-form-dark');

    // Fill in the form
    await page.fill('#customerName', 'John Doe');
    await page.fill('#customerEmail', 'john@example.com');
    await page.fill('#totalAmount', '2500.00');
    await page.fill('#notes', 'E-commerce platform with payment integration');
    await screenshot(page, '09-form-filled-dark');
  });

  test('quotes page UI - mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/admin/quotes');
    await waitForPageReady(page);

    // Close mobile sidebar menu if open (overlay intercepts clicks)
    // Use force:true because sidebar has higher z-index than close button overlay
    const closeButton = page.locator('button[aria-label="Close menu"]');
    if (await closeButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await closeButton.click({ force: true });
      await waitForPageReady(page);
    }

    await screenshot(page, '10-mobile-quotes-list');

    // Open create form
    await page.click('text=+ New Quote');
    await waitForPageReady(page);
    await screenshot(page, '11-mobile-create-form');

    // Dark mode mobile
    await setDarkMode(page);
    await waitForPageReady(page);
    await screenshot(page, '12-mobile-dark-mode');
  });
});

// Email template previews
test.describe('Email Templates', () => {
  test('quote email preview', async ({ page }) => {
    // Create mock email HTML directly in the browser
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8f9fa; padding: 20px; margin: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; text-align: center; }
          .header-emoji { font-size: 48px; margin-bottom: 12px; }
          .header-title { color: #fff; font-size: 28px; font-weight: bold; margin: 0 0 8px 0; }
          .header-subtitle { color: rgba(255,255,255,0.9); font-size: 16px; margin: 0; }
          .section { padding: 30px; }
          .greeting { font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 12px; }
          .paragraph { font-size: 15px; color: #4b5563; line-height: 1.6; }
          .divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
          .section-title { font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 16px; }
          .card { background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 8px; }
          .pricing-card { background: #faf5ff; padding: 16px; border-radius: 8px; border: 1px solid #e9d5ff; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .info-label { color: #6b7280; font-size: 14px; }
          .info-value { color: #1f2937; font-size: 14px; font-weight: 500; }
          .highlight { background: #8b5cf6; margin: 12px -16px; padding: 12px 16px; }
          .highlight .info-label, .highlight .info-value { color: #fff; }
          .highlight .info-value { font-size: 18px; font-weight: bold; }
          .button { display: inline-block; background: #8b5cf6; color: #fff; padding: 14px 36px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; }
          .button-section { text-align: center; margin: 24px 0; }
          .timeline-item { display: flex; margin-bottom: 16px; }
          .timeline-number { width: 28px; height: 28px; background: #8b5cf6; color: #fff; border-radius: 50%; text-align: center; line-height: 28px; font-weight: 600; font-size: 14px; flex-shrink: 0; }
          .timeline-content { margin-left: 12px; }
          .timeline-title { font-weight: 600; color: #1f2937; font-size: 14px; margin-bottom: 4px; }
          .timeline-desc { color: #6b7280; font-size: 13px; line-height: 1.4; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 24px; }
          .mono { font-family: monospace; font-size: 13px; background: #e5e7eb; padding: 2px 6px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-emoji">📝</div>
            <div class="header-title">Your Quote is Ready!</div>
            <div class="header-subtitle">Review and pay your deposit to get started</div>
          </div>
          <div class="section">
            <div class="greeting">Hi Jane,</div>
            <p class="paragraph">Great news! We've put together a quote for your project. Take a look at the details below and pay your deposit when you're ready to kick things off.</p>

            <hr class="divider">

            <div class="section-title">Quote Details</div>
            <div class="card">
              <div class="info-row"><span class="info-label">Quote Reference</span><span class="info-value mono">NTD-010126-1430</span></div>
              <div class="info-row"><span class="info-label">Project</span><span class="info-value">Website redesign with mobile optimization</span></div>
              <div class="info-row"><span class="info-label">Valid Until</span><span class="info-value">January 31, 2026</span></div>
            </div>

            <hr class="divider">

            <div class="section-title">Pricing</div>
            <div class="pricing-card">
              <div class="info-row"><span class="info-label">Project Total</span><span class="info-value">$1,500.00</span></div>
              <div class="info-row highlight"><span class="info-label">Deposit to Start (50%)</span><span class="info-value">$750.00</span></div>
              <div class="info-row"><span class="info-label" style="color:#9ca3af">Balance Due on Completion</span><span class="info-value" style="color:#9ca3af">$750.00</span></div>
            </div>

            <hr class="divider">

            <div class="section-title">How It Works</div>
            <div class="timeline-item"><div class="timeline-number">1</div><div class="timeline-content"><div class="timeline-title">Pay Your Deposit</div><div class="timeline-desc">Click the button below to pay $750.00 and reserve your spot.</div></div></div>
            <div class="timeline-item"><div class="timeline-number">2</div><div class="timeline-content"><div class="timeline-title">We Start Working</div><div class="timeline-desc">Your project moves to the front of our queue and work begins immediately.</div></div></div>
            <div class="timeline-item"><div class="timeline-number">3</div><div class="timeline-content"><div class="timeline-title">Review & Approve</div><div class="timeline-desc">You'll review the finished work and request any adjustments.</div></div></div>
            <div class="timeline-item"><div class="timeline-number">4</div><div class="timeline-content"><div class="timeline-title">Final Payment & Delivery</div><div class="timeline-desc">Pay the remaining balance and we'll hand over everything.</div></div></div>

            <div class="button-section"><a href="#" class="button">Pay $750.00 Deposit</a></div>

            <div class="footer">Questions? Reply to this email or contact hello@needthisdone.com</div>
          </div>
        </div>
      </body>
      </html>
    `;

    await page.setContent(emailHtml);
    await screenshot(page, '13-email-quote-template');
  });

  test('deposit confirmation email preview', async ({ page }) => {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8f9fa; padding: 20px; margin: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; }
          .header-emoji { font-size: 48px; margin-bottom: 12px; }
          .header-title { color: #fff; font-size: 28px; font-weight: bold; margin: 0 0 8px 0; }
          .header-subtitle { color: rgba(255,255,255,0.9); font-size: 16px; margin: 0; }
          .section { padding: 30px; }
          .greeting { font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 12px; }
          .paragraph { font-size: 15px; color: #4b5563; line-height: 1.6; }
          .divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
          .section-title { font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 16px; }
          .card { background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 8px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .info-label { color: #6b7280; font-size: 14px; }
          .info-value { color: #1f2937; font-size: 14px; font-weight: 500; }
          .success { color: #10b981; font-weight: 600; }
          .mono { font-family: monospace; font-size: 13px; background: #e5e7eb; padding: 2px 6px; border-radius: 4px; }
          .timeline-item { display: flex; margin-bottom: 16px; }
          .timeline-number { width: 28px; height: 28px; background: #10b981; color: #fff; border-radius: 50%; text-align: center; line-height: 28px; font-weight: 600; font-size: 14px; flex-shrink: 0; }
          .timeline-content { margin-left: 12px; }
          .timeline-title { font-weight: 600; color: #1f2937; font-size: 14px; margin-bottom: 4px; }
          .timeline-desc { color: #6b7280; font-size: 13px; line-height: 1.4; }
          .button { display: inline-block; background: #10b981; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; }
          .button-section { text-align: center; margin: 24px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 24px; }
          .final-row { border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 12px; }
          .bold { font-weight: bold; font-size: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-emoji">🎉</div>
            <div class="header-title">You're All Set!</div>
            <div class="header-subtitle">Your deposit has been received</div>
          </div>
          <div class="section">
            <div class="greeting">Hi Jane,</div>
            <p class="paragraph">Great news! We've received your deposit and your project is now officially in our queue. We're excited to get started and can't wait to bring your vision to life.</p>

            <hr class="divider">

            <div class="section-title">Project Details</div>
            <div class="card">
              <div class="info-row"><span class="info-label">Quote Reference</span><span class="info-value mono">NTD-010126-1430</span></div>
              <div class="info-row"><span class="info-label">Project</span><span class="info-value">Website redesign with mobile optimization</span></div>
              <div class="info-row"><span class="info-label">Payment Date</span><span class="info-value">Wednesday, January 1, 2026</span></div>
            </div>

            <hr class="divider">

            <div class="section-title">Payment Summary</div>
            <div class="card">
              <div class="info-row"><span class="info-label">Project Total</span><span class="info-value">$1,500.00</span></div>
              <div class="info-row"><span class="info-label success">Deposit Paid ✓</span><span class="info-value success">$750.00</span></div>
              <div class="info-row final-row"><span class="info-label bold">Balance Due Upon Completion</span><span class="info-value bold">$750.00</span></div>
            </div>

            <hr class="divider">

            <div class="section-title">What Happens Next</div>
            <div class="timeline-item"><div class="timeline-number">1</div><div class="timeline-content"><div class="timeline-title">We Get to Work</div><div class="timeline-desc">Your project moves to the front of our queue and work begins.</div></div></div>
            <div class="timeline-item"><div class="timeline-number">2</div><div class="timeline-content"><div class="timeline-title">Regular Updates</div><div class="timeline-desc">We'll keep you in the loop with progress updates and any questions.</div></div></div>
            <div class="timeline-item"><div class="timeline-number">3</div><div class="timeline-content"><div class="timeline-title">Review & Feedback</div><div class="timeline-desc">Once complete, you'll review the work and we'll make any needed adjustments.</div></div></div>
            <div class="timeline-item"><div class="timeline-number">4</div><div class="timeline-content"><div class="timeline-title">Final Payment & Delivery</div><div class="timeline-desc">After your approval, pay the remaining $750.00 and we'll hand over everything.</div></div></div>

            <div class="button-section"><a href="#" class="button">Visit NeedThisDone.com</a></div>

            <div class="footer">Questions? Reply to this email or contact hello@needthisdone.com<br><small style="color:#9ca3af">This email serves as your deposit receipt. Please keep it for your records.</small></div>
          </div>
        </div>
      </body>
      </html>
    `;

    await page.setContent(emailHtml);
    await screenshot(page, '14-email-deposit-confirmation');
  });
});

// Summary test - runs last to list all captured screenshots
test.describe.serial('Screenshot Summary', () => {
  test('list captured screenshots', async () => {
    // Small delay to ensure parallel tests have finished writing
    await new Promise(resolve => setTimeout(resolve, 1000));

    const files = fs.existsSync(SCREENSHOT_DIR)
      ? fs.readdirSync(SCREENSHOT_DIR).filter(f => f.endsWith('.png')).sort()
      : [];

    console.log('\n📸 Screenshots captured:');
    console.log('─'.repeat(50));
    files.forEach((file, i) => {
      console.log(`  ${i + 1}. ${file}`);
    });
    console.log('─'.repeat(50));
    console.log(`  Total: ${files.length} screenshots`);
    console.log(`  Location: ${SCREENSHOT_DIR}\n`);

    // Don't fail if no screenshots - just report
    if (files.length === 0) {
      console.log('⚠️  No screenshots found. Check if other tests passed.');
    }
  });
});
