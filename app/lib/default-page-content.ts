// ============================================================================
// Default Page Content - Fallback Values for Marketing Pages
// ============================================================================
// Contains the current hardcoded content from each marketing page.
// Used as fallback when no database entry exists for a page.
// When the content editor saves, these defaults get replaced with DB values.

import type {
  PricingPageContent,
  FAQPageContent,
  ServicesPageContent,
  HowItWorksPageContent,
  HomePageContent,
  PageContent,
  EditablePageSlug,
} from './page-content-types';

// ============================================================================
// Pricing Page Defaults
// ============================================================================

export const defaultPricingContent: PricingPageContent = {
  header: {
    title: 'Pick Your Perfect Fit',
    description:
      "Every project is different, so here's a starting point. Not sure which one? Just ask and we'll help you figure it out.",
  },
  tiers: [
    {
      name: 'Quick Task',
      price: 'From $50',
      period: 'per task',
      description:
        'Perfect for simple tasks across any service—admin, data entry, or quick site fixes.',
      features: [
        'Virtual Assistant: Email sorting, basic scheduling',
        'Data & Documents: Simple formatting, data entry',
        'Website: Fix broken links, update text or images',
        'Delivered in days, not weeks',
      ],
      color: 'green',
      // No individual CTA - uses shared consultation CTA below
    },
    {
      name: 'Standard Task',
      price: 'From $150',
      period: 'per task',
      description:
        'Our most popular option. Great for projects that need research, organization, or multiple steps.',
      features: [
        'Virtual Assistant: Research, travel planning, coordination',
        'Data & Documents: Spreadsheet cleanup, report formatting',
        'Website: Refresh a page, add new features, speed things up',
        "Revisions included until you're happy",
      ],
      color: 'blue',
      popular: true,
      // No individual CTA - uses shared consultation CTA below
    },
    {
      name: 'Premium Service',
      price: 'From $500',
      period: 'per project',
      description:
        "For bigger builds and complex projects. We'll be with you every step of the way.",
      features: [
        'Website: Build a new site or give yours a complete makeover',
        'Online store setup so you can start selling',
        'Large data migrations & system overhauls',
        'Dedicated point of contact throughout',
      ],
      color: 'purple',
      // No individual CTA - uses shared dual-option CTA below
    },
  ],
  paymentNote: {
    enabled: true,
    depositPercent: '50%',
    depositLabel: 'To Start',
    depositDescription: 'Deposit to begin work',
    deliveryPercent: '50%',
    deliveryLabel: 'On Delivery',
    deliveryDescription: 'When you approve the work',
  },
  customSection: {
    title: 'Something Else in Mind?',
    description:
      "Every project is unique. Tell us what you're working on and we'll figure out the best approach together. Or check out our FAQ for quick answers.",
    buttons: [
      { text: 'View Services', variant: 'orange', href: '/services' },
      { text: 'Read the FAQ', variant: 'purple', href: '/faq' },
    ],
    hoverColor: 'orange',
  },
};

// ============================================================================
// FAQ Page Defaults
// ============================================================================

