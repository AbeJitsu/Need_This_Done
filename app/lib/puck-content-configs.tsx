'use client';

import type { Config, Data } from '@measured/puck';
import type { AccentVariant, AccentColor } from '@/lib/colors';
import type {
  PricingPageContent,
  FAQPageContent,
  ServicesPageContent,
  HowItWorksPageContent,
  HomePageContent,
  EditablePageSlug,
} from '@/lib/page-content-types';

// ============================================================================
// Puck Content Configs - Specialized Editors for Page Content
// ============================================================================
// What: Puck configurations for editing marketing page content (not layout)
// Why: Allows non-technical users to edit text, colors, items via visual editor
// How: Each page type has a config that matches its content JSON structure
//
// Key difference from puck-config.tsx:
// - That file is for building page layouts (drag-drop components)
// - This file is for editing content data within fixed page structures

// ============================================================================
// Shared Field Options
// ============================================================================

const colorOptions = [
  { label: 'Purple', value: 'purple' },
  { label: 'Blue', value: 'blue' },
  { label: 'Green', value: 'green' },
  { label: 'Orange', value: 'orange' },
  { label: 'Teal', value: 'teal' },
  { label: 'Gray', value: 'gray' },
] as const;

const accentColorOptions = [
  { label: 'Purple', value: 'purple' },
  { label: 'Blue', value: 'blue' },
  { label: 'Green', value: 'green' },
] as const;

// ============================================================================
// Pricing Page Content Config
// ============================================================================

export const pricingContentConfig: Config = {
  components: {
    // Root component that holds all pricing page content
    PricingPageContent: {
      fields: {
        // Header Section
        headerTitle: {
          type: 'text',
          label: 'Page Title',
        },
        headerDescription: {
          type: 'textarea',
          label: 'Page Description',
        },
        // Pricing Tiers
        tiers: {
          type: 'array',
          label: 'Pricing Tiers',
          arrayFields: {
            name: { type: 'text', label: 'Tier Name' },
            price: { type: 'text', label: 'Price (e.g., "From $50")' },
            period: { type: 'text', label: 'Period (e.g., "per task")' },
            description: { type: 'textarea', label: 'Description' },
            features: {
              type: 'array',
              label: 'Features',
              arrayFields: {
                text: { type: 'text', label: 'Feature' },
              },
              defaultItemProps: { text: 'New feature' },
            },
            color: {
              type: 'select',
              label: 'Color',
              options: accentColorOptions,
            },
            cta: { type: 'text', label: 'Button Text' },
            popular: {
              type: 'radio',
              label: 'Popular Badge',
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ],
            },
          },
          defaultItemProps: {
            name: 'New Tier',
            price: 'From $0',
            period: 'per task',
            description: 'Description here',
            features: [],
            color: 'blue',
            cta: 'Get Started',
            popular: 'no',
          },
        },
        // Payment Note
        paymentEnabled: {
          type: 'radio',
          label: 'Show Payment Structure',
          options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ],
        },
        depositPercent: { type: 'text', label: 'Deposit Percent' },
        depositLabel: { type: 'text', label: 'Deposit Label' },
        depositDescription: { type: 'text', label: 'Deposit Description' },
        deliveryPercent: { type: 'text', label: 'Delivery Percent' },
        deliveryLabel: { type: 'text', label: 'Delivery Label' },
        deliveryDescription: { type: 'text', label: 'Delivery Description' },
        // Custom Section
        customTitle: { type: 'text', label: 'Bottom Section Title' },
        customDescription: { type: 'textarea', label: 'Bottom Section Description' },
        customButtons: {
          type: 'array',
          label: 'Bottom Section Buttons',
          arrayFields: {
            text: { type: 'text', label: 'Button Text' },
            variant: { type: 'select', label: 'Color', options: colorOptions },
            href: { type: 'text', label: 'Link URL' },
          },
          defaultItemProps: {
            text: 'Button',
            variant: 'blue',
            href: '/',
          },
        },
      },
      defaultProps: {},
      render: () => <div>Preview not available - content will render on the live page</div>,
    },
  },
};

// ============================================================================
// FAQ Page Content Config
// ============================================================================

