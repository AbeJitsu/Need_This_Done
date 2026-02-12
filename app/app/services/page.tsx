import { Metadata } from 'next';
import Link from 'next/link';
import { AllServicesJsonLd, ProfessionalServiceJsonLd } from '@/components/seo/JsonLd';
import { seoConfig } from '@/lib/seo-config';
import { FadeIn, StaggerContainer, StaggerItem, RevealSection } from '@/components/motion';

// ============================================================================
// Services Page - /services
// ============================================================================
// Dedicated services page targeting "web development services" keywords.
// Dark editorial pattern matching the homepage service cards.

export const metadata: Metadata = {
  title: 'Web Development, Automation & AI Services | NeedThisDone',
  description:
    'Professional web development, workflow automation, and managed AI services. Custom websites from $500, automation from $150, AI solutions from $500/mo. Orlando-based, serving clients nationwide.',
  openGraph: {
    title: 'Web Development, Automation & AI Services | NeedThisDone',
    description:
      'Custom websites, workflow automation, and AI solutions built for your business. Transparent pricing, reliable delivery.',
    url: `${seoConfig.baseUrl}/services`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web Development, Automation & AI Services | NeedThisDone',
    description:
      'Custom websites, workflow automation, and AI solutions built for your business.',
  },
};

// Service data with problem/outcome framing for sales funnel
const services = [
  {
    number: '01',
    title: 'Website Builds',
    headline: 'Stop losing customers to a bad first impression',
    problem: 'Your website looks outdated, loads slowly, or doesn\'t show up on Google. Potential customers leave before they even know what you offer.',
    outcome: 'A professional, fast-loading site that ranks on Google and turns visitors into paying customers — built in 1-4 weeks.',
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
    price: 'From $500',
    ctaHref: '/pricing#websites',
    ctaLabel: 'See Website Packages',
    color: 'emerald' as const,
    bg: 'bg-emerald-800',
    gradient: 'from-emerald-700 via-emerald-800 to-emerald-900',
    glow: 'bg-emerald-400/20',
    glowSecondary: 'bg-emerald-300/15',
    badge: 'bg-white/15 text-white border-white/10',
    textAccent: 'text-emerald-200',
    priceAccent: 'text-emerald-300',
  },
  {
    number: '02',
    title: 'Automation Setup',
    headline: 'Stop doing the same tasks every single day',
    problem: 'You\'re copying data between tools, sending the same emails manually, and wasting hours on work a computer could do in seconds.',
    outcome: 'Connected workflows that run automatically — so you reclaim hours every week and eliminate human error.',
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
    price: 'From $150',
    ctaHref: '/pricing#automation',
    ctaLabel: 'See Automation Pricing',
    color: 'blue' as const,
    bg: 'bg-slate-900',
    gradient: 'from-slate-800 via-slate-900 to-slate-950',
    glow: 'bg-blue-500/20',
    glowSecondary: 'bg-blue-400/10',
    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
    textAccent: 'text-slate-400',
    priceAccent: 'text-blue-400',
  },
  {
    number: '03',
    title: 'Managed AI Services',
    headline: 'Get AI working for you, not the other way around',
    problem: 'You know AI could help your business, but you don\'t have the time or expertise to build, train, and maintain AI systems yourself.',
    outcome: 'Custom AI agents that handle customer support, data processing, and operations 24/7 — with monthly optimization and reporting.',
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
    price: 'From $500/mo',
    ctaHref: '/pricing#automation',
    ctaLabel: 'See AI Pricing',
    color: 'purple' as const,
    bg: 'bg-gradient-to-br from-purple-700 to-purple-900',
    gradient: 'from-purple-700 via-purple-800 to-purple-900',
    glow: 'bg-purple-400/20',
    glowSecondary: 'bg-purple-300/15',
    badge: 'bg-white/15 text-purple-200 border-white/10',
    textAccent: 'text-purple-200',
    priceAccent: 'text-purple-300',
  },
];

