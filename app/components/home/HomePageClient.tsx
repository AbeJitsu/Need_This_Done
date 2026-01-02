'use client';

import Link from 'next/link';
import Button from '@/components/Button';
import ServiceCardWithModal from '@/components/ServiceCardWithModal';
import CircleBadge from '@/components/CircleBadge';
import { EditableSection, EditableItem, SortableItemsWrapper, Editable } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import {
  formInputColors,
  titleColors,
  headingColors,
  groupHoverColors,
  accentColors,
  cardHoverColors,
  shadowClasses,
  linkColors,
  linkHoverColors,
  linkFontWeight,
  focusRingClasses,
  neutralAccentBg,
} from '@/lib/colors';
import type { HomePageContent } from '@/lib/page-content-types';

// ============================================================================
// Home Page Client - Universal Editing Version
// ============================================================================
// Uses universal content loading from InlineEditProvider.
// EditableSection/EditableItem wrappers provide click-to-select functionality.

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
      {/* Hero Section */}
      <EditableSection sectionKey="hero" label="Hero Section">
        <div className="text-center mb-16">
          <Editable path="hero.title">
            <h1 className={`text-5xl md:text-6xl font-bold tracking-tight ${titleColors.blue} mb-4`}>
              {content.hero.title}
            </h1>
          </Editable>
          <Editable path="hero.description">
            <p className={`text-xl ${formInputColors.helper} leading-relaxed mb-6 max-w-3xl mx-auto`}>
              {content.hero.description}
            </p>
          </Editable>
          <SortableItemsWrapper
            sectionKey="hero"
            arrayField="buttons"
            itemIds={content.hero.buttons.map((_, i) => `hero-btn-${i}`)}
            className="flex flex-wrap gap-4 justify-center"
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
      </EditableSection>

      {/* Services Section */}
      <EditableSection sectionKey="services" label="Services">
        <div className="mb-10">
          <Editable path="services.title">
            <h2
              className={`text-3xl font-bold ${headingColors.primary} mb-6 text-center ${groupHoverColors.green} transition-colors cursor-pointer`}
            >
              <Link href={content.services.linkHref} className="group">
                {content.services.title}{' '}
                <span className="text-lg opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </Link>
            </h2>
          </Editable>
          <SortableItemsWrapper
            sectionKey="services"
            arrayField="cards"
            itemIds={content.services.cards.map((_, i) => `service-${i}`)}
            className="grid lg:grid-cols-3 gap-6"
          >
            {content.services.cards.map((service, index) => (
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
              </EditableItem>
            ))}
          </SortableItemsWrapper>
          <p className={`text-center mt-4 ${formInputColors.helper}`}>
            <Link
              href={content.services.linkHref}
              className={`${linkColors.blue} ${linkHoverColors.blue} hover:underline ${linkFontWeight} ${focusRingClasses.blue} rounded`}
            >
              {content.services.linkText}
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
                className={`text-3xl font-bold ${headingColors.primary} mb-2 text-center ${groupHoverColors.blue} transition-colors`}
              >
                {content.consultations.title}{' '}
                <span className="text-lg opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </h2>
            </Link>
            <p className={`text-center ${formInputColors.helper} mb-6`}>
              {content.consultations.description}
            </p>
            <SortableItemsWrapper
              sectionKey="consultations"
              arrayField="options"
              itemIds={content.consultations.options.map((_, i) => `consult-${i}`)}
              className="grid md:grid-cols-3 gap-4"
            >
              {content.consultations.options.map((option, index) => (
                <EditableItem
                  key={`consult-${index}`}
                  sectionKey="consultations"
                  arrayField="options"
                  index={index}
                  label={option.name}
                  content={option as unknown as Record<string, unknown>}
                  sortable
                  sortId={`consult-${index}`}
                >
                  <Link
                    href={content.consultations!.linkHref}
                    className={`block p-5 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-600 ${accentColors[option.color].hoverBorder} ${shadowClasses.cardHover} transition-all duration-300 text-center ${focusRingClasses[option.color as keyof typeof focusRingClasses] || focusRingClasses.blue}`}
                  >
                    <div className={`text-2xl font-bold ${accentColors[option.color].text} mb-1`}>
                      {option.price}
                    </div>
                    <div className={`font-semibold ${headingColors.primary} mb-1`}>{option.name}</div>
                    <div className={`text-sm ${formInputColors.helper} mb-2`}>{option.duration}</div>
                    <div className={`text-sm ${formInputColors.helper}`}>{option.description}</div>
                  </Link>
                </EditableItem>
              ))}
            </SortableItemsWrapper>
            <p className={`text-center mt-4 ${formInputColors.helper} font-medium hover:underline`}>
              <Link href={content.consultations.linkHref} className={`${focusRingClasses.purple} rounded`}>
                {content.consultations.linkText}
              </Link>
            </p>
          </div>
        </EditableSection>
      )}

      {/* How It Works Preview */}
      <EditableSection sectionKey="processPreview" label="Process Preview">
        <Link
          href="/how-it-works"
          className={`block mb-16 bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-400 dark:border-gray-500 transition-all duration-300 ${cardHoverColors.purple} ${shadowClasses.cardHover} active:scale-98 group ${focusRingClasses.purple}`}
        >
          <h2 className={`text-3xl font-bold ${headingColors.primary} mb-6 text-center transition-colors`}>
            {content.processPreview.title}
          </h2>
          <SortableItemsWrapper
            sectionKey="processPreview"
            arrayField="steps"
            itemIds={content.processPreview.steps.map((_, i) => `step-${i}`)}
            className="grid md:grid-cols-4 gap-6 text-center"
          >
            {content.processPreview.steps.map((step, index) => (
              <EditableItem
                key={`step-${index}`}
                sectionKey="processPreview"
                arrayField="steps"
                index={index}
                label={step.title}
                content={step as unknown as Record<string, unknown>}
                sortable
                sortId={`step-${index}`}
              >
                <div>
                  <div className="flex justify-center mb-3">
                    <CircleBadge number={step.number} color={step.color} size="md" />
                  </div>
                  <h3 className={`font-semibold ${headingColors.primary} mb-2`}>{step.title}</h3>
                  <p className={`${formInputColors.helper} text-sm`}>{step.description}</p>
                </div>
              </EditableItem>
            ))}
          </SortableItemsWrapper>
          <p className={`text-center mt-6 ${formInputColors.helper} font-medium group-hover:underline`}>
            {content.processPreview.linkText}
          </p>
        </Link>
      </EditableSection>

      {/* CTA Section */}
      <EditableSection sectionKey="cta" label="Call to Action">
        <div className={`text-center py-12 px-6 ${neutralAccentBg.gray} rounded-2xl`}>
          <Editable path="cta.title">
            <h2 className={`text-3xl font-bold ${headingColors.primary} mb-4`}>
              {content.cta.title}
            </h2>
          </Editable>
          <Editable path="cta.description">
            <p className={`text-lg ${formInputColors.helper} mb-6 max-w-2xl mx-auto`}>
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
              {content.cta.footer}{' '}
              <Link
                href={content.cta.footerLinkHref}
                className={`${accentColors.purple.text} hover:opacity-80 hover:underline ${linkFontWeight}`}
              >
                {content.cta.footerLinkText}
              </Link>
            </p>
          )}
          {content.cta.chatbotNote && (
            <p className={`text-sm ${formInputColors.helper} mt-2`}>
              {content.cta.chatbotNote}
            </p>
          )}
        </div>
      </EditableSection>
    </div>
  );
}
