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
    'A $500 website audit and contained fix, or a human-led managed AI operator pilot with explicit approval boundaries.',

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
    // Core skills (long-tail)
    'full stack developer Orlando',
    'React Next.js developer',
    'TypeScript developer for hire',
    'AI RAG developer',
    'Python automation specialist',
    // Differentiators
    'veteran developer',
    'Claude Code developer',
    'e-commerce developer Next.js',
    'Supabase developer',
    // Services
    'web development Orlando Florida',
    'custom website development',
    'workflow automation',
    'AI chatbot development',
    'data automation Python',
    // Business terms
    'freelance full stack developer',
    'technical consulting',
    'remote developer',
  ],

  // Services for structured data
  services: [
    {
      name: 'Website Improvement',
      description: 'A $500 website audit plus one agreed contained accessibility, SEO, performance, conversion, page, or component-level fix.',
      serviceType: 'Website Improvement',
      price: '$500',
    },
    {
      name: 'Managed AI Operator',
      description: 'A proposal-based 30-day supervised pilot operated privately by Abe and Andrea with weekly client briefs and human approval for external actions.',
      serviceType: 'Managed AI Operations',
      price: 'Proposal-based',
    },
  ],
};

// Type export for consumers that need the shape
export type SeoConfig = typeof seoConfig;
