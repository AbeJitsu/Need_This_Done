'use client';

import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { ServiceModalProvider } from '@/context/ServiceModalContext';
import ServiceDetailModal from '@/components/service-modal/ServiceDetailModal';
import ScenarioMatcher from '@/components/services/ScenarioMatcher';
import ServiceComparisonTable from '@/components/services/ServiceComparisonTable';
import ServiceDeepDive from '@/components/services/ServiceDeepDive';
import { EditableSection, EditableItem, SortableItemsWrapper } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import type { ServicesPageContent } from '@/lib/page-content-types';
import {
  accentColors,
  accentBorderWidth,
  AccentVariant,
} from '@/lib/colors';
import { Sparkles } from 'lucide-react';

// ============================================================================
// Services Page Client - Universal Editing Version
// ============================================================================
// Uses universal content loading from InlineEditProvider.
// EditableSection/EditableItem wrappers provide click-to-select functionality.

interface ServicesPageClientProps {
  content: ServicesPageContent;
}

export default function ServicesPageClient({ content: initialContent }: ServicesPageClientProps) {
  // Use content from universal provider (auto-loaded by route)
  const { pageContent } = useInlineEdit();
  // Check that pageContent has expected structure before using it
  const hasValidContent = pageContent && 'header' in pageContent && 'chooseYourPath' in pageContent;
  const content = hasValidContent ? (pageContent as unknown as ServicesPageContent) : initialContent;

  return (
    <ServiceModalProvider>
      <div className="min-h-screen">
        {/* ================================================================
            Hero Section - Edge-to-edge on mobile, contained on desktop
            ================================================================ */}
        <section className="py-8 md:py-12">
          {/* Gradient container - full width on mobile, contained on desktop */}
          <div className="relative overflow-hidden md:max-w-6xl md:mx-auto md:rounded-2xl py-12 md:py-16 flex items-center justify-center min-h-[200px]">
            {/* Gradient orbs */}
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-purple-100 to-purple-100 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-emerald-100 to-blue-100 blur-2xl" />

            {/* Text container - always padded */}
            <div className="relative z-10 text-center px-4 sm:px-6 md:px-8">
              <EditableSection sectionKey="header" label="Page Header">
                <h1 className={`text-4xl md:text-5xl font-bold tracking-tight ${accentColors.green.titleText} mb-4`}>
                  {content.header.title}
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  {content.header.description}
                </p>
              </EditableSection>
            </div>
          </div>
        </section>

        {/* ================================================================
            Main Content - White background sections
            ================================================================ */}
        <section className="py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
            {/* 2. Scenario Matcher - "Does this sound like you?" */}
            {content.scenarioMatcher && (
              <EditableSection sectionKey="scenarioMatcher" label="Scenario Matcher">
                <ScenarioMatcher
                  title={content.scenarioMatcher.title}
                  description={content.scenarioMatcher.description}
                  scenarios={content.scenarioMatcher.scenarios}
                />
              </EditableSection>
            )}

            {/* 3. Comparison Table - Side-by-side view */}
            {content.comparison && (
              <EditableSection sectionKey="comparison" label="Comparison Table">
                <ServiceComparisonTable
                  title={content.comparison.title}
                  description={content.comparison.description}
                  columns={content.comparison.columns}
                  rows={content.comparison.rows}
                />
              </EditableSection>
            )}

            {/* 4. Service Deep-Dives - Expandable details */}
            <ServiceDeepDive />
          </div>
        </section>

        {/* ================================================================
            Choose Your Path - Two clear options
            ================================================================ */}
        <section className="py-16 bg-gray-50/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
            {/* 5. Choose Your Path - Two clear options */}
        {content.chooseYourPath && (
          <EditableSection sectionKey="chooseYourPath" label="Choose Your Path">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {content.chooseYourPath.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {content.chooseYourPath.description}
              </p>
            </div>

            <SortableItemsWrapper
              sectionKey="chooseYourPath"
              arrayField="paths"
              itemIds={content.chooseYourPath.paths.map((_, i) => `path-${i}`)}
              className="grid md:grid-cols-2 gap-6 mb-10"
            >
              {content.chooseYourPath.paths.map((path, index) => (
                <EditableItem
                  key={`path-${index}`}
                  sectionKey="chooseYourPath"
                  arrayField="paths"
                  index={index}
                  label={path.title}
                  content={path as unknown as Record<string, unknown>}
                  sortable
                  sortId={`path-${index}`}
                >
                  <Card hoverColor={path.hoverColor} hoverEffect="lift">
                    <div className="p-8">
                      {/* Badge */}
                      <div className="mb-4">
                        <span className={`inline-block px-4 py-1 ${accentColors[path.hoverColor as AccentVariant].bg} ${accentColors[path.hoverColor as AccentVariant].text} ${accentColors[path.hoverColor as AccentVariant].border} ${accentBorderWidth} rounded-full text-sm font-semibold`}>
                          {path.badge}
                        </span>
                      </div>
                      {/* Title + Description */}
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                        {path.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {path.description}
                      </p>
                      {/* Bullets */}
                      <ul className="space-y-3 mb-6">
                        {path.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className={accentColors[path.hoverColor as AccentVariant].text} aria-hidden="true">✓</span>
                            <span className="text-gray-700 dark:text-gray-300">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                      {/* Button */}
                      <Button
                        variant={path.button.variant}
                        href={path.button.href}
                        size={path.button.size || 'lg'}
                        className="w-full"
                      >
                        {path.button.text}
                      </Button>
                    </div>
                  </Card>
                </EditableItem>
              ))}
            </SortableItemsWrapper>
          </EditableSection>
        )}
          </div>
        </section>

        {/* ================================================================
            Trust Signals - Dark section for contrast (like homepage)
            ================================================================ */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-20">
            <EditableSection sectionKey="expectations" label="What You Can Expect">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 mb-6">
                  <Sparkles className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {content.expectationsTitle}
                </h2>
              </div>

              <SortableItemsWrapper
                sectionKey="expectations"
                arrayField="expectations"
                itemIds={content.expectations.map((_, i) => `expect-${i}`)}
                className="grid md:grid-cols-2 gap-6"
              >
                {content.expectations.map((item, index) => {
                  const itemContent = (
                    <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-400 font-bold">✓</span>
                      </div>
                      <div>
                        <h3 className={`font-semibold text-white mb-1 ${
                          item.link ? 'group-hover:text-emerald-400 transition-colors' : ''
                        }`}>
                          {item.title}
                          {item.link && (
                            <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
                              {' '}
                              →
                            </span>
                          )}
                        </h3>
                        <p className="text-slate-300 text-sm">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );

                  if (item.link) {
                    return (
                      <EditableItem
                        key={`expect-${index}`}
                        sectionKey="expectations"
                        arrayField="expectations"
                        index={index}
                        label={item.title}
                        content={item as unknown as Record<string, unknown>}
                        sortable
                        sortId={`expect-${index}`}
                      >
                        <Link href={item.link.href} className="group block">
                          {itemContent}
                        </Link>
                      </EditableItem>
                    );
                  }

                  return (
                    <EditableItem
                      key={`expect-${index}`}
                      sectionKey="expectations"
                      arrayField="expectations"
                      index={index}
                      label={item.title}
                      content={item as unknown as Record<string, unknown>}
                      sortable
                      sortId={`expect-${index}`}
                    >
                      {itemContent}
                    </EditableItem>
                  );
                })}
              </SortableItemsWrapper>

              {/* Trust indicators like homepage */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Every project, every time
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  No surprises
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Built for trust
                </span>
              </div>
            </EditableSection>
          </div>
        </section>
      </div>

      {/* Modal for scenario clicks */}
      <ServiceDetailModal />
    </ServiceModalProvider>
  );
}
