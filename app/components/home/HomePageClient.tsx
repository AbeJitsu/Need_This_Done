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
  neutralAccentBg,
  cardBgColors,
  cardBorderColors,
} from '@/lib/colors';
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Hero Section - Enhanced with geometric accents */}
      <EditableSection sectionKey="hero" label="Hero Section">
        <div className="relative text-center mb-20 py-8">
          {/* Geometric background accents */}
          <GeometricAccents variant="hero" />

          {/* Hero content with staggered animations */}
          <div className="relative z-10">
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

          {/* Service icons row */}
          <div className="grid lg:grid-cols-3 gap-6 mb-4">
            {content.services.cards.map((service, index) => {
              const delayClass = index === 0 ? 'animate-delay-100' : index === 1 ? 'animate-delay-200' : 'animate-delay-300';
              return (
                <div key={`icon-${index}`} className={`flex justify-center animate-slide-up ${delayClass}`}>
                  <ServiceIcon
                    type={getServiceIconType(service.title)}
                    color={service.color as 'blue' | 'purple' | 'green'}
                    size="lg"
                  />
                </div>
              );
            })}
          </div>

          {/* Service cards grid - equal heights */}
          <SortableItemsWrapper
            sectionKey="services"
            arrayField="cards"
            itemIds={content.services.cards.map((_, i) => `service-${i}`)}
            className="grid lg:grid-cols-3 gap-6"
          >
            {content.services.cards.map((service, index) => {
              const delayClass = index === 0 ? 'animate-delay-150' : index === 1 ? 'animate-delay-250' : 'animate-delay-350';
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

      {/* Consultation CTA - Refined single-action section */}
      {content.consultations && (
        <EditableSection sectionKey="consultations" label="Consultations">
          <div className="mb-16 animate-slide-up">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border border-gray-200 dark:border-gray-700">
              {/* Subtle decorative element */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100/50 to-transparent dark:from-blue-900/20 rounded-full -translate-y-1/2 translate-x-1/2" />

              <div className="relative px-8 py-12 md:py-16 text-center">
                <Editable path="consultations.title">
                  <h2 className={`text-3xl md:text-4xl font-bold ${headingColors.primary} mb-3`}>
                    {content.consultations.title}
                  </h2>
                </Editable>
                <Editable path="consultations.description">
                  <p className={`text-lg ${formInputColors.helper} mb-8 max-w-xl mx-auto`}>
                    {content.consultations.description}
                  </p>
                </Editable>

                {/* Single prominent CTA */}
                <Button variant="blue" href={content.consultations.linkHref} size="lg">
                  Book a Free Consultation
                </Button>

                {/* Trust indicators */}
                <div className={`mt-8 flex flex-wrap justify-center gap-6 text-sm ${formInputColors.helper}`}>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    No commitment required
                  </span>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    15-30 minute call
                  </span>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Get a clear next step
                  </span>
                </div>
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
    </div>
  );
}
