import { PUBLIC_OFFERS } from "./public-offers";

// ============================================================================
// Centralized SEO Configuration
// ============================================================================
// Single source of truth for all SEO-related values.
// Import from '@/lib/seo-config' instead of hardcoding URLs and business info.

export const seoConfig = {
  // Base URL - uses environment variable with fallback
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com',

  // Site identity
  siteName: 'Need This Done',
  description:
    'Your vision, brought to life. NeedThisDone helps owners and founders turn an idea for something better into a clear, focused result.',

  // Business information for structured data
  business: {
    name: 'Need This Done',
    email: 'hello@needthisdone.com',
    priceRange: '$$',
    address: {
      locality: 'Orlando',
      region: 'FL',
      country: 'US',
    },
    socialLinks: ['https://linkedin.com/in/weneedthisdone'],
    openingHours: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '17:00',
    },
  },

  // SEO keywords
  keywords: [
    'your vision brought to life',
    'outcome partner for founders',
    'bring a business vision to life',
    'focused business improvement',
    'website fix',
    'website accessibility fix',
    'website performance fix',
    'website conversion fix',
    'managed automation',
    'repeated work problem',
    'better work outcome',
    'small business workflow help',
  ],

  // Services for structured data
  services: [
    {
      name: 'Website Fix',
      description: PUBLIC_OFFERS["website-improvement"].summary,
      serviceType: 'Website Fix',
      price: PUBLIC_OFFERS["website-improvement"].price,
    },
    {
      name: 'Managed Automation',
      description: PUBLIC_OFFERS["ai-operator"].summary,
      serviceType: 'Managed Automation',
      price: PUBLIC_OFFERS["ai-operator"].price,
    },
  ],
};

// Type export for consumers that need the shape
export type SeoConfig = typeof seoConfig;
