import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { resolve } from 'path';

// ============================================================================
// Feature Inventory Tests
// ============================================================================
// Every feature offered in Starter / Growth / Pro tiers must exist in code.
// Business model: clone the full site, remove what the customer didn't pay for.
// These tests verify every feature is present so nothing is accidentally missing.
//
// When stripping features for a lower tier, failing tests tell you what to remove.

const APP = resolve(__dirname, '..');

/** Check that a file or directory exists */
function exists(relativePath: string): boolean {
  return existsSync(resolve(APP, relativePath));
}

/** Check multiple paths exist */
function allExist(paths: string[]): void {
  for (const p of paths) {
    expect(exists(p), `Expected ${p} to exist`).toBe(true);
  }
}

// ============================================================================
// STARTER SITE ($500) — "Get online"
// ============================================================================

describe('Starter Site Features', () => {
  describe('Custom pages', () => {
    it('has core marketing pages', () => {
      allExist([
        'app/page.tsx',
        'app/about/page.tsx',
        'app/services/page.tsx',
        'app/contact/page.tsx',
        'app/pricing/page.tsx',
      ]);
    });
  });

  describe('Contact form (sends email)', () => {
    it('has contact page with form', () => {
      allExist(['app/contact/page.tsx']);
    });

    it('has projects API to receive submissions', () => {
      allExist(['app/api/projects/route.ts']);
    });

    it('has email sending utility', () => {
      allExist(['lib/email.ts']);
    });
  });

  describe('Basic SEO', () => {
    it('has SEO config', () => {
      allExist(['lib/seo-config.ts']);
    });

    it('has JSON-LD structured data components', () => {
      allExist(['components/seo/JsonLd.tsx']);
    });
  });

  describe('Design system (mobile-friendly)', () => {
    it('has centralized color system', () => {
      allExist(['lib/colors.ts']);
    });

    it('has responsive layout components', () => {
      allExist([
        'components/Button.tsx',
        'components/Card.tsx',
      ]);
    });
  });
});

// ============================================================================
// GROWTH SITE ($1,500) — "Grow your business"
// ============================================================================

describe('Growth Site Features (includes Starter)', () => {
  describe('Database (form submissions saved, customer data stored)', () => {
    it('has Supabase client utilities', () => {
      allExist([
        'lib/supabase.ts',
        'lib/supabase-server.ts',
      ]);
    });

    it('has database migrations', () => {
      expect(exists('../supabase/migrations')).toBe(true);
    });
  });

  describe('Appointment booking with email confirmations', () => {
    it('has appointment request API', () => {
      allExist(['app/api/appointments/request/route.ts']);
    });

    it('has consultation calendar component', () => {
      allExist(['components/ConsultationCalendar.tsx']);
    });

    it('has consultation slot generation logic', () => {
      allExist(['lib/consultation-slots.ts']);
    });

    it('has email service for appointment notifications', () => {
      allExist(['lib/email-service.ts']);
    });
  });
});

// ============================================================================
// PRO SITE ($5,000) — "Run your business"
// ============================================================================

