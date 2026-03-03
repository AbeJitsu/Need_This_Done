// ============================================================================
// Score Breakdown — 10 horizontal bars with earned/possible
// ============================================================================
// Color-coded: green=full, yellow=partial, red=zero

interface Category {
  name: string;
  earned: number;
  possible: number;
  note: string;
}

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
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Score Breakdown</h2>

      <div className="space-y-4">
        {categories.map((cat) => {
          const pct = Math.round((cat.earned / cat.possible) * 100);
          return (
            <div key={cat.name} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-slate-700">{cat.name}</span>
                <span className="text-sm text-slate-500">
                  {cat.earned}/{cat.possible}
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