export const faqContentConfig: Config = {
  components: {
    FAQPageContent: {
      fields: {
        // Header
        headerTitle: { type: 'text', label: 'Page Title' },
        headerDescription: { type: 'textarea', label: 'Page Description' },
        // FAQ Items
        items: {
          type: 'array',
          label: 'FAQ Items',
          arrayFields: {
            question: { type: 'text', label: 'Question' },
            answer: { type: 'textarea', label: 'Answer' },
            linkText: { type: 'text', label: 'Link Text (optional)' },
            linkHref: { type: 'text', label: 'Link URL (optional)' },
          },
          defaultItemProps: {
            question: 'New question?',
            answer: 'Answer here...',
            linkText: '',
            linkHref: '',
          },
        },
        // CTA
        ctaTitle: { type: 'text', label: 'CTA Title' },
        ctaDescription: { type: 'textarea', label: 'CTA Description' },
        ctaButtons: {
          type: 'array',
          label: 'CTA Buttons',
          arrayFields: {
            text: { type: 'text', label: 'Button Text' },
            variant: { type: 'select', label: 'Color', options: colorOptions },
            href: { type: 'text', label: 'Link URL' },
          },
          defaultItemProps: {
            text: 'Button',
            variant: 'orange',
            href: '/contact',
          },
        },
      },
      defaultProps: {},
      render: () => <div>Preview not available - content will render on the live page</div>,
    },
  },
};

// ============================================================================
// Services Page Content Config
// ============================================================================

export const servicesContentConfig: Config = {
  components: {
    ServicesPageContent: {
      fields: {
        // Header
        headerTitle: { type: 'text', label: 'Page Title' },
        headerDescription: { type: 'textarea', label: 'Page Description' },
        // Expectations Section
        expectationsTitle: { type: 'text', label: 'Expectations Section Title' },
        expectations: {
          type: 'array',
          label: 'What to Expect Items',
          arrayFields: {
            title: { type: 'text', label: 'Title' },
            description: { type: 'text', label: 'Description' },
            linkHref: { type: 'text', label: 'Link URL (optional)' },
          },
          defaultItemProps: {
            title: 'New expectation',
            description: 'Description here',
            linkHref: '',
          },
        },
        // CTA
        ctaTitle: { type: 'text', label: 'CTA Title' },
        ctaDescription: { type: 'textarea', label: 'CTA Description' },
        ctaButtons: {
          type: 'array',
          label: 'CTA Buttons',
          arrayFields: {
            text: { type: 'text', label: 'Button Text' },
            variant: { type: 'select', label: 'Color', options: colorOptions },
            href: { type: 'text', label: 'Link URL' },
          },
          defaultItemProps: {
            text: 'Button',
            variant: 'orange',
            href: '/contact',
          },
        },
      },
      defaultProps: {},
      render: () => <div>Preview not available - content will render on the live page</div>,
    },
  },
};

// ============================================================================
// How It Works Page Content Config
// ============================================================================

export const howItWorksContentConfig: Config = {
  components: {
    HowItWorksPageContent: {
      fields: {
        // Header
        headerTitle: { type: 'text', label: 'Page Title' },
        headerDescription: { type: 'textarea', label: 'Page Description' },
        // Steps
        steps: {
          type: 'array',
          label: 'Process Steps',
          arrayFields: {
            number: { type: 'number', label: 'Step Number' },
            title: { type: 'text', label: 'Title' },
            description: { type: 'textarea', label: 'Description' },
            details: {
              type: 'array',
              label: 'Details',
              arrayFields: {
                text: { type: 'text', label: 'Detail' },
              },
              defaultItemProps: { text: 'New detail' },
            },
            color: { type: 'select', label: 'Color', options: colorOptions },
            href: { type: 'text', label: 'Link URL (optional)' },
          },
          defaultItemProps: {
            number: 1,
            title: 'New Step',
            description: 'Step description',
            details: [],
            color: 'blue',
            href: '',
          },
        },
        // Timeline Note
        timelineTitle: { type: 'text', label: 'Timeline Section Title' },
        timelineDescription: { type: 'textarea', label: 'Timeline Description' },
        // CTA
        ctaTitle: { type: 'text', label: 'CTA Title' },
        ctaDescription: { type: 'textarea', label: 'CTA Description' },
        ctaButtons: {
          type: 'array',
          label: 'CTA Buttons',
          arrayFields: {
            text: { type: 'text', label: 'Button Text' },
            variant: { type: 'select', label: 'Color', options: colorOptions },
            href: { type: 'text', label: 'Link URL' },
          },
          defaultItemProps: {
            text: 'Button',
            variant: 'orange',
            href: '/contact',
          },
        },
      },
      defaultProps: {},
      render: () => <div>Preview not available - content will render on the live page</div>,
    },
  },
};

