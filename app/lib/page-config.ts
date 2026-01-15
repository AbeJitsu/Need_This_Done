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
// Visual Editor Style Types (Phase 2)
// ============================================================================

/** Style configuration for resizable sections */
export interface SectionStyles {
  /** Width: preset name or custom value */
  width?: 'narrow' | 'medium' | 'wide' | 'full' | string | number;
  /** Text/content alignment within the section */
  alignment?: 'left' | 'center' | 'right';
  /** Vertical padding in pixels */
  padding?: { top?: number; bottom?: number };
}

/** Style configuration for resizable items (cards, list items, etc.) */
export interface ItemStyles {
  /** Width as percentage, pixels, or auto */
  width?: number | string;
  /** Height as pixels or auto */
  height?: number | 'auto';
  /** Alignment within parent container */
  alignment?: 'left' | 'center' | 'right';
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
  /** Visual editor styles for this tier card */
  styles?: ItemStyles;
}

export interface PricingCtaPath {
  badge: string;
  title: string;
  description: string;
  features: string[];
  button: { text: string; href: string; variant: AccentVariant };
  hoverColor: AccentVariant;
}

export interface PricingPageContent {
  header: PageHeader;
  tiers: PricingTier[];
  ctaSection: {
    title: string;
    description: string;
  };
  ctaPaths: PricingCtaPath[];
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
  /** Visual editor styles for this FAQ item */
  styles?: ItemStyles;
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
  /** Visual editor styles for this path card */
  styles?: ItemStyles;
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
  buttonText?: string; // For steps with CTAs (e.g., "Get Started")
  /** Visual editor styles for this step card */
  styles?: ItemStyles;
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

/** Modal content structure for service cards */
export interface ServiceModalContent {
  headline: string;
  hook: string;
  bulletHeader?: string;
  bulletPoints: string[];
  ctas: {
    primary: { text: string; href: string };
    secondary: { text: string; href: string };
  };
}

export interface HomeServiceCard {
  title: string;
  tagline: string;
  description: string;
  details?: string;
  color: AccentVariant;
  /** Text for the card's action link */
  linkText?: string;
  /** Visual editor styles for this service card */
  styles?: ItemStyles;
  /** Modal content shown when the link is clicked */
  modal?: ServiceModalContent;
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
export interface ContactFormField {
  label: string;
  placeholder: string;
  optional?: string; // e.g., "(if applicable)"
}

export interface ContactPageContent {
  header: PageHeader;
  quickLink: { text: string; href: string };
  form: {
    nameField: ContactFormField;
    emailField: ContactFormField;
    companyField: ContactFormField;
    serviceField: ContactFormField & { defaultOption: string; otherOption: string };
    messageField: ContactFormField;
    fileUpload: {
      label: string;
      optional: string;
      dropText: string;
      helpText: string;
      removeButton: string;
    };
    submitButton: { default: string; submitting: string };
  };
  success: {
    title: string;
    description: string;
    nextStepsTitle: string;
    nextSteps: string[];
    sendAnotherLink: string;
  };
  error: {
    message: string;
  };
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
  /** Visual editor styles for this path card */
  styles?: ItemStyles;
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

// --- Guide Page ---
export type GuideGroup = 'getting-started' | 'account' | 'explore' | 'admin' | 'support';
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

// --- Layout Content (Header/Footer - Global) ---
export interface NavLink {
  href: string;
  label: string;
}

export interface FooterLink {
  href: string;
  label: string;
}

export interface LayoutContent {
  header: {
    brand: string;
    navLinks: NavLink[];
    ctaButton: { text: string; href: string };
    signInText: string;
  };
  footer: {
    brand: string;
    tagline: string;
    links: FooterLink[];
    legalLinks: Array<{ href: string; label: string }>;
  };
}

/** Default layout content for header/footer */
export const DEFAULT_LAYOUT_CONTENT: LayoutContent = {
  header: {
    brand: 'Need This Done',
    navLinks: [
      { href: '/services', label: 'Services' },
      { href: '/shop', label: 'Shop' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/how-it-works', label: 'How It Works' },
      { href: '/about', label: 'About' },
      { href: '/blog', label: 'Blog' },
    ],
    ctaButton: { text: 'Get a Quote', href: '/contact' },
    signInText: 'Sign in',
  },
  footer: {
    brand: 'Need This Done',
    tagline: 'Technology that works as hard as you do.',
    links: [
      { href: '/about', label: 'About' },
      { href: '/how-it-works', label: 'How It Works' },
      { href: '/contact', label: 'Contact' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/faq', label: 'FAQ' },
      { href: '/get-started', label: 'Get Started' },
    ],
    legalLinks: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
};

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
        title: 'Websites. Automation. AI.',
        description: 'From your first website to fully automated operations. We build the technology that lets you focus on what matters.',
        buttons: [
          { text: 'See Services', variant: 'blue', href: '/services' },
          { text: 'Get a Quote', variant: 'gold', href: '/contact' },
        ],
      },
      services: {
        title: 'What We Build',
        linkText: 'Compare all services →',
        linkHref: '/services',
        cards: [
          {
            title: 'Website Builds',
            tagline: 'Your digital foundation',
            description: 'Professional websites that work. From landing pages to full e-commerce, built to convert visitors into customers.',
            details: 'Custom Design, Mobile-First, SEO-Ready, Easy to Update',
            color: 'green',
            linkText: 'Learn more →',
            modal: {
              headline: 'A website that actually works for your business.',
              hook: 'No templates. No DIY headaches. Just a professional site that makes you look as good as you are.',
              bulletHeader: 'What you get:',
              bulletPoints: [
                'Custom design that matches your brand',
                'Mobile-responsive and fast-loading',
                'SEO foundations built in',
                'Content management you can actually use',
                '30 days of support included',
              ],
              ctas: {
                primary: { text: 'Get a Website Quote', href: '/contact?service=website' },
                secondary: { text: 'See Pricing', href: '/pricing' },
              },
            },
          },
          {
            title: 'Automation Setup',
            tagline: 'Stop doing repetitive work',
            description: 'Connect your tools, automate your workflows, and reclaim hours every week. We set it up, you reap the benefits.',
            details: 'Workflow Design, Tool Integration, Testing, Training',
            color: 'blue',
            linkText: 'Learn more →',
            modal: {
              headline: 'Automate the work you keep putting off.',
              hook: 'That thing you do manually every day? Let\'s make it happen automatically.',
              bulletHeader: 'What we automate:',
              bulletPoints: [
                'Lead capture to CRM workflows',
                'Email sequences and follow-ups',
                'Data sync between platforms',
                'Report generation and delivery',
                'Custom workflows for your specific needs',
              ],
              ctas: {
                primary: { text: 'Explore Automation', href: '/contact?service=automation' },
                secondary: { text: 'See Pricing', href: '/pricing' },
              },
            },
          },
          {
            title: 'Managed AI Services',
            tagline: 'AI that runs while you sleep',
            description: 'We build, deploy, and maintain AI agents that handle your operations. You get the results without the complexity.',
            details: 'Custom AI Agents, Monitoring, Optimization, Support',
            color: 'purple',
            linkText: 'Learn more →',
            modal: {
              headline: 'AI that actually does the work.',
              hook: 'Not chatbots. Not gimmicks. Real AI agents that handle real business tasks.',
              bulletHeader: 'What AI can do for you:',
              bulletPoints: [
                'Customer inquiry handling and routing',
                'Document processing and data extraction',
                'Content generation and scheduling',
                'Research and competitive analysis',
                'Custom agents for your specific workflows',
              ],
              ctas: {
                primary: { text: 'Learn About Managed AI', href: '/contact?service=managed-ai' },
                secondary: { text: 'See Pricing', href: '/pricing' },
              },
            },
          },
        ],
      },
      consultations: {
        title: 'Not Sure Where to Start?',
        description: 'Book a quick call. We\'ll figure out the best approach for your situation.',
        options: [
          { name: 'Quick Chat', duration: '15 min', price: '$20', description: 'Got a quick question?', color: 'green' },
          { name: 'Strategy Call', duration: '30 min', price: '$35', description: 'Let\'s map out your needs', color: 'blue' },
          { name: 'Deep Dive', duration: '55 min', price: '$50', description: 'Full project consultation', color: 'purple' },
        ],
        linkText: 'Book a consultation →',
        linkHref: '/shop',
      },
      processPreview: {
        title: 'How It Works',
        steps: [
          { number: 1, title: 'Tell Us', description: 'What do you need built?', color: 'green' },
          { number: 2, title: 'We Scope', description: 'Clear quote, no surprises', color: 'blue' },
          { number: 3, title: 'We Build', description: 'You stay in the loop', color: 'purple' },
          { number: 4, title: 'You Launch', description: 'Go live with confidence', color: 'gold' },
        ],
        linkText: 'See the full process →',
      },
      cta: {
        title: 'Ready to Build?',
        description: 'Tell us what you need. We\'ll get back to you within 2 business days with a clear quote.',
        buttons: [
          { text: 'Get a Quote', variant: 'gold', href: '/contact' },
          { text: 'View Pricing', variant: 'blue', href: '/pricing' },
        ],
        footer: 'Questions first?',
        footerLinkText: 'Check the FAQ',
        footerLinkHref: '/faq',
        chatbotNote: '',
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
        title: 'Three Ways to Grow',
        description: 'Start with a website, add automation as you scale, or go all-in with managed AI. Each tier builds on the last.',
      },
      scenarioMatcher: {
        title: 'Which sounds like you?',
        description: 'Click the scenario that fits.',
        scenarios: [
          {
            quotes: [
              'I need a professional website but don\'t want to DIY it',
              'My current site looks outdated and isn\'t converting',
              'I want to sell online but the tech is overwhelming',
            ],
            serviceKey: 'website-services',
            serviceTitle: 'Website Builds',
            color: 'green',
          },
          {
            quotes: [
              'I\'m doing the same manual tasks every single day',
              'My tools don\'t talk to each other',
              'I know I should automate but don\'t know where to start',
            ],
            serviceKey: 'data-documents',
            serviceTitle: 'Automation Setup',
            color: 'blue',
          },
          {
            quotes: [
              'I want AI working for my business, not just chatbots',
              'I need ongoing AI support, not a one-time setup',
              'I want to leverage AI but don\'t have time to manage it',
            ],
            serviceKey: 'virtual-assistant',
            serviceTitle: 'Managed AI Services',
            color: 'purple',
          },
        ],
      },
      comparison: {
        title: 'Compare Services',
        description: 'Each tier can stand alone or build on the others.',
        columns: ['Website Builds', 'Automation Setup', 'Managed AI'],
        rows: [
          { label: 'Best for', values: ['Getting online professionally', 'Eliminating repetitive work', 'Hands-off AI operations'] },
          { label: 'What you get', values: ['Custom website, mobile-ready, SEO-optimized', 'Connected tools, automated workflows', 'AI agents that work 24/7'] },
          { label: 'Timeline', values: ['1-4 weeks', '1-2 weeks per workflow', 'Ongoing'] },
          { label: 'Starting at', values: ['$500 one-time', '$150 per workflow', '$500/month'] },
          { label: 'Support included', values: ['30 days', 'Training session', 'Continuous'] },
        ],
      },
      chooseYourPath: {
        title: 'Ready to Start?',
        description: 'Pick your path forward.',
        paths: [
          {
            badge: 'Free',
            title: 'Get a Quote',
            description: 'Tell us what you need built',
            bullets: ['No obligation', 'Response in 2 business days', 'Clear pricing upfront'],
            button: { text: 'Get a Quote', variant: 'gold', href: '/contact', size: 'lg' },
            hoverColor: 'gold',
          },
          {
            badge: 'Paid',
            title: 'Book a Strategy Call',
            description: 'Let\'s plan your approach together',
            bullets: ['30-minute focused session', 'Personalized recommendations', 'Recording included'],
            button: { text: 'Book a Call', variant: 'purple', href: '/shop', size: 'lg' },
            hoverColor: 'purple',
          },
        ],
      },
      expectationsTitle: 'What to Expect',
      expectations: [
        { title: 'Clear Communication', description: 'You\'ll always know where things stand. No ghosting, no jargon.' },
        { title: 'Quality Work', description: 'Built right the first time. We don\'t cut corners.' },
        { title: 'Fair Pricing', description: 'You\'ll know the cost before we start. No surprises.', link: { href: '/pricing' } },
        { title: 'Ongoing Support', description: 'We don\'t disappear after delivery. Questions welcome.' },
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
        title: 'Clear Pricing',
        description: 'No hidden fees. No hourly billing surprises. You\'ll know exactly what you\'re paying before we start.',
      },
      tiers: [
        {
          name: 'Website Build',
          price: 'From $500',
          period: 'one-time',
          description: 'Your professional website, built to convert.',
          features: [
            'Custom design to match your brand',
            'Mobile-responsive and fast',
            'SEO foundations included',
            'Content management training',
            '30 days of support',
          ],
          color: 'green',
          cta: 'Get a Website Quote',
          href: '/contact?service=website',
        },
        {
          name: 'Automation Setup',
          price: 'From $150',
          period: 'per workflow',
          description: 'Connect your tools. Stop doing repetitive work.',
          features: [
            'Workflow design consultation',
            'Platform integration (Zapier, Make, etc.)',
            'Testing and documentation',
            'Training session included',
            'Email support for questions',
          ],
          color: 'blue',
          popular: true,
          cta: 'Explore Automation',
          href: '/contact?service=automation',
        },
        {
          name: 'Managed AI',
          price: 'From $500',
          period: 'per month',
          description: 'AI agents that work while you sleep.',
          features: [
            'Custom AI agent development',
            'Ongoing monitoring and optimization',
            'Monthly performance reports',
            'Priority support',
            'Continuous improvements',
          ],
          color: 'purple',
          cta: 'Learn About Managed AI',
          href: '/contact?service=managed-ai',
        },
      ],
      ctaSection: {
        title: 'Ready to Move Forward?',
        description: 'Pick your starting point.',
      },
      ctaPaths: [
        {
          badge: 'Free',
          title: 'Get a Quote',
          description: 'Tell us what you need',
          features: ['No obligation', 'Response in 2 days', 'Clear pricing'],
          button: { text: 'Get a Quote', href: '/contact', variant: 'gold' },
          hoverColor: 'gold',
        },
        {
          badge: 'Paid',
          title: 'Strategy Call',
          description: 'Plan your approach',
          features: ['30-minute session', 'Personalized advice', 'Recording included'],
          button: { text: 'Book a Call', href: '/shop', variant: 'purple' },
          hoverColor: 'purple',
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
        title: 'Need Something Custom?',
        description: 'Every business is different. If you don\'t see exactly what you need, let\'s talk. We\'ll figure out the right approach together.',
        buttons: [
          { text: 'Contact Us', variant: 'blue', href: '/contact' },
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
        { question: 'What do you build?', answer: 'Three main things: professional websites, automation workflows, and managed AI services. Most clients start with a website and add automation as they grow. Some go straight to managed AI. We\'ll help you figure out what makes sense for your situation.', links: [{ text: 'See all services', href: '/services' }] },
        { question: 'How much does it cost?', answer: 'Website builds start at $500. Automation setup starts at $150 per workflow. Managed AI services start at $500/month. Every project gets a clear quote upfront—no hourly billing surprises.', links: [{ text: 'View pricing', href: '/pricing' }] },
        { question: 'How long does it take?', answer: 'Websites typically take 1-4 weeks depending on complexity. Automation workflows take 1-2 weeks each. Managed AI is ongoing. We\'ll give you a realistic timeline before we start.', links: [{ text: 'How it works', href: '/how-it-works' }] },
        { question: 'Do I need to be technical?', answer: 'Not at all. Just describe what you want to accomplish in plain English. We handle the technical side and explain things without jargon.' },
        { question: 'What if I need changes after delivery?', answer: 'Website builds include 30 days of support and reasonable revisions. Automation setups include a training session and email support. Managed AI includes continuous optimization as part of the monthly fee.' },
        { question: 'How does payment work?', answer: 'For project work: 50% deposit to start, 50% on approval. For managed AI: monthly billing. We accept all major credit cards. No surprises.', links: [{ text: 'Ready to start?', href: '/contact' }] },
        { question: 'What\'s the difference between automation and managed AI?', answer: 'Automation setup is a one-time project—we build workflows that run automatically (like connecting your CRM to your email). Managed AI is ongoing—we build, monitor, and improve AI agents that handle complex tasks continuously.' },
        { question: 'Can I start with one service and add others later?', answer: 'Absolutely. Many clients start with a website, then add automation as they see what\'s possible. The services are designed to build on each other.' },
      ],
      cta: {
        title: 'Still Have Questions?',
        description: 'Book a quick call and we\'ll figure it out together.',
        buttons: [{ text: 'Book a Call', variant: 'purple', href: '/shop' }],
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
        title: 'How We Work Together',
        description: 'A simple process designed to get you from idea to launch without the headaches.',
      },
      trustBadges: [
        { text: 'Human + AI', description: 'Best of both worlds' },
        { text: 'Clear Updates', description: 'At every step' },
        { text: 'No Surprises', description: 'Transparent pricing' },
      ],
      steps: [
        { number: 1, title: 'Tell Us What You Need', description: 'Fill out our simple form. No tech jargon required—just tell us what you\'re trying to accomplish.', details: ['Describe your project in plain English', 'Attach any relevant files or examples', 'Let us know your timeline if you have one'], color: 'green', href: '/contact', buttonText: 'Start Here' },
        { number: 2, title: 'Get a Clear Quote', description: 'Within 2 business days, you\'ll have a detailed quote. No hidden fees, no hourly surprises.', details: ['We assess what needs to be built', 'We ask questions if needed', 'You get a fixed price quote'], color: 'blue' },
        { number: 3, title: 'We Build It', description: '50% deposit to start. We keep you updated throughout so you\'re never wondering what\'s happening.', details: ['Regular progress updates', 'Review checkpoints along the way', 'Revisions until you\'re happy'], color: 'purple' },
        { number: 4, title: 'You Launch', description: 'Final 50% on approval. We help you go live and stick around to make sure everything works.', details: ['Final review and approval', 'Launch support included', 'Post-launch questions welcome'], color: 'gold' },
      ],
      timeline: {
        title: 'Typical Timeline',
        description: "We know waiting is part of the process. That's why we give you a realistic timeline from day one, so you can plan with confidence. Most projects take 1-4 weeks. Bigger ones take longer, but we'll keep you in the loop every step of the way.",
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
        title: 'Ready to Start?',
        description: 'Tell us what you need built. We\'ll take it from there.',
        buttons: [
          { text: 'Get a Quote', variant: 'gold', href: '/contact' },
          { text: 'View Services', variant: 'blue', href: '/services' },
          { text: 'See Pricing', variant: 'purple', href: '/pricing' },
        ],
        hoverColor: 'gold',
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
        title: 'Get a Quote',
        description: 'Tell us what you need built. We\'ll get back to you within 2 business days with a clear quote. No obligation.',
      },
      quickLink: { text: 'Need help now? Book a quick consultation →', href: '/shop' },
      form: {
        nameField: { label: 'What should we call you?', placeholder: 'Your name' },
        emailField: { label: 'Where can we reach you?', placeholder: 'your@email.com' },
        companyField: { label: 'Company', placeholder: 'Where you work', optional: '(if applicable)' },
        serviceField: {
          label: 'What do you need built?',
          placeholder: '',
          defaultOption: 'Pick one (or skip this)',
          otherOption: 'Not Sure Yet',
        },
        messageField: {
          label: 'Tell us about your project',
          placeholder: 'What are you trying to accomplish? Any details that would help us understand your needs?',
        },
        fileUpload: {
          label: 'Have files to share?',
          optional: '(totally optional)',
          dropText: 'Drop files here or click to browse',
          helpText: 'Images, PDFs, or docs. Up to 3 files, 5MB each',
          removeButton: 'Remove',
        },
        submitButton: { default: 'Get a Quote', submitting: 'Sending...' },
      },
      success: {
        title: 'Message Received!',
        description: 'Thanks for reaching out. We\'re excited to learn about your project.',
        nextStepsTitle: 'What happens next:',
        nextSteps: [
          'We\'ll review your request within 2 business days',
          'You\'ll receive a clear quote via email',
          'If you\'re ready to proceed: 50% to start, 50% on delivery',
        ],
        sendAnotherLink: 'Send another message',
      },
      error: {
        message: "Something went wrong. Please try again, or reach out to us another way - we're here to help.",
      },
      cta: {
        title: 'Want to learn more first?',
        description: '',
        buttons: [
          { text: 'View Services', variant: 'blue', href: '/services' },
          { text: 'How It Works', variant: 'purple', href: '/how-it-works' },
          { text: 'Read the FAQ', variant: 'green', href: '/faq' },
        ],
        hoverColor: 'blue',
      },
    } as ContactPageContent,
  },

  'get-started': {
    route: '/get-started',
    slug: 'get-started',
    displayName: 'Get Started',
    contentType: 'get_started_page',
    defaults: {
      header: { title: 'Let\'s Build Something', description: 'Two ways to get started. Pick what works for you.' },
      paths: [
        {
          badge: 'Free',
          title: 'Get a Quote',
          description: 'Tell us what you need built. No obligation.',
          features: ['Response in 2 business days', 'Clear pricing upfront', 'No commitment required'],
          button: { text: 'Request a Quote', variant: 'gold', href: '/contact', size: 'lg' },
          hoverColor: 'gold',
        },
        {
          badge: 'Paid',
          title: 'Strategy Call',
          description: 'Talk through your needs with an expert.',
          features: ['30-minute focused session', 'Personalized recommendations', 'Recording included'],
          button: { text: 'Book a Call', variant: 'purple', href: '/shop', size: 'lg' },
          hoverColor: 'purple',
        },
      ],
      quoteSection: { title: 'Already Have a Quote?', description: 'Enter your quote details below to authorize your project.' },
      authForm: {
        title: "Let's Begin Your Project",
        description: "Enter your details and we'll process your deposit",
        quoteRefLabel: 'Quote Reference Number',
        quoteRefPlaceholder: 'e.g., NTD-010126-1430',
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
      header: { title: 'Blog', description: 'Insights on websites, automation, and AI for growing businesses.' },
      emptyState: { emoji: '📝', title: 'Coming Soon', description: 'We\'re working on guides and insights about websites, automation, and AI. Check back soon.' },
      morePostsTitle: 'More Posts',
      categoryFilterLabel: 'All Posts',
    } as BlogPageContent,
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
        { title: 'Explore Our Content', icon: '📚', group: 'explore', content: 'Stay informed with our regularly updated content:\n\n• Blog: Tips, insights, and industry updates\n• How It Works: Step-by-step breakdown of our process\n• FAQ: Quick answers to common questions' },
        { title: 'Dark Mode', icon: '🌙', group: 'explore', content: 'Prefer a darker interface? We\'ve got you covered:\n\n• Click the sun/moon icon in the header to toggle dark mode\n• Your preference is saved automatically\n• All pages are optimized for both light and dark viewing\n• Designed to meet accessibility standards (WCAG AA)' },
        { title: 'Visual Editor (Admin)', icon: '✏️', group: 'admin', content: 'Admins can edit page content directly in the browser:\n\n**Click to Edit**\n• Click any text on a page to edit it inline\n• A formatting toolbar appears with bold, italic, links, and more\n• Changes save automatically when you click away\n\n**Sections & Cards**\n• Hover over sections to see blue outlines\n• Click a section to open the sidebar editor\n• Edit titles, descriptions, and settings in one place\n\n**Drag to Reorder**\n• Grab the drag handle (⋮⋮) on any section\n• Drag up or down to reorder page sections\n• Drop to save the new order instantly\n\n**Tips**\n• Press ESC to cancel without saving\n• Use the sidebar for complex edits\n• All changes are live immediately' },
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
