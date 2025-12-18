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
// Virtual Assistant Modal Content
// ============================================================================

export const virtualAssistantModal: ServiceModalContent = {
  title: 'Virtual Assistant',
  headline: 'Your time is valuable. Let us handle the tasks that eat up your day.',
  hook: 'We take care of the details so you can focus on what actually moves your business forward.',
  bulletPoints: [
    'Email management and inbox organization',
    'Calendar coordination and scheduling',
    'Research projects and data gathering',
    'Travel planning and booking',
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
// Data & Documents Modal Content
// ============================================================================

export const dataDocumentsModal: ServiceModalContent = {
  title: 'Data & Documents',
  headline: 'Messy spreadsheets and formatting nightmares? We turn chaos into clarity.',
  hook: 'We make your documents look professional and work better. No judgment, just results.',
  bulletPoints: [
    'Spreadsheet cleanup and organization',
    'Data entry and formatting',
    'Report and presentation design',
    'Document templates and file organization',
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
// Website Services Modal Content
// ============================================================================

export const websiteServicesModal: ServiceModalContent = {
  title: 'Website Services',
  headline: 'Your website should work for you, not give you a headache.',
  hook: 'You focus on your business. We handle the tech. Plain language, clear answers.',
  bulletPoints: [
    'New website builds and redesigns',
    'Content updates and page edits',
    'E-commerce setup and product management',
    'Ongoing maintenance and support',
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

/**
 * Get modal content for a specific service
 */
export function getServiceModalContent(serviceType: ServiceType): ServiceModalContent {
  return serviceModalContentMap[serviceType];
}

/**
 * Get all service modal content
 */
export function getAllServiceModalContent(): Record<ServiceType, ServiceModalContent> {
  return serviceModalContentMap;
}

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
  'virtual-assistant': {
    title: 'Virtual Assistant',
    headline: 'Your time is valuable. Let us handle the tasks that eat up your day.',
    subtitle: 'We handle the details so you can focus on what matters.',
    bulletPoints: [
      'Email management and inbox organization',
      'Calendar coordination and scheduling',
      'Travel planning and booking',
      'Research and data gathering',
    ],
    examples: {
      title: 'What we do:',
      items: [
        'Tame your inbox',
        'Book your next trip',
        'Research done for you',
        'Meetings scheduled, headaches avoided',
      ],
    },
    reassurance: 'You stay in control. We keep things moving.',
    ctas: {
      primary: { text: 'Book a Consultation', href: '/shop' },
      secondary: { text: 'Get a Quote', href: '/contact' },
    },
  },
  'data-documents': {
    title: 'Data & Documents',
    headline: 'Messy spreadsheets and formatting nightmares? We turn chaos into clarity.',
    subtitle: 'We turn messy files into polished, professional work.',
    bulletPoints: [
      'Spreadsheet cleanup and organization',
      'Data entry and formatting',
      'Report and presentation design',
      'Document templates and file organization',
    ],
    examples: {
      title: 'What we do:',
      items: [
        'Messy spreadsheets → organized data',
        'Reports that look the part',
        'Data entry, handled',
        'Templates you will actually use',
      ],
    },
    reassurance: 'No judgment. Just results.',
    ctas: {
      primary: { text: 'Book a Consultation', href: '/shop' },
      secondary: { text: 'Get a Quote', href: '/contact' },
    },
  },
  'website-services': {
    title: 'Website Services',
    headline: 'Your website should work for you, not give you a headache.',
    subtitle: 'You focus on your business. We handle the tech.',
    bulletPoints: [
      'New website builds and redesigns',
      'Content updates and page edits',
      'E-commerce setup and management',
      'Ongoing maintenance and support',
    ],
    examples: {
      title: 'What we do:',
      items: [
        'Fresh site, built for you',
        'Content updates and fixes',
        'Online store, ready to sell',
        'Monthly care and maintenance',
      ],
    },
    reassurance: 'Plain language. Clear answers.',
    ctas: {
      primary: { text: 'Book a Consultation', href: '/shop' },
      secondary: { text: 'Get a Quote', href: '/contact' },
    },
  },
};
