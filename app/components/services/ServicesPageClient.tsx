'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Eye, Shield, RefreshCcw } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem, RevealSection, useReducedMotion } from '@/components/motion';
import { AllServicesJsonLd, ProfessionalServiceJsonLd } from '@/components/seo/JsonLd';

// ============================================================================
// Services Page Client Component
// ============================================================================
// Split from page.tsx so we can use framer-motion while keeping metadata
// in a server component. All JSX, animations, and interactivity live here.

// Reusable dot texture overlay for dark surfaces
function DotTexture({ size = 20, opacity = 0.04 }: { size?: number; opacity?: number }) {
  return (
    <div
      className={`absolute inset-0 rounded-3xl pointer-events-none`}
      style={{
        opacity,
        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}

// Service data with problem/outcome framing for sales funnel
const services = [
  {
    id: 'websites',
    number: '01',
    title: 'Website Builds',
    headline: 'Stop losing customers to a bad first impression',
    problem:
      "Your website looks outdated, loads slowly, or doesn't show up on Google. Potential customers leave before they even know what you offer.",
    outcome:
      'A professional, fast-loading site that ranks on Google and turns visitors into paying customers — built in 1-4 weeks.',
    description:
      'Professional website design and development. Mobile-friendly, search engine optimized, and built to grow with your business.',
    features: [
      'Custom design tailored to your brand',
      'Mobile-friendly responsive layouts',
      'Search engine optimization built in from day one',
      'Database, booking, and payments available',
      'Performance tuned for fast load times',
      'Ongoing support and maintenance available',
    ],
    ctaHref: '/pricing#websites',
    ctaAction: 'Choose Your Package',
    ctaPrice: 'Starting at $250 deposit',
    timeline: 'Typical delivery: 1–4 weeks',
    color: 'emerald' as const,
    bg: 'bg-emerald-800',
    gradient: 'from-emerald-700 via-emerald-800 to-emerald-900',
    glow: 'bg-emerald-400/20',
    glowSecondary: 'bg-emerald-300/15',
    badge: 'bg-white/15 text-white border-white/10',
    textAccent: 'text-emerald-200',
    ring: 'ring-4 ring-inset ring-emerald-400/60',
    ctaShadow: 'shadow-emerald-500/25',
  },
  {
    id: 'automation',
    number: '02',
    title: 'Automation Setup',
    headline: 'Stop doing the same tasks every single day',
    problem:
      "You're copying data between tools, sending the same emails manually, and wasting hours on work a computer could do in seconds.",
    outcome:
      'Connected workflows that run automatically — so you reclaim hours every week and eliminate human error.',
    description:
      'Workflow automation and tool integration. Connect your apps and free up hours every week.',
    features: [
      'Audit your current workflows for automation opportunities',
      'Connect tools like Zapier, Make, or custom integrations',
      'Automate repetitive data entry and reporting',
      'Set up email sequences and notifications',
      'Build custom dashboards for real-time visibility',
      'Documentation so your team can maintain it',
    ],
    ctaHref: '/pricing#automation',
    ctaAction: 'Start Automating',
    ctaPrice: 'From $150 per workflow',
    timeline: 'Setup in 1–2 weeks',
    color: 'blue' as const,
    bg: 'bg-slate-900',
    gradient: 'from-slate-800 via-slate-900 to-slate-950',
    glow: 'bg-blue-500/20',
    glowSecondary: 'bg-blue-400/10',
    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
    textAccent: 'text-slate-400',
    ring: 'ring-4 ring-inset ring-blue-400/60',
    ctaShadow: 'shadow-blue-500/25',
  },
  {
    id: 'ai',
    number: '03',
    title: 'Managed AI Services',
    headline: 'Get AI working for you, not the other way around',
    problem:
      "You know AI could help your business, but you don't have the time or expertise to build, train, and maintain AI systems yourself.",
    outcome:
      'Custom AI agents that handle customer support, data processing, and operations 24/7 — with monthly optimization and reporting.',
    description:
      'AI agent development and ongoing management. Custom solutions that run 24/7 while you focus on growth.',
    features: [
      'Custom AI chatbots trained on your business data',
      'Document processing and intelligent extraction',
      'Automated customer support and lead qualification',
      'AI-powered content generation pipelines',
      'Continuous monitoring and improvement',
      'Monthly reporting on AI performance and ROI',
    ],
    ctaHref: '/pricing#automation',
    ctaAction: 'Get Your AI Agent',
    ctaPrice: '$500/mo — cancel anytime',
    timeline: 'Continuous monthly service',
    color: 'purple' as const,
    bg: 'bg-gradient-to-br from-purple-700 to-purple-900',
    gradient: 'from-purple-700 via-purple-800 to-purple-900',
    glow: 'bg-purple-400/20',
    glowSecondary: 'bg-purple-300/15',
    badge: 'bg-white/15 text-purple-200 border-white/10',
    textAccent: 'text-purple-200',
    ring: 'ring-4 ring-inset ring-purple-400/60',
    ctaShadow: 'shadow-purple-500/25',
  },
];

// Trust props with icons and belt-color progression
const trustProps = [
  {
    icon: Eye,
    title: 'You See the Price Before We Start',
    description:
      "No hidden fees, no hourly surprises. You'll know exactly what you're paying before we write a single line of code.",
    color: 'emerald' as const,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    icon: Shield,
    title: 'Pay Half Now, Half When You Approve',
    description:
      '50% deposit gets things moving. The rest is due when you\'re happy with the finished product.',
    color: 'blue' as const,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    icon: RefreshCcw,
    title: 'Not Happy? Full Deposit Refund',
    description:
      "If we can't deliver what was promised, you get your deposit back. Your success is our reputation.",
    color: 'purple' as const,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
];

// Quick-nav pills for hero section
const navPills = [
  { label: 'Websites', href: '#websites', price: 'from $500', color: 'emerald' as const },
  { label: 'Automation', href: '#automation', price: 'from $150', color: 'blue' as const },
  { label: 'AI Services', href: '#ai', price: '$500/mo', color: 'purple' as const },
];

const pillColors = {
  emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30',
  blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30',
  purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30',
};

export default function ServicesPageClient() {
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const orb1Y = useTransform(heroScroll, [0, 1], [0, -40]);
  const orb2Y = useTransform(heroScroll, [0, 1], [0, -20]);

  return (
    <>
      <AllServicesJsonLd />
      <ProfessionalServiceJsonLd />

      {/* ================================================================
          HERO SECTION — Dark with parallax orbs, dot texture, ghost type
          ================================================================ */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      >
        {/* Dot texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Ghost typography */}
        <div className="absolute -bottom-8 right-8 text-[12rem] md:text-[16rem] font-black text-white/[0.03] leading-none select-none pointer-events-none">
          &lt;/&gt;
        </div>

        {/* Parallax gradient orbs — inside max-w container */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="relative overflow-hidden py-20 md:py-28">
            {/* Orbs inside container for centered gradient pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl"
                style={{ y: prefersReducedMotion ? 0 : orb1Y }}
              />
              <motion.div
                className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl"
                style={{ y: prefersReducedMotion ? 0 : orb2Y }}
              />
            </div>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-1 w-12 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 rounded-full" />
                <span className="text-sm font-semibold uppercase tracking-widest text-slate-400">
                  Our Services
                </span>
              </div>
              <FadeIn direction="up" triggerOnScroll={false}>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[0.95] mb-6">
                  Technology that
                  <br />
                  <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    works as hard as you do.
                  </span>
                </h1>
              </FadeIn>
              <FadeIn direction="up" delay={0.1} triggerOnScroll={false}>
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed mb-8">
                  You shouldn&apos;t have to choose between growing your business and fighting with
                  technology. Here&apos;s how we fix that.
                </p>
              </FadeIn>

              {/* Quick-nav pills */}
              <FadeIn direction="up" delay={0.2} triggerOnScroll={false}>
                <div className="flex flex-wrap gap-3">
                  {navPills.map((pill) => (
                    <Link
                      key={pill.href}
                      href={pill.href}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${pillColors[pill.color]}`}
                    >
                      {pill.label}
                      <span className="opacity-70">{pill.price}</span>
                    </Link>
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          SERVICE CARDS — Ring borders, dot texture, two-line CTAs
          ================================================================ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-24">
        <StaggerContainer className="space-y-8">
          {services.map((service) => (
            <StaggerItem key={service.number}>
              <div
                id={service.id}
                className={`relative overflow-hidden rounded-3xl p-8 md:p-10 lg:p-12 scroll-mt-24 ${service.bg} ${service.ring}`}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} rounded-3xl`} />
                {/* Dot texture */}
                <DotTexture />
                {/* Decorative glows */}
                <div
                  className={`absolute -top-20 -right-20 w-64 h-64 rounded-full ${service.glow} blur-3xl`}
                />
                <div
                  className={`absolute -bottom-10 -left-10 w-40 h-40 rounded-full ${service.glowSecondary} blur-2xl`}
                />

                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:gap-12">
                    {/* Left: info */}
                    <div className="lg:flex-1 mb-8 lg:mb-0">
                      <div
                        className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${service.badge} text-sm font-bold mb-6 border`}
                      >
                        {service.number}
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
                        {service.title}
                      </h2>
                      <p className="text-lg font-semibold text-white/90 mb-4">{service.headline}</p>
                      {/* Problem/Outcome framing */}
                      <div className="space-y-3 mb-6 max-w-lg">
                        <p className={`${service.textAccent} text-sm leading-relaxed`}>
                          <span className="font-semibold text-white/70">The problem:</span>{' '}
                          {service.problem}
                        </p>
                        <p className={`${service.textAccent} text-sm leading-relaxed`}>
                          <span className="font-semibold text-white/70">
                            What you walk away with:
                          </span>{' '}
                          {service.outcome}
                        </p>
                      </div>

                      {/* Value comparison anchor — only on Website card */}
                      {service.id === 'websites' && (
                        <div className="mb-6 max-w-sm bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="text-center flex-1">
                              <p className="text-xs text-white/50 mb-1">Typical agency</p>
                              <p className="text-2xl font-bold text-white/40 line-through">
                                $15,000+
                              </p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-xs font-medium flex-shrink-0">
                              vs
                            </div>
                            <div className="text-center flex-1">
                              <p className="text-xs text-white/50 mb-1">NeedThisDone</p>
                              <p className="text-2xl font-black text-white">From $500</p>
                            </div>
                          </div>
                          <p className="text-center text-xs text-white/40 mt-2">
                            Same quality. Direct from the builder.
                          </p>
                        </div>
                      )}

                      {/* Two-line CTA button */}
                      <div className="inline-flex flex-col items-center">
                        <Link
                          href={service.ctaHref}
                          className={`inline-flex flex-col items-center px-8 py-3 rounded-xl bg-white/15 border border-white/20 text-white hover:bg-white/25 transition-colors shadow-lg ${service.ctaShadow}`}
                        >
                          <span className="font-semibold text-sm">{service.ctaAction}</span>
                          <span className="text-xs font-normal opacity-80">{service.ctaPrice}</span>
                        </Link>
                        {service.timeline && (
                          <p className={`mt-3 text-xs ${service.textAccent} opacity-80`}>
                            {service.timeline}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: features */}
                    <div className="lg:w-[400px]">
                      <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">
                        What&apos;s included
                      </p>
                      <ul className="space-y-3" role="list">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                            <span className="text-white/90 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ================================================================
          PROCESS TEASER — Link to /how-it-works
          ================================================================ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pb-16 md:pb-24">
        <RevealSection>
          <div className="rounded-3xl bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-100 p-8 md:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mb-2">
                Wondering how it all works?
              </h2>
              <p className="text-gray-500 max-w-lg">
                Four simple steps from idea to launch. No jargon, no surprises — just clear
                communication and reliable delivery.
              </p>
            </div>
            <Link
              href="/how-it-works"
              className="inline-flex items-center px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/25 whitespace-nowrap"
            >
              See Our Process
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </RevealSection>
      </section>

      {/* ================================================================
          TRUST SECTION — Redesigned as cards with icons
          ================================================================ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-20">
        <FadeIn direction="up">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-3">
              Why Clients Trust Us
            </h2>
          </div>
        </FadeIn>
        <StaggerContainer className="grid md:grid-cols-3 gap-6" staggerDelay={0.1}>
          {trustProps.map((prop, i) => (
            <StaggerItem key={i}>
              <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 text-center h-full">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${prop.iconBg} mb-4`}
                >
                  <prop.icon className={`w-6 h-6 ${prop.iconColor}`} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{prop.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{prop.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Scarcity signal */}
        <FadeIn direction="up" delay={0.2}>
          <p className="text-center text-gray-500 text-sm mt-8">
            We take on <span className="font-semibold text-gray-700">3-4 projects per month</span>{' '}
            to ensure quality.{' '}
            <Link href="/contact" className="text-emerald-600 font-medium hover:underline">
              Check availability &rarr;
            </Link>
          </p>
        </FadeIn>
      </section>

      {/* ================================================================
          CTA SECTION — Dark with dot texture, ghost type, upgraded copy
          ================================================================ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pb-16 md:pb-24">
        <RevealSection>
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950" />
            {/* Dot texture */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            {/* Ghost typography */}
            <div className="absolute -bottom-4 -right-2 text-[8rem] font-black text-white/[0.03] leading-none select-none pointer-events-none">
              &rarr;
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/8 rounded-full blur-3xl" />

            <div className="relative z-10 py-16 px-8 md:px-16 text-center">
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
                You&apos;ve seen what we build.
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">
                  Now see what it costs.
                </span>
              </h2>
              <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8">
                Transparent packages with no surprises. Pick what fits or build your own.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/pricing"
                  className="inline-flex items-center px-8 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/25"
                >
                  Choose Your Package
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center px-8 py-3 rounded-xl bg-white/5 text-slate-300 font-medium hover:bg-white/10 transition-colors border border-white/5"
                >
                  Book a Free 15-Min Call
                </Link>
              </div>
            </div>
          </div>
        </RevealSection>
      </section>
    </>
  );
}
