import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { PUBLIC_OFFERS } from '@/lib/public-offers';

const comparison = [
  {
    name: 'Website Fix',
    tone: 'light',
    rows: [
      ['Choose this when', 'One website problem is slowing people down.'],
      ['You get', 'A focused review, one agreed fix, and a clear handoff.'],
      ['Price', '$500 total'],
    ],
    cta: 'Start a Website Fix',
    href: PUBLIC_OFFERS['website-improvement'].contactHref,
  },
  {
    name: 'Managed Automation',
    tone: 'dark',
    rows: [
      ['Choose this when', 'One repeated task keeps taking time or getting stuck.'],
      ['You get', 'A human-run 30-day pilot and a short weekly brief.'],
      ['Price', 'Priced by proposal'],
    ],
    cta: 'Discuss automation',
    href: PUBLIC_OFFERS['ai-operator'].contactHref,
  },
] as const;

export function OfferComparison({ heading = 'Choose the right starting point.' }: { heading?: string }) {
  return (
    <section aria-labelledby="offer-comparison-heading">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">Two clear offers</p>
      <h2 id="offer-comparison-heading" className="mt-4 max-w-3xl font-playfair text-4xl font-black leading-tight md:text-5xl">{heading}</h2>
      <div className="mt-10 overflow-hidden rounded-[2rem] border border-[#183229]/15 bg-white md:grid md:grid-cols-2">
        {comparison.map((offer) => {
          const dark = offer.tone === 'dark';
          return (
            <article key={offer.name} className={dark ? 'bg-[#18372e] p-7 text-white sm:p-9' : 'p-7 text-[#183229] sm:p-9'}>
              <h3 className="font-playfair text-3xl font-black">{offer.name}</h3>
              <dl className={dark ? 'mt-7 divide-y divide-white/15 border-y border-white/15' : 'mt-7 divide-y divide-[#183229]/10 border-y border-[#183229]/10'}>
                {offer.rows.map(([term, description]) => (
                  <div key={term} className="grid gap-2 py-4 sm:grid-cols-[8rem_1fr]">
                    <dt className={dark ? 'text-xs font-bold uppercase tracking-wider text-emerald-200' : 'text-xs font-bold uppercase tracking-wider text-[#126b4e]'}>{term}</dt>
                    <dd className={dark ? 'leading-6 text-emerald-50/80' : 'leading-6 text-[#50675e]'}>{description}</dd>
                  </div>
                ))}
                <div className="grid gap-2 py-4 sm:grid-cols-[8rem_1fr]">
                  <dt className={dark ? 'text-xs font-bold uppercase tracking-wider text-emerald-200' : 'text-xs font-bold uppercase tracking-wider text-[#126b4e]'}>Next step</dt>
                  <dd>
                    <Link href={offer.href} className={dark ? 'inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-300 px-5 py-2.5 font-bold text-[#18372e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white' : 'inline-flex min-h-11 items-center gap-2 rounded-full bg-[#126b4e] px-5 py-2.5 font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#126b4e] focus-visible:ring-offset-2'}>
                      {offer.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>
    </section>
  );
}

const deliverySteps = [
  ['Tell us what’s stuck', 'Share the problem in plain language.'],
  ['Agree on one outcome', 'We confirm the boundary, price, and finish line.'],
  ['We do the work and hand it off', 'You receive the agreed result and a clear record.'],
] as const;

export function ThreeStepFlow() {
  return (
    <section aria-labelledby="three-step-flow-heading">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">Three steps</p>
      <h2 id="three-step-flow-heading" className="mt-4 font-playfair text-4xl font-black">A short path from stuck to done.</h2>
      <ol className="mt-8 border-y border-[#183229]/15 md:grid md:grid-cols-3 md:divide-x md:divide-[#183229]/15">
        {deliverySteps.map(([title, description], index) => (
          <li key={title} className="flex gap-4 border-b border-[#183229]/10 py-6 last:border-b-0 md:border-b-0 md:px-6 md:first:pl-0 md:last:pr-0">
            <span className="text-sm font-black text-[#126b4e]">{index + 1}</span>
            <div><h3 className="font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-[#50675e]">{description}</p></div>
          </li>
        ))}
      </ol>
    </section>
  );
}

const controlSteps = [
  ['Prepared', 'We prepare the agreed work.'],
  ['Reviewed', 'A person checks the work and its evidence.'],
  ['Approved', 'Nothing important moves forward without a clear yes.'],
] as const;

export function HumanControlFlow() {
  return (
    <section aria-labelledby="human-control-heading" className="rounded-[2rem] bg-[#18372e] p-7 text-white sm:p-9">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-200">Human control</p>
      <h2 id="human-control-heading" className="mt-4 font-playfair text-4xl font-black">Your say stays in the work.</h2>
      <ol className="mt-8 grid gap-3 sm:grid-cols-2" aria-label="Prepared, reviewed, approved">
        {controlSteps.map(([title, description], index) => (
          <li key={title} className={`flex gap-3 rounded-2xl border border-white/15 bg-white/[.06] p-4${index === controlSteps.length - 1 ? ' sm:col-span-2' : ''}`}>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-300 font-black text-[#18372e]">{index === controlSteps.length - 1 ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}</span>
            <div className="min-w-0"><h3 className="font-black">{title}</h3><p className="mt-1 text-sm leading-6 text-emerald-50/70">{description}</p></div>
          </li>
        ))}
      </ol>
    </section>
  );
}
