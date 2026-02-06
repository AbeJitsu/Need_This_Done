// ============================================================================
// Service Modal Content - Teaser Content for Service Modals
// ============================================================================
// Brief, enticing content that sparks curiosity and drives users to the
// services page for full details. Progressive disclosure: tease → explore.
// Follows CLAUDE.md guidelines: inviting, focused, considerate, supportive.

export interface ServiceModalContent {
  title: string;
  headline: string;
  hook: string; // One sentence that answers "why should I care?"
  bulletHeader?: string; // Header for bullet list, defaults to "What we handle:"
  bulletPoints: string[]; // Keep to 3-4 items - just enough to intrigue
  ctas: {
    primary: {
      text: string;
      href: string;
    };
    secondary: {
      text: string;
      href: string;
    };
  };
}

// ============================================================================
// Managed AI Modal Content
// ============================================================================

export const virtualAssistantModal: ServiceModalContent = {
  title: 'Managed AI',
  headline: 'AI that runs while you sleep. We handle the complexity.',
  hook: 'We build, deploy, and maintain AI agents that handle your operations. You get the results without the complexity.',
  bulletHeader: 'What we handle:',
  bulletPoints: [
    'Custom AI agent development',
    '24/7 monitoring and optimization',
    'Continuous improvement and updates',
    'Dedicated support and training',
  ],
  ctas: {
    primary: {
      text: 'See All Services',
      href: '/services',
    },
    secondary: {
      text: 'Get a Quote',
      href: '/contact',
    },
  },
};

// ============================================================================
// Automation Setup Modal Content
// ============================================================================

export const dataDocumentsModal: ServiceModalContent = {
  title: 'Automation Setup',
  headline: 'Stop doing the same manual tasks every single day.',
  hook: 'We connect your tools and automate your workflows. You reclaim hours every week.',
  bulletHeader: 'What we handle:',
  bulletPoints: [
    'Workflow design and optimization',
    'Tool integration and connection',
    'Automated task sequences',
    'Training and documentation',
  ],
  ctas: {
    primary: {
      text: 'See All Services',
      href: '/services',
    },
    secondary: {
      text: 'Get a Quote',
      href: '/contact',
    },
  },
};

// ============================================================================
// Website Builds Modal Content
// ============================================================================

export const websiteServicesModal: ServiceModalContent = {
  title: 'Website Builds',
  headline: 'Your digital foundation. Built to convert visitors into customers.',
  hook: 'Professional websites that work. From landing pages to full e-commerce, built right from the start.',
  bulletHeader: 'What we handle:',
  bulletPoints: [
    'Custom website design and development',
    'Mobile-first, SEO-optimized builds',
    'E-commerce setup and configuration',
    '30 days of post-launch support',
  ],
  ctas: {
    primary: {
      text: 'See All Services',
      href: '/services',
    },
    secondary: {
      text: 'Get a Quote',
      href: '/contact',
    },
  },
};

// ============================================================================
// Content Map & Helpers
// ============================================================================

export type ServiceType = 'virtual-assistant' | 'data-documents' | 'website-services';

export const serviceModalContentMap: Record<ServiceType, ServiceModalContent> = {
  'virtual-assistant': virtualAssistantModal,
  'data-documents': dataDocumentsModal,
  'website-services': websiteServicesModal,
};

// ============================================================================
// Title to Service Type Mapping (Single Source of Truth)
// ============================================================================
// Maps human-readable service titles to service type keys
// Used by ServiceModalContext and any component that needs to resolve titles

export const TITLE_TO_SERVICE_TYPE: Record<string, ServiceType> = {
  'Managed AI': 'virtual-assistant',
  'Automation Setup': 'data-documents',
  'Website Builds': 'website-services',
  // Legacy names for backwards compatibility
  'Virtual Assistant': 'virtual-assistant',
  'Data & Documents': 'data-documents',
  'Website Services': 'website-services',
};

