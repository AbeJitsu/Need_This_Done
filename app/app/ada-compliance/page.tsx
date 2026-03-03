import { Metadata } from 'next';
import Link from 'next/link';
import { seoConfig } from '@/lib/seo-config';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion';

// ============================================================================
// ADA Compliance Page - /ada-compliance
// ============================================================================
// SEO content page targeting "ADA website compliance" search traffic.
// Educates prospects on the problem, then offers the solution.
// Dual purpose: SEO magnet + sales funnel.

export const metadata: Metadata = {
  title: 'ADA Website Compliance: What Small Businesses Need to Know | NeedThisDone',
  description:
    'ADA website compliance explained in plain language. Learn what it means for your business, common issues to fix, and how to avoid costly lawsuits.',
  openGraph: {
    title: 'ADA Website Compliance for Small Businesses | NeedThisDone',
    description:
      'ADA lawsuits against websites are surging. Learn what compliance means, what issues to look for, and how to protect your business.',
    url: `${seoConfig.baseUrl}/ada-compliance`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ADA Website Compliance for Small Businesses',
    description:
      'ADA lawsuits against websites are surging. Learn what compliance means and how to protect your business.',
  },
};

const commonIssues = [
  {
    issue: 'Missing alt text on images',
    impact: 'Screen readers can\'t describe images to blind users, and it\'s the #1 issue cited in ADA lawsuits.',
    fix: 'Add descriptive alt text to every meaningful image. Decorative images get empty alt="".',
  },
  {
    issue: 'Unlabeled form inputs',
    impact: 'Screen reader users can\'t tell what information to enter. Contact forms become unusable.',
    fix: 'Every input needs a visible <label> element connected to it.',
  },
  {
    issue: 'No keyboard navigation',
    impact: 'Users who can\'t use a mouse — including those with motor disabilities — can\'t navigate your site.',
    fix: 'Ensure all interactive elements (buttons, links, menus) are reachable with Tab and activatable with Enter.',
  },
  {
    issue: 'Missing skip navigation',
    impact: 'Keyboard users must tab through every single navigation link on every page before reaching content.',
    fix: 'Add a "Skip to main content" link as the first focusable element on every page.',
  },
  {
    issue: 'Low color contrast',
    impact: 'Users with low vision or color blindness can\'t read text. WCAG requires at least 4.5:1 contrast ratio.',
    fix: 'Test your color combinations. Light gray text on white backgrounds is the most common offender.',
  },
  {
    issue: 'Generic link text',
    impact: 'Screen reader users who navigate by links hear "click here" and "read more" with no context about where the link goes.',
    fix: 'Use descriptive link text: "View our pricing packages" instead of "click here."',
  },
  {
    issue: 'Missing page language',
    impact: 'Screen readers don\'t know which pronunciation rules to use. English text might be read with French pronunciation.',
    fix: 'Add lang="en" (or your language) to the <html> element.',
  },
  {
    issue: 'No heading structure',
    impact: 'Screen reader users rely on headings to navigate. Without a proper H1 → H2 → H3 hierarchy, pages feel like a wall of text.',
    fix: 'Use one H1 per page, then H2s for sections, H3s for subsections. Never skip levels.',
  },
];

