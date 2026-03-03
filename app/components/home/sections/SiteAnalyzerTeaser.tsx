// ============================================================================
// Site Analyzer Teaser — Homepage section driving traffic to /site-analyzer
// ============================================================================
// Positioned before the final CTA as a value-add. Uses glassmorphism card
// with a clear value prop and trust badges.

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function SiteAnalyzerTeaser() {
  return (
    <div className="mb-24">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-12">
        {/* Decorative blurs */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Left: copy */}
          <div className="max-w-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
              <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
                Free Tool
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-[1.05] mb-3">
              How Does Your Website Stack Up?
            </h2>

            <p className="text-slate-400 leading-relaxed mb-6">
              Get a free, instant audit of your website&apos;s SEO, accessibility, and
              performance — scored on a 100-point scale with specific recommendations.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-400" aria-hidden="true">&#10003;</span>
                10-second analysis
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-400" aria-hidden="true">&#10003;</span>
                ADA compliance check
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-400" aria-hidden="true">&#10003;</span>
                AI-powered review
              </span>
            </div>
          </div>

          {/* Right: CTA */}
          <div className="flex-shrink-0">
            <Link
              href="/site-analyzer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/25 transition-all"
            >
              Analyze My Site Free
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
