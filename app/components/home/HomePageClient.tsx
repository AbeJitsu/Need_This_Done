import Link from 'next/link';
import {
  ArrowRight,
  Check,
  CircleCheck,
  FileSearch,
  FileText,
  PanelTop,
  Search,
  Sparkles,
} from 'lucide-react';
import { PUBLIC_OFFERS } from '@/lib/public-offers';

const containedFixes = [
  'One page or component fix',
  'One accessibility, SEO, performance, or conversion fix',
  'A clear before-and-after handoff',
];

const automationIncludes = [
  'A clear outcome and workflow',
  'Tools, LLMs, and agents coordinated in one place',
  'Evidence and approvals attached to the work',
];

function ScatteredWorkPreview() {
  return (
    <div className="relative" aria-label="Illustration of work scattered across separate tools">
      <div className="absolute -inset-3 rounded-[2.25rem] bg-[#18372e]/10 blur-xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-[#183229]/15 bg-white p-4 shadow-2xl shadow-emerald-950/10 sm:p-6">
        <div className="flex items-center justify-between border-b border-[#183229]/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f28b82]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#e8c66a]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#8ed3ac]" />
            </div>
            <div className="flex items-center gap-2 rounded-full bg-[#f7f4ed] px-3 py-1.5 text-xs text-[#50675e]">
              <PanelTop className="h-3.5 w-3.5" aria-hidden="true" />
              Too many tabs
            </div>
          </div>
          <span className="text-xs font-bold text-[#a16a24]">No shared next step</span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#183229]/10 bg-[#e4eee6] p-4">
            <Search className="h-5 w-5 text-[#126b4e]" aria-hidden="true" />
            <p className="mt-4 text-sm font-black text-[#183229]">Research</p>
            <p className="mt-1 text-xs leading-5 text-[#50675e]">Sources in one tab</p>
            <span className="mt-4 block rounded-full bg-white/70 px-3 py-1 text-center text-[11px] font-bold text-[#50675e]">7 open tabs</span>
          </div>
          <div className="rounded-2xl border border-[#183229]/10 bg-[#eeeaf9] p-4">
            <FileText className="h-5 w-5 text-[#6d58a5]" aria-hidden="true" />
            <p className="mt-4 text-sm font-black text-[#183229]">Drafts</p>
            <p className="mt-1 text-xs leading-5 text-[#50675e]">Versions in another</p>
            <span className="mt-4 block rounded-full bg-white/70 px-3 py-1 text-center text-[11px] font-bold text-[#50675e]">3 versions</span>
          </div>
          <div className="rounded-2xl border border-[#183229]/10 bg-[#fbf0d4] p-4">
            <CircleCheck className="h-5 w-5 text-[#a16a24]" aria-hidden="true" />
            <p className="mt-4 text-sm font-black text-[#183229]">Approval</p>
            <p className="mt-1 text-xs leading-5 text-[#50675e]">Decision in a message</p>
            <span className="mt-4 block rounded-full bg-white/70 px-3 py-1 text-center text-[11px] font-bold text-[#50675e]">Waiting</span>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-dashed border-[#183229]/20 bg-[#f7f4ed] p-4 text-sm text-[#50675e]">
          <span className="font-black text-[#183229]">The friction:</span> the work exists, but the next decision is hard to see.
        </div>
      </div>
    </div>
  );
}

export default function HomePageClient() {
  return (
    <main className="overflow-hidden bg-[#f7f4ed] text-[#183229]">
      <section className="relative border-b border-[#183229]/10 bg-[#f7f4ed]">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-[#b8d9c7]/55 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 left-1/3 h-[28rem] w-[28rem] rounded-full bg-[#d9b96e]/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 md:py-20 lg:grid-cols-[.85fr_1.15fr] lg:px-12 lg:py-24">
          <div className="max-w-xl">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-900/15 bg-white/75 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-900 shadow-sm">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              The problem: work is scattered
            </p>
            <h1 className="font-playfair text-5xl font-black leading-[.98] tracking-tight sm:text-6xl md:text-7xl">
              Too many tools.
              <span className="block text-[#126b4e]">No clear next step.</span>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-[#40564e] md:text-xl">
              Research, drafts, and decisions live in different places. When the next move is hard to see, useful work slows down.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/services#website-improvement" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white transition hover:bg-[#0c563e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#126b4e] focus-visible:ring-offset-4">
                Fix one problem <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/services#ai-operator" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#183229]/20 bg-white/70 px-7 py-3 font-bold hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#126b4e] focus-visible:ring-offset-4">
                Set up automation
              </Link>
            </div>
            <p className="mt-5 text-sm font-semibold text-[#50675e]">Start with the smallest useful move.</p>
          </div>

          <ScatteredWorkPreview />
        </div>
      </section>

      <section aria-labelledby="offers-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-28 lg:px-12">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">Choose your path</p>
          <h2 id="offers-heading" className="mt-4 font-playfair text-4xl font-black leading-tight md:text-6xl">Move the work forward.</h2>
          <p className="mt-5 text-lg leading-8 text-[#50675e]">Start with one visible problem, or make recurring work easier to coordinate.</p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <article id="website-improvement" className="rounded-[2rem] border border-[#183229]/15 bg-white p-7 sm:p-9">
            <FileSearch className="h-8 w-8 text-[#126b4e]" aria-hidden="true" />
            <p className="mt-7 text-sm font-bold text-[#126b4e]">Targeted fix</p>
            <h3 className="mt-3 text-3xl font-black">Fix one website problem.</h3>
            <p className="mt-5 leading-7 text-[#50675e]">A focused review and one agreed fix for $500. Best when one page, component, or user path is holding progress back.</p>
            <ul className="mt-6 space-y-3 text-sm leading-6 text-[#40564e]">
              {containedFixes.map((item) => <li key={item} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-[#126b4e]" aria-hidden="true" />{item}</li>)}
            </ul>
            <Link href={PUBLIC_OFFERS['website-improvement'].contactHref} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#126b4e] px-6 py-3 font-bold text-white">Fix this problem <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </article>
          <article id="ai-operator" className="rounded-[2rem] bg-[#18372e] p-7 text-white sm:p-9">
            <PanelTop className="h-8 w-8 text-emerald-300" aria-hidden="true" />
            <p className="mt-7 text-sm font-bold text-emerald-200">Automation system setup</p>
            <h3 className="mt-3 text-3xl font-black">Make recurring work easier.</h3>
            <p className="mt-5 leading-7 text-emerald-50/75">A browser workspace that coordinates tools, LLMs, and agents around a defined result. Best when work repeats across too many places.</p>
            <ul className="mt-6 space-y-3 text-sm leading-6 text-emerald-50/85">
              {automationIncludes.map((item) => <li key={item} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />{item}</li>)}
            </ul>
            <Link href={PUBLIC_OFFERS['ai-operator'].contactHref} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-300 px-6 py-3 font-bold text-[#18372e]">Set up automation <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </article>
        </div>
      </section>
    </main>
  );
}
