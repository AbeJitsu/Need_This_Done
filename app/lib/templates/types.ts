// ============================================================================
// Template Types - Core Definitions for Page Templates
// ============================================================================
// These types define the structure of templates that can be used to quickly
// create pages. Templates are just DATA - they don't know about UI or storage.
//
// ARCHITECTURE:
// ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
// │   Template      │ -> │  Wizard/Picker  │ -> │   Puck JSON     │
// │   (this file)   │    │   (UI layer)    │    │   (output)      │
// └─────────────────┘    └─────────────────┘    └─────────────────┘
//
// ORTHOGONALITY:
// - Templates don't know how they're selected (wizard vs picker vs API)
// - Templates don't know how they're stored (file vs database)
// - Templates don't know about Puck internals (just produce compatible JSON)
//
// DRY:
// - Reuses AccentVariant from colors.ts
// - Component props mirror Puck component interfaces
// ============================================================================

import type { AccentVariant } from '../colors';

// ============================================================================
// Template Metadata - Describes what the template is for
// ============================================================================

/** Categories to organize templates in the picker */
export type TemplateCategory =
  | 'landing'      // Landing pages, sales pages
  | 'course'       // Course landing, curriculum, lesson
  | 'shop'         // Product pages, collections
  | 'content'      // Blog, about, portfolio
  | 'utility';     // Contact, thank you, 404

/** Who this template is designed for */
export type TemplateAudience =
  | 'everyone'     // General purpose
  | 'coaches'      // Coaches, consultants, course creators
  | 'ecommerce'    // Online sellers
  | 'services'     // Service providers
  | 'creators';    // Content creators, influencers

/** Template metadata - helps users find the right template */
export interface TemplateMetadata {
  /** Unique identifier (used in URLs and storage) */
  id: string;

  /** Display name shown in picker */
  name: string;

  /** Short description (1-2 sentences) */
  description: string;

  /** Category for filtering */
  category: TemplateCategory;

  /** Who this template is best for */
  audience: TemplateAudience;

  /** Keywords for search */
  tags: string[];

  /** Preview image URL (optional) */
  thumbnail?: string;

  /** Is this a featured/recommended template? */
  featured?: boolean;

  /** Estimated time to customize (in minutes) */
  estimatedTime?: number;
}

// ============================================================================
// Template Sections - Building blocks that make up a template
// ============================================================================

/**
 * Base section that all sections extend.
 * The 'type' field maps to Puck component names.
 */
export interface BaseSection {
  type: string;
  props: Record<string, unknown>;
}

/** Hero section - the big intro at the top */
export interface HeroSection extends BaseSection {
  type: 'Hero';
  props: {
    heading: string;
    subheading: string;
    alignment: 'left' | 'center' | 'right';
    showCta: 'yes' | 'no';
    ctaText?: string;
    ctaLink?: string;
    accentColor: AccentVariant;
  };
}

/** Feature grid - highlight key benefits */
export interface FeatureGridSection extends BaseSection {
  type: 'FeatureGrid';
  props: {
    columns: '2' | '3' | '4';
    features: Array<{
      icon?: string;
      title: string;
      description: string;
    }>;
    accentColor: AccentVariant;
  };
}

/** Testimonials - social proof */
export interface TestimonialsSection extends BaseSection {
  type: 'Testimonials';
  props: {
    layout: 'carousel' | 'grid' | 'single';
    showRating: 'yes' | 'no';
    showAvatar: 'yes' | 'no';
    autoPlay: 'yes' | 'no';
    testimonials: Array<{
      quote: string;
      author: string;
      role?: string;
      company?: string;
      rating?: number;
    }>;
    accentColor: AccentVariant;
  };
}

/** Pricing table - show your offers */
export interface PricingSection extends BaseSection {
  type: 'PricingTable';
  props: {
    columns: '2' | '3';
    tiers: Array<{
      name: string;
      price: string;
      period: string;
      description: string;
      features: string[];
      highlighted?: boolean;
    }>;
    accentColor: AccentVariant;
  };
}

/** FAQ accordion - answer common questions */
export interface FAQSection extends BaseSection {
  type: 'Accordion';
  props: {
    style: 'bordered' | 'separated' | 'minimal';
    allowMultiple: 'yes' | 'no';
    items: Array<{
      title: string;
      content: string;
      defaultOpen?: 'open' | 'closed';
    }>;
    accentColor: AccentVariant;
  };
}

