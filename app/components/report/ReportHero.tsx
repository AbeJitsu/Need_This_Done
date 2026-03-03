// ============================================================================
// Report Hero — Grade badge + executive summary
// ============================================================================
// Dark hero with color-coded grade badge following BJJ belt progression:
// A=emerald, B=blue, C=purple, D=gold, F=red

const gradeConfig: Record<string, { color: string; bg: string; shadow: string; label: string }> = {
  A: { color: 'text-emerald-400', bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/30', label: 'Excellent' },
  B: { color: 'text-blue-400', bg: 'bg-blue-500', shadow: 'shadow-blue-500/30', label: 'Good' },
  C: { color: 'text-purple-400', bg: 'bg-purple-500', shadow: 'shadow-purple-500/30', label: 'Fair' },
  D: { color: 'text-amber-400', bg: 'bg-amber-500', shadow: 'shadow-amber-500/30', label: 'Needs Work' },
  F: { color: 'text-red-400', bg: 'bg-red-500', shadow: 'shadow-red-500/30', label: 'Critical' },
};

interface ReportHeroProps {
  domain: string;
  url: string;
  score: number;
  grade: string;
  executiveSummary: string;
  pagesCrawled: number;
}

export default function ReportHero({ domain, score, grade, executiveSummary, pagesCrawled }: ReportHeroProps) {
  const config = gradeConfig[grade] || gradeConfig.F;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Decorative blurs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="relative max-w-5xl mx-auto px-6 sm:px-8 md:px-12 pt-16 md:pt-24 pb-16 md:pb-20">
        {/* Accent line + label */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
          <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
            Site Report
          </span>
        </div>

        <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] mb-8">
          {domain}
        </h1>

        {/* Score + grade badge */}
        <div className="flex items-center gap-6 mb-8">
          <div className="flex items-baseline gap-2">
            <span className="text-6xl md:text-7xl font-black text-white leading-none">{score}</span>
            <span className="text-2xl text-slate-500 font-medium">/100</span>
          </div>

          <div className={`${config.bg} ${config.shadow} shadow-lg px-5 py-2 rounded-full`}>
            <span className="text-white text-xl font-bold">{grade}</span>
            <span className="text-white/80 text-sm ml-2">{config.label}</span>
          </div>
        </div>

        {/* Meta info */}
        <p className="text-sm text-slate-500 mb-4">
          {pagesCrawled} pages analyzed
        </p>

        {/* Executive summary */}
        <p className="text-lg text-slate-300 leading-relaxed max-w-3xl">
          {executiveSummary}
        </p>
      </div>
    </section>
  );
}
