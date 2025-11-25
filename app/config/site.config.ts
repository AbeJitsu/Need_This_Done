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

  // Services displayed on services page
  services: Array<{
    title: string;
    description: string;
    details?: string;
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
    tagline: 'Get your projects done right',
    description: 'A professional service platform for getting things done. Submit your project, get a quote, and let us handle the rest.',
    url: 'https://needthisdone.com',
  },

  // ========================================================================
  // Services
  // ========================================================================
  // List of services offered - update with your actual services
  services: [
    {
      title: 'Project Consultation',
      description: 'Discuss your project needs and get expert guidance on the best approach.',
      details: 'We review your requirements and provide clear recommendations.',
      color: 'purple',
    },
    {
      title: 'Custom Development',
      description: 'Get your technical projects built by experienced professionals.',
      details: 'From websites to applications, we handle the technical work.',
      color: 'blue',
    },
    {
      title: 'Ongoing Support',
      description: 'Keep your projects running smoothly with reliable maintenance.',
      details: 'Updates, fixes, and improvements as you need them.',
      color: 'green',
    },
  ],

  // ========================================================================
  // Metadata for SEO and HTML Head
  // ========================================================================
  metadata: {
    siteName: 'NeedThisDone',
    siteDescription: 'Professional project services - submit your project, get it done right.',
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