export const defaultFAQContent: FAQPageContent = {
  header: {
    title: 'Frequently Asked Questions',
    description: 'Your questions, answered.',
  },
  items: [
    {
      question: 'What types of tasks do you handle?',
      answer:
        'We help with all kinds of tasks: spreadsheets and data cleanup, document preparation, administrative work, computer help, and even website builds and updates. Check out our services page to see what we specialize in. If you\'re not sure whether we can help, just ask! We\'re happy to discuss your needs.',
      links: [{ text: 'services page', href: '/services' }],
    },
    {
      question: 'Do I need to be tech-savvy to work with you?',
      answer:
        "Not at all! We work with people of all backgrounds. Just describe what you need in your own words, and we'll take it from there. No technical terms needed.",
    },
    {
      question: 'How long does a typical task take?',
      answer:
        'Most projects are completed within 1-2 weeks, depending on scope. Quick tasks can be done in days, while bigger builds may take longer. We always provide a clear timeline upfront so you know what to expect. Learn more about how it works.',
      links: [{ text: 'how it works', href: '/how-it-works' }],
    },
    {
      question: 'How much does it cost?',
      answer:
        "Pricing depends on complexity, not service type. Quick tasks across any service start at $50. Standard projects that need more steps run $150+. Bigger builds like full websites or complex data migrations start at $500+. Check out our pricing page for details. We provide transparent quotes with no hidden fees—tell us what you need, and we'll give you a clear estimate before any work begins.",
      links: [{ text: 'pricing page', href: '/pricing' }],
    },
    {
      question: 'How do I get started?',
      answer:
        "Simply reach out through our contact form and describe what you need help with. We'll review your request and get back to you within 2 business days with questions or a quote.",
      links: [{ text: 'contact form', href: '/contact' }],
    },
    {
      question: 'Can you help with one-time tasks or just ongoing work?',
      answer:
        "Both! Whether you have a single task that needs attention or want regular ongoing support, we're here to help. Many clients start with a one-time task and come back when something else comes up.",
    },
    {
      question: 'What if I need changes after delivery?',
      answer:
        "We want you to be completely satisfied. We include reasonable revisions as part of every task. If something isn't quite right, just let us know and we'll make it right.",
    },
    {
      question: 'How do you handle communication?',
      answer:
        "We keep you updated every step of the way. You can expect clear progress updates and quick responses to your questions. We believe good communication makes everything easier.",
    },
    {
      question: 'How does payment work?',
      answer:
        'We use a simple 50/50 structure: 50% deposit to start work, and the remaining 50% when you approve the final delivery. We accept major credit cards and other common payment methods. No surprises, just straightforward pricing. Ready to authorize a project?',
      links: [{ text: 'Ready to authorize a project?', href: '/get-started' }],
    },
    {
      question: 'What if I have a question that is not listed here?',
      answer:
        "We'd love to hear from you! Reach out through our contact page and we'll be happy to answer any questions you have.",
      links: [{ text: 'contact page', href: '/contact' }],
    },
  ],
  cta: {
    title: 'Still Have Questions?',
    description:
      "We're here to help. Reach out and we'll get back to you promptly.",
    buttons: [
      { text: 'View Services', variant: 'orange', href: '/services' },
      { text: 'View Pricing', variant: 'teal', href: '/pricing' },
    ],
    hoverColor: 'orange',
  },
};

// ============================================================================
// Services Page Defaults
// ============================================================================

