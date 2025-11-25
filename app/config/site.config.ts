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
  // Core service offerings: website work, virtual assistance, and data tasks
  services: [
    {
      title: 'Website Services',
      description: 'From new builds to updates and maintenance. We handle websites of any size on any platform—so you can focus on your business.',
      details: 'Website builds & redesigns, content updates, e-commerce setup.',
      color: 'green',
    },
    {
      title: 'Virtual Assistant',
      description: 'Let us handle the day-to-day tasks that eat up your time. Email, scheduling, research, bookings, and social media posting.',
      details: 'Email management, calendar coordination, research & bookings.',
      color: 'purple',
    },
    {
      title: 'Data & Documents',
      description: 'From messy spreadsheets to polished reports. We organize, format, and prepare your documents so they look professional.',
      details: 'Spreadsheets, data entry, reports, presentations, file organization.',
      color: 'blue',
    },
  ],

  // ========================================================================
  // Metadata for SEO and HTML Head
  // ========================================================================
  metadata: {
    siteName: 'NeedThisDone',
    siteDescription: 'Real people helping busy professionals get tasks done. Websites, virtual assistant tasks, data, and documents.',
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
