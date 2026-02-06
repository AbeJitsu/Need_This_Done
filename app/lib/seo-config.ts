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
    'Professional project services for businesses and individuals. From web development to data solutions, we help you get things done right the first time.',

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
      name: 'Website Builds',
      description: 'Professional website design and development. Custom sites built to convert visitors into customers, mobile-optimized and SEO-ready.',
      serviceType: 'Web Development',
      price: 'From $500',
    },
    {
      name: 'Automation Setup',
      description: 'Workflow automation and tool integration. Connect your apps and eliminate repetitive manual tasks.',
      serviceType: 'Business Process Automation',
      price: 'From $150',
    },
    {
      name: 'Managed AI Services',
      description: 'AI agent development and ongoing management. Custom AI solutions that run 24/7 while you focus on growth.',
      serviceType: 'AI Consulting',
      price: 'From $500/month',
    },
  ],
};

// Type export for consumers that need the shape
export type SeoConfig = typeof seoConfig;
