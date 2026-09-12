// ============================================================================
// Selected signal summary — visual coverage bars without a public score label.

interface Category {
  name: string;
  earned: number;
  possible: number;
  note: string;
}

const DISPLAY_NAMES: Record<string, string> = {
  'Meta Tags': 'Page titles and descriptions',
  'OG Tags': 'Social sharing details',
  'Heading Structure': 'Heading order',
  'Content Depth': 'Page content',
  'CTA Presence': 'Next-step links',
  'H1 Consistency': 'Main headings',
  'Page Coverage': 'Pages checked',
  Readability: 'Reading clarity',
};

function getBarColor(earned: number, possible: number): string {
  const pct = earned / possible;
  if (pct >= 1) return 'bg-emerald-500';
  if (pct >= 0.5) return 'bg-amber-500';
  return 'bg-red-500';
}

function getBarBg(earned: number, possible: number): string {
  const pct = earned / possible;
  if (pct >= 1) return 'bg-emerald-500/10';
  if (pct >= 0.5) return 'bg-amber-500/10';
  return 'bg-red-500/10';
}

export default function ScoreBreakdown({ categories }: { categories: Category[] }) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Selected signals</h2><p className="mb-6 text-sm leading-6 text-slate-600">These checks show places worth a closer look. They are limited signals, not a complete review.</p>

      <div className="space-y-4">
        {categories.length === 0 && <p className="text-sm leading-6 text-slate-600">No signal details are available in this snapshot.</p>}
        {categories.map((cat) => {
          const pct = Math.round((cat.earned / cat.possible) * 100);
          return (
            <div key={cat.name} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-slate-700">{DISPLAY_NAMES[cat.name] || cat.name}</span>
                <span className="text-sm text-slate-500">
                  {pct >= 100 ? 'Covered' : pct >= 50 ? 'Partial' : 'Review'}
                </span>
              </div>

              <div className={`h-3 rounded-full ${getBarBg(cat.earned, cat.possible)} overflow-hidden`}>
                <div
                  className={`h-full rounded-full ${getBarColor(cat.earned, cat.possible)} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <p className="text-xs text-slate-500 mt-1">{cat.note}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
