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
      { href: '/services#website-improvement', label: 'Website Improvement' },
      { href: '/services#ai-operator', label: 'AI Operator' },
      { href: '/how-it-works', label: 'How It Works' },
      { href: '/work', label: 'Work' },
      { href: '/blog', label: 'Insights' },
    ],
    ctaButton: { text: 'Start a Project', href: '/contact' },
    signInText: 'Sign in',
  },
  footer: {
    brand: 'Need This Done',
    tagline: 'Focused website improvements and human-led managed AI operator pilots.',
    links: [
      { href: '/services#website-improvement', label: 'Website Improvement' },
      { href: '/services#ai-operator', label: 'AI Operator' },
      { href: '/how-it-works', label: 'How It Works' },
      { href: '/work', label: 'Work' },
      { href: '/blog', label: 'Insights' },
      { href: '/faq', label: 'FAQ' },
      { href: '/site-analyzer', label: 'Free Site Audit' },
      { href: '/ada-compliance', label: 'Accessibility Checks' },
      { href: '/contact', label: 'Start a Project' },
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
                secondary: { text: 'See All Services', href: '/services' },
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
                secondary: { text: 'See All Services', href: '/services' },
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
                secondary: { text: 'See All Services', href: '/services' },
              },
            },
          },
        ],
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
        description: 'See exactly what we build and how it helps your business grow.',
        buttons: [
          { text: 'See What We Build', variant: 'blue', href: '/services' },
          { text: 'Book a Free Call', variant: 'green', href: '/contact' },
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
            badge: 'Free',
            title: 'Book a Strategy Call',
            description: 'Let\'s plan your approach together',
            bullets: ['30-minute focused session', 'Personalized recommendations', 'No obligation'],
            button: { text: 'Book a Call', variant: 'purple', href: '/contact', size: 'lg' },
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
          badge: 'Free',
          title: 'Strategy Call',
          description: 'Plan your approach',
          features: ['30-minute session', 'Personalized advice', 'No obligation'],
          button: { text: 'Book a Call', href: '/contact', variant: 'purple' },
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
        description: 'Straight answers about the two offers, payment, approval, and what happens next.',
      },
      items: [
        { question: 'What is the Website Improvement?', answer: 'It is a $500 engagement: an evidence-backed review plus one mutually agreed contained fix. A contained fix may be a page or component improvement, accessibility correction, SEO or performance correction, or focused conversion change.', links: [{ text: 'See the exact scope', href: '/services#website-improvement' }] },
        { question: 'What is not included in the $500 website offer?', answer: 'It does not include a redesign, integration, multi-page build, or open-ended maintenance plan. If the finding needs broader work, that work is discussed and scoped separately before any commitment.' },
        { question: 'How does website payment work?', answer: 'The website engagement uses manual invoices: $250 (50%) to begin after the contained scope is confirmed, and $250 (50%) after the agreed fix is delivered. No checkout flow or subscription is activated from the public site.', links: [{ text: 'Review pricing', href: '/pricing#website-improvement' }] },
        { question: 'What is the Managed AI Operator?', answer: 'It is a proposal-based 30-day pilot. Abe and Andrea operate a bounded role privately: they prepare research, organize work, and bring decisions for human review. Clients receive weekly briefs rather than a dashboard to operate.', links: [{ text: 'See the pilot path', href: '/services#ai-operator' }] },
        { question: 'Can the AI operator send messages or change systems on its own?', answer: 'No. External messages, publishing, system changes, and spending require explicit human approval. The private operator tools record the work and decisions; they do not create autonomous authority.' },
        { question: 'How is the AI pilot priced?', answer: 'Pilot scope, success measures, payment terms, and approval boundaries are written into the proposal before work begins. There is no published recurring price or automatic renewal.' },
        { question: 'Do I need to be technical?', answer: 'No. Describe the website problem or recurring bottleneck in plain language. The intake adapts to the offer so we can ask for the right context without asking you to manage the implementation.' },
        { question: 'Does a site audit certify accessibility or legal compliance?', answer: 'No. The audit surfaces selected technical signals and can support one focused improvement. It is not a legal opinion, an accessibility certification, or a replacement for a specialist conformance review.', links: [{ text: 'Read the accessibility notes', href: '/ada-compliance' }] },
      ],
      cta: {
        title: 'Still Have Questions?',
        description: 'Choose an offer and share the context. We will confirm the appropriate next step before work begins.',
        buttons: [{ text: 'Start a Project', variant: 'purple', href: '/contact' }],
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
        primaryButton: { text: 'Book a Quick Chat', variant: 'blue', href: '/contact' },
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
      quickLink: { text: 'Need help now? Book a quick consultation →', href: '/contact' },
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
        description: 'See what I\'ve built, or learn about my process.',
        buttons: [
          { text: 'View My Work', variant: 'green', href: '/work' },
          { text: 'View Services', variant: 'blue', href: '/services' },
          { text: 'Read the FAQ', variant: 'purple', href: '/faq' },
        ],
        hoverColor: 'green',
      },
    } as ContactPageContent,
  },

