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
    'Fix one website problem for $500, or set up a browser-based automation system for recurring work.',

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
      name: 'Targeted Fix',
      description: 'A $500 review plus one agreed website fix.',
      serviceType: 'Targeted Fix',
      price: '$500',
    },
    {
      name: 'Automation System Setup',
      description: 'A proposal-based system for recurring work using multiple LLMs and agents.',
      serviceType: 'Automation System Setup',
      price: 'Proposal-based',
    },
  ],
};

// Type export for consumers that need the shape
export type SeoConfig = typeof seoConfig;