export const defaultServicesContent: ServicesPageContent = {
  header: {
    title: 'Find Your Perfect Fit',
    description:
      "Not sure which service you need? You're in the right place. Let's figure it out together—no pressure, no tech speak, just helpful guidance.",
  },

  // Scenario Matcher - "Does this sound like you?"
  scenarioMatcher: {
    title: 'Does this sound like you?',
    description: 'Click any scenario to learn more about how we can help.',
    scenarios: [
      {
        scenario: 'My inbox is drowning me and I can\'t keep up',
        serviceKey: 'virtual-assistant',
        serviceTitle: 'Virtual Assistant',
        color: 'green',
      },
      {
        scenario: 'I have spreadsheets that need serious help',
        serviceKey: 'data-documents',
        serviceTitle: 'Data & Documents',
        color: 'blue',
      },
      {
        scenario: 'My website needs work but I don\'t know where to start',
        serviceKey: 'website-services',
        serviceTitle: 'Website Services',
        color: 'purple',
      },
      {
        scenario: 'I need someone to handle the stuff I keep putting off',
        serviceKey: 'virtual-assistant',
        serviceTitle: 'Virtual Assistant',
        color: 'green',
      },
      {
        scenario: 'I need professional documents but don\'t have design skills',
        serviceKey: 'data-documents',
        serviceTitle: 'Data & Documents',
        color: 'blue',
      },
      {
        scenario: 'I want to sell online but the tech is overwhelming',
        serviceKey: 'website-services',
        serviceTitle: 'Website Services',
        color: 'purple',
      },
    ],
  },

  // Comparison Table - Side-by-side view
  comparison: {
    title: 'Compare Services',
    description: 'Pricing depends on complexity, not just service type. Simple tasks start at $50, bigger projects run $150-500+.',
    columns: ['Virtual Assistant', 'Data & Documents', 'Website Services'],
    rows: [
      {
        label: 'Best for',
        values: [
          'Freeing up your time',
          'Turning chaos into clarity',
          'Tech without the headache',
        ],
      },
      {
        label: 'What we handle',
        values: [
          'Email, calendar, research, social media',
          'Spreadsheets, reports, templates, files',
          'Builds, updates, e-commerce, maintenance',
        ],
      },
      {
        label: 'Typical timeline',
        values: ['Ongoing or one-time', 'Days to 1 week', '1-4 weeks'],
      },
      {
        label: 'Quick tasks',
        values: ['$50/task', '$50/task', '$50/task'],
      },
      {
        label: 'Bigger projects',
        values: ['$150+', '$150+', '$500+'],
      },
    ],
  },

  // Still Not Sure - Low-friction CTA
  stillUnsure: {
    title: 'Still not sure?',
    description:
      "No problem—that's what we're here for. Book a quick 15-minute chat and we'll help you figure out exactly what you need. No pressure, no commitment.",
    primaryButton: {
      text: 'Book a Quick Chat',
      subtext: 'Just $20 · 15 minutes',
      variant: 'orange',
      href: '/shop',
    },
    secondaryButton: {
      text: 'Request a Free Quote',
      subtext: 'Tell us about your project',
      variant: 'blue',
      href: '/contact',
    },
  },

  // Existing sections (kept)
  expectationsTitle: 'What You Can Expect',
  expectations: [
    {
      title: 'Clear Communication',
      description: 'We keep you informed every step of the way. No surprises.',
    },
    {
      title: 'Quality Work',
      description: 'We take pride in delivering work you can rely on.',
    },
    {
      title: 'Fair Pricing',
      description: 'Transparent quotes with no hidden fees.',
      link: { href: '/pricing' },
    },
    {
      title: 'Timely Delivery',
      description: 'We respect your deadlines and deliver on time.',
    },
  ],
  cta: {
    title: 'Ready to Get Started?',
    description:
      "Tell us about your project and we'll get back to you with a personalized quote.",
    buttons: [
      { text: 'View Pricing', variant: 'orange', href: '/pricing' },
      { text: 'How It Works', variant: 'blue', href: '/how-it-works' },
      { text: 'FAQ', variant: 'teal', href: '/faq' },
    ],
    hoverColor: 'orange',
  },
};

// ============================================================================
// How It Works Page Defaults
// ============================================================================

export const defaultHowItWorksContent: HowItWorksPageContent = {
  header: {
    title: 'We Make It Easy',
    description:
      'No hoops to jump through. No confusing tech speak. Just a simple, friendly process from start to finish.',
  },
  trustBadges: [
    { text: 'Personal attention', description: 'Real people, not bots' },
    { text: 'Clear updates', description: 'At every step' },
    { text: 'No surprises', description: 'Transparent pricing' },
  ],
  steps: [
    {
      number: 1,
      title: 'Start the Conversation',
      description:
        'Tell us what you need in your own words. No tech speak required—just describe what\'s on your plate and we\'ll take it from there.',
      details: [
        'Fill out our simple contact form',
        'Attach any relevant files or documents',
        'Let us know your timeline if you have one',
      ],
      color: 'green',
      href: '/contact',
    },
    {
      number: 2,
      title: 'We Review & Respond',
      description:
        'Quote within 2 business days, no obligation. We\'ll ask questions if needed and give you a clear, honest estimate.',
      details: [
        'We assess what needs to be done',
        'We ask clarifying questions if needed',
        'You receive a clear, transparent quote',
      ],
      color: 'blue',
    },
    {
      number: 3,
      title: 'You Authorize & We Start',
      description:
        '50% deposit to begin, progress updates along the way. You\'ll always know where things stand.',
      details: [
        '50% deposit to begin work',
        'Secure online payment',
        "We'll keep you updated on progress",
      ],
      color: 'purple',
    },
    {
      number: 4,
      title: 'Approve & Receive',
      description:
        'Review the work, give feedback, and pay the remaining 50% when you\'re happy. Simple as that.',
      details: [
        'You review what we have done',
        'We address any feedback',
        "Final 50% on approval, then it's yours!",
      ],
      color: 'orange',
    },
  ],
  timeline: {
    title: 'Typical Timeline',
    description:
      "Most projects wrap up in 1-2 weeks. Bigger builds take longer—we'll give you a clear timeline upfront.",
    hoverColor: 'blue',
  },
  questionsSection: {
    title: 'Questions about the process?',
    description: "We're happy to walk you through it. No pressure, no obligation.",
    primaryButton: { text: 'Book a Quick Chat', variant: 'blue', href: '/shop' },
    secondaryButton: { text: 'Read the FAQ', variant: 'purple', href: '/faq' },
    hoverColor: 'blue',
  },
  cta: {
    title: 'Ready to Get Started?',
    description:
      "Tell us what you need and we'll get back with a personalized quote.",
    buttons: [
      { text: 'View Services', variant: 'orange', href: '/services' },
      { text: 'View Pricing', variant: 'teal', href: '/pricing' },
      { text: 'Contact Us', variant: 'blue', href: '/contact' },
    ],
    hoverColor: 'orange',
  },
};

