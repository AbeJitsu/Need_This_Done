// ============================================================================
// JSON-LD Structured Data Component
// ============================================================================
// Provides schema.org structured data for rich search results.
// This helps search engines understand the content and display rich snippets.

import { seoConfig } from '@/lib/seo-config';

interface JsonLdProps {
  type: 'LocalBusiness' | 'WebSite' | 'Service' | 'FAQPage' | 'ProfessionalService';
}

// Base business information used across all schema types - sourced from seoConfig
const businessInfo = {
  name: seoConfig.siteName,
  url: seoConfig.baseUrl,
  description: seoConfig.description,
  address: {
    '@type': 'PostalAddress',
    addressLocality: seoConfig.business.address.locality,
    addressRegion: seoConfig.business.address.region,
    addressCountry: seoConfig.business.address.country,
  },
  email: seoConfig.business.email,
  priceRange: seoConfig.business.priceRange,
};

// Schema definitions for different page types
const schemas = {
  LocalBusiness: {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': businessInfo.url,
    name: businessInfo.name,
    url: businessInfo.url,
    description: businessInfo.description,
    address: businessInfo.address,
    email: businessInfo.email,
    priceRange: businessInfo.priceRange,
    image: `${businessInfo.url}/og-image.png`,
    sameAs: seoConfig.business.socialLinks,
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: seoConfig.business.openingHours.days,
      opens: seoConfig.business.openingHours.opens,
      closes: seoConfig.business.openingHours.closes,
    },
  },

  ProfessionalService: {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': businessInfo.url,
    name: businessInfo.name,
    url: businessInfo.url,
    description: businessInfo.description,
    address: businessInfo.address,
    email: businessInfo.email,
    priceRange: businessInfo.priceRange,
    image: `${businessInfo.url}/og-image.png`,
    sameAs: seoConfig.business.socialLinks,
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: seoConfig.business.openingHours.days,
      opens: seoConfig.business.openingHours.opens,
      closes: seoConfig.business.openingHours.closes,
    },
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Professional Services',
      itemListElement: seoConfig.services.map((service) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service.name,
          description: service.description,
        },
      })),
    },
  },

  WebSite: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: businessInfo.name,
    url: businessInfo.url,
    description: businessInfo.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${businessInfo.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  },

  Service: {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Professional Project Services',
    provider: {
      '@type': 'LocalBusiness',
      name: businessInfo.name,
      url: businessInfo.url,
    },
    description: businessInfo.description,
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
    serviceType: ['Web Development', 'Data Solutions', 'Technical Consulting'],
  },

  FAQPage: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What types of tasks do you handle?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "We help with all kinds of tasks: spreadsheets and data cleanup, document preparation, administrative work, computer help, and even website builds and updates. If you're not sure whether we can help, just ask!",
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need to be tech-savvy to work with you?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Not at all! We work with people of all backgrounds. Just describe what you need in your own words, and we'll take it from there. No technical terms needed.",
        },
      },
      {
        '@type': 'Question',
        name: 'How long does a typical task take?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Most projects are completed within 1-2 weeks, depending on scope. Quick tasks can be done in days, while bigger builds may take longer. We always provide a clear timeline upfront so you know what to expect.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much does it cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Pricing depends on complexity, not service type. Quick tasks across any service start at $50. Standard projects that need more steps run $150+. Bigger builds like full websites or complex data migrations start at $500+. We provide transparent quotes with no hidden fees.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I get started?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Simply reach out through our contact form and describe what you need help with. We'll review your request and get back to you within 2 business days with questions or a quote.",
        },
      },
      {
        '@type': 'Question',
        name: 'Can you help with one-time tasks or just ongoing work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Both! Whether you have a single task that needs attention or want regular ongoing support, we're here to help. Many clients start with a one-time task and come back when something else comes up.",
        },
      },
      {
        '@type': 'Question',
        name: 'What if I need changes after delivery?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "We want you to be completely satisfied. We include reasonable revisions as part of every task. If something isn't quite right, just let us know and we'll make it right.",
        },
      },
      {
        '@type': 'Question',
        name: 'How does payment work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We use a simple 50/50 structure: 50% deposit to start work, and the remaining 50% when you approve the final delivery. We accept major credit cards and other common payment methods. No surprises, just straightforward pricing.',
        },
      },
    ],
  },
};

export default function JsonLd({ type }: JsonLdProps) {
  const schema = schemas[type];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Export individual schema components for specific pages
export function LocalBusinessJsonLd() {
  return <JsonLd type="LocalBusiness" />;
}

export function WebSiteJsonLd() {
  return <JsonLd type="WebSite" />;
}

export function ServiceJsonLd() {
  return <JsonLd type="Service" />;
}

export function ProfessionalServiceJsonLd() {
  return <JsonLd type="ProfessionalService" />;
}
