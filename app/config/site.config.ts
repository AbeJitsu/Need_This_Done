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
    tagline: 'Website improvements and a managed AI operator.',
    description: 'A focused $500 website improvement or a proposal-based managed AI operator pilot, both run with clear human accountability.',
    url: 'https://needthisdone.com',
  },

  // ========================================================================
  // Services
  // ========================================================================
  // Core service offerings - colors match page-config.ts: Website=green, Automation=blue, AI=purple
  services: [
    {
      title: 'Website Improvement',
      tagline: '$500 audit + one contained fix',
      description: 'A focused review of one website path, followed by one agreed page-, component-, accessibility-, SEO-, performance-, or conversion-level improvement.',
      details: 'Audit, Contained Fix, Before/After Handoff, Manual 50/50 Invoice',
      color: 'green',
    },
    {
      title: 'Managed AI Operator',
      tagline: 'A private 30-day supervised pilot',
      description: 'Abe and Andrea operate a bounded role privately, bring decisions for human approval, and send weekly client briefs.',
      details: 'Operating Brief, Approval Boundaries, Weekly Briefs, Recorded Outcomes',
      color: 'blue',
    },
  ],

  // ========================================================================
  // Metadata for SEO and HTML Head
  // ========================================================================
  metadata: {
    siteName: 'NeedThisDone',
    siteDescription: 'Focused website improvements and human-led managed AI operator pilots for busy owners and managers.',
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
