import { Metadata } from 'next';
import Link from 'next/link';
import { AllServicesJsonLd, ProfessionalServiceJsonLd } from '@/components/seo/JsonLd';
import { seoConfig } from '@/lib/seo-config';

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

// Service data expanded from seoConfig
const services = [
  {
    number: '01',
    title: 'Website Builds',
    headline: 'Sites that convert visitors into customers',
    description:
      'Professional website design and development. Mobile-optimized, SEO-ready, and built to grow with your business.',
    features: [
      'Custom design tailored to your brand',
      'Mobile-first responsive layouts',
      'SEO optimization built in from day one',
      'Content management so you can update easily',
      'Performance tuned for fast load times',
      'Ongoing support and maintenance available',
    ],
    price: 'From $500',
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
    headline: 'Eliminate the work you shouldn\'t be doing manually',
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
    headline: 'AI that works while you sleep',
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

const processSteps = [
  {
    number: '1',
    title: 'Discovery',
    description: 'We learn about your goals, your audience, and what success looks like for you.',
  },
  {
    number: '2',
    title: 'Proposal',
    description: 'You get a clear scope, timeline, and price. No surprises, no hidden fees.',
  },
  {
    number: '3',
    title: 'Build',
    description: 'We build with regular check-ins so you see progress and can give feedback.',
  },
  {
    number: '4',
    title: 'Launch',
    description: 'We deploy, test, and hand off. You get documentation and ongoing support options.',
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
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[0.95] mb-6">
            What We Build
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
            From your first website to fully automated operations. We build the technology
            that lets you focus on what matters.
          </p>
        </div>
      </section>

      {/* Service Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-24">
        <div className="space-y-8">
          {services.map((service) => (
            <div
              key={service.number}
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
                    <p className="text-lg font-semibold text-white/90 mb-2">
                      {service.headline}
                    </p>
                    <p className={`${service.textAccent} leading-relaxed mb-6 max-w-lg`}>
                      {service.description}
                    </p>
                    <p className={`text-2xl font-black ${service.priceAccent}`}>
                      {service.price}
                    </p>
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
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pb-16 md:pb-24">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-full" />
            <span className="text-sm font-semibold uppercase tracking-widest text-gray-500">
              Our Process
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-[0.95]">
            How It Works
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-0">
          {processSteps.map((step, index) => {
            const stepStyles = [
              { bg: 'bg-emerald-800', gradient: 'from-emerald-700 via-emerald-800 to-emerald-900', badge: 'bg-white/15 text-white', desc: 'text-emerald-200', num: 'text-emerald-300/10' },
              { bg: 'bg-slate-900', gradient: 'from-slate-800 via-slate-900 to-slate-950', badge: 'bg-white/15 text-white', desc: 'text-slate-400', num: 'text-blue-500/10' },
              { bg: 'bg-purple-800', gradient: 'from-purple-700 via-purple-800 to-purple-900', badge: 'bg-white/15 text-purple-200', desc: 'text-purple-200', num: 'text-purple-400/10' },
              { bg: 'bg-yellow-900', gradient: 'from-yellow-800 via-yellow-900 to-yellow-950', badge: 'bg-white/15 text-yellow-200', desc: 'text-yellow-200', num: 'text-yellow-500/10' },
            ];
            const style = stepStyles[index];
            const isFirst = index === 0;
            const isLast = index === processSteps.length - 1;

            return (
              <div
                key={index}
                className={`relative overflow-hidden p-8 ${style.bg} ${isFirst ? 'rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none' : ''} ${isLast ? 'rounded-b-3xl md:rounded-r-3xl md:rounded-bl-none' : ''}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient}`} />
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${style.badge} text-sm font-bold mb-6 border border-white/10`}>
                    {step.number}
                  </div>
                  <h3 className="text-xl font-black text-white mb-2 tracking-tight">
                    {step.title}
                  </h3>
                  <p className={`text-sm ${style.desc} leading-relaxed`}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pb-16 md:pb-24">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/8 rounded-full blur-3xl" />

          <div className="relative z-10 py-16 px-8 md:px-16 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8">
              Check out our transparent pricing or book a free strategy call. No pressure, just clarity.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/pricing"
                className="inline-flex items-center px-8 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/25"
              >
                View Pricing
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors border border-white/10"
              >
                Start a Project
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