export default function AdaCompliancePage() {
  return (
    <div>
      {/* Hero — dark hero matching site pattern */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-5xl mx-auto px-6 sm:px-8 md:px-12 pt-16 md:pt-24 pb-16 md:pb-20">
          <FadeIn direction="none" triggerOnScroll={false}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
              <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
                ADA Compliance
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] mb-6">
              Is Your Website ADA Compliant?
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed max-w-3xl mb-8">
              If your website isn&apos;t accessible to people with disabilities, you&apos;re
              not just missing customers — you may be facing legal risk. Here&apos;s what
              you need to know, explained in plain language.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/site-analyzer"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/25 transition-all"
              >
                Check Your Site Now
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10 font-bold text-lg transition-all"
              >
                Book a Free Call
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Content sections */}
      <div className="max-w-5xl mx-auto px-6 sm:px-8 md:px-12 py-16 space-y-20">

        {/* Section 1: What ADA compliance means */}
        <FadeIn direction="up">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
              <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
                The Basics
              </span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-6">
              What Does ADA Compliance Mean for Websites?
            </h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                The Americans with Disabilities Act (ADA) requires businesses to be
                accessible to people with disabilities. While the law was originally
                written for physical spaces, courts have consistently ruled that it
                applies to websites too.
              </p>
              <p>
                In practice, this means your website needs to work for people who
                use screen readers, keyboard navigation, or other assistive technology.
                The standard most businesses follow is called <strong>WCAG 2.1 Level AA</strong> —
                a set of technical guidelines published by the World Wide Web Consortium.
              </p>
              <p>
                You don&apos;t need to memorize the WCAG spec. You just need to make sure your
                website doesn&apos;t create barriers for people trying to use it.
              </p>
            </div>
          </section>
        </FadeIn>

        {/* Section 2: Why it matters */}
        <FadeIn direction="up">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-1 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
              <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
                The Stakes
              </span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-6">
              Why This Matters for Your Business
            </h2>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                {
                  stat: '4,600+',
                  label: 'ADA lawsuits filed in 2023 alone',
                  detail: 'And the number keeps growing year over year. Small businesses are increasingly targeted.',
                  color: 'text-red-600',
                },
                {
                  stat: '26%',
                  label: 'of U.S. adults have a disability',
                  detail: 'That\'s roughly 1 in 4 potential customers who may struggle to use your website.',
                  color: 'text-blue-600',
                },
                {
                  stat: '$10K–$75K',
                  label: 'typical settlement range',
                  detail: 'Most ADA website lawsuits settle without going to trial, but settlements aren\'t cheap.',
                  color: 'text-amber-600',
                },
              ].map((item) => (
                <div key={item.stat} className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                  <p className={`text-3xl font-black ${item.color} mb-1`}>{item.stat}</p>
                  <p className="text-sm font-semibold text-slate-800 mb-2">{item.label}</p>
                  <p className="text-sm text-slate-500">{item.detail}</p>
                </div>
              ))}
            </div>

            <p className="text-slate-600 leading-relaxed">
              Beyond legal risk, accessibility is good business. Accessible websites tend
              to have better SEO, faster load times, and lower bounce rates. When your
              site works well for people with disabilities, it works better for everyone.
            </p>
          </section>
        </FadeIn>

        {/* Section 3: Common issues */}
        <FadeIn direction="up">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-1 rounded-full bg-gradient-to-r from-purple-400 to-emerald-400" />
              <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
                What to Look For
              </span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
              The Most Common Accessibility Issues
            </h2>
            <p className="text-slate-500 mb-8">
              Our site analyzer checks for all of these automatically. Here&apos;s what each one
              means and why it matters.
            </p>

            <StaggerContainer className="space-y-4">
              {commonIssues.map((item) => (
                <StaggerItem key={item.issue}>
                  <div className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors">
                    <h3 className="font-bold text-slate-800 mb-2">{item.issue}</h3>
                    <p className="text-sm text-slate-600 mb-2">
                      <span className="font-semibold text-amber-700">Impact: </span>
                      {item.impact}
                    </p>
                    <p className="text-sm text-slate-600">
                      <span className="font-semibold text-emerald-700">Fix: </span>
                      {item.fix}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        </FadeIn>

        {/* Section 4: How we help */}
        <FadeIn direction="up">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400" />
              <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
                How We Help
              </span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-6">
              From Audit to Compliant — We Handle It
            </h2>
            <div className="space-y-4 text-slate-600 leading-relaxed mb-8">
              <p>
                Our free site analyzer scans your website for the most common accessibility
                issues in seconds. You get a detailed report with specific problems and
                their business impact — no dev jargon, just plain-language explanations.
              </p>
              <p>
                If you want help fixing what we find, our team handles the remediation.
                We fix the accessibility issues, test the results, and give you a clean
                report. Most sites can be brought into compliance within 1–2 weeks.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { step: '1', title: 'Scan', desc: 'Run our free analyzer to see where you stand', color: 'bg-emerald-500' },
                { step: '2', title: 'Fix', desc: 'Our team resolves the issues we find', color: 'bg-blue-500' },
                { step: '3', title: 'Verify', desc: 'Get a clean report you can share', color: 'bg-purple-500' },
              ].map((item) => (
                <div key={item.step} className="text-center p-6 rounded-xl bg-slate-50 border border-slate-100">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${item.color} text-white font-bold mb-3`}>
                    {item.step}
                  </div>
                  <h3 className="font-bold text-slate-800 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* Bottom CTA */}
        <FadeIn direction="up">
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-12 text-center">
            <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />

            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Find Out Where You Stand
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto mb-8">
                Our free site analyzer checks for all the issues listed above — plus
                SEO, content quality, and technical health. Takes about 10 seconds.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/site-analyzer"
                  className="px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/25 transition-all"
                >
                  Analyze My Site Free
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-4 rounded-xl border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10 font-bold text-lg transition-all"
                >
                  Book a Free 15-Min Call
                </Link>
              </div>
            </div>
          </section>
        </FadeIn>
      </div>
    </div>
  );
}
