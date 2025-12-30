// ============================================================================
// Page Content Types - TypeScript Interfaces for Editable Page Content
// ============================================================================
// Defines the structure of editable content for each marketing page.
// These types are used by the API, Puck editor, and page components.

import { AccentColor, AccentVariant } from './colors';

// ============================================================================
// Shared Types
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
// Pricing Page Content
// ============================================================================

export interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  color: AccentColor;
  cta?: string; // Optional - if omitted, no individual CTA (use shared CTA instead)
  href?: string; // Where the CTA button links to (defaults to /contact)
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

// ============================================================================
// FAQ Page Content
// ============================================================================

export interface FAQItem {
  question: string;
  answer: string;
  /** Optional links to embed in the answer */
  links?: Array<{
    text: string;
    href: string;
  }>;
}

export interface FAQPageContent {
  header: PageHeader;
  items: FAQItem[];
  cta: CTASection;
}

// ============================================================================
// Services Page Content
// ============================================================================

export interface ExpectationItem {
  title: string;
  description: string;
  /** Optional link to make this item clickable */
  link?: {
    href: string;
  };
}

/** Scenario for the "Does this sound like you?" matcher */
export interface ServiceScenario {
  quotes: string[]; // Array of bullet point quotes
  serviceKey: 'virtual-assistant' | 'data-documents' | 'website-services';
  serviceTitle: string;
  color: AccentColor;
}

/** Row in the service comparison table */
export interface ComparisonRow {
  label: string;
  values: [string, string, string]; // One value per service (VA, Data, Website)
}

/** Enhanced CTA button with optional subtext */
export interface EnhancedCTAButton extends CTAButton {
  subtext?: string;
}

/** Path option for the "Choose Your Path" two-path choice section */
export interface ChoosePath {
  badge: string;
  title: string;
  description: string;
  bullets: string[];
  button: CTAButton & { size?: 'sm' | 'md' | 'lg' };
  hoverColor: AccentVariant;
}

/** Choose Your Path - Two-path choice after exploring services */
export interface ChooseYourPathContent {
  title: string;
  description: string;
  paths: ChoosePath[];
}

export interface ServicesPageContent {
  header: PageHeader;

  // Scenario Matcher Section - "Does this sound like you?"
  scenarioMatcher?: {
    title: string;
    description: string;
    scenarios: ServiceScenario[];
  };

  // Comparison Table Section - Side-by-side view
  comparison?: {
    title: string;
    description: string;
    columns: [string, string, string]; // Service names
    rows: ComparisonRow[];
  };

  // Choose Your Path - Two-path choice after exploring services
  chooseYourPath: ChooseYourPathContent;

  // Existing sections (kept for backwards compatibility)
  expectationsTitle: string;
  expectations: ExpectationItem[];
}

// ============================================================================
// How It Works Page Content
// ============================================================================

export interface ProcessStep {
  number: number;
  title: string;
  description: string;
  details: string[];
  color: AccentVariant;
  href?: string;
}

/** Trust badge for reassurance section */
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

// ============================================================================
// Home Page Content
// ============================================================================

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

/** Service card for the home page services section */
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

// ============================================================================
// Contact Page Content
// ============================================================================

export interface ContactPageContent {
  header: PageHeader;
  quickLink: {
    text: string;
    href: string;
  };
  cta: CTASection;
}

// ============================================================================
// Get Started Page Content
// ============================================================================

/** Path option for the Get Started page */
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
  quoteSection: {
    title: string;
    description: string;
  };
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

// ============================================================================
// Blog Page Content
// ============================================================================

export interface BlogPageContent {
  header: PageHeader;
  emptyState: {
    emoji: string;
    title: string;
    description: string;
  };
  morePostsTitle: string;
  categoryFilterLabel: string;
}

// ============================================================================
// Changelog Page Content
// ============================================================================

export interface ChangelogPageContent {
  header: PageHeader;
  emptyState: {
    emoji: string;
    title: string;
    description: string;
  };
}

// ============================================================================
// Guide Page Content
// ============================================================================

export interface GuidePageContent {
  header: PageHeader;
  sections: Array<{
    title: string;
    content: string;
  }>;
}

// ============================================================================
// Privacy Page Content
// ============================================================================

export interface PrivacyPageContent {
  header: PageHeader;
  lastUpdated: string;
  quickSummary: {
    title: string;
    items: string[];
  };
  sections: Array<{
    title: string;
    content: string;
  }>;
}

// ============================================================================
// Terms Page Content
// ============================================================================

export interface TermsPageContent {
  header: PageHeader;
  lastUpdated: string;
  quickSummary: {
    title: string;
    items: string[];
  };
  sections: Array<{
    title: string;
    content: string;
  }>;
}

// ============================================================================
// Union Types & Mapping
// ============================================================================

/** All possible page content types */
export type PageContent =
  | PricingPageContent
  | FAQPageContent
  | ServicesPageContent
  | HowItWorksPageContent
  | HomePageContent
  | ContactPageContent
  | GetStartedPageContent
  | BlogPageContent
  | ChangelogPageContent
  | GuidePageContent
  | PrivacyPageContent
  | TermsPageContent;

/** Content type identifiers */
export type PageContentType =
  | 'pricing_page'
  | 'faq_page'
  | 'services_page'
  | 'how_it_works_page'
  | 'home_page'
  | 'contact_page'
  | 'get_started_page'
  | 'blog_page'
  | 'changelog_page'
  | 'guide_page'
  | 'privacy_page'
  | 'terms_page';

/** Maps page slugs to their content types */
export const PAGE_CONTENT_TYPES: Record<string, PageContentType> = {
  pricing: 'pricing_page',
  faq: 'faq_page',
  services: 'services_page',
  'how-it-works': 'how_it_works_page',
  home: 'home_page',
  contact: 'contact_page',
  'get-started': 'get_started_page',
  blog: 'blog_page',
  changelog: 'changelog_page',
  guide: 'guide_page',
  privacy: 'privacy_page',
  terms: 'terms_page',
};

/** Display names for admin UI */
export const PAGE_DISPLAY_NAMES: Record<string, string> = {
  pricing: 'Pricing',
  faq: 'FAQ',
  services: 'Services',
  'how-it-works': 'How It Works',
  home: 'Homepage',
  contact: 'Contact',
  'get-started': 'Get Started',
  blog: 'Blog',
  changelog: 'Changelog',
  guide: 'Guide',
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
};

/** All editable page slugs */
export const EDITABLE_PAGES = [
  'home',
  'pricing',
  'services',
  'faq',
  'how-it-works',
  'contact',
  'get-started',
  'blog',
  'changelog',
  'guide',
  'privacy',
  'terms',
] as const;
export type EditablePageSlug = (typeof EDITABLE_PAGES)[number];
