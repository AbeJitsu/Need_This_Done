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
  scenario: string;
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

  // Still Not Sure Section - Low-friction CTA
  stillUnsure?: {
    title: string;
    description: string;
    primaryButton: EnhancedCTAButton;
    secondaryButton: EnhancedCTAButton;
  };

  // Existing sections (kept for backwards compatibility)
  expectationsTitle: string;
  expectations: ExpectationItem[];
  cta: CTASection;
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

export interface HowItWorksPageContent {
  header: PageHeader;
  steps: ProcessStep[];
  timeline: {
    title: string;
    description: string;
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

export interface HomePageContent {
  hero: {
    buttons: CTAButton[];
  };
  servicesTitle: string;
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
// Union Types & Mapping
// ============================================================================

/** All possible page content types */
export type PageContent =
  | PricingPageContent
  | FAQPageContent
  | ServicesPageContent
  | HowItWorksPageContent
  | HomePageContent;

/** Content type identifiers */
export type PageContentType =
  | 'pricing_page'
  | 'faq_page'
  | 'services_page'
  | 'how_it_works_page'
  | 'home_page';

/** Maps page slugs to their content types */
export const PAGE_CONTENT_TYPES: Record<string, PageContentType> = {
  pricing: 'pricing_page',
  faq: 'faq_page',
  services: 'services_page',
  'how-it-works': 'how_it_works_page',
  home: 'home_page',
};

/** Display names for admin UI */
export const PAGE_DISPLAY_NAMES: Record<string, string> = {
  pricing: 'Pricing',
  faq: 'FAQ',
  services: 'Services',
  'how-it-works': 'How It Works',
  home: 'Homepage',
};

/** All editable page slugs */
export const EDITABLE_PAGES = ['home', 'pricing', 'services', 'faq', 'how-it-works'] as const;
export type EditablePageSlug = (typeof EDITABLE_PAGES)[number];