// ============================================================================
// Home Page Content Config
// ============================================================================

export const homeContentConfig: Config = {
  components: {
    HomePageContent: {
      fields: {
        // Hero Buttons
        heroButtons: {
          type: 'array',
          label: 'Hero Section Buttons',
          arrayFields: {
            text: { type: 'text', label: 'Button Text' },
            variant: { type: 'select', label: 'Color', options: colorOptions },
            href: { type: 'text', label: 'Link URL' },
          },
          defaultItemProps: {
            text: 'Button',
            variant: 'orange',
            href: '/contact',
          },
        },
        // Services Section
        servicesTitle: { type: 'text', label: 'Services Section Title' },
        // Process Preview
        processTitle: { type: 'text', label: 'Process Section Title' },
        processSteps: {
          type: 'array',
          label: 'Process Preview Steps',
          arrayFields: {
            number: { type: 'number', label: 'Step Number' },
            title: { type: 'text', label: 'Title' },
            description: { type: 'text', label: 'Description' },
            color: { type: 'select', label: 'Color', options: colorOptions },
          },
          defaultItemProps: {
            number: 1,
            title: 'Step',
            description: 'Description',
            color: 'blue',
          },
        },
        processLinkText: { type: 'text', label: 'Process Link Text' },
        // CTA Section
        ctaTitle: { type: 'text', label: 'CTA Title' },
        ctaDescription: { type: 'textarea', label: 'CTA Description' },
        ctaButtons: {
          type: 'array',
          label: 'CTA Buttons',
          arrayFields: {
            text: { type: 'text', label: 'Button Text' },
            variant: { type: 'select', label: 'Color', options: colorOptions },
            href: { type: 'text', label: 'Link URL' },
          },
          defaultItemProps: {
            text: 'Button',
            variant: 'orange',
            href: '/contact',
          },
        },
        ctaFooter: { type: 'text', label: 'CTA Footer Text' },
        ctaFooterLinkText: { type: 'text', label: 'CTA Footer Link Text' },
        ctaFooterLinkHref: { type: 'text', label: 'CTA Footer Link URL' },
      },
      defaultProps: {},
      render: () => <div>Preview not available - content will render on the live page</div>,
    },
  },
};

// ============================================================================
// Config Getter
// ============================================================================

const configMap: Record<EditablePageSlug, Config> = {
  pricing: pricingContentConfig,
  faq: faqContentConfig,
  services: servicesContentConfig,
  'how-it-works': howItWorksContentConfig,
  home: homeContentConfig,
};

export function getContentConfig(slug: EditablePageSlug): Config {
  return configMap[slug];
}

// ============================================================================
// Content Transform Utilities
// ============================================================================
// These functions transform between our content types and Puck's flat field format

/**
 * Transform our nested content structure to Puck's flat props format
 */
