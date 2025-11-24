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
      'Your foundation is ready: user authentication, database, caching, Docker setup, and secure communication all working. Now you focus on building what makes your idea unique.',
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
      description: 'Remember the Speed Demo above? That\'s Redis caching at work. First load ~300ms, second load ~2ms. Your site automatically remembers frequently-used data so visitors see results instantly.',
      benefit: 'Visitors stay longer when pages load fast. More people complete your goals.',
      metric: '100× faster after first load',
    },
    {
      icon: '🔒',
      title: 'Protected From Day One',
      description: 'The Auth Demo uses real encryption—the same security banks use. Everything users type is scrambled before leaving their browser. Your backend is protected automatically. No extra work needed.',
      benefit: 'Your users\' information is genuinely safe. You can focus on features instead of security.',
      metric: 'Enterprise-grade protection, included',
    },
    {
      icon: '📦',
      title: 'Everything Included',
      description: 'The Database Demo above shows real persistence. You have Supabase (permanent storage), Redis (speed memory), and authentication already working. User accounts, passwords, file storage—all connected and tested.',
      benefit: 'You don\'t need to figure out which tools work together. It\'s already done.',
      metric: '5+ systems, fully integrated',
    },
    {
      icon: '🐳',
      title: 'Works the Same Everywhere',
      description: 'Everything you saw working above—the demos, the database, the caching—runs in Docker containers. Test on your laptop. Deploy on the internet. It behaves identically.',
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
