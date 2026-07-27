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
    tagline: 'Your supervised AI Growth Employee.',
    description: 'Growth work moves forward between focused check-ins while you stay in control.',
    url: 'https://needthisdone.com',
  },

  // ========================================================================
  // Services
  // ========================================================================
  // Core service offerings - colors match page-config.ts: Website=green, Automation=blue, AI=purple
  services: [
    {
      title: 'AI Growth Employee Pilot',
      tagline: 'Design and prove the role',
      description: 'Discovery, operating brief, first workflows, guardrails, and a measured supervised trial.',
      details: 'Role Design, Guardrails, Check-ins, Measured Trial',
      color: 'green',
    },
    {
      title: 'Managed AI Growth Employee',
      tagline: 'Operate and improve the role',
      description: 'Ongoing operation, monitoring, improvement, reporting, and support.',
      details: 'Daily Queues, Monitoring, Outcomes, Support',
      color: 'blue',
    },
    {
      title: 'Implementation Capabilities',
      tagline: 'Used only when the plan requires them',
      description: 'Website improvements, integrations, and automation support an approved growth plan rather than being headline products.',
      details: 'Web Improvements, Integrations, Custom Automation',
      color: 'purple',
    },
  ],

  // ========================================================================
  // Metadata for SEO and HTML Head
  // ========================================================================
  metadata: {
    siteName: 'NeedThisDone',
    siteDescription: 'Supervised AI Growth Employees for busy owners and managers.',
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
