import Link from 'next/link';
import { getServices } from '@/config/site.config';
import ServiceCard from '@/components/ServiceCard';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import CTASection from '@/components/CTASection';
import { getDefaultServicesContent } from '@/lib/default-page-content';
import type { ServicesPageContent } from '@/lib/page-content-types';
import { formInputColors, successCheckmarkColors } from '@/lib/colors';

// ============================================================================
// Services Page - What NeedThisDone Offers
// ============================================================================
// Lists the services available and explains what clients can expect.
// Services come from site.config.ts (developer-controlled).
// Other content is fetched from the database (if customized) or uses defaults.

export const metadata = {
  title: 'Services - NeedThisDone',
  description: 'We handle everyday tasks for busy professionals. Data, documents, admin work, and friendly tech help.',
};

// ============================================================================
// Content Fetching
// ============================================================================

async function getContent(): Promise<ServicesPageContent> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/page-content/services`, {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      return data.content as ServicesPageContent;
    }
  } catch (error) {
    console.error('Failed to fetch services content:', error);
  }

  return getDefaultServicesContent();
}

// ============================================================================
// Page Component
// ============================================================================

export default async function ServicesPage() {
  const content = await getContent();
  const services = getServices(); // Services always come from config

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">

        {/* Header */}
        <PageHeader
          title={content.header.title}
          description={content.header.description}
        />

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              tagline={service.tagline}
              description={service.description}
              details={service.details}
              color={service.color}
              variant="full"
            />
          ))}
        </div>

        {/* What to Expect */}
        <Card hoverColor="green" hoverEffect="glow" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            {content.expectationsTitle}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {content.expectations.map((item, index) => {
              const itemContent = (
                <>
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-200 flex items-center justify-center flex-shrink-0">
                    <span className={`${successCheckmarkColors.iconAlt} font-bold`}>✓</span>
                  </div>
                  <div>
                    <h3 className={`font-semibold text-gray-900 dark:text-gray-100 mb-1 ${item.link ? 'group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors' : ''}`}>
                      {item.title}
                      {item.link && <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity"> →</span>}
                    </h3>
                    <p className={`${formInputColors.helper} text-sm`}>
                      {item.description}
                    </p>
                  </div>
                </>
              );

              if (item.link) {
                return (
                  <Link key={index} href={item.link.href} className="flex gap-4 group">
                    {itemContent}
                  </Link>
                );
              }

              return (
                <div key={index} className="flex gap-4">
                  {itemContent}
                </div>
              );
            })}
          </div>
        </Card>

        {/* CTA */}
        <CTASection
          title={content.cta.title}
          description={content.cta.description}
          buttons={content.cta.buttons}
          hoverColor={content.cta.hoverColor || 'orange'}
        />
    </div>
  );
}
