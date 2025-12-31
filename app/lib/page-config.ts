// ============================================================================
// Page Configuration - Single Source of Truth for Editable Pages
// ============================================================================
// What: Defines all editable pages in one place
// Why: Adding a new page should require editing ONE file, not many (ETC principle)
// How: Define page metadata here, and this file auto-generates types and mappings
//
// To add a new editable page:
// 1. Add entry to PAGE_CONFIGS below
// 2. Create default content in this file
// 3. (Optional) Create the page component if it doesn't exist
// That's it! Routes, types, and mappings are auto-generated.

import type { AccentColor, AccentVariant } from './colors';

// ============================================================================
// Shared Types (used across multiple page content types)
// ============================================================================

/** Header section common to most pages */
export interface PageHeader {
  title: string;
  description: string;
}

/** Button configuration for CTA sections */
export interface CTAButton {
  text: string;
  variant: AccentVariant;
  href: string;
}

/** CTA section common to most pages */
export interface CTASection {
  title: string;
  description: string;
  buttons: CTAButton[];
  hoverColor?: AccentVariant;
}

// ============================================================================
// Page-Specific Content Types
// ============================================================================

// --- Pricing Page ---
export interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  color: AccentColor;
  cta?: string;
  href?: string;
  popular?: boolean;
}

export interface PricingPageContent {
  header: PageHeader;
  tiers: PricingTier[];
  paymentNote: {
    enabled: boolean;
    depositPercent: string;
    depositLabel: string;
    depositDescription: string;
    deliveryPercent: string;
    deliveryLabel: string;
    deliveryDescription: string;
  };
  customSection: {
    title: string;
    description: string;
    buttons: CTAButton[];
    hoverColor?: AccentVariant;
  };
}

// --- FAQ Page ---
export interface FAQItem {
  question: string;
  answer: string;
  links?: Array<{ text: string; href: string }>;
}

export interface FAQPageContent {
  header: PageHeader;
  items: FAQItem[];
  cta: CTASection;
}

// --- Services Page ---
export interface ExpectationItem {
  title: string;
  description: string;
  link?: { href: string };
}

export interface ServiceScenario {
  quotes: string[];
  serviceKey: 'virtual-assistant' | 'data-documents' | 'website-services';
  serviceTitle: string;
  color: AccentColor;
}

export interface ComparisonRow {
  label: string;
  values: [string, string, string];
}

export interface EnhancedCTAButton extends CTAButton {
  subtext?: string;
}

export interface ChoosePath {
  badge: string;
  title: string;
  description: string;
  bullets: string[];
  button: CTAButton & { size?: 'sm' | 'md' | 'lg' };
  hoverColor: AccentVariant;
}

export interface ChooseYourPathContent {
  title: string;
  description: string;
  paths: ChoosePath[];
}

export interface ServicesPageContent {
  header: PageHeader;
  scenarioMatcher?: {
    title: string;
    description: string;
    scenarios: ServiceScenario[];
  };
  comparison?: {
    title: string;
    description: string;
    columns: [string, string, string];
    rows: ComparisonRow[];
  };
  chooseYourPath: ChooseYourPathContent;
  expectationsTitle: string;
  expectations: ExpectationItem[];
}

// --- How It Works Page ---
export interface ProcessStep {
  number: number;
  title: string;
  description: string;
  details: string[];
  color: AccentVariant;
  href?: string;
}

export interface TrustBadge {
  text: string;
  description: string;
}

export interface HowItWorksPageContent {
  header: PageHeader;
  trustBadges?: TrustBadge[];
  steps: ProcessStep[];
  timeline: {
    title: string;
    description: string;
    hoverColor?: AccentVariant;
  };
  questionsSection?: {
    title: string;
    description: string;
    primaryButton: CTAButton;
    secondaryButton: CTAButton;
    hoverColor?: AccentVariant;
  };
  cta: CTASection;
}

// --- Home Page ---
export interface ProcessPreviewStep {
  number: number;
  title: string;
  description: string;
  color: AccentVariant;
}

export interface ConsultationOption {
  name: string;
  duration: string;
  price: string;
  description: string;
  color: AccentVariant;
}