export function contentToPuckData(
  slug: EditablePageSlug,
  content: PricingPageContent | FAQPageContent | ServicesPageContent | HowItWorksPageContent | HomePageContent
): Data {
  const componentName = getComponentName(slug);

  switch (slug) {
    case 'pricing': {
      const c = content as PricingPageContent;
      return {
        root: { props: {} },
        content: [
          {
            type: componentName,
            props: {
              headerTitle: c.header.title,
              headerDescription: c.header.description,
              tiers: c.tiers.map((t) => ({
                ...t,
                features: t.features.map((f) => ({ text: f })),
                popular: t.popular ? 'yes' : 'no',
              })),
              paymentEnabled: c.paymentNote.enabled ? 'yes' : 'no',
              depositPercent: c.paymentNote.depositPercent,
              depositLabel: c.paymentNote.depositLabel,
              depositDescription: c.paymentNote.depositDescription,
              deliveryPercent: c.paymentNote.deliveryPercent,
              deliveryLabel: c.paymentNote.deliveryLabel,
              deliveryDescription: c.paymentNote.deliveryDescription,
              customTitle: c.customSection.title,
              customDescription: c.customSection.description,
              customButtons: c.customSection.buttons,
            },
          },
        ],
        zones: {},
      };
    }

    case 'faq': {
      const c = content as FAQPageContent;
      return {
        root: { props: {} },
        content: [
          {
            type: componentName,
            props: {
              headerTitle: c.header.title,
              headerDescription: c.header.description,
              items: c.items.map((item) => ({
                question: item.question,
                answer: item.answer,
                linkText: item.links?.[0]?.text || '',
                linkHref: item.links?.[0]?.href || '',
              })),
              ctaTitle: c.cta.title,
              ctaDescription: c.cta.description,
              ctaButtons: c.cta.buttons,
            },
          },
        ],
        zones: {},
      };
    }

    case 'services': {
      const c = content as ServicesPageContent;
      return {
        root: { props: {} },
        content: [
          {
            type: componentName,
            props: {
              headerTitle: c.header.title,
              headerDescription: c.header.description,
              expectationsTitle: c.expectationsTitle,
              expectations: c.expectations.map((e) => ({
                title: e.title,
                description: e.description,
                linkHref: e.link?.href || '',
              })),
              ctaTitle: c.cta.title,
              ctaDescription: c.cta.description,
              ctaButtons: c.cta.buttons,
            },
          },
        ],
        zones: {},
      };
    }

    case 'how-it-works': {
      const c = content as HowItWorksPageContent;
      return {
        root: { props: {} },
        content: [
          {
            type: componentName,
            props: {
              headerTitle: c.header.title,
              headerDescription: c.header.description,
              steps: c.steps.map((s) => ({
                ...s,
                details: s.details.map((d) => ({ text: d })),
              })),
              timelineTitle: c.timeline.title,
              timelineDescription: c.timeline.description,
              ctaTitle: c.cta.title,
              ctaDescription: c.cta.description,
              ctaButtons: c.cta.buttons,
            },
          },
        ],
        zones: {},
      };
    }

    case 'home': {
      const c = content as HomePageContent;
      return {
        root: { props: {} },
        content: [
          {
            type: componentName,
            props: {
              heroButtons: c.hero.buttons,
              servicesTitle: c.servicesTitle,
              processTitle: c.processPreview.title,
              processSteps: c.processPreview.steps,
              processLinkText: c.processPreview.linkText,
              ctaTitle: c.cta.title,
              ctaDescription: c.cta.description,
              ctaButtons: c.cta.buttons,
              ctaFooter: c.cta.footer,
              ctaFooterLinkText: c.cta.footerLinkText,
              ctaFooterLinkHref: c.cta.footerLinkHref,
            },
          },
        ],
        zones: {},
      };
    }
  }
}

/**
 * Transform Puck's flat props format back to our nested content structure
 */