export default function ServicesPage() {
  return (
    <>
      <AllServicesJsonLd />
      <ProfessionalServiceJsonLd />

      {/* Dark Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-20 md:py-28">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 rounded-full" />
            <span className="text-sm font-semibold uppercase tracking-widest text-slate-400">
              Our Services
            </span>
          </div>
          <FadeIn direction="up" triggerOnScroll={false}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[0.95] mb-6">
              Technology that<br />
              <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">works as hard as you do.</span>
            </h1>
          </FadeIn>
          <FadeIn direction="up" delay={0.1} triggerOnScroll={false}>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
              You shouldn&apos;t have to choose between growing your business and fighting with technology.
              Here&apos;s how we fix that.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Service Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-24">
        <StaggerContainer className="space-y-8">
          {services.map((service) => (
            <StaggerItem key={service.number}>
              <div
                className={`relative overflow-hidden rounded-3xl p-8 md:p-10 lg:p-12 ${service.bg}`}
              >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient}`} />
              {/* Decorative glows */}
              <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full ${service.glow} blur-3xl`} />
              <div className={`absolute -bottom-10 -left-10 w-40 h-40 rounded-full ${service.glowSecondary} blur-2xl`} />

              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-start lg:gap-12">
                  {/* Left: info */}
                  <div className="lg:flex-1 mb-8 lg:mb-0">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${service.badge} text-sm font-bold mb-6 border`}>
                      {service.number}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
                      {service.title}
                    </h2>
                    <p className="text-lg font-semibold text-white/90 mb-4">
                      {service.headline}
                    </p>
                    {/* Problem/Outcome framing */}
                    <div className="space-y-3 mb-6 max-w-lg">
                      <p className={`${service.textAccent} text-sm leading-relaxed`}>
                        <span className="font-semibold text-white/70">The problem:</span>{' '}
                        {service.problem}
                      </p>
                      <p className={`${service.textAccent} text-sm leading-relaxed`}>
                        <span className="font-semibold text-white/70">What you walk away with:</span>{' '}
                        {service.outcome}
                      </p>
                    </div>
                    <p className={`text-2xl font-black ${service.priceAccent} mb-6`}>
                      {service.price}
                    </p>
                    <Link
                      href={service.ctaHref}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/15 border border-white/20 text-white font-semibold text-sm hover:bg-white/25 transition-colors"
                    >
                      {service.ctaLabel}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
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
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
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

      {/* Process Teaser — full details on /how-it-works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pb-16 md:pb-24">
        <RevealSection>
          <div className="rounded-3xl bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-100 p-8 md:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mb-2">
              Wondering how it all works?
            </h2>
            <p className="text-gray-500 max-w-lg">
              Four simple steps from idea to launch. No jargon, no surprises — just clear communication and reliable delivery.
            </p>
          </div>
          <Link
            href="/how-it-works"
            className="inline-flex items-center px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/25 whitespace-nowrap"
          >
            See Our Process
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        </RevealSection>
      </section>

      {/* Value Props - Moved from pricing page */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-20">
        <FadeIn direction="up">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-3">
              Why Clients Trust Us
            </h2>
          </div>
        </FadeIn>
        <StaggerContainer className="grid md:grid-cols-3 gap-8" staggerDelay={0.1}>
          {[
            {
              title: 'Transparent Pricing',
              description: 'No hidden fees, no hourly surprises. You\'ll know exactly what you\'re paying before we start.',
            },
            {
              title: '50% Deposit Model',
              description: 'Pay half upfront, half when you\'re happy with the work. Fair for everyone.',
            },
            {
              title: 'Quality Guaranteed',
              description: 'Not satisfied? We\'ll make it right or refund your deposit. Your success is our reputation.',
            },
          ].map((prop, i) => (
            <StaggerItem key={i}>
              <div className="text-center p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-2">{prop.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{prop.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* CTA Section — Funnel close: services → pricing */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pb-16 md:pb-24">
        <RevealSection>
          <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/8 rounded-full blur-3xl" />

          <div className="relative z-10 py-16 px-8 md:px-16 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
              You&apos;ve seen what we build.<br />
              <span className="bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">Now see what it costs.</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8">
              Transparent packages with no surprises. Pick what fits or build your own.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/pricing"
                className="inline-flex items-center px-8 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/25"
              >
                See Pricing
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors border border-white/10"
              >
                Or book a free call
              </Link>
            </div>
          </div>
        </div>
        </RevealSection>
      </section>
    </>
  );
}
