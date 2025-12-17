import Link from 'next/link';
import { siteConfig } from '@/config/site.config';
import Button from '@/components/Button';
import ServiceCardWithModal from '@/components/ServiceCardWithModal';
import CircleBadge from '@/components/CircleBadge';
import { getDefaultHomeContent } from '@/lib/default-page-content';
import { formInputColors, titleColors, headingColors, groupHoverColors, accentColors, cardHoverColors } from '@/lib/colors';
import type { HomePageContent } from '@/lib/page-content-types';

// ============================================================================
// Home Page - NeedThisDone Landing Page
// ============================================================================
// The main landing page that introduces the service and invites visitors
// to learn more or submit a project request.
// Hero tagline/description come from site.config.ts (developer-controlled).
// Other content is fetched from the database (if customized) or uses defaults.

// Force dynamic rendering - content comes from API
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'NeedThisDone - Get Your Projects Done Right',
  description: 'Professional project services - submit your project, get it done right.',
};

// ============================================================================
// Content Fetching
// ============================================================================

async function getContent(): Promise<HomePageContent> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
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
// Prefetch Shop Products (for instant navigation)
// ============================================================================
// Warms the cache so /shop loads instantly when users click "Book a Consultation"

async function prefetchProducts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    // Fire-and-forget fetch to warm Redis cache
    await fetch(`${baseUrl}/api/shop/products`, {
      next: { revalidate: 3600 }, // Match product cache TTL
    });
  } catch {
    // Silent fail - prefetch is optional optimization
  }
}

// ============================================================================
// Page Component
// ============================================================================

export default async function HomePage() {
  // Fetch content and prefetch products in parallel for speed
  const [content] = await Promise.all([
    getContent(),
    prefetchProducts(), // Warms cache for instant /shop navigation
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className={`text-5xl md:text-6xl font-bold tracking-tight ${titleColors.blue} mb-4`}>
            {siteConfig.project.tagline}
          </h1>
          <p className={`text-xl ${formInputColors.helper} leading-relaxed mb-6 max-w-3xl mx-auto`}>
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
            <h2 className={`text-3xl font-bold ${headingColors.primary} mb-6 text-center ${groupHoverColors.blue} transition-colors`}>
              {content.servicesTitle} <span className="text-lg opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </h2>
          </Link>
          <div className="grid lg:grid-cols-3 gap-6">
            {siteConfig.services.map((service, index) => (
              <ServiceCardWithModal
                key={index}
                title={service.title}
                tagline={service.tagline}
                description={service.description}
                details={service.details}
                color={service.color}
                variant="compact"
              />
            ))}
          </div>
          {/* Cross-page link to services comparison */}
          <p className={`text-center mt-4 ${formInputColors.helper}`}>
            <Link href="/services" className="hover:underline font-medium">
              Not sure which service? Compare them all →
            </Link>
          </p>
        </div>

        {/* Quick Consultations Section */}
        {content.consultations && (
          <div className="mb-10">
            <Link href={content.consultations.linkHref} className="block group">
              <h2 className={`text-3xl font-bold ${headingColors.primary} mb-2 text-center ${groupHoverColors.purple} transition-colors`}>
                {content.consultations.title} <span className="text-lg opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </h2>
            </Link>
            <p className={`text-center ${formInputColors.helper} mb-6`}>
              {content.consultations.description}
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {content.consultations.options.map((option, index) => (
                <Link
                  key={index}
                  href={content.consultations!.linkHref}
                  className={`block p-5 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-600 ${accentColors[option.color].hoverBorder} hover:shadow-lg transition-all duration-300 text-center`}
                >
                  <div className={`text-2xl font-bold ${accentColors[option.color].text} mb-1`}>
                    {option.price}
                  </div>
                  <div className={`font-semibold ${headingColors.primary} mb-1`}>
                    {option.name}
                  </div>
                  <div className={`text-sm ${formInputColors.helper} mb-2`}>
                    {option.duration}
                  </div>
                  <div className={`text-sm ${formInputColors.helper}`}>
                    {option.description}
                  </div>
                </Link>
              ))}
            </div>
            <p className={`text-center mt-4 ${formInputColors.helper} font-medium hover:underline`}>
              <Link href={content.consultations.linkHref}>
                {content.consultations.linkText}
              </Link>
            </p>
          </div>
        )}

        {/* How It Works Preview */}
        <Link
          href="/how-it-works"
          className={`block mb-16 bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-400 dark:border-gray-500 transition-all duration-300 ${cardHoverColors.blue} hover:shadow-xl active:scale-98 group`}
        >
          <h2 className={`text-3xl font-bold ${headingColors.primary} mb-6 text-center transition-colors`}>
            {content.processPreview.title}
          </h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            {content.processPreview.steps.map((step, index) => (
              <div key={index}>
                <div className="flex justify-center mb-3">
                  <CircleBadge number={step.number} color={step.color} size="md" />
                </div>
                <h3 className={`font-semibold ${headingColors.primary} mb-2`}>{step.title}</h3>
                <p className={`${formInputColors.helper} text-sm`}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
          <p className={`text-center mt-6 ${formInputColors.helper} font-medium group-hover:underline`}>
            {content.processPreview.linkText}
          </p>
        </Link>
      </div>
  );
}
