import Link from 'next/link';
import { siteConfig } from '@/config/site.config';
import Button from '@/components/Button';
import ServiceCard from '@/components/ServiceCard';
import CircleBadge from '@/components/CircleBadge';
import { getDefaultHomeContent } from '@/lib/default-page-content';
import { formInputColors, titleColors } from '@/lib/colors';
import type { HomePageContent } from '@/lib/page-content-types';

// ============================================================================
// Home Page - NeedThisDone Landing Page
// ============================================================================
// The main landing page that introduces the service and invites visitors
// to learn more or submit a project request.
// Hero tagline/description come from site.config.ts (developer-controlled).
// Other content is fetched from the database (if customized) or uses defaults.

export const metadata = {
  title: 'NeedThisDone - Get Your Projects Done Right',
  description: 'Professional project services - submit your project, get it done right.',
};

// ============================================================================
// Content Fetching
// ============================================================================

async function getContent(): Promise<HomePageContent> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/page-content/home`, {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      return data.content as HomePageContent;
    }
  } catch (error) {
    console.error('Failed to fetch home content:', error);
  }

  return getDefaultHomeContent();
}

// ============================================================================
// Page Component
// ============================================================================

export default async function HomePage() {
  const content = await getContent();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-blue-600 dark:text-blue-400 mb-4">
            {siteConfig.project.tagline}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-6 max-w-3xl mx-auto">
            {siteConfig.project.description}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {content.hero.buttons.map((button, index) => (
              <Button key={index} variant={button.variant} href={button.href}>
                {button.text}
              </Button>
            ))}
          </div>
        </div>

        {/* Services Preview */}
        <div className="mb-10">
          <Link href="/services" className="block group">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {content.servicesTitle} <span className="text-lg opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </h2>
          </Link>
          <div className="grid lg:grid-cols-3 gap-6">
            {siteConfig.services.map((service, index) => (
              <ServiceCard
                key={index}
                title={service.title}
                tagline={service.tagline}
                description={service.description}
                details={service.details}
                color={service.color}
                variant="compact"
                href="/services"
              />
            ))}
          </div>
        </div>

        {/* How It Works Preview */}
        <Link
          href="/how-it-works"
          className="block mb-16 bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-400 dark:border-gray-500 transition-all duration-300 hover:border-blue-400 hover:shadow-xl active:scale-98 dark:hover:border-blue-500 group"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center transition-colors">
            {content.processPreview.title}
          </h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            {content.processPreview.steps.map((step, index) => (
              <div key={index}>
                <div className="flex justify-center mb-3">
                  <CircleBadge number={step.number} color={step.color} size="md" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
          <p className="text-center mt-6 text-gray-700 dark:text-gray-300 font-medium group-hover:underline">
            {content.processPreview.linkText}
          </p>
        </Link>

        {/* CTA Section */}
        <div className="text-center bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500 rounded-xl p-8 shadow-lg hover:shadow-xl hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-300">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {content.cta.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {content.cta.description}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {content.cta.buttons.map((button, index) => (
              <Button key={index} variant={button.variant} href={button.href}>
                {button.text}
              </Button>
            ))}
          </div>
          <p className={`mt-6 text-sm ${formInputColors.helper}`}>
            {content.cta.footer}{' '}
            <Link href={content.cta.footerLinkHref} className={`${titleColors.blue} hover:underline`}>
              {content.cta.footerLinkText}
            </Link>
          </p>
        </div>
      </div>
  );
}
