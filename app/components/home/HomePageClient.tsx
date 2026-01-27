'use client';

import { EditableSection, EditableItem, Editable } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import ServiceIcon, { getServiceIconType } from '@/components/home/ServiceIcons';
import type { HomePageContent } from '@/lib/page-content-types';
import { scrollToId } from '@/lib/scroll-utils';

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
      {/* Hero Section - Contained with rounded corners on desktop, edge-to-edge on mobile */}
      <EditableSection sectionKey="hero" label="Hero Section">
        {/* Gradient container - full width on mobile, contained+rounded on desktop */}
        <div className="relative overflow-hidden md:max-w-6xl md:mx-auto md:rounded-2xl py-16 md:py-24 mb-20">
          {/* Background gradients - BJJ color orbs (green, blue, purple) */}
          {/* Green orb - bottom left */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-tr from-emerald-200 to-emerald-100 blur-2xl" />
          {/* Blue/Purple orb - top right */}
          <div className="absolute -top-32 -right-32 w-96 h-96 md:w-[28rem] md:h-[28rem] rounded-full bg-gradient-to-br from-blue-200 to-purple-200 blur-3xl" />
          {/* Small purple accent - right side */}
          <div className="absolute top-1/2 right-10 w-24 h-32 md:w-32 md:h-40 rounded-full bg-purple-200/80 blur-2xl" />

          {/* Hero content - CENTERED */}
          <div className="relative z-10 px-4 sm:px-6 md:px-8 text-center">
            <Editable path="hero.title">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-manrope font-extrabold tracking-tight mb-6 animate-scale-in leading-[1.1]">
                <span className="bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                  Websites.
                </span>{' '}
                <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Automation.
                </span>{' '}
                <span className="bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                  AI.
                </span>
              </h1>
            </Editable>
            <Editable path="hero.description">
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto animate-slide-up animate-delay-150">
                From your first website to fully automated operations. We build the technology that lets you focus on what matters.
              </p>
            </Editable>
            {/* Scroll indicator - respects prefers-reduced-motion */}
            <button
              onClick={(e) => {
                e.preventDefault();
                scrollToId('services-section', { block: 'start' });
              }}
              className="mt-10 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer animate-slide-up animate-delay-300"
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

          {/* Service cards - asymmetric grid with glassmorphism */}
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 lg:gap-8 mb-8">
            {/* Hero Card - Website Builds (Full modal content displayed) */}
            {content.services.cards[0] && content.services.cards[0].modal && (
              <EditableItem
                sectionKey="services"
                arrayField="cards"
                index={0}
                label={content.services.cards[0].title}
                content={content.services.cards[0] as unknown as Record<string, unknown>}
              >
                <div className="group relative bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 rounded-2xl p-8 lg:p-10 border border-emerald-100 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-slide-up animate-delay-100 backdrop-blur-sm">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-xl bg-emerald-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <ServiceIcon
                      type={getServiceIconType(content.services.cards[0].title)}
                      color="green"
                      size="md"
                    />
                  </div>

                  {/* Title */}
                  <h3 className="text-3xl font-manrope font-bold text-emerald-600 mb-3">
                    {content.services.cards[0].title}
                  </h3>

                  {/* Modal headline */}
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {content.services.cards[0].modal.headline}
                  </h4>

                  {/* Modal hook */}
                  <p className="text-gray-600 mb-6">
                    {content.services.cards[0].modal.hook}
                  </p>

                  {/* Bullet points */}
                  {content.services.cards[0].modal.bulletHeader && (
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        {content.services.cards[0].modal.bulletHeader}
                      </p>
                      <ul className="space-y-2">
                        {content.services.cards[0].modal.bulletPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5">
                              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-gray-700">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </EditableItem>
            )}

            {/* Right column - stacked cards with glassmorphism */}
            <div className="flex flex-col gap-6">
              {/* Automation Setup Card */}
              {content.services.cards[1] && content.services.cards[1].modal && (
                <EditableItem
                  sectionKey="services"
                  arrayField="cards"
                  index={1}
                  label={content.services.cards[1].title}
                  content={content.services.cards[1] as unknown as Record<string, unknown>}
                >
                  <div className="group relative bg-gradient-to-br from-blue-50 via-white to-blue-50/30 rounded-2xl p-6 border border-blue-100 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-slide-up animate-delay-200 backdrop-blur-sm">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <ServiceIcon
                        type={getServiceIconType(content.services.cards[1].title)}
                        color="blue"
                        size="sm"
                      />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-manrope font-bold text-blue-600 mb-2">
                      {content.services.cards[1].title}
                    </h3>

                    {/* Modal headline */}
                    <p className="text-base font-semibold text-gray-900 mb-2">
                      {content.services.cards[1].modal.headline}
                    </p>

                    {/* Modal hook */}
                    <p className="text-sm text-gray-600">
                      {content.services.cards[1].modal.hook}
                    </p>
                  </div>
                </EditableItem>
              )}

              {/* Managed AI Card */}
              {content.services.cards[2] && content.services.cards[2].modal && (
                <EditableItem
                  sectionKey="services"
                  arrayField="cards"
                  index={2}
                  label={content.services.cards[2].title}
                  content={content.services.cards[2] as unknown as Record<string, unknown>}
                >
                  <div className="group relative bg-gradient-to-br from-purple-50 via-white to-purple-50/30 rounded-2xl p-6 border border-purple-100 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-slide-up animate-delay-300 backdrop-blur-sm">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <ServiceIcon
                        type={getServiceIconType(content.services.cards[2].title)}
                        color="purple"
                        size="sm"
                      />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-manrope font-bold text-purple-600 mb-2">
                      {content.services.cards[2].title}
                    </h3>

                    {/* Modal headline */}
                    <p className="text-base font-semibold text-gray-900 mb-2">
                      {content.services.cards[2].modal.headline}
                    </p>

                    {/* Modal hook */}
                    <p className="text-sm text-gray-600">
                      {content.services.cards[2].modal.hook}
                    </p>
                  </div>
                </EditableItem>
              )}
            </div>
          </div>

          {/* Section CTA - View Pricing */}
          <div className="text-center mt-8">
            <a
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white font-semibold text-lg rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/25"
            >
              View Pricing
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

        </div>
      </EditableSection>

      {/* How It Works - Enhanced Full Section */}
      <EditableSection sectionKey="processPreview" label="Process Preview">
        <div id="how-it-works-section" className="mb-24 animate-slide-up scroll-mt-28">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-manrope font-extrabold text-gray-900 mb-4">
              HOW IT WORKS
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A simple process designed to get you from idea to launch without the headaches.
            </p>
          </div>

          {/* Trust Badges - BJJ Color Progression */}
          <div className="flex justify-center mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-gray-700">Human + AI</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-sm font-medium text-gray-700">Clear Updates</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-sm font-medium text-gray-700">No Surprises</span>
              </div>
            </div>
          </div>

          {/* Timeline Card with Enhanced Steps */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
            {/* Desktop: Horizontal timeline */}
            <div className="hidden md:block p-8 md:p-12">
              <div className="flex items-start justify-between gap-6 relative">
                {/* Timeline line */}
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-emerald-200 via-blue-200 via-purple-200 to-gold-200" style={{ top: '2rem' }} />

                {content.processPreview.steps.map((step, index) => {
                  // Force BJJ belt order: Green → Blue → Purple → Gold
                  const beltColors = [
                    { bg: 'bg-emerald-500', text: 'text-emerald-600', ring: 'ring-emerald-100', glow: 'shadow-emerald-200' },
                    { bg: 'bg-blue-500', text: 'text-blue-600', ring: 'ring-blue-100', glow: 'shadow-blue-200' },
                    { bg: 'bg-purple-500', text: 'text-purple-600', ring: 'ring-purple-100', glow: 'shadow-purple-200' },
                    { bg: 'bg-gold-500', text: 'text-gold-600', ring: 'ring-gold-100', glow: 'shadow-gold-200' },
                  ];
                  const colors = beltColors[index] || beltColors[0];

                  return (
                    <div key={index} className="flex-1 text-center relative group">
                      {/* Step number badge */}
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${colors.bg} text-white font-bold text-2xl mb-6 relative z-10 ring-4 ${colors.ring} shadow-lg ${colors.glow} transition-transform group-hover:scale-110`}>
                        {step.number}
                      </div>
                      {/* Step content */}
                      <h3 className={`font-manrope font-bold ${colors.text} mb-2 text-xl`}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-600 max-w-[180px] mx-auto">
                        {step.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile: Vertical timeline */}
            <div className="md:hidden p-6">
              <div className="space-y-0">
                {content.processPreview.steps.map((step, index) => {
                  // Force BJJ belt order
                  const beltColors = [
                    { bg: 'bg-emerald-500', text: 'text-emerald-600', line: 'bg-emerald-200' },
                    { bg: 'bg-blue-500', text: 'text-blue-600', line: 'bg-blue-200' },
                    { bg: 'bg-purple-500', text: 'text-purple-600', line: 'bg-purple-200' },
                    { bg: 'bg-gold-500', text: 'text-gold-600', line: 'bg-gold-200' },
                  ];
                  const colors = beltColors[index] || beltColors[0];
                  const isLast = index === content.processPreview.steps.length - 1;

                  return (
                    <div key={index} className="flex gap-4">
                      {/* Left: Badge and line */}
                      <div className="flex flex-col items-center">
                        <div className={`flex items-center justify-center w-14 h-14 rounded-full ${colors.bg} text-white font-bold text-xl flex-shrink-0 shadow-lg`}>
                          {step.number}
                        </div>
                        {!isLast && (
                          <div className={`w-1 flex-1 ${colors.line} my-2 rounded-full min-h-[3rem]`} />
                        )}
                      </div>
                      {/* Right: Content */}
                      <div className="flex-1 pt-3 pb-6">
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

            {/* Timeline Footer - Bold dark section */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-12 md:py-16">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 max-w-5xl mx-auto">
                {/* Timeline indicator */}
                <div className="text-center group">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 mb-5 shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                    <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
                    </svg>
                  </div>
                  <p className="text-3xl font-extrabold text-white mb-2">1-4 Weeks</p>
                  <p className="text-slate-300 text-base">Most projects completed</p>
                </div>

                {/* Communication */}
                <div className="text-center group">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 mb-5 shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                    <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
                    </svg>
                  </div>
                  <p className="text-3xl font-extrabold text-white mb-2">Regular Updates</p>
                  <p className="text-slate-300 text-base">You're never in the dark</p>
                </div>

                {/* Pricing */}
                <div className="text-center group">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 mb-5 shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
                    <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <p className="text-3xl font-extrabold text-white mb-2">No Surprises</p>
                  <p className="text-slate-300 text-base">Transparent pricing upfront</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA - Blue (2nd in progression, since Green was used for View Pricing) */}
          <div className="text-center mt-10">
            <a
              href="/get-started"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold text-lg rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
            >
              Start Your Project
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </EditableSection>

      {/* CTA Section - Confident Close */}
      <EditableSection sectionKey="cta" label="Call to Action">
        <div className="relative py-16 px-8 rounded-3xl overflow-hidden animate-slide-up">
          {/* Gradient background - purple invitation */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-white" />
          {/* Decorative glow orb */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-200/40 rounded-full blur-3xl" />

          {/* Content - centered */}
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-manrope font-extrabold text-purple-900 mb-6">
              LET'S TALK.
            </h2>
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Not sure where to start? Let's figure it out together.<br />
              Book a free 30-minute strategy call.
            </p>

            {/* Single CTA Button - Purple (3rd in BJJ order) */}
            <div className="mb-6">
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-purple-600 text-white font-semibold text-xl rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5"
              >
                BOOK A FREE CALL
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </a>
            </div>

            {/* Chatbot link */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-chatbot'))}
              className="text-sm text-purple-600 hover:text-purple-700 hover:underline transition-colors cursor-pointer"
            >
              Or ask our chatbot anything →
            </button>
          </div>
        </div>
      </EditableSection>
      </div>{/* End max-w container */}
    </div>
  );
}
