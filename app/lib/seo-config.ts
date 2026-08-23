// ============================================================================
// Centralized SEO Configuration
// ============================================================================
// Single source of truth for all SEO-related values.
// Import from '@/lib/seo-config' instead of hardcoding URLs and business info.

export const seoConfig = {
  // Base URL - uses environment variable with fallback
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com',

  // Site identity
  siteName: 'NeedThisDone',
  description:
    'Fix one website problem for $500, or discuss a human-run 30-day pilot for one repeated task.',

  // Business information for structured data
  business: {
    name: 'NeedThisDone',
    email: 'hello@needthisdone.com',
    priceRange: '$$',
    address: {
      locality: 'Orlando',
      region: 'FL',
      country: 'US',
    },
    socialLinks: [
      'https://github.com/AbeJitsu',
      'https://linkedin.com/in/weneedthisdone',
    ],
    openingHours: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '17:00',
    },
  },

  // SEO keywords
  keywords: [
    'website fix',
    'website accessibility fix',
    'website performance fix',
    'website conversion fix',
    'managed automation',
    'repeated task automation',
    'human run automation pilot',
    'small business workflow help',
  ],

  // Services for structured data
  services: [
    {
      name: 'Website Fix',
      description: 'A $500 review plus one agreed contained website fix.',
      serviceType: 'Website Fix',
      price: '$500',
    },
    {
      name: 'Managed Automation',
      description: 'A human-run 30-day pilot for one repeated task, priced by proposal.',
      serviceType: 'Managed Automation',
      price: 'Proposal-based',
    },
  ],
};

// Type export for consumers that need the shape
export type SeoConfig = typeof seoConfig;