describe('Pro Site Features (includes Growth)', () => {
  describe('Customer accounts (sign up, log in, save info, track orders)', () => {
    it('has auth pages', () => {
      allExist([
        'app/login/page.tsx',
        'app/account/page.tsx',
        'app/dashboard/page.tsx',
      ]);
    });

    it('has auth API routes', () => {
      allExist([
        'app/api/auth/login/route.ts',
        'app/api/auth/signup/route.ts',
      ]);
    });

    it('has account management APIs', () => {
      allExist([
        'app/api/account/profile/route.ts',
        'app/api/account/saved-addresses/route.ts',
      ]);
    });

    it('has auth context provider', () => {
      allExist(['context/AuthContext.tsx']);
    });
  });

  describe('Accept payments (one-time, subscriptions, deposits)', () => {
    it('has checkout API', () => {
      allExist(['app/api/checkout/session/route.ts']);
    });

    it('has Stripe webhook handler', () => {
      allExist(['app/api/stripe/webhook/route.ts']);
    });

    it('has payment intent creation', () => {
      allExist(['app/api/stripe/create-payment-intent/route.ts']);
    });

    it('has subscription creation', () => {
      allExist(['app/api/stripe/create-subscription/route.ts']);
    });

    it('has Stripe client and deposit utilities', () => {
      allExist([
        'lib/stripe.ts',
        'lib/deposit-utils.ts',
        'lib/deposit-validation.ts',
      ]);
    });

    it('has cart and Stripe context providers', () => {
      allExist([
        'context/CartContext.tsx',
        'context/StripeContext.tsx',
      ]);
    });
  });

  describe('Blog with editor', () => {
    it('has blog pages', () => {
      allExist([
        'app/blog/page.tsx',
        'app/blog/[slug]/page.tsx',
      ]);
    });

    it('has admin blog pages', () => {
      allExist([
        'app/admin/blog/page.tsx',
        'app/admin/blog/new/page.tsx',
        'app/admin/blog/[slug]/edit/page.tsx',
      ]);
    });

    it('has blog API', () => {
      allExist([
        'app/api/blog/route.ts',
        'app/api/blog/[slug]/route.ts',
      ]);
    });

    it('has blog components', () => {
      allExist([
        'components/blog/BlogPostCard.tsx',
        'components/blog/MarkdownContent.tsx',
      ]);
    });

    it('has rich text editor', () => {
      allExist(['components/editor/RichTextEditor.tsx']);
    });
  });

  describe('Edit your own site (visual content editor with version history)', () => {
    it('has inline edit context', () => {
      allExist(['context/InlineEditContext.tsx']);
    });

    it('has inline editor components', () => {
      allExist([
        'components/InlineEditor/AdminSidebar.tsx',
        'components/InlineEditor/Editable.tsx',
        'components/InlineEditor/VersionHistoryPanel.tsx',
      ]);
    });

    it('has page content API with history and restore', () => {
      allExist([
        'app/api/page-content/[slug]/route.ts',
        'app/api/page-content/[slug]/history/route.ts',
        'app/api/page-content/[slug]/restore/route.ts',
      ]);
    });

    it('has content path mapping utility', () => {
      allExist(['lib/content-path-mapper.ts']);
    });
  });

  describe('Customer reviews + admin moderation', () => {
    it('has reviews API', () => {
      allExist([
        'app/api/reviews/route.ts',
        'app/api/admin/reviews/route.ts',
      ]);
    });

    it('has admin review pages with analytics', () => {
      allExist([
        'app/admin/reviews/page.tsx',
        'app/admin/reviews/analytics/page.tsx',
      ]);
    });

    it('has review notification emails', () => {
      allExist(['lib/review-notifications.ts']);
    });
  });

  describe('Loyalty program (points + referral credits)', () => {
    it('has loyalty API routes', () => {
      allExist([
        'app/api/loyalty/balance/route.ts',
        'app/api/loyalty/earn/route.ts',
        'app/api/loyalty/redeem/route.ts',
      ]);
    });

    it('has referral API routes', () => {
      allExist([
        'app/api/referrals/my-referral/route.ts',
        'app/api/referrals/track/route.ts',
        'app/api/referrals/complete/route.ts',
      ]);
    });

    it('has admin loyalty and referral pages', () => {
      allExist([
        'app/admin/loyalty/page.tsx',
        'app/admin/referrals/page.tsx',
      ]);
    });
  });

  describe('Email campaigns (templates, segments, analytics)', () => {
    it('has email template and campaign APIs', () => {
      allExist([
        'app/api/admin/email-templates/route.ts',
        'app/api/admin/email-campaigns/route.ts',
        'app/api/admin/email-campaigns/send/route.ts',
      ]);
    });

    it('has communication admin page', () => {
      allExist(['app/admin/communication/page.tsx']);
    });
  });

  describe('Product analytics (views, conversions, trends)', () => {
    it('has product analytics API', () => {
      allExist(['app/api/admin/product-analytics/route.ts']);
    });

    it('has product analytics admin page', () => {
      allExist(['app/admin/product-analytics/page.tsx']);
    });
  });

  describe('AI chatbot trained on site content', () => {
    it('has chatbot components', () => {
      allExist([
        'components/chatbot/ChatbotWidget.tsx',
        'components/chatbot/ChatbotButton.tsx',
      ]);
    });

    it('has chat API', () => {
      allExist(['app/api/chat/route.ts']);
    });

    it('has embeddings API for content indexing', () => {
      allExist([
        'app/api/embeddings/index/route.ts',
        'app/api/embeddings/status/route.ts',
      ]);
    });

    it('has chatbot content processing utilities', () => {
      allExist([
        'lib/chatbot/content-extractor.ts',
        'lib/chatbot/text-chunker.ts',
        'lib/chatbot/content-hash.ts',
      ]);
    });
  });

  describe('Automated emails (order confirmations, reminders, restock alerts)', () => {
    it('has cron jobs for automated emails', () => {
      allExist([
        'app/api/cron/abandoned-carts/route.ts',
        'app/api/cron/appointment-reminders/route.ts',
        'app/api/cron/waitlist-notifications/route.ts',
        'app/api/cron/retry-failed-emails/route.ts',
      ]);
    });

    it('has email service with templates', () => {
      allExist(['lib/email-service.ts']);
    });
  });

  describe('Appointment booking with Google Calendar sync + reminders', () => {
    it('has Google Calendar integration', () => {
      allExist(['lib/google-calendar.ts']);
    });

    it('has Google OAuth API routes', () => {
      allExist([
        'app/api/google/connect/route.ts',
        'app/api/google/callback/route.ts',
        'app/api/google/disconnect/route.ts',
        'app/api/google/status/route.ts',
      ]);
    });

    it('has appointment reminder cron', () => {
      allExist(['app/api/cron/appointment-reminders/route.ts']);
    });
  });

  describe('Admin dashboard (orders, customers, reviews, analytics)', () => {
    it('has core admin pages', () => {
      allExist([
        'app/admin/analytics/page.tsx',
        'app/admin/orders/page.tsx',
        'app/admin/users/page.tsx',
        'app/admin/reviews/page.tsx',
        'app/admin/appointments/page.tsx',
        'app/admin/products/page.tsx',
      ]);
    });

    it('has admin API routes', () => {
      allExist([
        'app/api/admin/appointments/route.ts',
        'app/api/admin/reviews/route.ts',
      ]);
    });

    it('has admin layout components', () => {
      allExist(['components/AdminSidebar.tsx']);
    });
  });
});

