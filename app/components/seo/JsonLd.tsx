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
  },

  Service: {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'NeedThisDone Services',
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
    serviceType: ['Website Improvement', 'Managed AI Operations'],
  },

  FAQPage: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the Website Improvement?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'It is a $500 evidence-backed website review plus one mutually agreed contained fix, such as a page, component, accessibility, SEO, performance, or conversion correction.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does website payment work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'After the contained scope is confirmed, the Website Improvement uses manual invoices: $250 to begin and $250 after the agreed fix is delivered.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the Managed AI Operator?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'It is a proposal-based 30-day pilot operated privately by Abe and Andrea. The role prepares work and brings decisions for human review; clients receive weekly briefs rather than a dashboard to operate.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can the AI operator take external actions on its own?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. External messages, publishing, system changes, and spending require explicit human approval.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does the site audit certify accessibility or legal compliance?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The audit surfaces selected technical signals and may support one focused improvement. It is not legal advice or an accessibility certification.',
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

// Dynamic service schema for individual services
interface ServiceSchemaProps {
  serviceName: string;
  serviceDescription: string;
  serviceType: string;
  price?: string;
}

export function DynamicServiceJsonLd({ serviceName, serviceDescription, serviceType, price }: ServiceSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName,
    description: serviceDescription,
    serviceType: serviceType,
    provider: {
      '@type': 'ProfessionalService',
      name: seoConfig.siteName,
      url: seoConfig.baseUrl,
    },
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
    ...(price && {
      offers: {
        '@type': 'Offer',
        price: price.replace(/[^0-9]/g, ''),
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: price.replace(/[^0-9]/g, ''),
          priceCurrency: 'USD',
          description: price,
        },
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// All services schema for services page
export function AllServicesJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Professional Services',
    description: 'A contained website improvement and a human-led managed AI operator pilot.',
    itemListElement: seoConfig.services.map((service, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        name: service.name,
        description: service.description,
        serviceType: service.serviceType,
        provider: {
          '@type': 'ProfessionalService',
          name: seoConfig.siteName,
        },
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQPageJsonLd() {
  return <JsonLd type="FAQPage" />;
}

// Blog post structured data for individual articles
interface BlogPostingJsonLdProps {
  post: {
    title: string;
    excerpt?: string | null;
    meta_description?: string | null;
    featured_image?: string | null;
    published_at?: string | null;
    updated_at?: string | null;
    author_name?: string | null;
    tags?: string[] | null;
    slug: string;
  };
}

export function BlogPostingJsonLd({ post }: BlogPostingJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta_description || post.excerpt || '',
    ...(post.featured_image && { image: post.featured_image }),
    datePublished: post.published_at || undefined,
    ...(post.updated_at && { dateModified: post.updated_at }),
    author: {
      '@type': 'Person',
      name: post.author_name || 'Abe Reyes',
      url: `${seoConfig.baseUrl}/work`,
    },
    publisher: {
      '@type': 'Organization',
      name: seoConfig.siteName,
      url: seoConfig.baseUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${seoConfig.baseUrl}/blog/${post.slug}`,
    },
    ...(post.tags && post.tags.length > 0 && { keywords: post.tags.join(', ') }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
