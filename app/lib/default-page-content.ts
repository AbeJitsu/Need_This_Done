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
  ContactPageContent,
  GetStartedPageContent,
  BlogPageContent,
  ChangelogPageContent,
  GuidePageContent,
  PrivacyPageContent,
  TermsPageContent,
  PageContent,
  EditablePageSlug,
} from './page-content-types';

// ============================================================================
// Pricing Page Defaults
// ============================================================================

export const defaultPricingContent: PricingPageContent = {
  header: {
    title: 'Pricing That Fits',
    description:
      "Every project is different, so here's a starting point. Not sure which one? Just ask and we'll help you figure it out.",
  },
  tiers: [
    {
      name: 'Quick Task',
      price: 'From $50',
      period: 'per task',
      description:
        'Perfect for simple tasks across any service: admin, data entry, or quick site fixes.',
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
      { text: 'View Services', variant: 'blue', href: '/services' },
      { text: 'Read the FAQ', variant: 'purple', href: '/faq' },
    ],
    hoverColor: 'blue',
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
        "Pricing depends on complexity, not service type. Quick tasks across any service start at $50. Standard projects that need more steps run $150+. Bigger builds like full websites or complex data migrations start at $500+. Check out our pricing page for details. We provide transparent quotes with no hidden fees. Tell us what you need, and we'll give you a clear estimate before any work begins.",
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
    title: 'Ready to Talk?',
    description:
      "Book a consultation to discuss your project with an expert.",
    buttons: [
      { text: 'Book a Consultation', variant: 'purple', href: '/shop' },
    ],
    hoverColor: 'purple',
  },
};

// ============================================================================
// Services Page Defaults
// ============================================================================