export interface HomeServiceCard {
  title: string;
  tagline: string;
  description: string;
  details?: string;
  color: AccentVariant;
}

export interface HomePageContent {
  hero: {
    title: string;
    description: string;
    buttons: CTAButton[];
  };
  services: {
    title: string;
    linkText: string;
    linkHref: string;
    cards: HomeServiceCard[];
  };
  consultations?: {
    title: string;
    description: string;
    options: ConsultationOption[];
    linkText: string;
    linkHref: string;
  };
  processPreview: {
    title: string;
    steps: ProcessPreviewStep[];
    linkText: string;
  };
  cta: {
    title: string;
    description: string;
    buttons: CTAButton[];
    footer: string;
    footerLinkText: string;
    footerLinkHref: string;
    chatbotNote?: string;
    hoverColor?: AccentVariant;
  };
}

// --- Contact Page ---
export interface ContactPageContent {
  header: PageHeader;
  quickLink: { text: string; href: string };
  cta: CTASection;
}

// --- Get Started Page ---
export interface GetStartedPath {
  badge: string;
  title: string;
  description: string;
  features: string[];
  button: CTAButton & { size?: 'sm' | 'md' | 'lg' };
  hoverColor: AccentVariant;
}

export interface GetStartedPageContent {
  header: PageHeader;
  paths: GetStartedPath[];
  quoteSection: { title: string; description: string };
  authForm: {
    title: string;
    description: string;
    quoteRefLabel: string;
    quoteRefPlaceholder: string;
    quoteRefHelper: string;
    emailLabel: string;
    emailPlaceholder: string;
    emailHelper: string;
    submitButton: string;
    processingText: string;
    securityNote: string;
  };
}

// --- Blog Page ---
export interface BlogPageContent {
  header: PageHeader;
  emptyState: { emoji: string; title: string; description: string };
  morePostsTitle: string;
  categoryFilterLabel: string;
}

// --- Changelog Page ---
export interface ChangelogPageContent {
  header: PageHeader;
  emptyState: { emoji: string; title: string; description: string };
}

// --- Guide Page ---
export type GuideGroup = 'getting-started' | 'account' | 'explore' | 'support';
export interface GuideSection {
  title: string;
  content: string;
  icon?: string;
  group: GuideGroup;
}
export interface GuidePageContent {
  header: PageHeader;
  sections: GuideSection[];
}

// --- Privacy Page ---
export interface PrivacyPageContent {
  header: PageHeader;
  lastUpdated: string;
  quickSummary: { title: string; items: string[] };
  sections: Array<{ title: string; content: string }>;
}

// --- Terms Page ---
export interface TermsPageContent {
  header: PageHeader;
  lastUpdated: string;
  quickSummary: { title: string; items: string[] };
  sections: Array<{ title: string; content: string }>;
}

// --- Login Page ---
export interface LoginPageContent {
  header: {
    signIn: { title: string; description: string };
    signUp: { title: string; description: string };
    forgotPassword: { title: string; description: string };
  };
  buttons: {
    signIn: string;
    signUp: string;
    resetPassword: string;
    googleSignIn: string;
  };
  links: {
    backToHome: string;
    seeWhatWeDo: string;
    getFreeQuote: string;
  };
}

// ============================================================================
// Page Configuration Type
// ============================================================================

/** Configuration for a single editable page */
export interface PageConfig<T> {
  /** URL path (e.g., '/', '/services', '/pricing') */
  route: string;
  /** Page slug (e.g., 'home', 'services', 'pricing') */
  slug: string;
  /** Display name for admin UI */
  displayName: string;
  /** Content type identifier for API */
  contentType: string;
  /** Default content */
  defaults: T;
}

// ============================================================================
// Page Configurations - THE SINGLE SOURCE OF TRUTH
// ============================================================================
// Add new pages here. Everything else is auto-generated.

