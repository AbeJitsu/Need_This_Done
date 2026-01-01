// ============================================================================
// JSON-LD Structured Data Component
// ============================================================================
// Provides schema.org structured data for rich search results.
// This helps search engines understand the content and display rich snippets.

interface JsonLdProps {
  type: 'LocalBusiness' | 'WebSite' | 'Service' | 'FAQPage';
}

// Base business information used across all schema types
const businessInfo = {
  name: 'NeedThisDone',
  url: 'https://needthisdone.com',
  description: 'Professional project services for businesses and individuals. From web development to data solutions, we help you get things done right the first time.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Orlando',
    addressRegion: 'FL',
    addressCountry: 'US',
  },
  email: 'hello@needthisdone.com',
  priceRange: '$$',
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
    sameAs: [
      'https://github.com/AbeJitsu',
      'https://linkedin.com/in/weneedthisdone',
    ],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '17:00',
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
    mainEntity: [],
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
