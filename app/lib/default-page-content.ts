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
        'Need something done fast? This is your go-to for quick wins.',
      features: [
        'Content updates & simple edits',
        'Data entry & quick formatting',
        'Document formatting',
        'Get it done in days, not weeks',
      ],
      color: 'green',
      cta: "Let's Do This",
    },
    {
      name: 'Standard Task',
      price: 'From $150',
      period: 'per task',
      description:
        'Our most popular option. Great for projects that need a little extra care.',
      features: [
        'Research projects',
        'Spreadsheet organization',
        'Multi-step tasks',
        "Revisions included until you're happy",
      ],
      color: 'blue',
      popular: true,
      cta: "Let's Chat",
    },
    {
      name: 'Premium Service',
      price: 'From $500',
      period: 'per project',
      description:
        "For the big stuff. We'll be with you every step of the way.",
      features: [
        'Website builds & redesigns',
        'E-commerce setup',
        'Larger multi-phase projects',
        'A dedicated point of contact throughout',
      ],
      color: 'purple',
      cta: 'Tell Us More',
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
      { text: "Let's Figure It Out", variant: 'orange', href: '/contact' },
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
        'Most tasks are completed within a few days to a week. Larger projects may take longer, but we always provide a clear timeline upfront so you know what to expect. Learn more about how it works.',
      links: [{ text: 'how it works', href: '/how-it-works' }],
    },
    {
      question: 'How much does it cost?',
      answer:
        "Pricing depends on the scope and complexity of your task. Check out our pricing page for general ranges. We provide transparent quotes with no hidden fees—tell us what you need, and we'll give you a clear estimate before any work begins.",
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
      { text: 'Get a Quote', variant: 'orange', href: '/contact' },
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
    title: 'How We Can Help',
    description:
      "Too busy? Not sure where to start? We handle the tasks you don't have time for, so you can focus on what matters most.",
  },
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
      { text: 'Get a Quote', variant: 'orange', href: '/contact' },
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
    title: 'How It Works',
    description:
      "Here's how we work together to get your project done right.",
  },
  steps: [
    {
      number: 1,
      title: 'Tell Us What You Need',
      description:
        'Describe your task in your own words. Include any files, examples, or questions. No tech speak required.',
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
        'We carefully review your request and get back to you within 2 business days with a personalized quote.',
      details: [
        'We assess what needs to be done',
        'We ask clarifying questions if needed',
        'You receive a clear, transparent quote',
      ],
      color: 'blue',
      href: '/login',
    },
    {
      number: 3,
      title: 'Authorize & Start',
      description:
        'Love the quote? Pay a 50% deposit to authorize work and we get started right away.',
      details: [
        '50% deposit to begin work',
        'Secure online payment',
        "We'll keep you updated on progress",
      ],
      color: 'purple',
      href: '/get-started',
    },
    {
      number: 4,
      title: 'Approve & Receive',
      description:
        'You review the completed work. Once you approve, pay the remaining 50% and receive everything.',
      details: [
        'You review what we have done',
        'We address any feedback',
        "Final 50% on approval, then it's yours!",
      ],
      color: 'orange',
      href: '/login',
    },
  ],
  timeline: {
    title: 'Typical Timeline',
    description:
      "Most projects are completed within 1-2 weeks, depending on scope. Larger projects may take longer - we'll provide a clear timeline with your quote.",
    hoverColor: 'blue',
  },
  cta: {
    title: 'Ready to Get Started?',
    description:
      "Tell us what you need and we'll get back with a personalized quote.",
    buttons: [
      { text: 'Get a Quote', variant: 'orange', href: '/contact' },
      { text: 'View Pricing', variant: 'teal', href: '/pricing' },
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
      { text: 'View Services', variant: 'orange', href: '/services' },
      { text: 'See How It Works', variant: 'blue', href: '/how-it-works' },
    ],
  },
  servicesTitle: 'What We Offer',
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
      "Have a task in mind? Tell us about it and we'll get back with a personalized quote.",
    buttons: [
      { text: 'Start Your Project', variant: 'orange', href: '/contact' },
      { text: 'View Pricing', variant: 'blue', href: '/pricing' },
    ],
    footer: 'Have questions?',
    footerLinkText: 'Check out our FAQ',
    footerLinkHref: '/faq',
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
