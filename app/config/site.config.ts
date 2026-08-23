// ============================================================================
// Site Configuration - NeedThisDone.com
// ============================================================================
// Centralized configuration for the site
// Update these values to customize branding and content

export interface SiteConfig {
  // Project Identity
  project: {
    name: string;
    tagline: string;
    description: string;
    url: string;
  };

  // Services displayed across the site
  services: Array<{
    title: string;
    tagline: string;      // Brief one-liner for home page
    description: string;  // Full description for services page
    details?: string;     // Additional info for services page
    color: 'blue' | 'purple' | 'green';
  }>;

  // SEO and Metadata
  metadata: {
    siteName: string;
    siteDescription: string;
    author: string;
  };
}

// Site configuration
const siteConfig: SiteConfig = {
  // ========================================================================
  // Project Configuration
  // ========================================================================
  project: {
    name: 'NeedThisDone',
    tagline: 'Website fixes and managed automation.',
    description: 'A focused $500 Website Fix or a proposal-based Managed Automation pilot, both run with clear human accountability.',
    url: 'https://needthisdone.com',
  },

  // ========================================================================
  // Services
  // ========================================================================
  // Core service offerings - colors match page-config.ts: Website=green, Automation=blue, AI=purple
  services: [
    {
      title: 'Website Fix',
      tagline: '$500 audit + one contained fix',
      description: 'A focused review of one website path, followed by one agreed page-, component-, accessibility-, SEO-, performance-, or conversion-level improvement.',
      details: 'Audit, Contained Fix, Before/After Handoff, Manual 50/50 Invoice',
      color: 'green',
    },
    {
      title: 'Managed Automation',
      tagline: 'A human-run 30-day pilot',
      description: 'Abe and Andrea run one repeated task privately, bring decisions for human review, and send weekly client briefs.',
      details: 'Operating Brief, Decision Points, Weekly Briefs, Recorded Outcomes',
      color: 'blue',
    },
  ],

  // ========================================================================
  // Metadata for SEO and HTML Head
  // ========================================================================
  metadata: {
    siteName: 'NeedThisDone',
    siteDescription: 'Focused website fixes and human-run managed automation pilots for busy owners and managers.',
    author: 'NeedThisDone',
  },
};

// Export the configuration
export { siteConfig };

// Helper function to get services
export function getServices(): SiteConfig['services'] {
  return siteConfig.services;
}

// Helper function to get project info
export function getProjectInfo() {
  return siteConfig.project;
}
