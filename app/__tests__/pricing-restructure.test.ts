import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ============================================================================
// Pricing Restructure Validation
// ============================================================================
// Validates the seed script product definitions match the PRD requirements.
// This reads the seed script as text and validates the data structure.

// Read the seed script to extract product data
const seedScript = readFileSync(
  resolve(__dirname, '../scripts/seed-products.ts'),
  'utf-8'
);

describe('Pricing Restructure - Seed Script', () => {
  describe('Website Packages', () => {
    it('has 3 tiers: Starter, Growth, Pro', () => {
      expect(seedScript).toContain("title: 'Starter Site'");
      expect(seedScript).toContain("title: 'Growth Site'");
      expect(seedScript).toContain("title: 'Pro Site'");
    });

    it('has correct prices', () => {
      // Starter: $500 = 50000 cents
      expect(seedScript).toMatch(/handle: 'starter-site'[\s\S]*?price: 50000/);
      // Growth: $1,500 = 150000 cents
      expect(seedScript).toMatch(/handle: 'growth-site'[\s\S]*?price: 150000/);
      // Pro: $5,000 = 500000 cents
      expect(seedScript).toMatch(/handle: 'pro-site'[\s\S]*?price: 500000/);
    });

    it('marks Pro Site as most popular', () => {
      // Pro should have popular: true
      expect(seedScript).toMatch(/handle: 'pro-site'[\s\S]*?popular: true/);
    });

    it('uses plain English descriptions (no jargon)', () => {
      // Should NOT contain technical jargon
      expect(seedScript).not.toContain('Next.js');
      expect(seedScript).not.toContain('Vercel');
      expect(seedScript).not.toContain('MDX');
      expect(seedScript).not.toContain('Stripe integration');
    });
  });

  describe('Add-ons', () => {
    it('has all 9 required add-ons', () => {
      const addons = [
        'Extra Page',
        'Blog',
        'Edit Your Own Site',
        'Calendar Booking',
        'File Uploads',
        'Accept Payments',
        'Customer Accounts',
        'AI Chatbot',
        'Online Store',
      ];
      for (const addon of addons) {
        expect(seedScript).toContain(`title: '${addon}'`);
      }
    });

    it('has correct add-on prices', () => {
      expect(seedScript).toMatch(/handle: 'additional-page'[\s\S]*?price: 10000/);    // $100
      expect(seedScript).toMatch(/handle: 'blog-setup'[\s\S]*?price: 30000/);         // $300
      expect(seedScript).toMatch(/handle: 'cms-integration'[\s\S]*?price: 50000/);    // $500
      expect(seedScript).toMatch(/handle: 'calendar-booking'[\s\S]*?price: 20000/);   // $200
      expect(seedScript).toMatch(/handle: 'contact-form-files'[\s\S]*?price: 15000/); // $150
      expect(seedScript).toMatch(/handle: 'payment-integration'[\s\S]*?price: 40000/);// $400
      expect(seedScript).toMatch(/handle: 'customer-accounts'[\s\S]*?price: 40000/);  // $400
      expect(seedScript).toMatch(/handle: 'ai-chatbot'[\s\S]*?price: 60000/);         // $600
      expect(seedScript).toMatch(/handle: 'online-store'[\s\S]*?price: 200000/);      // $2,000
    });

    it('has new add-ons: Customer Accounts, AI Chatbot, Online Store', () => {
      expect(seedScript).toContain("handle: 'customer-accounts'");
      expect(seedScript).toContain("handle: 'ai-chatbot'");
      expect(seedScript).toContain("handle: 'online-store'");
    });
  });

  describe('Automation Services', () => {
    it('keeps automation setup at $150', () => {
      expect(seedScript).toMatch(/handle: 'automation-setup'[\s\S]*?price: 15000/);
    });

    it('keeps managed AI at $500/month', () => {
      expect(seedScript).toMatch(/handle: 'managed-ai'[\s\S]*?price: 50000/);
      expect(seedScript).toContain("billing_period: 'monthly'");
    });
  });
});