export const PAGE_CONFIGS = {
  home: {
    route: '/',
    slug: 'home',
    displayName: 'Homepage',
    contentType: 'home_page',
    defaults: {
      hero: {
        title: 'Get your tasks done right',
        description: 'Real people helping busy professionals get things done. Book a quick consultation or tell us about your project. We handle the rest.',
        buttons: [
          { text: 'Book a Consultation', variant: 'gold', href: '/shop' },
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
        description: 'Need expert guidance fast? Book a call and get personalized help for your project.',
        options: [
          { name: 'Quick Chat', duration: '15 min', price: '$20', description: 'Perfect for quick questions', color: 'green' },
          { name: 'Standard Call', duration: '30 min', price: '$35', description: 'Our most popular option', color: 'blue' },
          { name: 'Deep Dive', duration: '55 min', price: '$50', description: 'For complex discussions', color: 'purple' },
        ],
        linkText: 'Browse all consultations →',
        linkHref: '/shop',
      },
      processPreview: {
        title: 'Simple Process',
        steps: [
          { number: 1, title: 'Tell Us', description: 'Describe what you need', color: 'green' },
          { number: 2, title: 'Get a Quote', description: 'We respond in 2 days', color: 'blue' },
          { number: 3, title: 'Authorize', description: '50% deposit to start', color: 'purple' },
          { number: 4, title: 'Delivery', description: 'Review and approve', color: 'gold' },
        ],
        linkText: 'Learn more about our process →',
      },
      cta: {
        title: 'Ready to Get Started?',
        description: 'Tell us about your project for a custom quote, or check our pricing to see what fits.',
        buttons: [
          { text: 'Get a Quote', variant: 'gold', href: '/contact' },
          { text: 'View Pricing', variant: 'blue', href: '/pricing' },
        ],
        footer: 'Have questions?',
        footerLinkText: 'Check out our FAQ',
        footerLinkHref: '/faq',
        chatbotNote: 'Or use the chat button to talk with us anytime.',
        hoverColor: 'gold',
      },
    } as HomePageContent,
  },

  services: {
    route: '/services',
    slug: 'services',
    displayName: 'Services',
    contentType: 'services_page',
    defaults: {
      header: {
        title: 'Find Your Perfect Fit',
        description: "Not sure which service you need? You're in the right place. Let's figure it out together. No pressure, no tech speak, just helpful guidance.",
      },
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
      comparison: {
        title: 'Compare Services',
        description: 'Pricing depends on complexity, not just service type. Simple tasks start at $50, bigger projects run $150-500+.',
        columns: ['Virtual Assistant', 'Data & Documents', 'Website Services'],
        rows: [
          { label: 'Best for', values: ['Freeing up your time', 'Turning chaos into clarity', 'Tech without the headache'] },
          { label: 'What we handle', values: ['Email, calendar, research, social media', 'Spreadsheets, reports, templates, files', 'Builds, updates, e-commerce, maintenance'] },
          { label: 'Typical timeline', values: ['Ongoing or one-time', 'Days to 1 week', '1-4 weeks'] },
          { label: 'Quick tasks', values: ['$50/task', '$50/task', '$50/task'] },
          { label: 'Bigger projects', values: ['$150+', '$150+', '$500+'] },
        ],
      },
      chooseYourPath: {
        title: 'Choose What Works for You',
        description: "You've explored our services. Now pick your next step. Either option moves you forward, no pressure.",
        paths: [
          {
            badge: 'Free',
            title: 'Get a Quote',
            description: 'Tell us about your project and get a custom quote',
            bullets: ['Free, no obligation', 'Response in 2 business days', 'Custom pricing for your needs'],
            button: { text: 'Get a Quote', variant: 'green', href: '/contact', size: 'lg' },
            hoverColor: 'green',
          },
          {
            badge: 'Expert Help',
            title: 'Book a Consultation',
            description: 'Talk to an expert before you start',
            bullets: ['Expert guidance and advice', 'Immediate scheduling', 'Personalized recommendations'],
            button: { text: 'Book a Consultation', variant: 'purple', href: '/shop', size: 'lg' },
            hoverColor: 'purple',
          },
        ],
      },
      expectationsTitle: 'What You Can Expect',
      expectations: [
        { title: 'Clear Communication', description: 'We keep you informed every step of the way. No surprises.' },
        { title: 'Quality Work', description: 'We take pride in delivering work you can rely on.' },
        { title: 'Fair Pricing', description: 'Transparent quotes with no hidden fees.', link: { href: '/pricing' } },
        { title: 'Timely Delivery', description: 'We respect your deadlines and deliver on time.' },
      ],
    } as ServicesPageContent,
  },

  pricing: {
    route: '/pricing',
    slug: 'pricing',
    displayName: 'Pricing',
    contentType: 'pricing_page',
    defaults: {
      header: {
        title: 'Pricing That Fits',
        description: "Every project is different, so here's a starting point. Not sure which one? Just ask and we'll help you figure it out.",
      },
      tiers: [
        {
          name: 'Quick Task',
          price: 'From $50',
          period: 'per task',
          description: 'Perfect for simple tasks across any service: admin, data entry, or quick site fixes.',
          features: [
            'Virtual Assistant: Email sorting, basic scheduling',
            'Data & Documents: Simple formatting, data entry',
            'Website: Fix broken links, update text or images',
            'Delivered in days, not weeks',
          ],
          color: 'green',
        },
        {
          name: 'Standard Task',
          price: 'From $150',
          period: 'per task',
          description: 'Our most popular option. Great for projects that need research, organization, or multiple steps.',
          features: [
            'Virtual Assistant: Research, travel planning, coordination',
            'Data & Documents: Spreadsheet cleanup, report formatting',
            'Website: Refresh a page, add new features, speed things up',
            "Revisions included until you're happy",
          ],
          color: 'blue',
          popular: true,
        },
        {
          name: 'Premium Service',
          price: 'From $500',
          period: 'per project',
          description: "For bigger builds and complex projects. We'll be with you every step of the way.",
          features: [
            'Website: Build a new site or give yours a complete makeover',
            'Online store setup so you can start selling',
            'Large data migrations & system overhauls',
            'Dedicated point of contact throughout',
          ],
          color: 'purple',
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
        description: "Every project is unique. Tell us what you're working on and we'll figure out the best approach together. Or check out our FAQ for quick answers.",
        buttons: [
          { text: 'View Services', variant: 'blue', href: '/services' },
          { text: 'Read the FAQ', variant: 'purple', href: '/faq' },
        ],
        hoverColor: 'blue',
      },
    } as PricingPageContent,
  },

  faq: {
    route: '/faq',
    slug: 'faq',
    displayName: 'FAQ',
    contentType: 'faq_page',
    defaults: {
      header: {
        title: 'Frequently Asked Questions',
        description: 'Your questions, answered.',
      },
      items: [
        { question: 'What types of tasks do you handle?', answer: 'We help with all kinds of tasks: spreadsheets and data cleanup, document preparation, administrative work, computer help, and even website builds and updates. Check out our services page to see what we specialize in. If you\'re not sure whether we can help, just ask! We\'re happy to discuss your needs.', links: [{ text: 'services page', href: '/services' }] },
        { question: 'Do I need to be tech-savvy to work with you?', answer: "Not at all! We work with people of all backgrounds. Just describe what you need in your own words, and we'll take it from there. No technical terms needed." },
        { question: 'How long does a typical task take?', answer: 'Most projects are completed within 1-2 weeks, depending on scope. Quick tasks can be done in days, while bigger builds may take longer. We always provide a clear timeline upfront so you know what to expect. Learn more about how it works.', links: [{ text: 'how it works', href: '/how-it-works' }] },
        { question: 'How much does it cost?', answer: "Pricing depends on complexity, not service type. Quick tasks across any service start at $50. Standard projects that need more steps run $150+. Bigger builds like full websites or complex data migrations start at $500+. Check out our pricing page for details. We provide transparent quotes with no hidden fees. Tell us what you need, and we'll give you a clear estimate before any work begins.", links: [{ text: 'pricing page', href: '/pricing' }] },
        { question: 'How do I get started?', answer: "Simply reach out through our contact form and describe what you need help with. We'll review your request and get back to you within 2 business days with questions or a quote.", links: [{ text: 'contact form', href: '/contact' }] },
        { question: 'Can you help with one-time tasks or just ongoing work?', answer: "Both! Whether you have a single task that needs attention or want regular ongoing support, we're here to help. Many clients start with a one-time task and come back when something else comes up." },
        { question: 'What if I need changes after delivery?', answer: "We want you to be completely satisfied. We include reasonable revisions as part of every task. If something isn't quite right, just let us know and we'll make it right." },
        { question: 'How do you handle communication?', answer: "We keep you updated every step of the way. You can expect clear progress updates and quick responses to your questions. We believe good communication makes everything easier." },
        { question: 'How does payment work?', answer: 'We use a simple 50/50 structure: 50% deposit to start work, and the remaining 50% when you approve the final delivery. We accept major credit cards and other common payment methods. No surprises, just straightforward pricing. Ready to authorize a project?', links: [{ text: 'Ready to authorize a project?', href: '/get-started' }] },
        { question: 'What if I have a question that is not listed here?', answer: "We'd love to hear from you! Reach out through our contact page and we'll be happy to answer any questions you have.", links: [{ text: 'contact page', href: '/contact' }] },
      ],
      cta: {
        title: 'Ready to Talk?',
        description: 'Book a consultation to discuss your project with an expert.',
        buttons: [{ text: 'Book a Consultation', variant: 'purple', href: '/shop' }],
        hoverColor: 'purple',
      },
    } as FAQPageContent,
  },

  'how-it-works': {
    route: '/how-it-works',
    slug: 'how-it-works',
    displayName: 'How It Works',
    contentType: 'how_it_works_page',
    defaults: {
      header: {
        title: 'We Make It Easy',
        description: 'No hoops to jump through. No confusing tech speak. Just a simple, friendly process from start to finish.',
      },
      trustBadges: [
        { text: 'Personal attention', description: 'Real people, not bots' },
        { text: 'Clear updates', description: 'At every step' },
        { text: 'No surprises', description: 'Transparent pricing' },
      ],
      steps: [
        { number: 1, title: 'Tell Us Your Needs', description: 'No tech speak required. Just describe what\'s on your plate and we\'ll take it from there.', details: ['Fill out our simple contact form', 'Attach any relevant files or documents', 'Let us know your timeline if you have one'], color: 'green', href: '/contact' },
        { number: 2, title: 'Get Your Quote', description: 'Quote within 2 business days, no obligation. We\'ll ask questions if needed and give you a clear, honest estimate.', details: ['We assess what needs to be done', 'We ask clarifying questions if needed', 'You receive a clear, transparent quote'], color: 'blue' },
        { number: 3, title: 'Authorize & We Begin', description: '50% deposit to begin, progress updates along the way. You\'ll always know where things stand.', details: ['50% deposit to begin work', 'Secure online payment', "We'll keep you updated on progress"], color: 'purple' },
        { number: 4, title: 'Review & Approve', description: 'Review the work, give feedback, and pay the remaining 50% when you\'re happy. Simple as that.', details: ['You review what we have done', 'We address any feedback', "Final 50% on approval, then it's yours!"], color: 'gold' },
      ],
      timeline: {
        title: 'Typical Timeline',
        description: "We know waiting is part of the process. That's why we give you a realistic timeline from day one, so you can plan with confidence. Most projects take 1-2 weeks. Bigger ones take longer, but we'll keep you in the loop every step of the way.",
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
        description: "Tell us what you need and we'll get back with a personalized quote.",
        buttons: [
          { text: 'View Services', variant: 'green', href: '/services' },
          { text: 'View Pricing', variant: 'blue', href: '/pricing' },
          { text: 'Contact Us', variant: 'purple', href: '/contact' },
        ],
        hoverColor: 'purple',
      },
    } as HowItWorksPageContent,
  },

  contact: {
    route: '/contact',
    slug: 'contact',
    displayName: 'Contact',
    contentType: 'contact_page',
    defaults: {
      header: {
        title: 'Request a Free Quote',
        description: "Tell us what you need help with and we'll send you a personalized quote within 2 business days. No commitment, no spam. Just a friendly estimate so you know exactly what to expect.",
      },
      quickLink: { text: 'Need help now? Book a quick consultation →', href: '/shop' },
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
    } as ContactPageContent,
  },

  'get-started': {
    route: '/get-started',
    slug: 'get-started',
    displayName: 'Get Started',
    contentType: 'get_started_page',
    defaults: {
      header: { title: 'Ready to Get Started?', description: "Choose the path that's right for you" },
      paths: [
        {
          badge: 'Free',
          title: 'Get a Quote',
          description: 'Tell us about your project and get a custom quote',
          features: ['Free, no obligation', 'Response in 2 business days', 'Custom pricing for your needs'],
          button: { text: 'Get a Quote', variant: 'green', href: '/contact', size: 'lg' },
          hoverColor: 'green',
        },
        {
          badge: 'Paid Service',
          title: 'Book a Consultation',
          description: 'Talk to an expert before you start',
          features: ['Expert guidance and advice', 'Immediate scheduling', 'Personalized recommendations'],
          button: { text: 'Book a Consultation', variant: 'purple', href: '/shop', size: 'lg' },
          hoverColor: 'purple',
        },
      ],
      quoteSection: { title: 'Already Have a Quote?', description: 'Enter your quote details below to authorize your project.' },
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
    } as GetStartedPageContent,
  },

  blog: {
    route: '/blog',
    slug: 'blog',
    displayName: 'Blog',
    contentType: 'blog_page',
    defaults: {
      header: { title: 'Blog', description: 'Tips, insights, and behind-the-scenes looks at how we help busy professionals get things done.' },
      emptyState: { emoji: '📝', title: 'Coming Soon', description: "We're working on some great content for you. Check back soon for tips, insights, and stories about getting things done." },
      morePostsTitle: 'More Posts',
      categoryFilterLabel: 'All Posts',
    } as BlogPageContent,
  },

  changelog: {
    route: '/changelog',
    slug: 'changelog',
    displayName: 'Changelog',
    contentType: 'changelog_page',
    defaults: {
      header: { title: 'Changelog', description: 'See what we\'ve been working on. New features, improvements, and fixes.' },
      emptyState: { emoji: '🚀', title: 'No Updates Yet', description: 'Check back soon for updates on new features and improvements.' },
    } as ChangelogPageContent,
  },

  guide: {
    route: '/guide',
    slug: 'guide',
    displayName: 'Guide',
    contentType: 'guide_page',
    defaults: {
      header: { title: 'Platform Guide', description: 'Everything you need to know about NeedThisDone - from booking consultations to managing your projects.' },
      sections: [
        { title: 'Browse Our Services', icon: '🔍', group: 'getting-started', content: 'Explore what we offer and find the right fit for your needs:\n\n• Visit the Services page to see our full range of professional services\n• Each service includes detailed descriptions, pricing, and what\'s included\n• Check our Pricing page to compare packages and find the best value\n• Use our FAQ for quick answers to common questions' },
        { title: 'Book a Consultation', icon: '📅', group: 'getting-started', content: 'Ready for expert guidance? Here\'s how to book:\n\n1. Visit the Shop to see available consultation packages (15, 30, or 55 minutes)\n2. Click any consultation to see full details and add to cart\n3. Review your cart and proceed to checkout\n4. Complete secure payment via Stripe (we accept all major cards)\n5. Select your preferred date and time for the session\n6. You\'ll receive an email confirmation with calendar invite' },
        { title: 'Start a Project', icon: '🚀', group: 'getting-started', content: 'Already have a quote? Here\'s how to get started:\n\n1. Go to the Get Started page\n2. Enter your quote reference number from our email\n3. Review the project scope and pricing\n4. Complete payment to authorize the project\n5. We\'ll be in touch within 24 hours to kick things off' },
        { title: 'Create Your Account', icon: '👤', group: 'account', content: 'An account gives you access to your dashboard and order history:\n\n• Sign in with Google for one-click access\n• Or create an account with email and password\n• Your account links all your orders and consultations\n• Access your dashboard anytime to check status and history' },
        { title: 'Your Dashboard', icon: '📊', group: 'account', content: 'Once logged in, your dashboard is your home base:\n\n• View all your orders and their current status\n• Track consultation bookings and upcoming appointments\n• Access order details and receipts\n• Update your account settings and preferences' },
        { title: 'Explore Our Content', icon: '📚', group: 'explore', content: 'Stay informed with our regularly updated content:\n\n• Blog: Tips, insights, and industry updates\n• Changelog: Latest platform features and improvements\n• How It Works: Step-by-step breakdown of our process\n• FAQ: Quick answers to common questions' },
        { title: 'Dark Mode', icon: '🌙', group: 'explore', content: 'Prefer a darker interface? We\'ve got you covered:\n\n• Click the sun/moon icon in the header to toggle dark mode\n• Your preference is saved automatically\n• All pages are optimized for both light and dark viewing\n• Designed to meet accessibility standards (WCAG AA)' },
        { title: 'Get in Touch', icon: '💬', group: 'support', content: 'Have questions or need help? We\'re here:\n\n• Visit our Contact page to send us a message\n• Email us directly at hello@needthisdone.com\n• Check our FAQ for immediate answers\n• Book a consultation if you need dedicated time with an expert' },
      ],
    } as GuidePageContent,
  },

  privacy: {
    route: '/privacy',
    slug: 'privacy',
    displayName: 'Privacy Policy',
    contentType: 'privacy_page',
    defaults: {
      header: { title: 'Privacy Policy', description: 'How we collect, use, and protect your information.' },
      lastUpdated: 'January 2025',
      quickSummary: {
        title: 'Quick Summary',
        items: ['We only collect what we need to serve you', 'We never sell your personal information', 'You can request deletion of your data anytime', 'We use industry-standard security measures'],
      },
      sections: [
        { title: '1. Information We Collect', content: 'When you use NeedThisDone, we collect:\n\n• Account Information: Name, email address, and password when you create an account or sign in with Google.\n• Payment Information: Processed securely through Stripe. We never store your full card number on our servers.\n• Appointment Details: Date, time, and notes you provide when booking services.\n• Usage Information: Pages you visit, features you use, and how you interact with our site (to help us improve).' },
        { title: '2. How We Use Your Information', content: 'We use your information to:\n\n• Provide our services and process your requests\n• Process payments and send receipts\n• Schedule and manage your appointments\n• Send confirmations and reminders\n• Respond to your questions and support requests\n• Improve our website and services\n• Send updates about our services (with your consent)\n\nWe will never sell your personal information to third parties. Ever.' },
        { title: '3. Third-Party Services', content: 'We work with trusted partners to provide our services:\n\n• Stripe - Secure payment processing (stripe.com/privacy)\n• Google - Sign-in and calendar integration (policies.google.com/privacy)\n• Supabase - Secure database and authentication (supabase.com/privacy)' },
        { title: '4. Your Rights', content: 'You have the right to:\n\n• Access Your Data: Request a copy of the personal information we have about you.\n• Correct Your Data: Update or fix any inaccurate information.\n• Delete Your Data: Request that we delete your personal information.\n\nTo exercise these rights, email us at hello@needthisdone.com' },
        { title: '5. Contact Us', content: 'Questions or concerns about your privacy?\n\nEmail: hello@needthisdone.com\nWebsite: needthisdone.com/contact' },
      ],
    } as PrivacyPageContent,
  },

  terms: {
    route: '/terms',
    slug: 'terms',
    displayName: 'Terms of Service',
    contentType: 'terms_page',
    defaults: {
      header: { title: 'Terms of Service', description: 'The terms and conditions that govern your use of our services.' },
      lastUpdated: 'January 2025',
      quickSummary: {
        title: 'The Short Version',
        items: ['Be respectful and use our services lawfully', 'Pay for services you book', "We'll do our best to help you get things done", 'Either party can end the relationship anytime'],
      },
      sections: [
        { title: '1. Acceptance of Terms', content: "By using NeedThisDone.com, you agree to these terms. If you don't agree, please don't use our services.\n\nThese terms apply to all visitors, users, and customers of our website and services." },
        { title: '2. Our Services', content: 'NeedThisDone provides personal assistance and errand services. We help you tackle your to-do list through scheduled consultations and task completion.\n\nService availability may vary. We reserve the right to modify, suspend, or discontinue services at any time with reasonable notice.' },
        { title: '3. Payments & Refunds', content: 'All payments are processed securely through Stripe.\n\nRefund Policy:\n• Consultation fees: Non-refundable once the consultation is completed\n• Cancellations 24+ hours in advance: Full refund\n• Cancellations less than 24 hours: 50% refund\n• No-shows: No refund\n\nIf you have concerns about a charge, please contact us within 7 days.' },
        { title: '4. User Responsibilities', content: 'When using our services, you agree to:\n\n• Provide accurate information when booking\n• Treat our team with respect and courtesy\n• Not use our services for illegal activities\n• Show up on time for scheduled appointments\n• Pay for services rendered\n• Keep your account credentials secure' },
        { title: '5. Limitation of Liability', content: 'NeedThisDone provides services "as is." We do our best to help, but we can\'t guarantee specific outcomes.\n\nOur total liability is limited to the amount you paid for the specific service in question.' },
        { title: '6. Privacy', content: 'Your privacy matters to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.' },
        { title: '7. Contact Us', content: 'Questions about these terms?\n\nEmail: hello@needthisdone.com\nWebsite: needthisdone.com/contact' },
      ],
    } as TermsPageContent,
  },

  login: {
    route: '/login',
    slug: 'login',
    displayName: 'Login',
    contentType: 'login_page',
    defaults: {
      header: {
        signIn: { title: 'Welcome Back', description: 'Good to see you! Sign in to check on your projects' },
        signUp: { title: 'Join Us', description: 'Create an account to track your projects and stay in the loop' },
        forgotPassword: { title: 'Reset Your Password', description: "No worries. We'll send you a reset link" },
      },
      buttons: { signIn: 'Sign In', signUp: 'Create Account', resetPassword: 'Send Reset Link', googleSignIn: 'Sign in with Google' },
      links: { backToHome: '← Back to Home', seeWhatWeDo: 'See what we do', getFreeQuote: 'Get a free quote' },
    } as LoginPageContent,
  },
} as const;

// ============================================================================
// Auto-Generated Types and Mappings
// ============================================================================

/** All page content types (union) */
export type PageContent =
  | HomePageContent
  | ServicesPageContent
  | PricingPageContent
  | FAQPageContent
  | HowItWorksPageContent
  | ContactPageContent
  | GetStartedPageContent
  | BlogPageContent
  | ChangelogPageContent
  | GuidePageContent
  | PrivacyPageContent
  | TermsPageContent
  | LoginPageContent;

/** All editable page slugs */
export type EditablePageSlug = keyof typeof PAGE_CONFIGS;

/** All page slugs as array (for iteration) */
export const EDITABLE_PAGES = Object.keys(PAGE_CONFIGS) as EditablePageSlug[];

/** Maps route paths to page slugs */
export const editableRoutes: Record<string, EditablePageSlug> = Object.fromEntries(
  Object.entries(PAGE_CONFIGS).map(([slug, config]) => [config.route, slug as EditablePageSlug])
);

/** Maps page slugs to content types */
export const PAGE_CONTENT_TYPES: Record<EditablePageSlug, string> = Object.fromEntries(
  Object.entries(PAGE_CONFIGS).map(([slug, config]) => [slug, config.contentType])
) as Record<EditablePageSlug, string>;

/** Maps page slugs to display names */
export const PAGE_DISPLAY_NAMES: Record<EditablePageSlug, string> = Object.fromEntries(
  Object.entries(PAGE_CONFIGS).map(([slug, config]) => [slug, config.displayName])
) as Record<EditablePageSlug, string>;

/** Content type identifiers */
export type PageContentType = (typeof PAGE_CONFIGS)[EditablePageSlug]['contentType'];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the page slug for a given pathname.
 * Handles trailing slashes and query strings.
 */
export function getPageSlugFromPath(pathname: string): EditablePageSlug | null {
  const pathWithoutQuery = pathname.split('?')[0];
  const normalizedPath = pathWithoutQuery === '/' ? '/' : pathWithoutQuery.replace(/\/$/, '');
  return editableRoutes[normalizedPath] ?? null;
}

/**
 * Check if a route is editable
 */
export function isEditableRoute(pathname: string): boolean {
  return getPageSlugFromPath(pathname) !== null;
}

/**
 * Get default content for a page slug
 */
export function getDefaultContent(slug: EditablePageSlug): PageContent {
  return PAGE_CONFIGS[slug].defaults;
}

/**
 * Get page config for a slug
 */
export function getPageConfig(slug: EditablePageSlug) {
  return PAGE_CONFIGS[slug];
}
