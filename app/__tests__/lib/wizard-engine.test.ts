import { describe, it, expect } from 'vitest';
import {
  getRecommendation,
  type ProductCatalog,
} from '@/lib/wizard-engine';
import type { FeatureKey } from '@/components/Wizard/wizard-data';

const mockCatalog: ProductCatalog = {
  packages: [
    { handle: 'starter-site', title: 'Starter Site', price: 50000, variantId: 'variant_starter', depositPercent: 50, features: [] },
    { handle: 'growth-site', title: 'Growth Site', price: 150000, variantId: 'variant_growth', depositPercent: 50, features: [] },
    { handle: 'pro-site', title: 'Pro Site', price: 500000, variantId: 'variant_pro', depositPercent: 50, features: [] },
  ],
  addons: [
    { handle: 'calendar-booking', title: 'Calendar Booking', price: 20000, variantId: 'variant_calendar', depositPercent: 50, features: [] },
    { handle: 'blog-setup', title: 'Blog', price: 30000, variantId: 'variant_blog', depositPercent: 50, features: [] },
    { handle: 'cms-integration', title: 'Edit Your Own Site', price: 50000, variantId: 'variant_cms', depositPercent: 50, features: [] },
    { handle: 'payment-integration', title: 'Accept Payments', price: 40000, variantId: 'variant_payments', depositPercent: 50, features: [] },
    { handle: 'customer-accounts', title: 'Customer Accounts', price: 40000, variantId: 'variant_accounts', depositPercent: 50, features: [] },
    { handle: 'ai-chatbot', title: 'AI Chatbot', price: 60000, variantId: 'variant_chatbot', depositPercent: 50, features: [] },
    { handle: 'online-store', title: 'Online Store', price: 200000, variantId: 'variant_store', depositPercent: 50, features: [] },
  ],
  services: [
    { handle: 'automation-setup', title: 'Automation Setup', price: 15000, variantId: 'variant_automation', depositPercent: 100, features: [] },
    { handle: 'managed-ai', title: 'Managed AI', price: 50000, variantId: 'variant_managed_ai', depositPercent: 0, features: [] },
  ],
};

describe('Wizard Recommendation Engine', () => {
  it('recommends Starter when no features selected', () => {
    const result = getRecommendation([], mockCatalog);
    expect(result.tier.handle).toBe('starter-site');
    expect(result.addOns).toHaveLength(0);
    expect(result.services).toHaveLength(0);
    expect(result.totalCents).toBe(50000);
    expect(result.depositCents).toBe(25000);
  });

  it('recommends Starter + calendar add-on when only booking needed (cheaper than Growth)', () => {
    const result = getRecommendation(['calendar_booking'], mockCatalog);
    // Starter ($500) + Calendar ($200) = $700 < Growth ($1,500)
    expect(result.tier.handle).toBe('starter-site');
    expect(result.addOns[0].handle).toBe('calendar-booking');
    expect(result.totalCents).toBe(70000);
  });

  it('recommends Growth when SEO needed (no add-on available)', () => {
    const result = getRecommendation(['seo_advanced'], mockCatalog);
    expect(result.tier.handle).toBe('growth-site');
    expect(result.addOns).toHaveLength(0);
  });

  it('recommends Growth when booking + SEO needed (both included)', () => {
    const result = getRecommendation(['calendar_booking', 'seo_advanced'], mockCatalog);
    expect(result.tier.handle).toBe('growth-site');
    expect(result.addOns).toHaveLength(0);
    expect(result.totalCents).toBe(150000);
  });

  it('recommends Pro when reviews needed (no add-on, Pro-only)', () => {
    const result = getRecommendation(['reviews'], mockCatalog);
    expect(result.tier.handle).toBe('pro-site');
  });

  it('recommends Pro when email campaigns needed (Pro-only)', () => {
    const result = getRecommendation(['email_campaigns'], mockCatalog);
    expect(result.tier.handle).toBe('pro-site');
  });

  it('recommends Starter + add-ons when that beats upgrading', () => {
    // Starter ($500) + Blog ($300) + Payments ($400) = $1,200 < Growth + Payments ($1,900)
    const result = getRecommendation(['blog', 'payments'], mockCatalog);
    expect(result.tier.handle).toBe('starter-site');
    expect(result.addOns.map((a) => a.handle).sort()).toEqual(['blog-setup', 'payment-integration'].sort());
    expect(result.totalCents).toBe(120000);
  });

  it('recommends Pro when a no-addon feature combined with others', () => {
    const result = getRecommendation(['reviews', 'blog'], mockCatalog);
    expect(result.tier.handle).toBe('pro-site');
    expect(result.addOns).toHaveLength(0);
  });

  it('always adds online store as add-on (no tier includes it)', () => {
    const result = getRecommendation(['online_store'], mockCatalog);
    expect(result.tier.handle).toBe('starter-site');
    expect(result.addOns[0].handle).toBe('online-store');
    expect(result.totalCents).toBe(250000);
  });

  it('adds automation as a service (independent of tier)', () => {
    const result = getRecommendation(['automation'], mockCatalog);
    expect(result.services[0].handle).toBe('automation-setup');
    expect(result.totalCents).toBe(65000);
  });

  it('adds managed AI as a service with 0% deposit', () => {
    const result = getRecommendation(['managed_ai'], mockCatalog);
    expect(result.services[0].handle).toBe('managed-ai');
    expect(result.depositCents).toBe(25000); // 50% of Starter only
  });

  it('calculates deposit with mixed deposit percentages', () => {
    // Starter ($500, 50%) + Calendar ($200, 50%) + Automation ($150, 100%)
    const result = getRecommendation(['calendar_booking', 'automation'], mockCatalog);
    expect(result.totalCents).toBe(85000);
    expect(result.depositCents).toBe(50000);
  });

  it('handles all features selected (Pro + online-store add-on + services)', () => {
    const features: FeatureKey[] = [
      'calendar_booking', 'payments', 'seo_advanced', 'ai_chatbot', 'reviews',
      'blog', 'online_store', 'email_campaigns', 'customer_accounts', 'cms',
      'automation', 'managed_ai',
    ];
    const result = getRecommendation(features, mockCatalog);
    expect(result.tier.handle).toBe('pro-site');
    expect(result.addOns).toHaveLength(1);
    expect(result.addOns[0].handle).toBe('online-store');
    expect(result.services).toHaveLength(2);
    expect(result.totalCents).toBe(765000);
  });

  it('includes variantIds for cart integration', () => {
    const result = getRecommendation(['blog'], mockCatalog);
    expect(result.tier.variantId).toBe('variant_starter');
    expect(result.addOns[0].variantId).toBe('variant_blog');
  });
});
