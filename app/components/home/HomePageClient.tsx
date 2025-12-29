'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site.config';
import Button from '@/components/Button';
import ServiceCardWithModal from '@/components/ServiceCardWithModal';
import CircleBadge from '@/components/CircleBadge';
import { EditableSection } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import {
  formInputColors,
  titleColors,
  headingColors,
  groupHoverColors,
  accentColors,
  cardHoverColors,
  linkColors,
  linkHoverColors,
  linkFontWeight,
  focusRingClasses,
} from '@/lib/colors';
import type { HomePageContent } from '@/lib/page-content-types';

// ============================================================================
// Home Page Client Component - Renders home page with inline editing support
// ============================================================================
// What: Client-side wrapper for the home page that enables inline editing
// Why: Allows admins to click on sections and edit them directly
// How: Initializes the edit context with page content and wraps sections

interface HomePageClientProps {
  content: HomePageContent;
}

export default function HomePageClient({ content: initialContent }: HomePageClientProps) {
  const { setPageSlug, setPageContent, pageContent, getFieldValue } = useInlineEdit();

  // Initialize the edit context when the component mounts
  useEffect(() => {
    setPageSlug('home');
    setPageContent(initialContent as unknown as Record<string, unknown>);
  }, [initialContent, setPageSlug, setPageContent]);

  // Use pageContent from context if available (has pending edits), otherwise use initial
  const content = (pageContent as unknown as HomePageContent) || initialContent;

  // Helper to get a value that might have been edited
  const getValue = (sectionKey: string, fieldPath: string, fallback: unknown) => {
    const value = getFieldValue(sectionKey, fieldPath);
    return value !== undefined ? value : fallback;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Hero Section */}
      <EditableSection sectionKey="hero" label="Hero Section">
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
      </EditableSection>

      {/* Services Preview */}
      <EditableSection sectionKey="servicesTitle" label="Services Title">
        <div className="mb-10">
          <Link href="/services" className="block group">
            <h2
              className={`text-3xl font-bold ${headingColors.primary} mb-6 text-center ${groupHoverColors.blue} transition-colors`}
            >
              {getValue('servicesTitle', '_value', content.servicesTitle) as string}{' '}
              <span className="text-lg opacity-0 group-hover:opacity-100 transition-opacity">→</span>
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
          <p className={`text-center mt-4 ${formInputColors.helper}`}>
            <Link
              href="/services"
              className={`${linkColors.blue} ${linkHoverColors.blue} hover:underline ${linkFontWeight} ${focusRingClasses.blue} rounded`}
            >
              Not sure which service? Compare them all →
            </Link>
          </p>
        </div>
      </EditableSection>

      {/* Quick Consultations Section */}
      {content.consultations && (
        <EditableSection sectionKey="consultations" label="Consultations">
          <div className="mb-10">
            <Link href={content.consultations.linkHref} className="block group">
              <h2
                className={`text-3xl font-bold ${headingColors.primary} mb-2 text-center ${groupHoverColors.purple} transition-colors`}
              >
                {getValue('consultations', 'title', content.consultations.title) as string}{' '}
                <span className="text-lg opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </h2>
            </Link>
            <p className={`text-center ${formInputColors.helper} mb-6`}>
              {getValue('consultations', 'description', content.consultations.description) as string}
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {content.consultations.options.map((option, index) => (
                <Link
                  key={index}
                  href={content.consultations!.linkHref}
                  className={`block p-5 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-600 ${accentColors[option.color].hoverBorder} hover:shadow-lg transition-all duration-300 text-center ${focusRingClasses[option.color as keyof typeof focusRingClasses] || focusRingClasses.blue}`}
                >
                  <div className={`text-2xl font-bold ${accentColors[option.color].text} mb-1`}>
                    {option.price}
                  </div>
                  <div className={`font-semibold ${headingColors.primary} mb-1`}>{option.name}</div>
                  <div className={`text-sm ${formInputColors.helper} mb-2`}>{option.duration}</div>
                  <div className={`text-sm ${formInputColors.helper}`}>{option.description}</div>
                </Link>
              ))}
            </div>
            <p className={`text-center mt-4 ${formInputColors.helper} font-medium hover:underline`}>
              <Link href={content.consultations.linkHref} className={`${focusRingClasses.purple} rounded`}>
                {getValue('consultations', 'linkText', content.consultations.linkText) as string}
              </Link>
            </p>
          </div>
        </EditableSection>
      )}

      {/* How It Works Preview */}
      <EditableSection sectionKey="processPreview" label="Process Preview">
        <Link
          href="/how-it-works"
          className={`block mb-16 bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-400 dark:border-gray-500 transition-all duration-300 ${cardHoverColors.blue} hover:shadow-xl active:scale-98 group ${focusRingClasses.blue}`}
        >
          <h2 className={`text-3xl font-bold ${headingColors.primary} mb-6 text-center transition-colors`}>
            {getValue('processPreview', 'title', content.processPreview.title) as string}
          </h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            {content.processPreview.steps.map((step, index) => (
              <div key={index}>
                <div className="flex justify-center mb-3">
                  <CircleBadge number={step.number} color={step.color} size="md" />
                </div>
                <h3 className={`font-semibold ${headingColors.primary} mb-2`}>{step.title}</h3>
                <p className={`${formInputColors.helper} text-sm`}>{step.description}</p>
              </div>
            ))}
          </div>
          <p className={`text-center mt-6 ${formInputColors.helper} font-medium group-hover:underline`}>
            {getValue('processPreview', 'linkText', content.processPreview.linkText) as string}
          </p>
        </Link>
      </EditableSection>

      {/* CTA Section */}
      <EditableSection sectionKey="cta" label="Call to Action">
        <div className="text-center py-12 px-6 bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-900/20 dark:to-blue-900/20 rounded-2xl">
          <h2 className={`text-3xl font-bold ${headingColors.primary} mb-4`}>
            {getValue('cta', 'title', content.cta.title) as string}
          </h2>
          <p className={`text-lg ${formInputColors.helper} mb-6 max-w-2xl mx-auto`}>
            {getValue('cta', 'description', content.cta.description) as string}
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            {content.cta.buttons.map((button, index) => (
              <Button key={index} variant={button.variant} href={button.href}>
                {button.text}
              </Button>
            ))}
          </div>
          {content.cta.footer && (
            <p className={`${formInputColors.helper}`}>
              {getValue('cta', 'footer', content.cta.footer) as string}{' '}
              <Link
                href={content.cta.footerLinkHref}
                className={`${accentColors.purple.text} hover:opacity-80 hover:underline ${linkFontWeight}`}
              >
                {getValue('cta', 'footerLinkText', content.cta.footerLinkText) as string}
              </Link>
            </p>
          )}
          {content.cta.chatbotNote && (
            <p className={`text-sm ${formInputColors.helper} mt-2`}>
              {getValue('cta', 'chatbotNote', content.cta.chatbotNote) as string}
            </p>
          )}
        </div>
      </EditableSection>
    </div>
  );
}