export const defaultServicesContent: ServicesPageContent = {
  header: {
    title: 'Find Your Perfect Fit',
    description:
      "Not sure which service you need? You're in the right place. Let's figure it out together. No pressure, no tech speak, just helpful guidance.",
  },

  // Scenario Matcher - "Does this sound like you?"
  scenarioMatcher: {
    title: 'Does this sound like you?',
    description: 'Click any scenario to learn more about how we can help.',
    scenarios: [
      {
        quotes: [
          'My inbox is drowning me and I can\'t keep up',
          'I need someone to handle the stuff I keep putting off',
          'My calendar is a mess and I\'m constantly double-booked',
        ],
        serviceKey: 'virtual-assistant',
        serviceTitle: 'Virtual Assistant',
        color: 'green',
      },
      {
        quotes: [
          'I have spreadsheets that need serious help',
          'I need professional documents but don\'t have design skills',
          'My data is chaos and I can\'t make sense of it',
        ],
        serviceKey: 'data-documents',
        serviceTitle: 'Data & Documents',
        color: 'blue',
      },
      {
        quotes: [
          'My website needs work but I don\'t know where to start',
          'I want to sell online but the tech is overwhelming',
          'My site looks outdated and I need a refresh',
        ],
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

  // Choose Your Path - Two-path choice after exploring services
  chooseYourPath: {
    title: 'Choose What Works for You',
    description: "You've explored our services. Now pick your next step. Either option moves you forward, no pressure.",
    paths: [
      {
        badge: 'Free',
        title: 'Get a Quote',
        description: 'Tell us about your project and get a custom quote',
        bullets: [
          'Free, no obligation',
          'Response in 2 business days',
          'Custom pricing for your needs',
        ],
        button: { text: 'Get a Quote', variant: 'green', href: '/contact', size: 'lg' },
        hoverColor: 'green',
      },
      {
        badge: 'Expert Help',
        title: 'Book a Consultation',
        description: 'Talk to an expert before you start',
        bullets: [
          'Expert guidance and advice',
          'Immediate scheduling',
          'Personalized recommendations',
        ],
        button: { text: 'Book a Consultation', variant: 'purple', href: '/shop', size: 'lg' },
        hoverColor: 'purple',
      },
    ],
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
      title: 'Tell Us Your Needs',
      description:
        'No tech speak required. Just describe what\'s on your plate and we\'ll take it from there.',
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
      title: 'Get Your Quote',
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
      title: 'Authorize & We Begin',
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
      title: 'Review & Approve',
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
      "We know waiting is part of the process. That's why we give you a realistic timeline from day one, so you can plan with confidence. Most projects take 1-2 weeks. Bigger ones take longer, but we'll keep you in the loop every step of the way.",
    hoverColor: 'green',
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
      { text: 'View Services', variant: 'green', href: '/services' },
      { text: 'View Pricing', variant: 'blue', href: '/pricing' },
      { text: 'Contact Us', variant: 'purple', href: '/contact' },
    ],
    hoverColor: 'purple',
  },
};

// ============================================================================
// Home Page Defaults
// ============================================================================

export const defaultHomeContent: HomePageContent = {
  hero: {
    title: 'Get your tasks done right',
    description: 'Real people helping busy professionals get things done. Book a quick consultation or tell us about your project. We handle the rest.',
    buttons: [
      { text: 'Book a Consultation', variant: 'orange', href: '/shop' },
      { text: 'View Services', variant: 'blue', href: '/services' },
    ],
  },
  services: {
    title: 'What We Offer',
    linkText: 'Not sure which service? Compare them all →',
    linkHref: '/services',
    cards: [
      {
        title: 'Virtual Assistant',
        tagline: 'Free up your time for what matters',
        description: 'Let us handle the day-to-day tasks that eat up your time. Email, scheduling, research, bookings, and social media posting.',
        details: 'Email Management, Calendar Coordination, Research & Bookings, Social Media Posting',
        color: 'green',
      },
      {
        title: 'Data & Documents',
        tagline: 'From messy data to polished documents',
        description: 'From messy spreadsheets to polished reports. We organize, format, and prepare your documents so they look professional.',
        details: 'Spreadsheets & Data Entry, Reports & Presentations, Document Formatting, File Organization',
        color: 'blue',
      },
      {
        title: 'Website Services',
        tagline: 'Websites that work while you focus on business',
        description: 'From new builds to updates and maintenance. We handle websites of any size on any platform, so you can focus on your business.',
        details: 'Website Builds & Redesigns, Content Updates, E-commerce Setup, Ongoing Maintenance',
        color: 'purple',
      },
    ],
  },
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
// Contact Page Defaults
// ============================================================================

export const defaultContactContent: ContactPageContent = {
  header: {
    title: 'Request a Free Quote',
    description:
      "Tell us what you need help with and we'll send you a personalized quote within 2 business days. No commitment, no spam. Just a friendly estimate so you know exactly what to expect.",
  },
  quickLink: {
    text: 'Need help now? Book a quick consultation →',
    href: '/shop',
  },
  cta: {
    title: 'Want to learn more first?',
    description: '',
    buttons: [
      { text: 'View Our Services', variant: 'green', href: '/services' },
      { text: 'How It Works', variant: 'blue', href: '/how-it-works' },
      { text: 'Read the FAQ', variant: 'purple', href: '/faq' },
    ],
    hoverColor: 'green',
  },
};

// ============================================================================
// Get Started Page Defaults
// ============================================================================

export const defaultGetStartedContent: GetStartedPageContent = {
  header: {
    title: 'Ready to Get Started?',
    description: "Choose the path that's right for you",
  },
  paths: [
    {
      badge: 'Free',
      title: 'Get a Quote',
      description: 'Tell us about your project and get a custom quote',
      features: [
        'Free, no obligation',
        'Response in 2 business days',
        'Custom pricing for your needs',
      ],
      button: { text: 'Get a Quote', variant: 'green', href: '/contact', size: 'lg' },
      hoverColor: 'green',
    },
    {
      badge: 'Paid Service',
      title: 'Book a Consultation',
      description: 'Talk to an expert before you start',
      features: [
        'Expert guidance and advice',
        'Immediate scheduling',
        'Personalized recommendations',
      ],
      button: { text: 'Book a Consultation', variant: 'purple', href: '/shop', size: 'lg' },
      hoverColor: 'purple',
    },
  ],
  quoteSection: {
    title: 'Already Have a Quote?',
    description: 'Enter your quote details below to authorize your project.',
  },
  authForm: {
    title: "Let's Begin Your Project",
    description: "Enter your details and we'll process your deposit",
    quoteRefLabel: 'Quote Reference Number',
    quoteRefPlaceholder: 'e.g., QT-2024-001',
    quoteRefHelper: "You'll find this in your quote email",
    emailLabel: 'Email Address',
    emailPlaceholder: 'your@email.com',
    emailHelper: 'Use the same email from your quote request',
    submitButton: 'Authorize & Pay Deposit',
    processingText: 'Getting everything ready...',
    securityNote: 'Secure payment processing. Your information is protected.',
  },
};

// ============================================================================
// Blog Page Defaults
// ============================================================================

export const defaultBlogContent: BlogPageContent = {
  header: {
    title: 'Blog',
    description: 'Tips, insights, and behind-the-scenes looks at how we help busy professionals get things done.',
  },
  emptyState: {
    emoji: '📝',
    title: 'Coming Soon',
    description: "We're working on some great content for you. Check back soon for tips, insights, and stories about getting things done.",
  },
  morePostsTitle: 'More Posts',
  categoryFilterLabel: 'All Posts',
};

// ============================================================================
// Changelog Page Defaults
// ============================================================================

export const defaultChangelogContent: ChangelogPageContent = {
  header: {
    title: 'Changelog',
    description: 'See what we\'ve been working on. New features, improvements, and fixes.',
  },
  emptyState: {
    emoji: '🚀',
    title: 'No Updates Yet',
    description: 'Check back soon for updates on new features and improvements.',
  },
};

// ============================================================================
// Guide Page Defaults
// ============================================================================

export const defaultGuideContent: GuidePageContent = {
  header: {
    title: 'Getting Started Guide',
    description: 'Everything you need to know to get the most out of our services.',
  },
  sections: [
    {
      title: 'Welcome',
      content: 'Welcome to NeedThisDone! This guide will help you understand how to work with us effectively.',
    },
    {
      title: 'How It Works',
      content: 'Submit your project details, receive a quote, approve and pay the deposit, then we get to work.',
    },
    {
      title: 'Communication',
      content: 'We keep you updated throughout the project. You can reach us via email or the chat widget.',
    },
    {
      title: 'Delivery',
      content: 'Once your project is complete, you\'ll review the work. Final payment is due upon approval.',
    },
  ],
};

// ============================================================================
// Privacy Page Defaults
// ============================================================================

export const defaultPrivacyContent: PrivacyPageContent = {
  header: {
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect your information.',
  },
  lastUpdated: 'January 2025',
  sections: [
    {
      title: 'Information We Collect',
      content: 'We collect information you provide directly to us, such as your name, email address, and project details.',
    },
    {
      title: 'How We Use Your Information',
      content: 'We use your information to provide our services, communicate with you, and improve our offerings.',
    },
    {
      title: 'Information Sharing',
      content: 'We do not sell your personal information. We may share information with service providers who assist us.',
    },
    {
      title: 'Data Security',
      content: 'We implement appropriate security measures to protect your personal information.',
    },
    {
      title: 'Contact Us',
      content: 'If you have questions about this privacy policy, please contact us.',
    },
  ],
};

// ============================================================================
// Terms Page Defaults
// ============================================================================

export const defaultTermsContent: TermsPageContent = {
  header: {
    title: 'Terms of Service',
    description: 'The terms and conditions that govern your use of our services.',
  },
  lastUpdated: 'January 2025',
  sections: [
    {
      title: 'Agreement to Terms',
      content: 'By using our services, you agree to be bound by these terms of service.',
    },
    {
      title: 'Our Services',
      content: 'We provide virtual assistant, data management, and website services as described on our website.',
    },
    {
      title: 'Payment Terms',
      content: 'Payment is due as specified in your project quote. We require a 50% deposit to begin work.',
    },
    {
      title: 'Revisions and Deliverables',
      content: 'We include reasonable revisions to ensure your satisfaction with the final deliverables.',
    },
    {
      title: 'Limitation of Liability',
      content: 'Our liability is limited to the amount paid for the specific service in question.',
    },
    {
      title: 'Contact',
      content: 'For questions about these terms, please contact us.',
    },
  ],
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
  contact: defaultContactContent,
  'get-started': defaultGetStartedContent,
  blog: defaultBlogContent,
  changelog: defaultChangelogContent,
  guide: defaultGuideContent,
  privacy: defaultPrivacyContent,
  terms: defaultTermsContent,
};

/**
 * Get default content for a page slug
 * Used as fallback when no database entry exists
 */
export function getDefaultContent(slug: EditablePageSlug): PageContent {
  return defaultContentMap[slug];
}

// Note: Individual typed getters (getDefaultPricingContent, etc.) were removed
// because they're unused. Use getDefaultContent(slug) instead, which returns
// the correct typed content based on the slug.