/**
 * Resolve a service identifier (title or type) to a ServiceType
 * @param identifier - Either a service title ('Virtual Assistant') or type ('virtual-assistant')
 * @returns The ServiceType or undefined if not found
 */
export function resolveServiceType(identifier: string): ServiceType | undefined {
  // Try title mapping first
  if (identifier in TITLE_TO_SERVICE_TYPE) {
    return TITLE_TO_SERVICE_TYPE[identifier];
  }
  // Try direct type match
  if (identifier in serviceModalContentMap) {
    return identifier as ServiceType;
  }
  return undefined;
}

/**
 * Get modal content for a specific service
 */
export function getServiceModalContent(serviceType: ServiceType): ServiceModalContent {
  return serviceModalContentMap[serviceType];
}

// Note: getAllServiceModalContent() was removed because it's unused.
// Access serviceModalContentMap directly instead.

// ============================================================================
// Full Service Content - For Services Page Deep Dive
// ============================================================================
// The services page shows the complete picture: everything from modals plus
// detailed examples, reassurance, and actionable CTAs. This is where users
// make their decision after being teased by the modals.

export interface ServiceFullContent {
  title: string;
  headline: string;
  subtitle: string;
  bulletPoints: string[];
  examples: {
    title: string;
    items: string[];
  };
  reassurance: string;
  ctas: {
    primary: {
      text: string;
      href: string;
    };
    secondary: {
      text: string;
      href: string;
    };
  };
}

export const serviceFullContentMap: Record<ServiceType, ServiceFullContent> = {
  // Order: green, blue, purple (Website Builds, Automation Setup, Managed AI)
  'website-services': {
    title: 'Website Builds',
    headline: 'Your digital foundation. Built to convert visitors into customers.',
    subtitle: 'Professional websites that work, from landing pages to full e-commerce.',
    bulletPoints: [
      'Custom website design and development',
      'Mobile-first, SEO-optimized builds',
      'E-commerce setup and configuration',
      '30 days of post-launch support',
    ],
    examples: {
      title: 'What we do:',
      items: [
        'Custom design, built for you',
        'Mobile-ready from day one',
        'SEO foundation included',
        'Easy updates after launch',
      ],
    },
    reassurance: 'Your site, your way. Built right.',
    ctas: {
      primary: { text: 'See Pricing', href: '/pricing' },
      secondary: { text: 'Get a Free Quote', href: '/contact' },
    },
  },
  'data-documents': {
    title: 'Automation Setup',
    headline: 'Stop doing the same manual tasks every single day.',
    subtitle: 'We connect your tools and automate your workflows.',
    bulletPoints: [
      'Workflow design and optimization',
      'Tool integration and connection',
      'Automated task sequences',
      'Training and documentation',
    ],
    examples: {
      title: 'What we do:',
      items: [
        'Connect your tools seamlessly',
        'Automate repetitive tasks',
        'Save hours every week',
        'Training included',
      ],
    },
    reassurance: 'Set it up once. Benefit forever.',
    ctas: {
      primary: { text: 'See Pricing', href: '/pricing' },
      secondary: { text: 'Get a Free Quote', href: '/contact' },
    },
  },
  'virtual-assistant': {
    title: 'Managed AI',
    headline: 'AI that runs while you sleep. We handle the complexity.',
    subtitle: 'We build, deploy, and maintain AI agents that handle your operations.',
    bulletPoints: [
      'Custom AI agent development',
      '24/7 monitoring and optimization',
      'Continuous improvement and updates',
      'Dedicated support and training',
    ],
    examples: {
      title: 'What we do:',
      items: [
        'AI agents that work around the clock',
        'Automated customer interactions',
        'Data processing and analysis',
        'Workflow automation with intelligence',
      ],
    },
    reassurance: 'You get the results without the complexity.',
    ctas: {
      primary: { text: 'See Pricing', href: '/pricing' },
      secondary: { text: 'Get a Free Quote', href: '/contact' },
    },
  },
};