export function puckDataToContent(
  slug: EditablePageSlug,
  data: Data
): PricingPageContent | FAQPageContent | ServicesPageContent | HowItWorksPageContent | HomePageContent {
  // Get the first (and only) content item's props
  const props = data.content[0]?.props || {};

  switch (slug) {
    case 'pricing': {
      return {
        header: {
          title: props.headerTitle as string,
          description: props.headerDescription as string,
        },
        tiers: ((props.tiers as Array<Record<string, unknown>>) || []).map((t) => ({
          name: t.name as string,
          price: t.price as string,
          period: t.period as string,
          description: t.description as string,
          features: ((t.features as Array<{ text: string }>) || []).map((f) => f.text),
          color: t.color as AccentColor,
          cta: t.cta as string,
          popular: t.popular === 'yes',
        })),
        paymentNote: {
          enabled: props.paymentEnabled === 'yes',
          depositPercent: props.depositPercent as string,
          depositLabel: props.depositLabel as string,
          depositDescription: props.depositDescription as string,
          deliveryPercent: props.deliveryPercent as string,
          deliveryLabel: props.deliveryLabel as string,
          deliveryDescription: props.deliveryDescription as string,
        },
        customSection: {
          title: props.customTitle as string,
          description: props.customDescription as string,
          buttons: (props.customButtons as Array<{ text: string; variant: AccentVariant; href: string }>) || [],
          hoverColor: 'orange',
        },
      } as PricingPageContent;
    }

    case 'faq': {
      return {
        header: {
          title: props.headerTitle as string,
          description: props.headerDescription as string,
        },
        items: ((props.items as Array<Record<string, unknown>>) || []).map((item) => ({
          question: item.question as string,
          answer: item.answer as string,
          links: item.linkText && item.linkHref
            ? [{ text: item.linkText as string, href: item.linkHref as string }]
            : undefined,
        })),
        cta: {
          title: props.ctaTitle as string,
          description: props.ctaDescription as string,
          buttons: (props.ctaButtons as Array<{ text: string; variant: AccentVariant; href: string }>) || [],
          hoverColor: 'orange',
        },
      } as FAQPageContent;
    }

    case 'services': {
      return {
        header: {
          title: props.headerTitle as string,
          description: props.headerDescription as string,
        },
        expectationsTitle: props.expectationsTitle as string,
        expectations: ((props.expectations as Array<Record<string, unknown>>) || []).map((e) => ({
          title: e.title as string,
          description: e.description as string,
          link: e.linkHref ? { href: e.linkHref as string } : undefined,
        })),
        cta: {
          title: props.ctaTitle as string,
          description: props.ctaDescription as string,
          buttons: (props.ctaButtons as Array<{ text: string; variant: AccentVariant; href: string }>) || [],
          hoverColor: 'orange',
        },
      } as ServicesPageContent;
    }

    case 'how-it-works': {
      return {
        header: {
          title: props.headerTitle as string,
          description: props.headerDescription as string,
        },
        steps: ((props.steps as Array<Record<string, unknown>>) || []).map((s) => ({
          number: s.number as number,
          title: s.title as string,
          description: s.description as string,
          details: ((s.details as Array<{ text: string }>) || []).map((d) => d.text),
          color: s.color as AccentVariant,
          href: s.href as string | undefined,
        })),
        timeline: {
          title: props.timelineTitle as string,
          description: props.timelineDescription as string,
          hoverColor: 'blue',
        },
        cta: {
          title: props.ctaTitle as string,
          description: props.ctaDescription as string,
          buttons: (props.ctaButtons as Array<{ text: string; variant: AccentVariant; href: string }>) || [],
          hoverColor: 'orange',
        },
      } as HowItWorksPageContent;
    }

    case 'home': {
      return {
        hero: {
          buttons: (props.heroButtons as Array<{ text: string; variant: AccentVariant; href: string }>) || [],
        },
        servicesTitle: props.servicesTitle as string,
        processPreview: {
          title: props.processTitle as string,
          steps: (props.processSteps as Array<{ number: number; title: string; description: string; color: AccentVariant }>) || [],
          linkText: props.processLinkText as string,
        },
        cta: {
          title: props.ctaTitle as string,
          description: props.ctaDescription as string,
          buttons: (props.ctaButtons as Array<{ text: string; variant: AccentVariant; href: string }>) || [],
          footer: props.ctaFooter as string,
          footerLinkText: props.ctaFooterLinkText as string,
          footerLinkHref: props.ctaFooterLinkHref as string,
          hoverColor: 'orange',
        },
      } as HomePageContent;
    }
  }
}

function getComponentName(slug: EditablePageSlug): string {
  const names: Record<EditablePageSlug, string> = {
    pricing: 'PricingPageContent',
    faq: 'FAQPageContent',
    services: 'ServicesPageContent',
    'how-it-works': 'HowItWorksPageContent',
    home: 'HomePageContent',
  };
  return names[slug];
}
