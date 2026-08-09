import { Metadata } from 'next';
import AnalyzerForm from '@/components/site-analyzer/AnalyzerForm';

// ============================================================================
// Site Analyzer Page - /site-analyzer
// ============================================================================
// Public lead generation tool. Users enter a URL + email, get a free site
// analysis report emailed to them and viewable at /report/[id].

export const metadata: Metadata = {
  title: 'Free Website Audit - NeedThisDone',
  description:
    'Get an evidence-based website audit with SEO, accessibility, and performance signals, then decide whether a focused $500 targeted fix fits.',
  alternates: { canonical: '/site-analyzer' },
  openGraph: {
    title: 'Free Website Audit - NeedThisDone',
    description: 'Review SEO, accessibility, and performance signals before choosing a contained targeted fix.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Website Audit - NeedThisDone',
    description: 'Review SEO, accessibility, and performance signals before choosing a contained targeted fix.',
  },
};

export default function SiteAnalyzerPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Dark */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Decorative blurs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-4xl mx-auto px-6 sm:px-10 md:px-12 pt-16 md:pt-24 pb-16 md:pb-20">
          {/* Accent line + label */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
            <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
              Free Audit
            </span>
          </div>

          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
            See where your website{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Stack Up?
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mb-12">
            Get a free evidence-based review of your website&apos;s SEO, accessibility, and
            performance. Use the report to decide whether one contained $500 targeted fix is the right next step.
          </p>

          {/* Form */}
          <AnalyzerForm />

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6 mt-10 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Report-first improvement path
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Accessibility signal check
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              No obligation to proceed
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
