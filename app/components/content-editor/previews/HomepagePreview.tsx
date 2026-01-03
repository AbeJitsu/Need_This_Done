import Link from 'next/link';
import Button from '@/components/Button';
import ServiceCard from '@/components/ServiceCard';
import CircleBadge from '@/components/CircleBadge';
import type { HomePageContent } from '@/lib/page-content-types';
import { cardBgColors } from '@/lib/colors';

// ============================================================================
// Homepage Preview Component
// ============================================================================
// What: Renders the Homepage with provided content (not fetched)
// Why: Used in the content editor to show live preview of changes
// How: Same structure as the actual Homepage, but takes content as props
// Note: All content now comes from the editable pageContent

interface HomepagePreviewProps {
  content: HomePageContent;
}

export default function HomepagePreview({ content }: HomepagePreviewProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-blue-600 dark:text-blue-400 mb-4">
          {content.hero.title}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-6 max-w-3xl mx-auto">
          {content.hero.description}
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
        <Link href={content.services.linkHref} className="block group">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {content.services.title} <span className="text-lg opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </h2>
        </Link>
        <div className="grid lg:grid-cols-3 gap-6">
          {content.services.cards.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              tagline={service.tagline}
              description={service.description}
              details={service.details}
              color={service.color as 'blue' | 'purple' | 'green'}
              variant="compact"
              href={content.services.linkHref}
            />
          ))}
        </div>
        <p className="text-center mt-4 text-gray-600 dark:text-gray-300">
          <Link
            href={content.services.linkHref}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            {content.services.linkText}
          </Link>
        </p>
      </div>

      {/* How It Works Preview */}
      <Link
        href="/how-it-works"
        className={`block mb-16 ${cardBgColors.base} rounded-xl p-6 border-2 border-gray-400 dark:border-gray-500 transition-all duration-300 hover:border-blue-400 hover:shadow-xl active:scale-98 dark:hover:border-blue-500 group`}
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
      <div className={`text-center ${cardBgColors.base} border-2 border-gray-400 dark:border-gray-500 rounded-xl p-8 shadow-lg hover:shadow-xl hover:border-gold-400 dark:hover:border-gold-500 transition-all duration-300`}>
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
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          {content.cta.footer}{' '}
          <Link href={content.cta.footerLinkHref} className="text-blue-600 dark:text-blue-400 hover:underline">
            {content.cta.footerLinkText}
          </Link>
        </p>
      </div>
    </div>
  );
}
