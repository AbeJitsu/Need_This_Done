'use client';

import Button from '@/components/Button';
import { EditableSection, EditableItem, Editable, EditableLink } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import ServiceIcon, { getServiceIconType } from '@/components/home/ServiceIcons';
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
  const { pageContent, isEditMode } = useInlineEdit();
  // Check that pageContent has expected structure before using it
  const hasValidContent = pageContent && 'hero' in pageContent && 'services' in pageContent;
  const content = hasValidContent ? (pageContent as unknown as HomePageContent) : initialContent;

  return (
    <div className="py-8">
      {/* Hero Section - Contained with rounded corners on desktop, edge-to-edge on mobile */}
      <EditableSection sectionKey="hero" label="Hero Section">
        {/* Gradient container - full width on mobile, contained+rounded on desktop */}
        <div className="relative overflow-hidden md:max-w-6xl md:mx-auto md:rounded-2xl py-12 md:py-16 mb-20">
          {/* Background gradients - responsive sizing for mobile visibility */}
          <div className="absolute -top-10 -left-10 w-[300px] h-[300px] md:w-[600px] md:h-[600px] md:-top-20 md:-left-20 bg-gradient-to-br from-emerald-200 to-emerald-100 blur-3xl opacity-70" />
          <div className="absolute -bottom-8 -right-8 w-[250px] h-[250px] md:w-[500px] md:h-[500px] md:-bottom-16 md:-right-16 bg-gradient-to-tl from-purple-200 to-purple-100 blur-3xl opacity-60" />

          {/* Hero content - left-aligned, always padded */}
          <div className="relative z-10 px-4 sm:px-6 md:px-8">
            <Editable path="hero.title">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-manrope font-extrabold tracking-tight mb-6 animate-scale-in leading-[1.1]">
                <span className="block bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                  WEBSITES.
                </span>
                <span className="block bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  AUTOMATION.
                </span>
                <span className="block bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                  AI.
                </span>
              </h1>
            </Editable>
            <Editable path="hero.description">
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-2xl animate-slide-up animate-delay-150">
                From your first website to fully automated operations.
              </p>
            </Editable>
            {/* Scroll indicator - functional smooth scroll */}
            <button
              onClick={(e) => {
                e.preventDefault();
                const servicesSection = document.getElementById('services-section');
                if (servicesSection) {
                  servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="mt-12 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer animate-slide-up animate-delay-300"
              aria-label="Scroll to services section"
            >
              <span>Scroll to explore</span>
              <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </EditableSection>

      {/* Rest of content in max-w container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Services Section - Asymmetric Hero Card Layout */}
        <EditableSection sectionKey="services" label="Services">
        <div id="services-section" className="mb-24 scroll-mt-24">
          {/* Section title - bold, left-aligned */}
          <h2 className="text-4xl md:text-5xl font-manrope font-extrabold text-gray-900 mb-12 animate-slide-up">
            WHAT WE BUILD
          </h2>

          {/* Service cards - asymmetric grid */}
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 lg:gap-8 mb-8">
            {/* Hero Card - Website Builds (First card, 60% width on desktop) */}
            {content.services.cards[0] && (
              <EditableItem
                sectionKey="services"
                arrayField="cards"
                index={0}
                label={content.services.cards[0].title}
                content={content.services.cards[0] as unknown as Record<string, unknown>}
              >
                <div className="group relative bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-8 lg:p-10 border-l-4 border-emerald-500 shadow-xl shadow-emerald-500/10 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-3 transition-all duration-300 animate-slide-up animate-delay-100">
                  {/* Large icon */}
                  <div className="w-16 h-16 rounded-xl bg-emerald-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <ServiceIcon
                      type={getServiceIconType(content.services.cards[0].title)}
                      color="green"
                      size="md"
                    />
                  </div>
                  {/* Title */}
                  <h3 className="text-3xl font-manrope font-bold text-emerald-600 mb-4">
                    {content.services.cards[0].title}
                  </h3>
                  {/* Description */}
                  <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                    {content.services.cards[0].description}
                  </p>
                  {/* Pricing hint */}
                  <p className="text-sm font-semibold text-gray-600 mb-6">
                    From $500 • 2-3 weeks
                  </p>
                  {/* CTA Button */}
                  <Button variant="green" className="shadow-lg">
                    {content.services.cards[0].linkText}
                  </Button>
                </div>
              </EditableItem>
            )}

            {/* Right column - stacked cards (40% width on desktop) */}
            <div className="flex flex-col gap-6">
              {/* Automation Setup Card */}
              {content.services.cards[1] && (
                <EditableItem
                  sectionKey="services"
                  arrayField="cards"
                  index={1}
                  label={content.services.cards[1].title}
                  content={content.services.cards[1] as unknown as Record<string, unknown>}
                >
                  <div className="group relative bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border-l-4 border-blue-500 shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 transition-all duration-300 animate-slide-up animate-delay-200">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <ServiceIcon
                        type={getServiceIconType(content.services.cards[1].title)}
                        color="blue"
                        size="sm"
                      />
                    </div>
                    <h3 className="text-2xl font-manrope font-bold text-blue-600 mb-3">
                      {content.services.cards[1].title}
                    </h3>
                    <p className="text-base text-gray-600 mb-4">
                      {content.services.cards[1].tagline}
                    </p>
                    <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      {content.services.cards[1].linkText}
                      <span>→</span>
                    </button>
                  </div>
                </EditableItem>
              )}

              {/* Managed AI Card */}
              {content.services.cards[2] && (
                <EditableItem
                  sectionKey="services"
                  arrayField="cards"
                  index={2}
                  label={content.services.cards[2].title}
                  content={content.services.cards[2] as unknown as Record<string, unknown>}
                >
                  <div className="group relative bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 border-l-4 border-purple-500 shadow-xl shadow-purple-500/10 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 transition-all duration-300 animate-slide-up animate-delay-300">
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <ServiceIcon
                        type={getServiceIconType(content.services.cards[2].title)}
                        color="purple"
                        size="sm"
                      />
                    </div>
                    <h3 className="text-2xl font-manrope font-bold text-purple-600 mb-3">
                      {content.services.cards[2].title}
                    </h3>
                    <p className="text-base text-gray-600 mb-4">
                      {content.services.cards[2].tagline}
                    </p>
                    <button className="text-purple-600 hover:text-purple-700 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      {content.services.cards[2].linkText}
                      <span>→</span>
                    </button>
                  </div>
                </EditableItem>
              )}
            </div>
          </div>

          {/* Compare all services link - bold treatment */}
          <div className="text-center animate-slide-up animate-delay-400">
            <EditableLink
              href={content.services.linkHref}
              textPath="services.linkText"
              hrefPath="services.linkHref"
              className="inline-flex items-center gap-2 text-xl font-manrope font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
            >
              <span>{content.services.linkText}</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </EditableLink>
          </div>
        </div>
      </EditableSection>

      {/* Consultation & Pricing Section - Split Decision */}
      {content.consultations && (
        <EditableSection sectionKey="consultations" label="Consultations">
          <div className="mb-24 animate-slide-up">
            {/* 50/50 Split Layout */}
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Left: Consultation Card - Warmer invitation */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 p-8 lg:p-10">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />

                <div className="relative">
                  <h2 className="text-3xl lg:text-4xl font-manrope font-extrabold text-white mb-6">
                    NOT SURE WHERE<br />TO START?
                  </h2>

                  <div className="space-y-2 mb-8 text-emerald-100 text-lg">
                    <p>15-minute call.</p>
                    <p>Zero pressure.</p>
                    <p>Clear path forward.</p>
                  </div>

                  <a
                    href={content.consultations.linkHref}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-white text-emerald-900 font-semibold text-lg rounded-xl hover:bg-emerald-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-100"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Book Free Call
                  </a>
                </div>
              </div>

              {/* Right: Pricing Quick Reference */}
              <div className="bg-white rounded-3xl border border-gray-200 p-8 lg:p-10">
                <h2 className="text-2xl font-manrope font-bold text-gray-900 mb-8">
                  KNOW WHAT YOU NEED?
                </h2>

                {/* Pricing list with colored borders */}
                <div className="space-y-4 mb-8">
                  {/* Websites */}
                  <div className="flex items-center gap-4 p-4 rounded-xl border-l-4 border-emerald-500 bg-gray-50">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">WEBSITES</p>
                      <p className="text-sm text-gray-600">From $500</p>
                    </div>
                  </div>

                  {/* Automation */}
                  <div className="flex items-center gap-4 p-4 rounded-xl border-l-4 border-blue-500 bg-gray-50">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">AUTOMATION</p>
                      <p className="text-sm text-gray-600">$150/workflow</p>
                    </div>
                  </div>

                  {/* Managed AI */}
                  <div className="flex items-center gap-4 p-4 rounded-xl border-l-4 border-purple-500 bg-gray-50">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">MANAGED AI</p>
                      <p className="text-sm text-gray-600">$500/month</p>
                    </div>
                  </div>
                </div>

                {/* View full pricing CTA */}
                <a
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors w-full justify-center"
                >
                  View Full Pricing
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </EditableSection>
      )}

      {/* How It Works - Timeline Flow */}
      <EditableSection sectionKey="processPreview" label="Process Preview">
        <div className="mb-24 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-manrope font-extrabold text-gray-900 mb-4">
            HOW IT WORKS
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Simple. Transparent. Fast.
          </p>

          {/* Timeline - horizontal on desktop, vertical on mobile */}
          <div className="bg-white rounded-3xl border border-gray-200 p-8 md:p-12 mb-8">
            {/* Desktop: Horizontal timeline */}
            <div className="hidden md:flex items-start justify-between gap-4 relative">
              {/* Timeline line - centered through the 48px circles (24px = center) */}
              <div className="absolute left-0 right-0 h-0.5 bg-gray-200" style={{ top: '1.5rem' }} />

              {content.processPreview.steps.map((step, index) => {
                const colorMap: Record<string, { bg: string; text: string }> = {
                  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600' },
                  blue: { bg: 'bg-blue-500', text: 'text-blue-600' },
                  purple: { bg: 'bg-purple-500', text: 'text-purple-600' },
                  gold: { bg: 'bg-gold-500', text: 'text-gold-600' },
                };
                const colors = colorMap[step.color] || { bg: 'bg-gray-500', text: 'text-gray-600' };

                return (
                  <div key={index} className="flex-1 text-center relative">
                    {/* Step number badge on timeline */}
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${colors.bg} text-white font-bold text-xl mb-4 relative z-10 ring-4 ring-white`}>
                      {step.number}
                    </div>
                    {/* Step content */}
                    <h3 className={`font-manrope font-bold ${colors.text} mb-2 text-lg`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Mobile: Vertical timeline */}
            <div className="md:hidden space-y-8">
              {content.processPreview.steps.map((step, index) => {
                const colorMap: Record<string, { bg: string; text: string; line: string }> = {
                  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', line: 'bg-emerald-200' },
                  blue: { bg: 'bg-blue-500', text: 'text-blue-600', line: 'bg-blue-200' },
                  purple: { bg: 'bg-purple-500', text: 'text-purple-600', line: 'bg-purple-200' },
                  gold: { bg: 'bg-gold-500', text: 'text-gold-600', line: 'bg-gold-200' },
                };
                const colors = colorMap[step.color] || { bg: 'bg-gray-500', text: 'text-gray-600', line: 'bg-gray-200' };

                const isLast = index === content.processPreview.steps.length - 1;

                return (
                  <div key={index} className="flex gap-4">
                    {/* Left: Badge and line */}
                    <div className="flex flex-col items-center">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full ${colors.bg} text-white font-bold text-xl flex-shrink-0`}>
                        {step.number}
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 h-full ${colors.line} mt-2`} />
                      )}
                    </div>
                    {/* Right: Content */}
                    <div className="flex-1 pt-2">
                      <h3 className={`font-manrope font-bold ${colors.text} mb-2 text-xl`}>
                        {step.title}
                      </h3>
                      <p className="text-base text-gray-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <a
              href="/how-it-works"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white font-semibold text-lg rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/25"
            >
              SEE THE FULL PROCESS
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </EditableSection>

      {/* CTA Section - Confident Close */}
      <EditableSection sectionKey="cta" label="Call to Action">
        <div className="relative py-16 px-8 rounded-3xl overflow-hidden animate-slide-up">
          {/* Gradient background - emerald invitation */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-white" />
          {/* Decorative glow orb */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-200/40 rounded-full blur-3xl" />

          {/* Content - left-aligned */}
          <div className="relative z-10 max-w-4xl">
            <h2 className="text-5xl md:text-6xl font-manrope font-extrabold text-emerald-900 mb-6">
              LET'S BUILD.
            </h2>
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl">
              Your project deserves expert execution.<br />
              Start with a quick form or free consultation.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <a
                href="/get-started"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold text-lg rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
              >
                START A PROJECT
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-purple-600 text-white font-semibold text-lg rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30"
              >
                BOOK FREE CALL
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </a>
            </div>

            {/* Chatbot note */}
            <p className="text-sm text-gray-500">
              Questions? Our chatbot is standing by. ↘
            </p>
          </div>
        </div>
      </EditableSection>
      </div>{/* End max-w container */}
    </div>
  );
}