// ============================================================================
// ADD-ONS — Each must exist independently
// ============================================================================

describe('Add-on Features', () => {
  describe('Online Store add-on (+$2,000)', () => {
    it('has shop pages', () => {
      allExist([
        'app/shop/page.tsx',
      ]);
    });

    it('has cart system', () => {
      allExist([
        'app/cart/page.tsx',
        'context/CartContext.tsx',
      ]);
    });

    it('has product waitlist', () => {
      allExist([
        'app/api/products/waitlist/route.ts',
      ]);
    });

    it('has product comparison', () => {
      allExist(['context/ComparisonContext.tsx']);
    });

    it('has wishlist', () => {
      allExist([
        'app/wishlist/page.tsx',
        'context/WishlistContext.tsx',
      ]);
    });

    it('has recently viewed tracking', () => {
      allExist(['context/BrowsingHistoryContext.tsx']);
    });
  });
});

// ============================================================================
// BACKEND RELIABILITY — Critical infrastructure for all tiers
// ============================================================================

describe('Backend Reliability (all tiers)', () => {
  it('has connection pooling via singleton Supabase client', () => {
    allExist(['lib/supabase.ts']);
  });

  it('has email retry/failure tracking', () => {
    allExist(['lib/email.ts']);
  });

  it('has rate limiting', () => {
    allExist(['lib/rate-limit.ts']);
  });

  it('has request deduplication', () => {
    allExist(['lib/request-dedup.ts']);
  });

  it('has API timeout protection', () => {
    allExist(['lib/api-timeout.ts']);
  });

  it('has input validation utilities', () => {
    allExist([
      'lib/api-validation.ts',
      'lib/validation.ts',
    ]);
  });

  it('has Redis circuit breaker', () => {
    allExist(['lib/redis.ts']);
  });
});