/** CTA section - call to action */
export interface CTASection extends BaseSection {
  type: 'CallToAction';
  props: {
    heading: string;
    subheading?: string;
    buttonText: string;
    buttonLink: string;
    style: 'simple' | 'banner' | 'split';
    accentColor: AccentVariant;
  };
}

/** Video embed - YouTube/Vimeo */
export interface VideoSection extends BaseSection {
  type: 'VideoEmbed';
  props: {
    url: string;
    title?: string;
    caption?: string;
    aspectRatio: '16:9' | '4:3' | '1:1' | '9:16';
    thumbnailMode: 'yes' | 'no';
    accentColor: AccentVariant;
  };
}

/** Text block - rich content area */
export interface TextSection extends BaseSection {
  type: 'RichText';
  props: {
    content: string;
    alignment: 'left' | 'center' | 'right';
  };
}

/** Image with optional caption */
export interface ImageSection extends BaseSection {
  type: 'Image';
  props: {
    src: string;
    alt: string;
    caption?: string;
    aspectRatio: 'square' | 'landscape' | 'portrait' | 'auto';
  };
}

/** Product grid - for e-commerce */
export interface ProductGridSection extends BaseSection {
  type: 'ProductGrid';
  props: {
    productIds: Array<{ id: string }>;
    columns: '2' | '3' | '4';
    gap: 'sm' | 'md' | 'lg' | 'xl';
    showPrice: 'yes' | 'no';
    accentColor: AccentVariant;
  };
}

/** Stats counter - show impressive numbers */
export interface StatsSection extends BaseSection {
  type: 'StatsCounter';
  props: {
    stats: Array<{
      value: string;
      label: string;
      prefix?: string;
      suffix?: string;
    }>;
    layout: 'row' | 'grid';
    accentColor: AccentVariant;
  };
}

// ============================================================================
// Template Section Union - All possible sections
// ============================================================================

export type TemplateSection =
  | HeroSection
  | FeatureGridSection
  | TestimonialsSection
  | PricingSection
  | FAQSection
  | CTASection
  | VideoSection
  | TextSection
  | ImageSection
  | ProductGridSection
  | StatsSection
  | BaseSection; // Fallback for custom sections

// ============================================================================
// Complete Template Definition
// ============================================================================

export interface PageTemplate {
  /** Metadata for display and filtering */
  metadata: TemplateMetadata;

  /** Default color scheme (user can change) */
  defaultColor: AccentVariant;

  /** The sections that make up this template */
  sections: TemplateSection[];

  /** Placeholder content - gets replaced by user input */
  placeholders: {
    /** Fields the wizard will ask for */
    fields: TemplatePlaceholder[];
  };
}

/** A field that the wizard will prompt the user for */
export interface TemplatePlaceholder {
  /** Which prop to replace (dot notation: "sections.0.props.heading") */
  path: string;

  /** Human-readable label */
  label: string;

  /** Help text shown below the field */
  hint?: string;

  /** Field type determines input UI */
  type: 'text' | 'textarea' | 'image' | 'color' | 'select';

  /** Options for select fields */
  options?: Array<{ label: string; value: string }>;

  /** Is this required? */
  required?: boolean;

  /** Default value if not provided */
  defaultValue?: string;
}

// ============================================================================
// Template Collection - For organizing multiple templates
// ============================================================================

export interface TemplateCollection {
  /** Collection name (e.g., "Starter Templates") */
  name: string;

  /** Collection description */
  description: string;

  /** Templates in this collection */
  templates: PageTemplate[];
}

// ============================================================================
// Wizard Types - For the step-by-step creation flow
// ============================================================================

/** Wizard step definition */
export interface WizardStep {
  id: string;
  title: string;
  description: string;
  type: 'category' | 'template' | 'color' | 'content' | 'preview';
}

/** User's selections during the wizard */
export interface WizardState {
  currentStep: number;
  category?: TemplateCategory;
  templateId?: string;
  color?: AccentVariant;
  content: Record<string, string>;
  completed: boolean;
}

// ============================================================================
// Puck Output - What templates ultimately generate
// ============================================================================

/**
 * Puck-compatible component format.
 * This is what we output to be rendered by Puck.
 */
export interface PuckComponent {
  type: string;
  props: Record<string, unknown>;
}

/**
 * Puck page data structure.
 * Templates get transformed into this format.
 */
export interface PuckPageData {
  content: PuckComponent[];
  root: {
    props?: Record<string, unknown>;
  };
}
