// ============================================================================
// Service Modal Content - Friendly, Non-Technical Content for Service Modals
// ============================================================================
// Contains engaging, relatable content for the three service modals.
// Written to speak directly to busy professionals in plain language.
// Follows CLAUDE.md guidelines: inviting, focused, considerate, supportive.

export interface ServiceModalContent {
  title: string;
  headline: string;
  subtitle?: string;
  bulletPoints: string[];
  examples: {
    title: string;
    items: string[];
  };
  reassurance: string;
  ctas: {
    primary: {
      text: string;
      description: string;
      href: string;
    };
    secondary: {
      text: string;
      description: string;
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
  subtitle: 'From inbox overwhelm to scheduling chaos, we take care of the details so you can focus on what actually moves your business forward.',
  bulletPoints: [
    'Email management and inbox organization',
    'Calendar coordination and appointment scheduling',
    'Travel planning and booking',
    'Research projects and data gathering',
    'Social media posting and updates',
  ],
  examples: {
    title: 'Real tasks we handle every day:',
    items: [
      'Sorting through 200 emails and flagging the 5 that need your attention',
      'Booking your entire conference trip, from flights to dinner reservations',
      'Researching vendors and creating a comparison spreadsheet',
      'Scheduling meetings across three time zones without the back-and-forth',
      'Posting your blog content to LinkedIn, Twitter, and Facebook',
    ],
  },
  reassurance: 'You stay in control. We handle the work, keep you updated, and make sure nothing falls through the cracks.',
  ctas: {
    primary: {
      text: 'Quick Chat ($20)',
      description: '15 minutes to discuss your needs',
      href: '/shop',
    },
    secondary: {
      text: 'Get a Quote',
      description: 'Tell us about your project',
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
  subtitle: 'Whether it is a spreadsheet that needs organizing or a presentation that needs polish, we make your documents look professional and work better.',
  bulletPoints: [
    'Spreadsheet cleanup and organization',
    'Data entry and formatting',
    'Report preparation and presentation design',
    'Document formatting and templates',
    'File organization and cleanup',
  ],
  examples: {
    title: 'Transformations we do regularly:',
    items: [
      'Taking 5 messy spreadsheets and turning them into one organized database',
      'Formatting your quarterly report so it actually looks professional',
      'Entering 500 business cards into a clean, searchable contact list',
      'Creating templates for your invoices, proposals, and reports',
      'Organizing years of files into a system that makes sense',
    ],
  },
  reassurance: 'No judgment, just results. We have seen it all and we know how to fix it. Your messy data becomes our clean deliverable.',
  ctas: {
    primary: {
      text: 'Quick Chat ($20)',
      description: '15 minutes to discuss your needs',
      href: '/shop',
    },
    secondary: {
      text: 'Get a Quote',
      description: 'Tell us about your project',
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
  subtitle: 'Whether you need a brand new site, updates to your current one, or someone to handle ongoing maintenance, we have got you covered. You focus on your business. We handle the tech.',
  bulletPoints: [
    'New website builds and redesigns',
    'Content updates and page edits',
    'E-commerce setup and product management',
    'Ongoing maintenance and updates',
    'Tech troubleshooting and support',
  ],
  examples: {
    title: 'What we build and fix:',
    items: [
      'Building a professional website for your small business from scratch',
      'Updating your homepage, fixing broken links, and adding new pages',
      'Setting up your online store so you can start selling',
      'Keeping your site secure, updated, and running smoothly every month',
      'Fixing that one thing that has been broken for weeks (you know what it is)',
    ],
  },
  reassurance: 'We handle the tech so you do not have to. No jargon, no confusion, just a website that works the way you need it to.',
  ctas: {
    primary: {
      text: 'Quick Chat ($20)',
      description: '15 minutes to discuss your needs',
      href: '/shop',
    },
    secondary: {
      text: 'Get a Quote',
      description: 'Tell us about your project',
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
