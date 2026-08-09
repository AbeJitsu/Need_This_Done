import Link from 'next/link';
import { ArrowRight, Check, FileSearch, PanelTop } from 'lucide-react';
import { PUBLIC_OFFERS } from '@/lib/public-offers';

const websiteIncludes = [
  'A focused review of one website problem',
  'One agreed page, component, accessibility, SEO, performance, or conversion fix',
  'A clear before-and-after handoff',
];

const automationIncludes = [
  'A defined result and the workflow around it',
  'Tools, LLMs, and agents coordinated in one browser workspace',
  'Evidence, costs, and approvals attached to each run',
];

export default function ServicesPageClient() {
  return (
    <main className="bg-[#f7f4ed] text-[#183229]">
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">Services</p>
        <h1 className="mt-5 max-w-4xl font-playfair text-5xl font-black leading-tight md:text-7xl">Choose the shape of the fix.</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-[#50675e]">One visible website problem calls for a targeted fix. Work that keeps repeating across tools calls for an automation system.</p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 pb-20 sm:px-8 md:pb-28 lg:grid-cols-2">
        <article id="website-improvement" className="rounded-[2rem] border border-[#183229]/15 bg-white p-7 sm:p-9">
          <FileSearch className="h-8 w-8 text-[#126b4e]" aria-hidden="true" />
          <p className="mt-7 text-sm font-bold text-[#126b4e]">Path one</p>
          <h2 className="mt-3 font-playfair text-4xl font-black">Targeted fix</h2>
          <p className="mt-5 leading-7 text-[#50675e]">Choose this when a single website issue is clear enough to name and small enough to contain.</p>
          <div className="mt-5 rounded-2xl bg-[#e4eee6] p-4 text-sm font-semibold text-[#183229]">$500 total · $250 manual invoice to begin · $250 after delivery</div>
          <ul className="mt-7 space-y-3">
            {websiteIncludes.map((item) => <li key={item} className="flex gap-3 leading-6 text-[#40564e]"><Check className="mt-0.5 h-5 w-5 shrink-0 text-[#126b4e]" aria-hidden="true" />{item}</li>)}
          </ul>
          <p className="mt-7 text-sm leading-6 text-[#50675e]"><strong className="text-[#183229]">Keep the boundary clear:</strong> redesigns, integrations, multi-page builds, and ongoing maintenance need a separate scope.</p>
          <Link href={PUBLIC_OFFERS['website-improvement'].contactHref} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white">Fix one problem <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </article>

        <article id="ai-operator" className="rounded-[2rem] bg-[#18372e] p-7 text-white sm:p-9">
          <PanelTop className="h-8 w-8 text-emerald-300" aria-hidden="true" />
          <p className="mt-7 text-sm font-bold text-emerald-200">Path two</p>
          <h2 className="mt-3 font-playfair text-4xl font-black">Automation system setup</h2>
          <p className="mt-5 leading-7 text-emerald-50/75">Choose this when the same work returns, crosses tools, or needs several kinds of preparation before a decision.</p>
          <div className="mt-5 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm font-semibold text-emerald-50">Proposal-based · scope, price, and commitment agreed before work begins</div>
          <ul className="mt-7 space-y-3">
            {automationIncludes.map((item) => <li key={item} className="flex gap-3 leading-6 text-emerald-50/85"><Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />{item}</li>)}
          </ul>
          <p className="mt-7 text-sm leading-6 text-emerald-50/75"><strong className="text-white">Start with the result:</strong> the setup is shaped around what should improve, not around a tool list.</p>
          <Link href={PUBLIC_OFFERS['ai-operator'].contactHref} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-300 px-7 py-3 font-bold text-[#18372e]">Set up automation <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </article>
      </section>

      <section className="border-y border-[#183229]/10 bg-[#e4eee6]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-20">
          <div className="grid gap-8 md:grid-cols-[.8fr_1.2fr] md:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">A useful first decision</p>
              <h2 className="mt-4 font-playfair text-4xl font-black">What is stuck?</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#183229]/10 bg-white/70 p-5"><p className="font-black text-[#183229]">One visible issue</p><p className="mt-2 text-sm leading-6 text-[#50675e]">Start with the targeted fix and leave with one clear change.</p></div>
              <div className="rounded-2xl border border-[#183229]/10 bg-white/70 p-5"><p className="font-black text-[#183229]">A repeating workflow</p><p className="mt-2 text-sm leading-6 text-[#50675e]">Start with automation setup and define the result before the system.</p></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
