import { Metadata } from 'next';
import Link from 'next/link';
import { seoConfig } from '@/lib/seo-config';
import { FadeIn, StaggerContainer, StaggerItem, RevealSection } from '@/components/motion';

// ============================================================================
// How It Works Page - /how-it-works
// ============================================================================
// Dedicated process page explaining how we work together.
// Light editorial design with vertical timeline — visually distinct from
// the dark card layouts on /services and homepage teasers.

export const metadata: Metadata = {
  title: 'How It Works | NeedThisDone',
  description:
    'From idea to launch in four simple steps. Tell us what you need, get a clear quote, we build it, you launch. No surprises, no hidden fees.',
  openGraph: {
    title: 'How It Works | NeedThisDone',
    description:
      'A simple process designed to get you from idea to launch without the headaches. Transparent pricing, regular updates, and reliable delivery.',
    url: `${seoConfig.baseUrl}/how-it-works`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How It Works | NeedThisDone',
    description:
      'From idea to launch in four simple steps. Transparent pricing, regular updates, no surprises.',
  },
};

// Step data with details (richer than homepage teaser)
const steps = [
  {
    number: 1,
    title: 'Tell Us What You Need',
    description:
      "Fill out our simple form. No tech jargon required — just tell us what you're trying to accomplish.",
    details: [
      'Describe your project in plain English',
      'Attach any relevant files or examples',
      'Let us know your timeline if you have one',
    ],
    color: {
      accent: 'emerald',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      badge: 'bg-emerald-600 text-white',
      line: 'bg-emerald-300',
      detailIcon: 'text-emerald-500',
      title: 'text-emerald-900',
    },
    href: '/contact',
    buttonText: 'Start Here',
  },
  {
    number: 2,
    title: 'Get a Clear Quote',
    description:
      "Within 2 business days, you'll have a detailed quote. No hidden fees, no hourly surprises.",
    details: [
      'We assess what needs to be built',
      'We ask questions if needed',
      'You get a fixed price quote',
    ],
    color: {
      accent: 'blue',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      badge: 'bg-blue-600 text-white',
      line: 'bg-blue-300',
      detailIcon: 'text-blue-500',
      title: 'text-blue-900',
    },
  },
  {
    number: 3,
    title: 'We Build It',
    description:
      "50% deposit to start. We keep you updated throughout so you're never wondering what's happening.",
    details: [
      'Regular progress updates',
      'Review checkpoints along the way',
      "Revisions until you're happy",
    ],
    color: {
      accent: 'purple',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      badge: 'bg-purple-600 text-white',
      line: 'bg-purple-300',
      detailIcon: 'text-purple-500',
      title: 'text-purple-900',
    },
  },
  {
    number: 4,
    title: 'You Launch',
    description:
      'Final 50% on approval. We help you go live and stick around to make sure everything works.',
    details: [
      'Final review and approval',
      'Launch support included',
      'Post-launch questions welcome',
    ],
    color: {
      accent: 'gold',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      badge: 'bg-amber-600 text-white',
      line: 'bg-amber-300',
      detailIcon: 'text-amber-500',
      title: 'text-amber-900',
    },
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero — Light with centered gradient orbs */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="relative overflow-hidden py-12 md:py-16">
            {/* Gradient orbs */}
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-emerald-100 to-blue-100 blur-2xl" />
            <div className="absolute top-20 left-1/4 w-32 h-32 rounded-full bg-purple-100 blur-xl" />

            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-1 w-12 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-full" />
                <span className="text-sm font-semibold uppercase tracking-widest text-gray-500">
                  Our Process
                </span>
                <div className="h-1 w-12 bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 rounded-full" />
              </div>
              <FadeIn direction="up" triggerOnScroll={false}>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[0.95] mb-6">
                  How We Work Together
                </h1>
              </FadeIn>
              <FadeIn direction="up" delay={0.1} triggerOnScroll={false}>
                <p className="text-lg md:text-xl text-gray-500 leading-relaxed">
                  A simple process designed to get you from idea to launch without the headaches.
                  No jargon, no surprises — just clear steps and honest communication.
                </p>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pb-16">
        <StaggerContainer staggerDelay={0.08}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StaggerItem>
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-50 border border-emerald-100 transition-transform duration-300 hover:y-[-4px]" whileHover={{ y: -4 }}>
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-black text-gray-900">Human + AI</p>
              <p className="text-sm text-gray-500">Best of both worlds</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-blue-50 border border-blue-100 transition-transform duration-300 hover:y-[-4px]" whileHover={{ y: -4 }}>
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-black text-gray-900">Clear Updates</p>
              <p className="text-sm text-gray-500">At every step</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-purple-50 border border-purple-100 transition-transform duration-300 hover:y-[-4px]" whileHover={{ y: -4 }}>
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-black text-gray-900">No Surprises</p>
              <p className="text-sm text-gray-500">Transparent pricing</p>
            </div>
            </StaggerItem>
          </div>
        </StaggerContainer>
      </section>

      {/* Vertical Timeline — Visually distinct from dark card grids */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pb-16 md:pb-24">
        <div className="max-w-3xl mx-auto">
          <StaggerContainer staggerDelay={0.1}>
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1;

              return (
                <StaggerItem key={step.number}>
                  <div className="relative flex gap-6 md:gap-8" whileHover={{ scale: 1.02 }}>
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex-shrink-0 w-14 h-14 rounded-2xl ${step.color.badge} flex items-center justify-center text-xl font-black shadow-lg`}
                    >
                      {step.number}
                    </div>
                    {!isLast && (
                      <div className={`w-0.5 flex-1 mt-4 ${step.color.line} opacity-40`} />
                    )}
                  </div>

                  {/* Step content */}
                  <div className={`flex-1 pb-8 ${isLast ? '' : 'pb-12'}`}>
                    <div className={`rounded-2xl ${step.color.bg} border ${step.color.border} p-6 md:p-8`}>
                      <h2 className={`text-2xl md:text-3xl font-black ${step.color.title} tracking-tight mb-3`}>
                        {step.title}
                      </h2>
                      <p className="text-gray-600 leading-relaxed mb-6">
                        {step.description}
                      </p>

                      {/* Detail bullets */}
                      <ul className="space-y-3" role="list">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <svg
                              className={`w-5 h-5 ${step.color.detailIcon} flex-shrink-0 mt-0.5`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span className="text-gray-700">{detail}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Optional action button for step 1 */}
                      {step.href && step.buttonText && (
                        <div className="mt-6">
                          <Link
                            href={step.href}
                            className="inline-flex items-center px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-colors text-sm shadow-lg shadow-emerald-500/25"
                          >
                            {step.buttonText}
                            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pb-16 md:pb-24">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-100 p-8 md:p-12">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">
              Typical Timeline
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              We know waiting is part of the process. That&apos;s why we give you a realistic
              timeline from day one, so you can plan with confidence. Most projects take 1-4 weeks.
              Bigger ones take longer, but we&apos;ll keep you in the loop every step of the way.
            </p>
            <StaggerContainer staggerDelay={0.06}>
              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                <StaggerItem>
                  <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm transition-transform duration-300 hover:scale-105" whileHover={{ scale: 1.05 }}>
                <p className="text-2xl font-black text-emerald-600">1-2</p>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Weeks for simple sites</p>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm transition-transform duration-300 hover:scale-105" whileHover={{ scale: 1.05 }}>
                <p className="text-2xl font-black text-blue-600">2-4</p>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Weeks for full builds</p>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm transition-transform duration-300 hover:scale-105" whileHover={{ scale: 1.05 }}>
                <p className="text-2xl font-black text-purple-600">1-2</p>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Weeks per automation</p>
                  </div>
                </StaggerItem>
              </div>
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* Questions Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pb-16 md:pb-24">
        <RevealSection>
          <div className="text-center max-w-2xl mx-auto">
            <FadeIn direction="up" triggerOnScroll={true}>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">
            Questions about the process?
          </h2>
          <p className="text-gray-500 leading-relaxed mb-8">
            We&apos;re happy to walk you through it. No pressure, no obligation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/25"
            >
              Book a Quick Chat
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center px-8 py-3 rounded-xl bg-purple-100 text-purple-700 font-semibold hover:bg-purple-200 transition-colors"
            >
              Read the FAQ
            </Link>
            </FadeIn>
          </div>
        </RevealSection>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pb-16 md:pb-24">
        <RevealSection>
          <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/8 rounded-full blur-3xl" />

          <div className="relative z-10 py-16 px-8 md:px-16 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
              Ready to Start?
            </h2>
            <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8">
              Tell us what you need built. We&apos;ll take it from there.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/25"
              >
                Get a Quote
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center px-8 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors border border-white/10"
              >
                View Services
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center px-8 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors border border-white/10"
              >
                See Pricing
              </Link>
            </div>
          </div>
        </div>
        </RevealSection>
      </section>
    </>
  );
}