// ============================================================================
// Home Page Defaults
// ============================================================================

export const defaultHomeContent: HomePageContent = {
  hero: {
    buttons: [
      { text: 'Book a Consultation', variant: 'orange', href: '/shop' },
      { text: 'View Services', variant: 'blue', href: '/services' },
    ],
  },
  servicesTitle: 'What We Offer',
  consultations: {
    title: 'Quick Consultations',
    description:
      'Need expert guidance fast? Book a call and get personalized help for your project.',
    options: [
      {
        name: 'Quick Chat',
        duration: '15 min',
        price: '$20',
        description: 'Perfect for quick questions',
        color: 'green',
      },
      {
        name: 'Standard Call',
        duration: '30 min',
        price: '$35',
        description: 'Our most popular option',
        color: 'blue',
      },
      {
        name: 'Deep Dive',
        duration: '55 min',
        price: '$50',
        description: 'For complex discussions',
        color: 'purple',
      },
    ],
    linkText: 'Browse all consultations →',
    linkHref: '/shop',
  },
  processPreview: {
    title: 'Simple Process',
    steps: [
      {
        number: 1,
        title: 'Tell Us',
        description: 'Describe what you need',
        color: 'green',
      },
      {
        number: 2,
        title: 'Get a Quote',
        description: 'We respond in 2 days',
        color: 'blue',
      },
      {
        number: 3,
        title: 'Authorize',
        description: '50% deposit to start',
        color: 'purple',
      },
      {
        number: 4,
        title: 'Delivery',
        description: 'Review and approve',
        color: 'orange',
      },
    ],
    linkText: 'Learn more about our process →',
  },
  cta: {
    title: 'Ready to Get Started?',
    description:
      'Tell us about your project for a custom quote, or check our pricing to see what fits.',
    buttons: [
      { text: 'Get a Quote', variant: 'orange', href: '/contact' },
      { text: 'View Pricing', variant: 'blue', href: '/pricing' },
    ],
    footer: 'Have questions?',
    footerLinkText: 'Check out our FAQ',
    footerLinkHref: '/faq',
    chatbotNote: 'Or use the chat button to talk with us anytime.',
    hoverColor: 'orange',
  },
};

// ============================================================================
// Default Content Getter
// ============================================================================

const defaultContentMap: Record<EditablePageSlug, PageContent> = {
  pricing: defaultPricingContent,
  faq: defaultFAQContent,
  services: defaultServicesContent,
  'how-it-works': defaultHowItWorksContent,
  home: defaultHomeContent,
};

/**
 * Get default content for a page slug
 * Used as fallback when no database entry exists
 */
export function getDefaultContent(slug: EditablePageSlug): PageContent {
  return defaultContentMap[slug];
}

/**
 * Get typed default content for a specific page
 */
export function getDefaultPricingContent(): PricingPageContent {
  return defaultPricingContent;
}

export function getDefaultFAQContent(): FAQPageContent {
  return defaultFAQContent;
}

export function getDefaultServicesContent(): ServicesPageContent {
  return defaultServicesContent;
}

export function getDefaultHowItWorksContent(): HowItWorksPageContent {
  return defaultHowItWorksContent;
}

export function getDefaultHomeContent(): HomePageContent {
  return defaultHomeContent;
}
