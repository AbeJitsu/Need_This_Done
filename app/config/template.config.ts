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
    benefit?: string;
    metric?: string;
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
      'Everything you need to build a web app: instant pages, protected data, user accounts, and deployment. Focus on your idea, not infrastructure.',
    repositoryUrl: process.env.NEXT_PUBLIC_GITHUB_URL ||
      'https://github.com/yourusername/fullstack-template',
  },

  // ========================================================================
  // Features
  // ========================================================================
  // List of features displayed on the home page
  // Written in plain language so anyone can understand what they get
  features: [
    {
      icon: '🚀',
      title: 'Pages Load Instantly',
      description: 'Your site remembers frequently-used information so pages appear immediately. First visit might take 200ms, but visitors after that see results in just 2ms.',
      benefit: 'Visitors stay longer when pages load fast. More people complete your goals.',
      metric: '100× faster after first load',
    },
    {
      icon: '🔒',
      title: 'Protected From Day One',
      description: 'Built-in padlock in the browser. Everything users type is scrambled. Hackers blocked automatically. No extra work needed.',
      benefit: 'Your users\' information is safe. You can focus on features instead of security.',
      metric: 'Enterprise-grade protection, included',
    },
    {
      icon: '📦',
      title: 'Everything Included',
      description: 'File storage for your data. User accounts and passwords. Speed memory. Rules for protection. Nothing to buy separately, nothing missing.',
      benefit: 'You don\'t need to figure out which tools work together. It\'s already done.',
      metric: '5+ systems, fully integrated',
    },
    {
      icon: '🐳',
      title: 'Works the Same Everywhere',
      description: 'Test on your laptop. Deploy on the internet. It behaves identically. No "but it worked on my computer" problems.',
      benefit: 'What you build is guaranteed to work the same way everywhere. No surprises.',
      metric: 'Same setup, laptop to production',
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
