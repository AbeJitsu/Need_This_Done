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
// Automation System Setup Modal Content
// ============================================================================

export const virtualAssistantModal: ServiceModalContent = {
  title: 'Automation System Setup',
  headline: 'Make recurring work easier to coordinate.',
  hook: 'We shape tools, LLMs, agents, evidence, and approvals around a defined result.',
  bulletHeader: 'What we handle:',
  bulletPoints: [
    'A defined result and workflow',
    'Coordinated tools, LLMs, and agents',
    'Evidence and approval records',
    'A browser workspace for review',
  ],
  ctas: {
    primary: {
      text: 'See All Services',
      href: '/services',
    },
    secondary: {
      text: 'Contact',
      href: '/contact',
    },
  },
};

// ============================================================================
// Automation Setup Modal Content
// ============================================================================

export const dataDocumentsModal: ServiceModalContent = {
  title: 'Automation System Setup',
  headline: 'Stop losing work between tools.',
  hook: 'We map the repeating workflow before selecting the smallest useful coordination layer.',
  bulletHeader: 'What we handle:',
  bulletPoints: [
    'Workflow mapping',
    'Tool and source coordination',
    'Evidence-backed handoffs',
    'Approval boundaries',
  ],
  ctas: {
    primary: {
      text: 'See All Services',
      href: '/services',
    },
    secondary: {
      text: 'Contact',
      href: '/contact',
    },
  },
};

// ============================================================================
// Website Builds Modal Content
// ============================================================================

export const websiteServicesModal: ServiceModalContent = {
  title: 'Targeted Fix',
  headline: 'Fix one website problem.',
  hook: 'A focused review turns one visible issue into one contained change for $500.',
  bulletHeader: 'What we handle:',
  bulletPoints: [
    'One focused review',
    'One agreed page or component fix',
    'Accessibility, SEO, performance, or conversion focus',
    'A before-and-after handoff',
  ],
  ctas: {
    primary: {
      text: 'See All Services',
      href: '/services',
    },
    secondary: {
      text: 'Contact',
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
  'Automation System Setup': 'virtual-assistant',
  'Targeted Fix': 'website-services',
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
  // Retained internal order: website, automation, automation detail.
  'website-services': {
    title: 'Targeted Fix',
    headline: 'Fix one website problem.',
    subtitle: 'A focused review and one agreed page, component, accessibility, SEO, performance, or conversion fix.',
    bulletPoints: [
      'One contained scope',
      'One agreed fix',
      'A clear before-and-after handoff',
    ],
    examples: {
      title: 'What we do:',
      items: [
        'Name the problem',
        'Agree on the result',
        'Deliver one change',
        'Record the handoff',
      ],
    },
    reassurance: 'Keep the promise narrow enough to deliver.',
    ctas: {
      primary: { text: 'See Pricing', href: '/pricing' },
      secondary: { text: 'Contact', href: '/contact?offer=website-improvement' },
    },
  },
  'data-documents': {
    title: 'Automation System Setup',
    headline: 'Make recurring work easier to coordinate.',
    subtitle: 'Map the workflow, connect the pieces, and keep evidence with each handoff.',
    bulletPoints: [
      'Workflow mapping',
      'Tool and source coordination',
      'Evidence-backed handoffs',
      'Approval boundaries',
    ],
    examples: {
      title: 'What we do:',
      items: [
        'Define the outcome',
        'Coordinate the work',
        'Review the evidence',
        'Improve the next run',
      ],
    },
    reassurance: 'Use the smallest useful system for the work at hand.',
    ctas: {
      primary: { text: 'See Pricing', href: '/pricing' },
      secondary: { text: 'Contact', href: '/contact?offer=ai-operator' },
    },
  },
  'virtual-assistant': {
    title: 'Automation System Setup',
    headline: 'Keep recurring work, evidence, and decisions together.',
    subtitle: 'Multiple tools, LLMs, and agents can prepare work while a person keeps the approval boundary.',
    bulletPoints: [
      'A defined result and workflow',
      'Coordinated specialists',
      'Durable evidence and costs',
      'Human review before external action',
    ],
    examples: {
      title: 'What we do:',
      items: [
        'Research with sources',
        'Drafts with versions',
        'Decisions with context',
        'Outcomes with a record',
      ],
    },
    reassurance: 'Visibility keeps automation useful.',
    ctas: {
      primary: { text: 'See Pricing', href: '/pricing' },
      secondary: { text: 'Contact', href: '/contact?offer=ai-operator' },
    },
  },
};
