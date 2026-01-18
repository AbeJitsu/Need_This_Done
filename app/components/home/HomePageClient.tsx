'use client';

import Button from '@/components/Button';
import ServiceCardWithModal from '@/components/ServiceCardWithModal';
import CircleBadge from '@/components/CircleBadge';
import { EditableSection, EditableItem, SortableItemsWrapper, Editable, EditableLink, EditableCard } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import GeometricAccents, { StepConnector } from '@/components/home/GeometricAccents';
import ServiceIcon, { getServiceIconType } from '@/components/home/ServiceIcons';
import {
  formInputColors,
  headingColors,
  groupHoverColors,
  accentColors,
  shadowClasses,
  linkColors,
  linkHoverColors,
  linkFontWeight,
  focusRingClasses,
  cardBgColors,
  cardBorderColors,
} from '@/lib/colors';
import { accentText } from '@/lib/contrast';
import type { HomePageContent } from '@/lib/page-content-types';

// ============================================================================
// Home Page Client - Enhanced Visual Design
// ============================================================================
// Features:
// - Geometric accent backgrounds for visual depth
// - Staggered entrance animations for sections and cards
// - Service icons for visual anchors
// - Process step connectors for visual flow
// - Refined typography hierarchy

interface HomePageClientProps {
  content: HomePageContent;
}

