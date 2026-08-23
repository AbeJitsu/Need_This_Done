// ============================================================================
// Report CTA — Tiered call-to-action at bottom of report
// ============================================================================
// The audit conversion path always opens the contained Website Fix intake.

import Link from 'next/link';

export default function ReportCTA() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-12 text-center">
      {/* Decorative blurs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />

      <div className="relative z-10">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Ready to address one of these findings?
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto mb-8">
          Website Fix turns this report into one agreed, contained accessibility, SEO, performance, conversion, page, or component fix for $500.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/contact?offer=website-fix"
            className="px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/25 transition-all"
          >
          Start a Website Fix
          </Link>
          <Link
            href="/how-it-works"
            className="px-8 py-4 rounded-xl border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10 font-bold text-lg transition-all"
          >
            See the delivery process
          </Link>
        </div>
      </div>
    </section>
  );
}