blog: {
    route: '/blog',
    slug: 'blog',
    displayName: 'Blog',
    contentType: 'blog_page',
    defaults: {
      header: { title: 'Insights', description: 'Practical notes on website improvement, clearer conversion paths, and safely managed AI operations.' },
      emptyState: { emoji: '📝', title: 'Fresh notes soon', description: 'We publish only material that remains useful to the two current offers.' },
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
      header: { title: 'Platform Guide', description: 'Everything you need to know about NeedThisDone—from choosing a service to tracking your project.' },
      sections: [
        { title: 'Browse Our Services', icon: '🔍', group: 'getting-started', content: 'Explore what we offer and find the right fit for your needs:\n\n• Visit the Services page to see our full range of professional services\n• Each service includes detailed descriptions, pricing, and what\'s included\n• Check our Pricing page to compare packages and find the best value\n• Use our FAQ for quick answers to common questions' },
        { title: 'Request a Consultation', icon: '📅', group: 'getting-started', content: 'Ready for expert guidance?\n\n1. Visit the Contact page\n2. Tell us what you need and choose your preferred consultation timing\n3. Submit your request\n4. We\'ll review the details and follow up with the next step' },
        { title: 'Start a Project', icon: '🚀', group: 'getting-started', content: 'Here\'s how to get started:\n\n1. Review the Services and Pricing pages\n2. Choose a package or tell us about custom work\n3. Submit the project request\n4. We\'ll confirm scope, price, and next steps before work begins' },
        { title: 'Access Your Account', icon: '👤', group: 'account', content: 'An account gives you access to your project workspace:\n\n• Sign in with Google using the email linked to your workspace\n• An operator can securely link your account to your project\n• Use password recovery only for an existing recovery-enabled account\n• Access your dashboard anytime to check project progress' },
        { title: 'Your Dashboard', icon: '📊', group: 'account', content: 'Once your account is linked to a project, your dashboard is your home base:\n\n• View project status and details\n• Read and add project comments\n• Access project files and delivery handoffs\n• Start another project when you are ready' },
        { title: 'Explore Our Content', icon: '📚', group: 'explore', content: 'Stay informed with our regularly updated content:\n\n• Blog: Tips, insights, and industry updates\n• How It Works: Step-by-step breakdown of our process\n• FAQ: Quick answers to common questions' },
        { title: 'Project Updates', icon: '✏️', group: 'admin', content: 'Project operators manage work from the protected dashboard:\n\n• Review new project requests\n• Update project status and notes\n• Link an existing client account after confirming the exact email\n• Publish delivery handoffs and retry failed notifications\n• Keep human approval in control of report follow-up' },
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
      header: { title: 'Privacy Policy', description: 'How project-request and private-workspace information is handled.' },
      lastUpdated: 'August 8, 2026',
      quickSummary: {
        title: 'Quick Summary',
        items: ['We collect the information needed to respond to a project request and deliver agreed work', 'The public site does not collect payment-card details or activate checkout', 'We do not sell personal information', 'Private operator records are not exposed as a public client dashboard'],
      },
      sections: [
        { title: '1. Information We Collect', content: 'When you submit a project request, we collect the contact details and project context you provide. For Website Improvement, that can include a website URL, the problem you want addressed, and the outcome you want. For a Managed AI Operator request, that can include bottlenecks, tools, approval boundaries, and desired outcomes.\n\nIf an operator later creates a private workspace for an agreed engagement, the workspace may contain the project, decisions, evidence, outcomes, and files needed to deliver that work. We also receive basic technical request and security information needed to operate the site.' },
        { title: '2. How We Use Information', content: 'We use project-request information to respond, scope work, send relevant service communications, and deliver an accepted engagement. Private-workspace information is used to operate and document the agreed work, including approvals and outcomes.\n\nWe do not sell personal information. We do not use a public request to enroll you in an automatic subscription. Payment-card data is not collected by the current public site flow.' },
        { title: '3. Service Providers and Access', content: 'NeedThisDone uses service providers for hosting, database/authentication, email delivery when configured, and security/operational support. Providers may process information only as needed to provide those services.\n\nAccess to private operator records is limited by authenticated, role-scoped controls. The dashboard, employee, prospecting, and administrative surfaces are not public client portals.' },
        { title: '4. Retention and Your Choices', content: 'We retain request and delivery information for as long as reasonably needed to respond, deliver work, meet legal or operational obligations, resolve disputes, and maintain accurate records. You may ask to access, correct, or request deletion of personal information by contacting us. Some records may need to be retained where required for legitimate operational or legal reasons.' },
        { title: '5. Contact Us', content: 'Questions or requests about privacy?\n\nEmail: hello@needthisdone.com\nWebsite: needthisdone.com/contact' },
      ],
    } as PrivacyPageContent,
  },

  terms: {
    route: '/terms',
    slug: 'terms',
    displayName: 'Terms of Service',
    contentType: 'terms_page',
    defaults: {
      header: { title: 'Terms of Service', description: 'The public-site terms and the service boundaries that apply before an accepted proposal.' },
      lastUpdated: 'August 8, 2026',
      quickSummary: {
        title: 'The Short Version',
        items: ['A project request is not an automatic purchase or a binding service agreement', 'Website Improvement is $500: 50% manual invoice to begin and 50% after the agreed contained fix is delivered', 'Managed AI Operator pilots are proposal-based and require written scope before work begins', 'External actions remain subject to explicit human approval'],
      },
      sections: [
        { title: '1. Acceptance and Project Requests', content: "By using NeedThisDone.com, you agree to these terms for your use of the public site. A project request invites a follow-up conversation; it does not create an automatic purchase, subscription, or binding service agreement. Accepted work is governed by the specific written scope, proposal, and invoice agreed for that engagement." },
        { title: '2. Website Improvement Scope', content: 'The public Website Improvement offer is $500 and includes an evidence-backed review plus one mutually agreed contained fix. A contained fix is one page- or component-level improvement, accessibility/SEO/performance correction, or focused conversion change.\n\nIt does not include a redesign, integration, multi-page build, or other work outside the written scope. Additional work requires a separate agreement.' },
        { title: '3. Website Improvement Payment', content: 'After the contained scope is confirmed, the Website Improvement uses manual invoices: $250 (50%) to begin and $250 (50%) after the agreed fix is delivered. The current public site does not activate a checkout or recurring payment flow. Any payment questions or changes are handled directly in the agreed written scope.' },
        { title: '4. Managed AI Operator Pilot', content: 'The Managed AI Operator is a proposal-based 30-day pilot. Abe and Andrea operate the role privately using an agreed operating brief, success measures, payment terms, and prohibited-action list. Clients receive weekly briefs; the private dashboard is not a client-facing product.\n\nThe pilot does not automatically renew. Any continuation requires a separate decision and agreement.' },
        { title: '5. Human Approval and Client Responsibilities', content: 'External messages, publishing, system changes, and spending require explicit human approval. You agree to provide accurate context, timely access or feedback when needed, and authority for any requested work. You remain responsible for your business decisions, content, accounts, and approvals.' },
        { title: '6. Results, Intellectual Property, and Liability', content: 'NeedThisDone does not guarantee traffic, revenue, legal compliance, accessibility certification, conversion results, or any other business outcome. Ownership, license, confidentiality, and portfolio terms for an accepted engagement are defined in its written scope. To the extent allowed by law, liability is limited to the amounts paid for the specific engagement giving rise to the claim.' },
        { title: '7. Privacy and Contact', content: 'Please review the Privacy Policy for how information is handled. Questions about these terms or a project scope can be sent to:\n\nEmail: hello@needthisdone.com\nWebsite: needthisdone.com/contact' },
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
        signUp: { title: 'Account Access', description: 'Use Google to access an operator-linked project workspace' },
        forgotPassword: { title: 'Reset Your Password', description: "No worries. We'll send you a reset link" },
      },
      buttons: { signIn: 'Sign In', signUp: 'Request Access', resetPassword: 'Send Reset Link', googleSignIn: 'Sign in with Google' },
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
