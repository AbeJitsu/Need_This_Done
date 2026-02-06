'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { EditableSection, EditableItem, Editable } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import Button from '@/components/Button';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion';
import { Hero } from '@/components/home/sections/Hero';
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
  const router = useRouter();
  // Use content from universal provider (auto-loaded by route)
  const { pageContent } = useInlineEdit();
  // Check that pageContent has expected structure before using it
  const hasValidContent = pageContent && 'hero' in pageContent && 'services' in pageContent;
  const content = hasValidContent ? (pageContent as unknown as HomePageContent) : initialContent;

  return (
    <div>
      {/* New Hero Section */}
      <Hero />

      {/* Legacy Hero Section - Temporarily disabled to use new Hero */}
      {false && (<EditableSection sectionKey="hero" label="Hero Section">
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
            <FadeIn direction="none" triggerOnScroll={false}>
              <Editable path="hero.title">
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-manrope font-extrabold tracking-tight mb-6 leading-[1.1]">
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
            </FadeIn>
            <FadeIn direction="up" delay={0.15} triggerOnScroll={false}>
              <Editable path="hero.description">
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto">
                  From your first website to fully automated operations. We build the technology that lets you focus on what matters.
                </p>
              </Editable>
            </FadeIn>
            {/* Scroll indicator - functional smooth scroll */}
            <FadeIn direction="up" delay={0.3} triggerOnScroll={false}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  const servicesSection = document.getElementById('services-section');
                  if (servicesSection) {
                    servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="mt-10 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                aria-label="Scroll to services section"
              >
                <span>Scroll to explore</span>
                <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </FadeIn>
          </div>
        </div>
      </EditableSection>
      )}

      {/* Rest of content in max-w container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Services Section - Bold Asymmetric Cards */}
        <EditableSection sectionKey="services" label="Services">
        <div id="services-section" className="mb-24 scroll-mt-24">
          {/* Section header — editorial style with accent line */}
          <FadeIn direction="up">
            <div className="mb-14">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-1 w-12 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-full" />
                <span className="text-sm font-semibold uppercase tracking-widest text-gray-500">Our Services</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-[0.95]">
                What we build
              </h2>
            </div>
          </FadeIn>

          {/* Service cards — asymmetric grid */}
          <StaggerContainer className="grid lg:grid-cols-[1.4fr_1fr] gap-5 lg:gap-6 mb-10">
            {/* Hero Card — Website Builds */}
            {content.services.cards[0] && content.services.cards[0].modal && (
              <StaggerItem>
              <EditableItem
                sectionKey="services"
                arrayField="cards"
                index={0}
                label={content.services.cards[0].title}
                content={content.services.cards[0] as unknown as Record<string, unknown>}
              >
                <motion.article
                  className="group relative h-full rounded-3xl p-8 lg:p-10 cursor-pointer overflow-hidden bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
                  tabIndex={0}
                  role="button"
                  aria-labelledby="service-card-0-title"
                  onClick={() => router.push('/pricing')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push('/pricing');
                    }
                  }}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 opacity-100" />
                  {/* Decorative glow */}
                  <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-emerald-400/20 blur-3xl" />
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-emerald-300/15 blur-2xl" />

                  <div className="relative z-10">
                    {/* Number badge */}
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/15 text-white/80 text-sm font-bold mb-6 backdrop-blur-sm border border-white/10">
                      01
                    </div>

                    {/* Title */}
                    <h3 id="service-card-0-title" className="text-3xl lg:text-4xl font-black text-white mb-3 tracking-tight">
                      {content.services.cards[0].title}
                    </h3>

                    {/* Headline */}
                    <p className="text-lg font-semibold text-white/90 mb-2">
                      {content.services.cards[0].modal.headline}
                    </p>

                    {/* Hook */}
                    <p className="text-emerald-200 leading-relaxed max-w-md">
                      {content.services.cards[0].modal.hook}
                    </p>

                  </div>
                </motion.article>
              </EditableItem>
              </StaggerItem>
            )}

            {/* Right column — stacked cards */}
            <div className="flex flex-col gap-5 lg:gap-6">
              {/* Automation Setup Card */}
              {content.services.cards[1] && content.services.cards[1].modal && (
                <StaggerItem>
                <EditableItem
                  sectionKey="services"
                  arrayField="cards"
                  index={1}
                  label={content.services.cards[1].title}
                  content={content.services.cards[1] as unknown as Record<string, unknown>}
                >
                  <motion.article
                    className="group relative h-full rounded-3xl p-7 cursor-pointer overflow-hidden bg-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                    tabIndex={0}
                    role="button"
                    aria-labelledby="service-card-1-title"
                    onClick={() => router.push('/pricing')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        router.push('/pricing');
                      }
                    }}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    {/* Blue accent glow */}
                    <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-blue-500/20 blur-3xl" />
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-blue-400/10 blur-2xl" />

                    <div className="relative z-10">
                      {/* Number badge */}
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold mb-5 border border-blue-500/20">
                        02
                      </div>

                      {/* Title */}
                      <h3 id="service-card-1-title" className="text-2xl font-black text-white mb-2 tracking-tight">
                        {content.services.cards[1].title}
                      </h3>

                      {/* Headline */}
                      <p className="text-base font-semibold text-blue-200 mb-2">
                        {content.services.cards[1].modal.headline}
                      </p>

                      {/* Hook */}
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {content.services.cards[1].modal.hook}
                      </p>

                    </div>
                  </motion.article>
                </EditableItem>
                </StaggerItem>
              )}

              {/* Managed AI Card */}
              {content.services.cards[2] && content.services.cards[2].modal && (
                <StaggerItem>
                <EditableItem
                  sectionKey="services"
                  arrayField="cards"
                  index={2}
                  label={content.services.cards[2].title}
                  content={content.services.cards[2] as unknown as Record<string, unknown>}
                >
                  <motion.article
                    className="group relative h-full rounded-3xl p-7 cursor-pointer overflow-hidden bg-gradient-to-br from-purple-700 to-purple-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-400 focus-visible:ring-offset-2"
                    tabIndex={0}
                    role="button"
                    aria-labelledby="service-card-2-title"
                    onClick={() => router.push('/pricing')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        router.push('/pricing');
                      }
                    }}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    {/* Purple accent glow */}
                    <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-purple-400/20 blur-3xl" />
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-purple-300/15 blur-2xl" />

                    <div className="relative z-10">
                      {/* Number badge */}
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/15 text-purple-200 text-sm font-bold mb-5 border border-white/10">
                        03
                      </div>

                      {/* Title */}
                      <h3 id="service-card-2-title" className="text-2xl font-black text-white mb-2 tracking-tight">
                        {content.services.cards[2].title}
                      </h3>

                      {/* Headline */}
                      <p className="text-base font-semibold text-purple-200 mb-2">
                        {content.services.cards[2].modal.headline}
                      </p>

                      {/* Hook */}
                      <p className="text-sm text-purple-200 leading-relaxed">
                        {content.services.cards[2].modal.hook}
                      </p>

                    </div>
                  </motion.article>
                </EditableItem>
                </StaggerItem>
              )}
            </div>
          </StaggerContainer>

          {/* Section CTA */}
          <FadeIn direction="up">
            <div className="flex flex-wrap justify-center gap-4 mt-10">
              <Button variant="green" href="/pricing" size="lg" className="shadow-lg shadow-emerald-500/25">
                View Pricing
              </Button>
              <Button variant="blue" href="/services" size="lg" className="shadow-lg shadow-blue-500/25">
                View All Services
              </Button>
            </div>
          </FadeIn>

        </div>
      </EditableSection>

      {/* How It Works - Bold Editorial Redesign */}
      <EditableSection sectionKey="processPreview" label="Process Preview">
        <div id="how-it-works-section" className="mb-24 scroll-mt-28">
          {/* Section header — editorial style matching Services */}
          <FadeIn direction="up">
            <div className="mb-14">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-1 w-12 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-full" />
                <span className="text-sm font-semibold uppercase tracking-widest text-gray-500">Our Process</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-[0.95] mb-4">
                How it works
              </h2>
              <p className="text-lg text-gray-500 max-w-xl">
                From idea to launch in four simple steps. No headaches.
              </p>
            </div>
          </FadeIn>

          {/* Desktop: Horizontal Steps */}
          <div className="hidden md:block mb-10">
            <StaggerContainer className="grid grid-cols-4 gap-0">
              {content.processPreview.steps.map((step, index) => {
                const stepStyles = [
                  { bg: 'bg-emerald-800', gradient: 'from-emerald-700 via-emerald-800 to-emerald-900', badge: 'bg-white/15 text-white', title: 'text-white', desc: 'text-emerald-200', num: 'text-emerald-300/10' },
                  { bg: 'bg-slate-900', gradient: 'from-slate-800 via-slate-900 to-slate-950', badge: 'bg-white/15 text-white', title: 'text-white', desc: 'text-slate-400', num: 'text-blue-500/10' },
                  { bg: 'bg-purple-800', gradient: 'from-purple-700 via-purple-800 to-purple-900', badge: 'bg-white/15 text-purple-200', title: 'text-white', desc: 'text-purple-200', num: 'text-purple-400/10' },
                  { bg: 'bg-yellow-900', gradient: 'from-yellow-800 via-yellow-900 to-yellow-950', badge: 'bg-white/15 text-yellow-200', title: 'text-white', desc: 'text-yellow-200', num: 'text-yellow-500/10' },
                ];
                const style = stepStyles[index] || stepStyles[0];
                const isFirst = index === 0;
                const isLast = index === content.processPreview.steps.length - 1;

                return (
                  <StaggerItem key={index}>
                    <motion.div
                      className={`relative overflow-hidden p-8 h-full ${style.bg} ${isFirst ? 'rounded-l-3xl' : ''} ${isLast ? 'rounded-r-3xl' : ''}`}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                      {/* Gradient overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient}`} />

                      <div className="relative z-10">
                        {/* Step badge */}
                        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${style.badge} text-sm font-bold mb-6 border border-white/10`}>
                          {step.number}
                        </div>

                        <h3 className={`text-xl font-black ${style.title} mb-2 tracking-tight`}>
                          {step.title}
                        </h3>
                        <p className={`text-sm ${style.desc} leading-relaxed`}>
                          {step.description}
                        </p>
                      </div>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>

          {/* Mobile: Vertical timeline */}
          <div className="md:hidden mb-10">
            <div className="space-y-4">
              {content.processPreview.steps.map((step, index) => {
                const mobileStyles = [
                  { bg: 'bg-emerald-800', badge: 'text-white', title: 'text-white', desc: 'text-emerald-200' },
                  { bg: 'bg-slate-900', badge: 'text-blue-400', title: 'text-white', desc: 'text-slate-400' },
                  { bg: 'bg-purple-800', badge: 'text-purple-200', title: 'text-white', desc: 'text-purple-200' },
                  { bg: 'bg-slate-800', badge: 'text-amber-400', title: 'text-white', desc: 'text-slate-400' },
                ];
                const style = mobileStyles[index] || mobileStyles[0];

                return (
                  <div key={index} className={`${style.bg} rounded-2xl p-6 flex gap-5 items-start`}>
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-white/15 flex items-center justify-center ${style.badge} font-bold text-lg border border-white/10`}>
                      {step.number}
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className={`font-black ${style.title} text-lg mb-1`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm ${style.desc}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metrics bar — inline, no stagger animation to avoid invisible content */}
          <FadeIn direction="up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xl font-black text-gray-900">1-4 Weeks</p>
                  <p className="text-sm text-gray-500">Most projects completed</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xl font-black text-gray-900">Regular Updates</p>
                  <p className="text-sm text-gray-500">You&apos;re never in the dark</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xl font-black text-gray-900">No Surprises</p>
                  <p className="text-sm text-gray-500">Transparent pricing upfront</p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* CTA */}
          <FadeIn direction="up">
            <div className="text-center">
              <Button variant="blue" href="/contact" size="lg" className="shadow-lg shadow-blue-500/25">
                Start Your Project
              </Button>
            </div>
          </FadeIn>
        </div>
      </EditableSection>

      {/* CTA Section - Confident Close */}
      <EditableSection sectionKey="cta" label="Call to Action">
        <FadeIn direction="up">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Dark gradient background — slate with purple accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950" />
            {/* Subtle glow accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/8 rounded-full blur-3xl" />
            {/* Large decorative watermark */}
            <div className="absolute -bottom-8 -right-4 text-[12rem] font-black text-white/5 leading-none select-none pointer-events-none">→</div>

            {/* Content */}
            <div className="relative z-10 py-20 px-8 md:px-16">
              <div className="max-w-4xl mx-auto">
                {/* Two-column: text left, CTA right */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10">
                  {/* Left: headline + subtext */}
                  <div className="md:max-w-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-purple-400" />
                      <span className="text-sm font-semibold tracking-widest uppercase text-purple-300">Ready?</span>
                    </div>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[0.95] tracking-tight mb-5">
                      Let&apos;s build<br />
                      <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">something great.</span>
                    </h2>
                    <p className="text-lg text-slate-400 max-w-md leading-relaxed">
                      Not sure where to start? Book a free 30-minute strategy call. No pressure, just clarity.
                    </p>
                  </div>

                  {/* Right: CTA stack */}
                  <div className="flex flex-col items-center md:items-start gap-4">
                    <Button variant="green" href="/contact" size="lg" className="shadow-2xl shadow-emerald-500/30">
                      Book a Free Call
                    </Button>
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('open-chatbot'))}
                      className="text-sm text-slate-500 hover:text-white transition-colors cursor-pointer rounded px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                    >
                      Or ask our chatbot anything →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </EditableSection>
      </div>{/* End max-w container */}
      <div className="h-16" />
    </div>
  );
}
