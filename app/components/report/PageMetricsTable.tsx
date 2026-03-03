// ============================================================================
// Page Metrics Table — Collapsible per-page breakdown
// ============================================================================
// Shows path, title, word count, H1 count, and alt text coverage for each
// crawled page. Collapsed by default on mobile, open on desktop.

'use client';

import { useState } from 'react';

interface PageMetric {
  url: string;
  title: string | null;
  wordCount: number;
  h1Count: number;
  images: { total: number; withAlt: number; withoutAlt: number; altCoverage: string };
}

export default function PageMetricsTable({ metrics }: { metrics: PageMetric[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left group"
        aria-expanded={isOpen}
      >
        <h2 className="text-2xl font-bold text-slate-900">
          Page-by-Page Metrics
        </h2>
        <span className="text-slate-400 group-hover:text-slate-600 transition-colors text-xl" aria-hidden="true">
          {isOpen ? '−' : '+'}
        </span>
      </button>

      <p className="text-sm text-slate-500 mt-1 mb-4">
        {metrics.length} page{metrics.length !== 1 ? 's' : ''} crawled
      </p>

      {isOpen && (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="text-left px-4 py-3 font-semibold">Page</th>
                <th className="text-left px-4 py-3 font-semibold">Title</th>
                <th className="text-right px-4 py-3 font-semibold">Words</th>
                <th className="text-right px-4 py-3 font-semibold">H1s</th>
                <th className="text-right px-4 py-3 font-semibold">Alt Coverage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.map((page) => {
                let path: string;
                try {
                  path = new URL(page.url).pathname;
                } catch {
                  path = page.url;
                }

                const altPct = page.images.total > 0
                  ? Math.round((page.images.withAlt / page.images.total) * 100)
                  : null;

                return (
                  <tr key={page.url} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 whitespace-nowrap">
                      {path}
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-[200px] truncate">
                      {page.title || <span className="text-red-500 italic">No title</span>}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                      {page.wordCount.toLocaleString()}
                    </td>
                    <td className={`px-4 py-3 text-right tabular-nums ${
                      page.h1Count === 1 ? 'text-emerald-600' : page.h1Count === 0 ? 'text-red-500' : 'text-amber-600'
                    }`}>
                      {page.h1Count}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {altPct !== null ? (
                        <span className={`tabular-nums ${
                          altPct === 100 ? 'text-emerald-600' : altPct >= 50 ? 'text-amber-600' : 'text-red-500'
                        }`}>
                          {altPct}%
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
