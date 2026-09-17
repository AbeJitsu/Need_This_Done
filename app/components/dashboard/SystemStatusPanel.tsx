'use client';

import { SYSTEM_PROOF_LANES } from '@/lib/system-progress';

const statusClasses = {
  built: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  'next-proof': 'border-amber-200 bg-amber-50 text-amber-900',
  pending: 'border-slate-200 bg-slate-50 text-slate-800',
} as const;

export default function SystemStatusPanel() {
  return (
    <section
      data-private-system-status
      className="bg-[#e8eee8] px-5 py-8 text-[#183229] sm:px-8"
      aria-labelledby="private-system-status-heading"
    >
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">
          Private system status
        </p>
        <h1 id="private-system-status-heading" className="mt-2 text-3xl font-black">
          Implementation proof
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-[#50675e]">
          This operator-only view keeps internal proof and evidence separate from
          the public explanation. Live workflow and worker health appear below.
        </p>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {SYSTEM_PROOF_LANES.map((lane) => (
            <article
              key={lane.number}
              className="rounded-3xl border border-[#183229]/10 bg-white p-5 shadow-[0_12px_32px_rgba(24,50,41,0.04)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-black tracking-[.18em] text-[#775d22]">
                  {lane.number} · {lane.title}
                </span>
                <span
                  className={'rounded-full border px-3 py-1 text-xs font-black ' + statusClasses[lane.state]}
                >
                  {lane.status}
                </span>
              </div>
              <p className="mt-4 leading-7 text-[#50675e]">{lane.description}</p>
              <p className="mt-4 border-t border-[#183229]/10 pt-4 text-sm font-semibold text-[#183229]">
                Evidence: {lane.evidence}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
