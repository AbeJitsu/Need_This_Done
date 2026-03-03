import { Metadata } from 'next';
import AnalyzerForm from '@/components/site-analyzer/AnalyzerForm';

// ============================================================================
// Site Analyzer Page - /site-analyzer
// ============================================================================
// Public lead generation tool. Users enter a URL + email, get a free site
// analysis report emailed to them and viewable at /report/[id].

export const metadata: Metadata = {
  title: 'Free Site Analyzer - NeedThisDone',
  description:
    'Get a free website audit with SEO, accessibility, and performance scoring. Enter your URL and get a detailed report with specific recommendations.',
  alternates: { canonical: '/site-analyzer' },
  openGraph: {
    title: 'Free Website Analyzer - NeedThisDone',
    description: 'Score your website on SEO, accessibility, and performance. Get a detailed report with AI-powered recommendations.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Website Analyzer - NeedThisDone',
    description: 'Score your website on SEO, accessibility, and performance. Get a detailed report with AI-powered recommendations.',
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
              Free Tool
            </span>
          </div>

          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
            How Does Your Website{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Stack Up?
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mb-12">
            Get a free, instant audit of your website&apos;s SEO, accessibility, and
            performance — scored on a 100-point scale with specific, actionable
            recommendations from AI analysis.
          </p>

          {/* Form */}
          <AnalyzerForm />

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6 mt-10 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              10-second analysis
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              ADA compliance check
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              AI-powered review
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
