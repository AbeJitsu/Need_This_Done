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
    tagline: 'Websites. Automation. AI.',
    description: 'From your first website to fully automated operations. We build the technology that lets you focus on what matters.',
    url: 'https://needthisdone.com',
  },

  // ========================================================================
  // Services
  // ========================================================================
  // Core service offerings - ordered to match pricing tier colors (blue, purple, green)
  services: [
    {
      title: 'Website Build',
      tagline: 'Your digital foundation',
      description: 'Professional websites that work. From landing pages to full e-commerce, built to convert visitors into customers.',
      details: 'Custom Design, Mobile-First, SEO-Ready, Easy to Update',
      color: 'blue',
    },
    {
      title: 'Automation Setup',
      tagline: 'Stop doing repetitive work',
      description: 'Connect your tools, automate your workflows, and reclaim hours every week. We set it up, you reap the benefits.',
      details: 'Workflow Design, Tool Integration, Testing, Training',
      color: 'purple',
    },
    {
      title: 'Managed AI Services',
      tagline: 'AI that runs while you sleep',
      description: 'We build, deploy, and maintain AI agents that handle your operations. You get the results without the complexity.',
      details: 'Custom AI Agents, Monitoring, Optimization, Support',
      color: 'green',
    },
  ],

  // ========================================================================
  // Metadata for SEO and HTML Head
  // ========================================================================
  metadata: {
    siteName: 'NeedThisDone',
    siteDescription: 'Professional website builds, automation setup, and managed AI services for growing businesses.',
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