export default function HomePageClient({ content: initialContent }: HomePageClientProps) {
  // Use content from universal provider (auto-loaded by route)
  const { pageContent } = useInlineEdit();
  // Check that pageContent has expected structure before using it
  const hasValidContent = pageContent && 'hero' in pageContent && 'services' in pageContent;
  const content = hasValidContent ? (pageContent as unknown as HomePageContent) : initialContent;

  return (
    <div className="py-8">
      {/* Hero Section - edge-to-edge on mobile, contained on desktop */}
      <EditableSection sectionKey="hero" label="Hero Section">
        <div className="relative text-center mb-20 py-8 overflow-hidden md:max-w-6xl md:mx-auto md:rounded-2xl">
          {/* Geometric background accents */}
          <GeometricAccents variant="hero" />

          {/* Hero content - always padded */}
          <div className="relative z-10 px-4 sm:px-6 md:px-8">
            <Editable path="hero.title">
              <h1 className={`text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight ${accentColors.blue.titleText} mb-6 animate-scale-in`}>
                {content.hero.title}
              </h1>
            </Editable>
            <Editable path="hero.description">
              <p className={`text-xl md:text-2xl ${formInputColors.helper} leading-relaxed mb-8 max-w-3xl mx-auto animate-slide-up animate-delay-150`}>
                {content.hero.description}
              </p>
            </Editable>
            <SortableItemsWrapper
              sectionKey="hero"
              arrayField="buttons"
              itemIds={content.hero.buttons.map((_, i) => `hero-btn-${i}`)}
              className="flex flex-wrap gap-4 justify-center animate-slide-up animate-delay-300"
            >
              {content.hero.buttons.map((button, index) => (
                <EditableItem
                  key={`hero-btn-${index}`}
                  sectionKey="hero"
                  arrayField="buttons"
                  index={index}
                  label={button.text}
                  content={button as unknown as Record<string, unknown>}
                  sortable
                  sortId={`hero-btn-${index}`}
                >
                  <Editable
                    path={`hero.buttons.${index}.text`}
                    hrefPath={`hero.buttons.${index}.href`}
                    href={button.href}
                  >
                    <Button variant={button.variant} href={button.href}>
                      {button.text}
                    </Button>
                  </Editable>
                </EditableItem>
              ))}
            </SortableItemsWrapper>
          </div>
        </div>
      </EditableSection>

      {/* Rest of content in max-w container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Services Section - Enhanced with icons and animations */}
        <EditableSection sectionKey="services" label="Services">
        <div className="mb-16">
          {/* Section title */}
          <EditableLink
            href={content.services.linkHref}
            textPath="services.title"
            hrefPath="services.linkHref"
            className={`text-3xl font-bold ${headingColors.primary} mb-8 text-center ${groupHoverColors.green} transition-colors cursor-pointer block animate-slide-up`}
            linkClassName="group"
          >
            <h2 className="inline">
              {content.services.title}{' '}
              <span className="text-lg opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </h2>
          </EditableLink>

          {/* Service cards grid */}
          <SortableItemsWrapper
            sectionKey="services"
            arrayField="cards"
            itemIds={content.services.cards.map((_, i) => `service-${i}`)}
            className="grid lg:grid-cols-3 gap-6"
          >
            {content.services.cards.map((service, index) => {
              const delayClass = index === 0 ? 'animate-delay-100' : index === 1 ? 'animate-delay-200' : 'animate-delay-300';
              return (
                <EditableItem
                  key={`service-${index}`}
                  sectionKey="services"
                  arrayField="cards"
                  index={index}
                  label={service.title}
                  content={service as unknown as Record<string, unknown>}
                  sortable
                  sortId={`service-${index}`}
                >
                  <div className={`h-full animate-slide-up ${delayClass}`}>
                    <ServiceCardWithModal
                      title={service.title}
                      tagline={service.tagline}
                      description={service.description}
                      details={service.details}
                      color={service.color as 'blue' | 'purple' | 'green'}
                      variant="compact"
                      linkText={service.linkText}
                      editBasePath={`services.cards.${index}`}
                      cardIndex={index}
                      modal={service.modal}
                      icon={<ServiceIcon
                        type={getServiceIconType(service.title)}
                        color={service.color as 'blue' | 'purple' | 'green'}
                        size="sm"
                      />}
                    />
                  </div>
                </EditableItem>
              );
            })}
          </SortableItemsWrapper>

          {/* Compare all services link - clearly outside and below cards */}
          <div className="mt-6 text-center animate-slide-up animate-delay-400">
            <EditableLink
              href={content.services.linkHref}
              textPath="services.linkText"
              hrefPath="services.linkHref"
              className={`${linkColors.blue} ${linkHoverColors.blue} hover:underline ${linkFontWeight} ${focusRingClasses.blue} rounded`}
            >
              {content.services.linkText}
            </EditableLink>
          </div>
        </div>
      </EditableSection>

      {/* Consultation & Pricing Section - Premium Design */}
      {content.consultations && (
        <EditableSection sectionKey="consultations" label="Consultations">
          <div className="mb-16 animate-slide-up">
            {/* Main Consultation Card - Hero treatment */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 mb-8">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />

              <div className="relative px-8 py-16 md:py-20 text-center">
                {/* Eyebrow */}
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-blue-300 text-sm font-medium mb-6 backdrop-blur-sm">
                  Free • No Commitment
                </span>

                <Editable path="consultations.title">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                    {content.consultations.title}
                  </h2>
                </Editable>
                <Editable path="consultations.description">
                  <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                    {content.consultations.description}
                  </p>
                </Editable>

                {/* Primary CTA - Prominent white button */}
                <a
                  href={content.consultations.linkHref}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 font-semibold text-lg rounded-2xl hover:bg-slate-100 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-100"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Book a Free Consultation
                </a>

                {/* Trust indicators - refined */}
                <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm text-slate-400">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    15-30 minute call
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Get a clear next step
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    No pressure, ever
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing Preview - Clean, understated */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-400 dark:border-gray-700 p-8">
              <div className="text-center mb-8">
                <h3 className={`text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2`}>
                  If you already know what you need
                </h3>
                <p className={`text-2xl font-bold ${headingColors.primary}`}>
                  Transparent Pricing
                </p>
              </div>

              {/* Quick pricing cards */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {/* Websites */}
                <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-center">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">Websites</p>
                  <p className="text-gray-500 text-sm">From $500</p>
                </div>

                {/* Automation */}
                <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-center">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">Automation</p>
                  <p className="text-gray-500 text-sm">$150/workflow</p>
                </div>

                {/* Managed AI */}
                <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-center">
                  <div className="w-10 h-10 rounded-lg bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">Managed AI</p>
                  <p className="text-gray-500 text-sm">$500/month</p>
                </div>
              </div>

              {/* View pricing link */}
              <div className="text-center">
                <a
                  href="/pricing"
                  className={`inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium transition-colors`}
                >
                  View full pricing
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </EditableSection>
      )}

      {/* How It Works Preview - Enhanced with connectors */}
      <EditableSection sectionKey="processPreview" label="Process Preview">
        <EditableCard
          href="/how-it-works"
          className={`block mb-16 ${cardBgColors.base} rounded-2xl p-8 ${cardBorderColors.subtle} transition-all duration-300 ${accentColors.purple.cardHover} ${shadowClasses.cardHover} active:scale-98 group ${focusRingClasses.purple} animate-slide-up`}
        >
          <Editable path="processPreview.title">
            <h2 className={`text-3xl font-bold ${headingColors.primary} mb-8 text-center transition-colors`}>
              {content.processPreview.title}
            </h2>
          </Editable>
          {/* Process steps with connectors - uses flex for better connector alignment */}
          <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-4 md:gap-2">
            {content.processPreview.steps.map((step, index) => {
              const isLast = index === content.processPreview.steps.length - 1;
              const delayClass = `animate-delay-${(index + 1) * 100}`;
              return (
                <div key={`step-group-${index}`} className="flex flex-col md:flex-row items-center">
                  <SortableItemsWrapper
                    sectionKey="processPreview"
                    arrayField="steps"
                    itemIds={[`step-${index}`]}
                    className="flex-shrink-0"
                  >
                    <EditableItem
                      sectionKey="processPreview"
                      arrayField="steps"
                      index={index}
                      label={step.title}
                      content={step as unknown as Record<string, unknown>}
                      sortable
                      sortId={`step-${index}`}
                    >
                      <div className={`text-center w-36 animate-slide-up ${delayClass}`}>
                        <div className="flex justify-center mb-3">
                          <CircleBadge number={step.number} color={step.color} size="md" />
                        </div>
                        <Editable path={`processPreview.steps.${index}.title`}>
                          <h3 className={`font-semibold ${headingColors.primary} mb-2`}>{step.title}</h3>
                        </Editable>
                        <Editable path={`processPreview.steps.${index}.description`}>
                          <p className={`${formInputColors.helper} text-sm`}>{step.description}</p>
                        </Editable>
                      </div>
                    </EditableItem>
                  </SortableItemsWrapper>
                  {/* Step connector arrow */}
                  {!isLast && <StepConnector color={step.color as 'blue' | 'purple' | 'green' | 'gold'} />}
                </div>
              );
            })}
          </div>
          <Editable path="processPreview.linkText">
            <p className={`text-center mt-8 ${formInputColors.helper} font-medium group-hover:underline`}>
              {content.processPreview.linkText}
            </p>
          </Editable>
        </EditableCard>
      </EditableSection>

      {/* CTA Section - Enhanced with gradient background */}
      <EditableSection sectionKey="cta" label="Call to Action">
        <div className={`relative text-center py-14 px-8 rounded-3xl overflow-hidden animate-slide-up`}>
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-blue-50 to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800" />

          {/* Content */}
          <div className="relative z-10">
            <Editable path="cta.title">
              <h2 className={`text-3xl md:text-4xl font-bold ${headingColors.primary} mb-4`}>
                {content.cta.title}
              </h2>
            </Editable>
            <Editable path="cta.description">
              <p className={`text-lg ${formInputColors.helper} mb-8 max-w-2xl mx-auto`}>
                {content.cta.description}
              </p>
            </Editable>
            <SortableItemsWrapper
              sectionKey="cta"
              arrayField="buttons"
              itemIds={content.cta.buttons.map((_, i) => `cta-btn-${i}`)}
              className="flex flex-wrap gap-4 justify-center mb-6"
            >
              {content.cta.buttons.map((button, index) => (
                <EditableItem
                  key={`cta-btn-${index}`}
                  sectionKey="cta"
                  arrayField="buttons"
                  index={index}
                  label={button.text}
                  content={button as unknown as Record<string, unknown>}
                  sortable
                  sortId={`cta-btn-${index}`}
                >
                  <Editable
                    path={`cta.buttons.${index}.text`}
                    hrefPath={`cta.buttons.${index}.href`}
                    href={button.href}
                  >
                    <Button variant={button.variant} href={button.href}>
                      {button.text}
                    </Button>
                  </Editable>
                </EditableItem>
              ))}
            </SortableItemsWrapper>
            {content.cta.footer && (
              <p className={`${formInputColors.helper}`}>
                <Editable path="cta.footer">
                  <span>{content.cta.footer}</span>
                </Editable>{' '}
                <EditableLink
                  href={content.cta.footerLinkHref}
                  textPath="cta.footerLinkText"
                  hrefPath="cta.footerLinkHref"
                  className={`${accentColors.purple.text} hover:opacity-80 hover:underline ${linkFontWeight}`}
                >
                  {content.cta.footerLinkText}
                </EditableLink>
              </p>
            )}
            {content.cta.chatbotNote && (
              <Editable path="cta.chatbotNote">
                <p className={`text-sm ${formInputColors.helper} mt-2`}>
                  {content.cta.chatbotNote}
                </p>
              </Editable>
            )}
          </div>
        </div>
      </EditableSection>
      </div>{/* End max-w container */}
    </div>
  );
}
