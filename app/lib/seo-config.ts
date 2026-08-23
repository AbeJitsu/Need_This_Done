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
    'Fix one website problem for $500, or discuss a focused way to improve one repeated problem at work.',

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
      description: 'A $500 review plus one agreed contained website fix.',
      serviceType: 'Website Fix',
      price: '$500',
    },
    {
      name: 'Managed Automation',
      description: 'A proposal-based way to improve one repeated problem at work.',
      serviceType: 'Managed Automation',
      price: 'Proposal-based',
    },
  ],
};

// Type export for consumers that need the shape
export type SeoConfig = typeof seoConfig;
