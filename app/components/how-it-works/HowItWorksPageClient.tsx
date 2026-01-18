'use client';

import Card from '@/components/Card';
import CircleBadge from '@/components/CircleBadge';
import Button from '@/components/Button';
import { EditableSection, EditableItem, SortableItemsWrapper } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import type { HowItWorksPageContent } from '@/lib/page-content-types';
import {
  formInputColors,
  titleColors,
  headingColors,
} from '@/lib/colors';
import { accent } from '@/lib/contrast';
import { CheckmarkCircle } from '@/components/ui/icons/CheckmarkCircle';
import { ArrowRight, Calendar } from 'lucide-react';

// ============================================================================
// How It Works Page Client - Universal Editing Version
// ============================================================================
// Uses universal content loading from InlineEditProvider.
// EditableSection/EditableItem wrappers provide click-to-select functionality.

interface HowItWorksPageClientProps {
  content: HowItWorksPageContent;
}

// Step colors for visual variety (matching homepage)
const stepColors = ['green', 'blue', 'purple', 'gold'] as const;

export default function HowItWorksPageClient({ content: initialContent }: HowItWorksPageClientProps) {
  // Use content from universal provider (auto-loaded by route)
  const { pageContent } = useInlineEdit();
  // Check that pageContent has expected structure before using it
  const hasValidContent = pageContent && 'steps' in pageContent && 'header' in pageContent;
  const content = hasValidContent ? (pageContent as unknown as HowItWorksPageContent) : initialContent;

  return (
    <div className="min-h-screen">
      {/* ================================================================
          Hero Section - Edge-to-edge on mobile, contained on desktop
          ================================================================ */}
      <section className="py-8 md:py-12">
        {/* Gradient container - full width on mobile, contained on desktop */}
        <div className="relative overflow-hidden md:max-w-5xl md:mx-auto md:rounded-2xl flex items-center justify-center min-h-[220px]">
          {/* Gradient orbs */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-gold-100 to-gold-100 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-green-100 to-emerald-100 blur-2xl" />

          {/* Text container - always padded */}
          <div className="relative z-10 text-center px-4 sm:px-6 md:px-8">
            <EditableSection sectionKey="header" label="Page Header">
              <h1 className={`text-4xl md:text-5xl font-bold tracking-tight mb-4 ${titleColors.green}`}>
                {content.header.title}
              </h1>
              <p className={`text-xl max-w-2xl mx-auto ${formInputColors.helper}`}>
                {content.header.description}
              </p>
            </EditableSection>
          </div>
        </div>
      </section>

      {/* ================================================================
          Trust Badges - Separate section below hero
          ================================================================ */}
      {content.trustBadges && content.trustBadges.length > 0 && (
        <section className="pb-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
            <EditableSection sectionKey="trustBadges" label="Trust Badges">
              <div className="bg-white rounded-2xl border border-gray-400 shadow-lg p-6">
                <SortableItemsWrapper
                  sectionKey="trustBadges"
                  arrayField="trustBadges"
                  itemIds={content.trustBadges.map((_, i) => `badge-${i}`)}
                  className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:justify-center sm:items-center sm:gap-8 md:gap-12"
                >
                  {content.trustBadges.map((badge, index) => (
                    <EditableItem
                      key={`badge-${index}`}
                      sectionKey="trustBadges"
                      arrayField="trustBadges"
                      index={index}
                      label={badge.text}
                      content={badge as unknown as Record<string, unknown>}
                      sortable
                      sortId={`badge-${index}`}
                    >
                      <div className="flex items-center gap-3">
                        <CheckmarkCircle color="green" size="lg" showBorder />
                        <div>
                          <p className={`font-semibold ${headingColors.primary}`}>
                            {badge.text}
                          </p>
                          <p className={`text-sm ${formInputColors.helper}`}>
                            {badge.description}
                          </p>
                        </div>
                      </div>
                    </EditableItem>
                  ))}
                </SortableItemsWrapper>
              </div>
            </EditableSection>
          </div>
        </section>
      )}

      {/* ================================================================
          Process Steps - Clean horizontal flow with subtle background
          ================================================================ */}
      <section className="py-16 bg-gray-50/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
          <EditableSection sectionKey="steps" label="Process Steps">
            <Card hoverColor="green" hoverEffect="glow">
              <h2 className={`text-2xl md:text-3xl font-bold text-center mb-8 ${headingColors.primary}`}>
                How It Works
              </h2>

              {/* Simple horizontal flow with circles and arrows */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-6 sm:gap-4">
                {content.steps.map((step, index) => (
                  <EditableItem
                    key={`step-${index}`}
                    sectionKey="steps"
                    arrayField="steps"
                    index={index}
                    label={step.title}
                    content={step as unknown as Record<string, unknown>}
                  >
                    <div className="flex items-center gap-4">
                      {/* Step circle and text */}
                      <div className="flex flex-col items-center text-center">
                        <CircleBadge number={step.number} color={stepColors[index % stepColors.length]} size="md" />
                        <h3 className={`mt-3 font-semibold ${titleColors[stepColors[index % stepColors.length]]}`}>
                          {step.title}
                        </h3>
                        <p className={`text-sm ${formInputColors.helper} mt-1 max-w-[140px]`}>
                          {step.description.split('.')[0]}
                        </p>
                      </div>

                      {/* Arrow connector (hidden on last step and mobile) */}
                      {index < content.steps.length - 1 && (
                        <ArrowRight className="hidden sm:block w-5 h-5 text-gray-300 flex-shrink-0" />
                      )}
                    </div>
                  </EditableItem>
                ))}
              </div>

              {/* CTA to get started */}
              <div className="text-center mt-8">
                <Button variant="green" href="/contact" size="md">
                  Get Started
                </Button>
              </div>
            </Card>
          </EditableSection>
        </div>
      </section>

      {/* ================================================================
          Timeline - Dark section for contrast (like homepage)
          ================================================================ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-20">
          <EditableSection sectionKey="timeline" label="Timeline">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 mb-6">
                <Calendar className={`w-8 h-8 ${accent.emerald.textOnDark}`} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {content.timeline.title}
              </h2>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
                {content.timeline.description}
              </p>

              {/* Trust indicators like homepage */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Most projects: 1-4 weeks
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Regular updates
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  No surprises
                </span>
              </div>
            </div>
          </EditableSection>
        </div>
      </section>

      {/* ================================================================
          Final CTA Section
          ================================================================ */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <EditableSection sectionKey="cta" label="Call to Action">
            <Card hoverColor="gold" hoverEffect="glow" className="text-center p-8 md:p-12">
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${headingColors.primary}`}>
                {content.cta.title}
              </h2>
              <p className={`text-lg mb-8 max-w-xl mx-auto ${formInputColors.helper}`}>
                {content.cta.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="gold" href="/contact" size="lg">
                  Get a Quote
                </Button>
                <Button variant="gray" href="/services" size="lg">
                  View Services
                </Button>
              </div>
            </Card>
          </EditableSection>
        </div>
      </section>
    </div>
  );
}
