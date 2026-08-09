import Link from 'next/link';
import { ArrowRight, Check, FileSearch, ShieldCheck, Wrench } from 'lucide-react';
import { PUBLIC_OFFERS } from '@/lib/public-offers';

const websiteIncludes = [
  'A focused review of the submitted website path and its evidence',
  'A prioritized recommendation you can understand before work begins',
  'One agreed contained fix: page/component, accessibility, SEO, performance, or conversion',
  'A before/after handoff describing the completed change',
];

const operatorIncludes = [
  'A written 30-day pilot proposal, operating brief, and prohibited-action list',
  'Private research, preparation, and queue operation by Abe and Andrea',
  'Human approval before any external message, publish, system change, or spend',
  'Four weekly client briefs with decisions, outcomes, and the next recommended step',
];

export default function ServicesPageClient() {
  return (
    <main className="bg-[#f7f4ed] text-[#183229]">
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">Two ways to engage</p>
        <h1 className="mt-5 max-w-4xl font-playfair text-5xl font-black leading-tight md:text-7xl">Start with the problem that is blocking progress now.</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-[#50675e]">NeedThisDone offers one bounded website engagement and one human-led operator pilot. Neither is a catch-all build contract, an autonomous agent, or a customer dashboard.</p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 pb-20 sm:px-8 md:pb-28 lg:grid-cols-2">
        <article id="website-improvement" className="rounded-[2rem] border border-[#183229]/15 bg-white p-7 sm:p-9">
          <FileSearch className="h-8 w-8 text-[#126b4e]" aria-hidden="true" />
          <p className="mt-7 text-sm font-bold text-[#126b4e]">Website Improvement</p>
          <h2 className="mt-3 font-playfair text-4xl font-black">$500 audit + one contained fix</h2>
          <p className="mt-5 leading-7 text-[#50675e]">Use the free site audit or bring a known problem. We agree on one contained improvement before implementation begins, so the outcome stays clear and reviewable.</p>
          <p className="mt-5 rounded-2xl bg-[#e4eee6] p-4 text-sm font-semibold text-[#183229]">Payment: $250 manual invoice to begin, then $250 manual invoice after the agreed fix is delivered.</p>
          <ul className="mt-7 space-y-3">
            {websiteIncludes.map((item) => <li key={item} className="flex gap-3 leading-6 text-[#40564e]"><Check className="mt-0.5 h-5 w-5 shrink-0 text-[#126b4e]" aria-hidden="true" />{item}</li>)}
          </ul>
          <p className="mt-7 text-sm leading-6 text-[#50675e]"><strong className="text-[#183229]">Not included:</strong> a redesign, an integration, a multi-page build, or a new ongoing maintenance plan. Those need a separately agreed scope.</p>
          <Link href={PUBLIC_OFFERS['website-improvement'].contactHref} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white">Start a website improvement <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </article>

        <article id="ai-operator" className="rounded-[2rem] bg-[#18372e] p-7 text-white sm:p-9">
          <Wrench className="h-8 w-8 text-emerald-300" aria-hidden="true" />
          <p className="mt-7 text-sm font-bold text-emerald-200">Managed AI Operator</p>
          <h2 className="mt-3 font-playfair text-4xl font-black">A proposal-based 30-day pilot</h2>
          <p className="mt-5 leading-7 text-emerald-50/75">Abe and Andrea operate the role privately. The client does not need to learn a dashboard; they receive a useful weekly brief and make the decisions that must stay human.</p>
          <p className="mt-5 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm font-semibold text-emerald-50">Payment, scope, measures, and the approval boundary are defined in the pilot proposal before work begins.</p>
          <ul className="mt-7 space-y-3">
            {operatorIncludes.map((item) => <li key={item} className="flex gap-3 leading-6 text-emerald-50/85"><Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />{item}</li>)}
          </ul>
          <Link href={PUBLIC_OFFERS['ai-operator'].contactHref} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-300 px-7 py-3 font-bold text-[#18372e]">Discuss the AI operator pilot <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </article>
      </section>

      <section className="bg-[#e4eee6]">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-[.8fr_1.2fr] md:py-20">
          <div>
            <ShieldCheck className="h-8 w-8 text-[#126b4e]" aria-hidden="true" />
            <h2 className="mt-5 font-playfair text-4xl font-black">What stays human</h2>
          </div>
          <div>
            <p className="text-lg leading-8 text-[#50675e]">The two offers share the same operating rule: a person owns the scope, judgment, and external actions. The private operator surfaces help Abe and Andrea prepare and record work; they are not a client-facing product.</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {['No automatic outreach or publishing', 'No system changes without approval', 'No spending authority', 'No public route into the worker boundary'].map((item) => <li key={item} className="flex gap-3 rounded-2xl border border-[#183229]/10 bg-white/60 p-4 text-sm font-semibold"><Check className="h-5 w-5 shrink-0 text-[#126b4e]" aria-hidden="true" />{item}</li>)}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
