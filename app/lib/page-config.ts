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

// --- Shared Legal Pages ---
export interface LegalPageSection {
  title: string;
  content: string;
}

export interface LegalPageContent {
  header: PageHeader;
  lastUpdated: string;
  quickSummary: { title: string; items: string[] };
  sections: LegalPageSection[];
}

// Keep named page types for callers that import the route-specific shapes.
export interface PrivacyPageContent extends LegalPageContent {}

export interface TermsPageContent extends LegalPageContent {}

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
      { href: '/services#website-fix', label: 'Website Fix' },
      { href: '/services#managed-automation', label: 'Managed Automation' },
      { href: '/how-it-works', label: 'How It Works' },
      { href: '/work', label: 'Work' },
    ],
    ctaButton: { text: "Tell us what's stuck", href: '/contact' },
  },
  footer: {
    brand: 'Need This Done',
    tagline: 'One clear outcome for work that keeps getting stuck.',
    links: [
      { href: '/services#website-fix', label: 'Website Fix' },
      { href: '/services#managed-automation', label: 'Managed Automation' },
      { href: '/how-it-works', label: 'How It Works' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/work', label: 'Work' },
      { href: '/faq', label: 'FAQ' },
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
        title: 'Fix the work that’s slowing you down.',
        description: 'Bring us one website problem or one repeated task. We agree on one outcome and hand the completed work back clearly.',
        buttons: [
          { text: 'Start a Website Fix', variant: 'blue', href: '/contact?offer=website-fix' },
          { text: 'Discuss Managed Automation', variant: 'gold', href: '/contact?offer=managed-automation' },
        ],
      },
      services: {
        title: 'Choose your path',
        linkText: 'See both paths →',
        linkHref: '/services',
        cards: [
          {
            title: 'Website Fix',
            tagline: 'Fix one website problem',
            description: 'A focused $500 review and one agreed website fix.',
            details: 'One problem, one scope, one handoff',
            color: 'green',
            linkText: 'Learn more →',
            modal: {
              headline: 'Fix the problem that is in the way.',
              hook: 'One focused fix keeps the work clear.',
              bulletHeader: 'What you get:',
              bulletPoints: [
                'Custom design that matches your brand',
                'Mobile-responsive and fast-loading',
                'SEO foundations built in',
                'Content management you can actually use',
                '30 days of support included',
              ],
              ctas: {
                primary: { text: 'Start a Website Fix', href: '/contact?offer=website-fix' },
                secondary: { text: 'See All Services', href: '/services' },
              },
            },
          },
          {
            title: 'Managed Automation',
            tagline: 'Run one repeated task for 30 days',
            description: 'A human-run pilot for one repeated task, priced by proposal.',
            details: 'One task, weekly briefs, a clear outcome',
            color: 'blue',
            linkText: 'Learn more →',
            modal: {
              headline: 'Make recurring work easier.',
              hook: 'Keep the work, evidence, and decisions together.',
              bulletHeader: 'What we automate:',
              bulletPoints: [
                'Lead capture to CRM workflows',
                'Email sequences and follow-ups',
                'Data sync between platforms',
                'Report generation and delivery',
                'Custom workflows for your specific needs',
              ],
              ctas: {
                primary: { text: 'Discuss Managed Automation', href: '/contact?offer=managed-automation' },
                secondary: { text: 'See All Services', href: '/services' },
              },
            },
          },
          {
            title: 'Human-led work',
            tagline: 'Keep control of important actions',
            description: 'Agents prepare work. A person reviews messages, publishing, changes, and spending.',
            details: 'Preparation, review, clear decisions',
            color: 'purple',
            linkText: 'Learn more →',
            modal: {
              headline: 'Automation with a clear boundary.',
              hook: 'The system prepares work without creating automatic authority.',
              bulletHeader: 'What AI can do for you:',
              bulletPoints: [
                'Customer inquiry handling and routing',
                'Document processing and data extraction',
                'Content generation and scheduling',
                'Research and competitive analysis',
                'A contained plan for your specific task',
              ],
              ctas: {
                primary: { text: 'Discuss Managed Automation', href: '/contact?offer=managed-automation' },
                secondary: { text: 'See All Services', href: '/services' },
              },
            },
          },
        ],
      },
      processPreview: {
        title: 'How it works',
        steps: [
          { number: 1, title: 'Choose a path', description: 'Fix one problem or set up automation', color: 'green' },
          { number: 2, title: 'Define the outcome', description: 'Agree on scope before work', color: 'blue' },
          { number: 3, title: 'Review the work', description: 'Keep decisions in human hands', color: 'purple' },
        ],
        linkText: 'See the full process →',
      },
      cta: {
        title: 'Ready to start?',
        description: 'Choose the path that fits the problem.',
        buttons: [
          { text: 'Start a Website Fix', variant: 'blue', href: '/contact?offer=website-fix' },
          { text: 'Discuss Managed Automation', variant: 'green', href: '/contact?offer=managed-automation' },
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
        title: 'Choose the shape of the fix.',
        description: 'One visible website problem fits Website Fix. One repeated task fits a 30-day Managed Automation pilot.',
      },
      chooseYourPath: {
        title: 'Choose by what is stuck.',
        description: 'Use the smallest useful starting point.',
        paths: [
          {
            badge: 'One problem',
            title: 'Website Fix',
            description: 'A $500 review and one agreed website fix.',
            bullets: ['One contained scope', 'One before-and-after handoff', 'Manual 50/50 invoices'],
            button: { text: 'Start a Website Fix', variant: 'green', href: '/contact?offer=website-fix', size: 'lg' },
            hoverColor: 'green',
          },
          {
            badge: 'Repeating work',
            title: 'Managed Automation',
            description: 'A human-run 30-day pilot for one repeated task.',
            bullets: ['One result stated first', 'One short weekly brief', 'Price agreed before the pilot'],
            button: { text: 'Discuss Managed Automation', variant: 'purple', href: '/contact?offer=managed-automation', size: 'lg' },
            hoverColor: 'purple',
          },
        ],
      },
      expectationsTitle: 'What to expect',
      expectations: [
        { title: 'Clear scope', description: 'The work and the boundary are agreed before it starts.' },
        { title: 'Visible progress', description: 'Evidence and handoffs stay attached to the work.' },
        { title: 'Human review', description: 'External actions wait for an explicit decision.' },
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
        title: 'Know the commitment before you start.',
        description: 'Website Fix has one published price. Managed Automation is priced in a written proposal.',
      },
      tiers: [
        {
          name: 'Website Fix',
          price: '$500',
          period: 'one-time',
          description: 'One focused review and one agreed website fix.',
          features: [
            'One contained scope',
            '$250 manual invoice to begin',
            '$250 manual invoice after delivery',
            'No recurring payment',
          ],
          color: 'green',
          cta: 'Start a Website Fix',
          href: '/contact?offer=website-fix',
        },
        {
          name: 'Managed Automation',
          price: 'Proposal-based',
          period: 'written proposal',
          description: 'Price follows the agreed task, 30-day outcome, and commitment.',
          features: [
            'Result and scope stated first',
            'Payment terms agreed before setup',
            'No automatic renewal',
            'Expansion separately agreed',
          ],
          color: 'blue',
          popular: true,
          cta: 'Request a proposal',
          href: '/contact?offer=managed-automation',
        },
      ],
      ctaSection: {
        title: 'A clear commitment protects the work.',
        description: 'No automatic purchase, hidden subscription, or unconfirmed scope.',
      },
      ctaPaths: [
        {
          badge: 'Questions',
          title: 'Contact',
          description: 'Share the context before committing.',
          features: ['Scope confirmed first', 'No automatic purchase', 'Clear next step'],
          button: { text: 'Contact', href: '/contact', variant: 'green' },
          hoverColor: 'green',
        },
      ],
      paymentNote: {
        enabled: true,
        depositPercent: '50%',
        depositLabel: 'To begin',
        depositDescription: '$250 manual invoice for Website Fix',
        deliveryPercent: '50%',
        deliveryLabel: 'After delivery',
        deliveryDescription: '$250 manual invoice after the agreed fix',
      },
      customSection: {
        title: 'Need a different commitment?',
        description: 'Share the context and we will confirm what belongs in the scope before work begins.',
        buttons: [
          { text: 'Contact', variant: 'green', href: '/contact' },
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
        title: 'Questions, answered.',
        description: 'Short answers about scope, cost, approval, and what happens next.',
      },
      items: [
        { question: 'What does Website Fix include?', answer: 'A $500 review and one agreed website fix. Redesigns, integrations, multi-page builds, and ongoing maintenance need a separate scope.', links: [{ text: 'See the exact scope', href: '/services#website-fix' }] },
        { question: 'How does the fixed price get paid?', answer: '$250 by manual invoice to begin and $250 after the agreed fix is delivered.', links: [{ text: 'Review pricing', href: '/pricing#website-fix' }] },
        { question: 'What does Managed Automation start with?', answer: 'One repeated task and one result for a 30-day human-run pilot.', links: [{ text: 'See the process', href: '/how-it-works' }] },
        { question: 'What needs a person to approve?', answer: 'External messages, publishing, system changes, and spending stay behind an explicit human review.' },
        { question: 'What if the request grows?', answer: 'The agreed boundary stays visible. Work outside it is paused and separately scoped before anyone commits to it.' },
        { question: 'Do I need a technical brief?', answer: 'No. Describe the problem, workflow, and desired result in plain language.' },
        { question: 'Is a site audit a compliance certification?', answer: 'No. It is a technical review, not legal advice or an accessibility certification.', links: [{ text: 'Read the accessibility notes', href: '/ada-compliance' }] },
      ],
      cta: {
        title: 'Still have a question?',
        description: 'Send the context you have. We can clarify the next useful step.',
        buttons: [{ text: 'Contact', variant: 'purple', href: '/contact' }],
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
        title: 'Work backward from the result.',
        description: 'An outcome-first process with visible work and human approval before external action.',
      },
      trustBadges: [
        { text: 'Outcome first', description: 'Define the result before tools' },
        { text: 'Visible work', description: 'Keep evidence with each handoff' },
        { text: 'Human review', description: 'Approve external action explicitly' },
      ],
      steps: [
        { number: 1, title: 'Name the outcome', description: 'Start with the result that should be different when the work is done.', details: ['What is stuck now?', 'What would useful improvement look like?', 'What is outside the request?'], color: 'green' },
        { number: 2, title: 'Map the work', description: 'Trace the inputs, tools, evidence, and handoffs around that result.', details: ['Identify the source of truth', 'Separate preparation from decision', 'Set the cost and scope boundary'], color: 'blue' },
        { number: 3, title: 'Do the work', description: 'We prepare the agreed work and keep the evidence attached.', details: ['Keep sources with research', 'Keep versions with drafts', 'Keep blocked work visible'], color: 'purple' },
        { number: 4, title: 'Review and hand off', description: 'A person reviews the evidence, approves the next external action, and records what happened.', details: ['See what is ready and what it cost', 'Approve, revise, defer, or stop', 'Carry the outcome into the next decision'], color: 'gold' },
      ],
      timeline: {
        title: 'Review boundary',
        description: 'The system may prepare research, drafts, evidence, and cost summaries. A person approves messages, publishing, system changes, and spending.',
        hoverColor: 'blue',
      },
      questionsSection: {
        title: 'Ready to make the result concrete?',
        description: 'Share the problem or workflow and the result you want.',
        primaryButton: { text: 'Contact', variant: 'blue', href: '/contact' },
        secondaryButton: { text: 'Read the FAQ', variant: 'purple', href: '/faq' },
        hoverColor: 'blue',
      },
      cta: {
        title: 'Ready to start?',
        description: 'Make the next decision clear.',
        buttons: [
          { text: 'Contact', variant: 'gold', href: '/contact' },
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
        title: 'Give the work context.',
        description: 'Share only what is needed to scope the first useful move.',
      },
      quickLink: { text: 'Contact →', href: '/contact' },
      form: {
        nameField: { label: 'What should we call you?', placeholder: 'Your name' },
        emailField: { label: 'Where can we reach you?', placeholder: 'your@email.com' },
        companyField: { label: 'Company', placeholder: 'Where you work', optional: '(if applicable)' },
        serviceField: {
          label: 'What are you contacting us about?',
          placeholder: '',
          defaultOption: 'Choose a starting point',
          otherOption: 'Something else',
        },
        messageField: {
          label: 'What result do you want?',
          placeholder: 'Describe the problem, workflow, and result in plain language.',
        },
        fileUpload: {
          label: 'Have files to share?',
          optional: '(totally optional)',
          dropText: 'Drop files here or click to browse',
          helpText: 'Images, PDFs, or docs. Up to 3 files, 5MB each',
          removeButton: 'Remove',
        },
        submitButton: { default: 'Send request', submitting: 'Sending...' },
      },
      success: {
        title: 'Request received.',
        description: 'We\'ll review the context and confirm the next step before work begins.',
        nextStepsTitle: 'What happens next:',
        nextSteps: [
          'We\'ll review the request',
          'We\'ll confirm the scope and next step',
          'No automatic purchase is created by the form',
        ],
        sendAnotherLink: 'Send another message',
      },
      error: {
        message: "Something went wrong. Please try again.",
      },
      cta: {
        title: 'Need more context first?',
        description: 'Review the process, proof, or common questions.',
        buttons: [
          { text: 'View Work', variant: 'green', href: '/work' },
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
      header: { title: 'Insights', description: 'Short notes on turning scattered work into clearer decisions, cleaner handoffs, and useful next steps.' },
      emptyState: { emoji: '📝', title: 'Fresh notes soon', description: 'New notes will focus on clearer decisions and more useful workflows.' },
      morePostsTitle: 'More Articles',
      categoryFilterLabel: 'All Insights',
    } as BlogPageContent,
  },

  guide: {
    route: '/guide',
    slug: 'guide',
    displayName: 'Guide',
    contentType: 'guide_page',
    defaults: {
      header: { title: 'Platform Guide', description: 'A short guide to choosing a starting point, reviewing the process, and finding support.' },
      sections: [
        { title: 'Browse Our Services', icon: '🔍', group: 'getting-started', content: 'Explore what we offer and find the right fit for your needs:\n\n• Visit the Services page to see our full range of professional services\n• Each service includes detailed descriptions, pricing, and what\'s included\n• Check our Pricing page to compare packages and find the best value\n• Use our FAQ for quick answers to common questions' },
        { title: 'Request a Consultation', icon: '📅', group: 'getting-started', content: 'Ready for expert guidance?\n\n1. Visit the Contact page\n2. Tell us what you need and choose your preferred consultation timing\n3. Submit your request\n4. We\'ll review the details and follow up with the next step' },
        { title: 'Start here', icon: '🚀', group: 'getting-started', content: 'Here\'s how to get started:\n\n1. Review Services and Pricing\n2. Choose the smallest useful starting point\n3. Share the context through Contact\n4. We\'ll confirm scope, price, and the next step before work begins' },
        { title: 'Private Team Access', icon: '👤', group: 'account', content: 'The sign-in route is reserved for the NeedThisDone team. Customers receive agreed handoffs and weekly briefs directly.' },
        { title: 'How Updates Arrive', icon: '📊', group: 'account', content: 'Website Fix ends with a clear handoff. Managed Automation includes a short weekly brief during the 30-day pilot.' },
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
      header: { title: 'Privacy Policy', description: 'How project requests, technical signals, and authenticated private-workspace records are handled.' },
      lastUpdated: 'August 9, 2026',
      quickSummary: {
        title: 'Quick Summary',
        items: ['We collect the contact, project, technical, and private-workspace information needed to respond and deliver agreed work', 'A public request does not create a subscription, and the public flow does not collect payment-card details', 'We do not sell personal information', 'Private records remain behind authenticated, role-scoped access'],
      },
      sections: [
        { title: '1. Information We Collect', content: 'When you submit a project request, we collect the contact details and project context you provide. For Website Fix, that can include a website URL, the problem you want addressed, and the outcome you want. For Managed Automation, that can include one repeated task, the tools involved, what should always wait for your say, and the desired outcome.\n\nPrivate team records may contain the project, decisions, evidence, outcomes, and files needed to deliver agreed work. We also receive basic technical request and security information needed to operate and protect the site.' },
        { title: '2. How We Use Information', content: 'We use project-request information to respond, scope work, send relevant service communications, and deliver an accepted engagement. Private-workspace information is used to operate and document the agreed work, including approvals and outcomes.\n\nWe do not sell personal information. A public request does not enroll you in an automatic subscription or purchase, and payment-card data is not collected by the current public site flow.' },
        { title: '3. Vendors and Access', content: 'NeedThisDone uses outside vendors for hosting, sign-in, email delivery when configured, and security or operational support. They may process information only as needed to provide those services.\n\nPrivate team records are limited to authorized operators. Customers receive agreed handoffs and weekly briefs directly.' },
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
      header: { title: 'Terms of Service', description: 'The public-site terms for project requests, a $500 Website Fix, and proposal-based Managed Automation.' },
      lastUpdated: 'August 9, 2026',
      quickSummary: {
        title: 'The Short Version',
        items: ['A request starts a conversation; it is not an automatic purchase, subscription, or binding agreement', 'Website Fix is $500: $250 manual invoice to begin and $250 after the agreed contained fix is delivered', 'Managed Automation is proposal-based, with one repeated task, a 30-day finish line, price, payment, and clear human decisions', 'Messages, publishing, account changes, and spending require explicit human approval'],
      },
      sections: [
        { title: '1. Acceptance and Project Requests', content: "By using NeedThisDone.com, you agree to these terms for your use of the public site. A project request invites a follow-up conversation; it does not create an automatic purchase, subscription, or binding service agreement. Accepted work is governed by the specific written scope, proposal, and invoice agreed for that engagement." },
        { title: '2. Website Fix Scope', content: 'Website Fix is $500 and includes an evidence-backed review plus one mutually agreed contained fix. A contained fix is one page- or component-level improvement, accessibility/SEO/performance correction, or focused conversion change.\n\nIt does not include a redesign, integration, multi-page build, or other work outside the written scope. Additional work requires a separate agreement.' },
        { title: '3. Website Fix Payment', content: 'After the contained scope is confirmed, Website Fix uses two manual invoices: $250 (50%) to begin and $250 (50%) after the agreed fix is delivered. The current public site does not activate a checkout or recurring payment flow. Any payment questions or changes are handled directly in the agreed written scope.' },
        { title: '4. Managed Automation', content: 'Managed Automation is a proposal-based, human-run 30-day pilot for one repeated task. Before work begins, the written proposal sets the requested result, scope, price, payment terms, success measures, and the actions that always need your say. NeedThisDone operators keep the work, evidence, costs, and decisions together.\n\nThe pilot does not create automatic external authority. Any expansion or continuation requires a separate decision and agreement.' },
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
        signIn: { title: 'Private Team Sign-In', description: 'Authorized NeedThisDone operators only.' },
        signUp: { title: 'Private Team Access', description: 'Public account requests are not available.' },
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
