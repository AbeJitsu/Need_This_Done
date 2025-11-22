// ============================================================================
// Template Configuration
// ============================================================================
// Centralized configuration for template customization
// Use environment variables to override defaults for easy template reuse
// This makes it simple to fork this template and customize it for new projects

export interface TemplateConfig {
  // Project Identity
  project: {
    name: string;
    description: string;
    repositoryUrl: string;
  };

  // Features displayed on home page
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;

  // SEO and Metadata
  metadata: {
    siteName: string;
    siteDescription: string;
    author: string;
  };
}

// Default configuration - override with environment variables
const defaultConfig: TemplateConfig = {
  // ========================================================================
  // Project Configuration
  // ========================================================================
  // Customize with environment variables:
  // NEXT_PUBLIC_PROJECT_NAME
  // NEXT_PUBLIC_PROJECT_DESCRIPTION
  // NEXT_PUBLIC_GITHUB_URL
  project: {
    name: process.env.NEXT_PUBLIC_PROJECT_NAME || 'Full-Stack Template',
    description: process.env.NEXT_PUBLIC_PROJECT_DESCRIPTION ||
      'A production-ready template with Nginx, Next.js, Redis, and Supabase',
    repositoryUrl: process.env.NEXT_PUBLIC_GITHUB_URL ||
      'https://github.com/yourusername/fullstack-template',
  },

  // ========================================================================
  // Features
  // ========================================================================
  // List of features displayed on the home page
  // Easy to customize by modifying this array
  features: [
    {
      icon: '🚀',
      title: 'Fast',
      description: 'Redis caching and Nginx optimization for lightning-fast performance',
    },
    {
      icon: '🔒',
      title: 'Secure',
      description: 'HTTPS by default, secure sessions, and production-ready security headers',
    },
    {
      icon: '📦',
      title: 'Complete',
      description: 'Everything you need: database, caching, authentication, and deployment',
    },
    {
      icon: '🐳',
      title: 'Dockerized',
      description: 'Runs identically on your laptop and in production - no surprises',
    },
  ],

  // ========================================================================
  // Metadata for SEO and HTML Head
  // ========================================================================
  // Used in layout.tsx for page metadata
  metadata: {
    siteName: process.env.NEXT_PUBLIC_PROJECT_NAME || 'Full-Stack Template',
    siteDescription: process.env.NEXT_PUBLIC_PROJECT_DESCRIPTION ||
      'A production-ready template with Nginx, Next.js, Redis, and Supabase',
    author: process.env.NEXT_PUBLIC_AUTHOR || 'Your Name',
  },
};

// Export the configuration
export const templateConfig: TemplateConfig = defaultConfig;

// Helper function to update features if needed
export function getFeatures(): TemplateConfig['features'] {
  return templateConfig.features;
}

// Helper function to get project info
export function getProjectInfo() {
  return templateConfig.project;
}
