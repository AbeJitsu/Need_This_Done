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
    tagline: 'Get your tasks done right',
    description: 'We handle the tasks you don\'t have time for. Real people getting everyday work done for busy professionals. Tell us what you need, and let us take care of the rest.',
    url: 'https://needthisdone.com',
  },

  // ========================================================================
  // Services
  // ========================================================================
  // Core service offerings for busy professionals and everyday task help
  services: [
    {
      title: 'Data & Spreadsheets',
      description: 'From messy data to organized insights. We handle spreadsheets, data entry, format conversions, and cleanup so you can focus on what matters.',
      details: 'Excel, Google Sheets, CSV transformations, and more.',
      color: 'purple',
    },
    {
      title: 'Documents & Admin',
      description: 'Professional document preparation, formatting, research, and administrative tasks that free up your valuable time.',
      details: 'Reports, presentations, correspondence, and organization.',
      color: 'blue',
    },
    {
      title: 'Tech & Web Help',
      description: 'From everyday computer questions to website builds and updates. Friendly, patient help with all things tech—no task too small.',
      details: 'Software setup, troubleshooting, websites, and more.',
      color: 'green',
    },
  ],

  // ========================================================================
  // Metadata for SEO and HTML Head
  // ========================================================================
  metadata: {
    siteName: 'NeedThisDone',
    siteDescription: 'Real people helping busy professionals get tasks done. Data, documents, admin work, tech help, and websites.',
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
