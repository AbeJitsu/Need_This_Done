import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Check,
  ClipboardCheck,
  Clock3,
  FileSearch,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import type { HomePageContent } from '@/lib/page-content-types';
import type { BlogPostSummary } from '@/lib/blog-types';
import { PUBLIC_OFFERS } from '@/lib/public-offers';

interface HomePageClientProps {
  content: HomePageContent;
  recentBlogPosts?: BlogPostSummary[];
}

const checkIns = [
  {
    time: 'Morning',
    title: 'Choose the priorities',
    description: 'Abe and Andrea prepare the strongest opportunities, risks, and questions for a short human review.',
    icon: Search,
  },
  {
    time: 'Midday',
    title: 'Review prepared work',
    description: 'Every proposed external action carries its evidence, intended result, and approval boundary.',
    icon: ClipboardCheck,
  },
  {
    time: 'Weekly brief',
    title: 'Close the loop',
    description: 'Clients receive a concise update on what moved, what needs a decision, and what happens next.',
    icon: BarChart3,
  },
];

const containedFixes = [
  'One agreed page or component-level improvement',
  'One focused accessibility, SEO, performance, or conversion correction',
  'A before/after handoff—not a redesign, integration, or multi-page build',
];

export default function HomePageClient({ recentBlogPosts = [] }: HomePageClientProps) {
  return (
    <main className="overflow-hidden bg-[#f7f4ed] text-[#183229]">
      <section className="relative border-b border-[#183229]/10">
        <div className="absolute inset-y-0 right-0 hidden w-[38%] border-l border-[#183229]/10 bg-[#e4eee6] lg:block" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-[1.1fr_.9fr] lg:px-12">
          <div className="max-w-3xl">
            <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-900/15 bg-white/60 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-900">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Two focused ways to move work forward
            </p>
            <h1 className="font-playfair text-5xl font-black leading-[.98] tracking-tight sm:text-6xl md:text-8xl">
              Fix the website path in front of you—or put a supervised AI operator behind it.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-[#40564e] md:text-xl">
              Start with a contained $500 website improvement, or a proposal-based 30-day AI-operator pilot. Both paths stay accountable to a real person and a clear scope.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href={PUBLIC_OFFERS['website-improvement'].contactHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white transition hover:bg-[#0c563e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#126b4e] focus-visible:ring-offset-4">
                Improve my website <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href={PUBLIC_OFFERS['ai-operator'].contactHref} className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#183229]/20 bg-white/50 px-7 py-3 font-bold hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#126b4e] focus-visible:ring-offset-4">
                Discuss an AI operator
              </Link>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-[#50675e]">
              <ShieldCheck className="h-4 w-4 text-[#126b4e]" aria-hidden="true" />
              No external action is sent, published, changed, or purchased without human approval.
            </p>
          </div>

          <aside className="self-center rounded-[2rem] border border-[#183229]/15 bg-[#17372d] p-6 text-white shadow-2xl shadow-emerald-950/15 sm:p-8" aria-label="Offer summary">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-200">Choose your starting point</p>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-white p-5 text-[#183229]">
                <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">Website Improvement</p><h2 className="mt-2 text-xl font-bold">$500 audit + one contained fix</h2></div><Wrench className="h-6 w-6 shrink-0 text-[#126b4e]" aria-hidden="true" /></div>
                <p className="mt-3 text-sm leading-6 text-[#50675e]">50% by manual invoice to begin, then 50% after the agreed fix is delivered.</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
                <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-200">Managed AI Operator</p><h2 className="mt-2 text-xl font-bold">Proposal-based 30-day pilot</h2></div><Clock3 className="h-6 w-6 shrink-0 text-emerald-300" aria-hidden="true" /></div>
                <p className="mt-3 text-sm leading-6 text-emerald-50/75">Operated privately by Abe and Andrea, with a clear brief and weekly client updates.</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section aria-labelledby="offers-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-28 lg:px-12">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">The two offers</p>
          <h2 id="offers-heading" className="mt-4 font-playfair text-4xl font-black leading-tight md:text-6xl">Equal starting points. Different kinds of leverage.</h2>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <article id="website-improvement" className="rounded-[2rem] border border-[#183229]/15 bg-white p-7 sm:p-9">
            <FileSearch className="h-8 w-8 text-[#126b4e]" aria-hidden="true" />
            <p className="mt-7 text-sm font-bold text-[#126b4e]">Website Improvement</p>
            <h3 className="mt-3 text-3xl font-black">Find the costly gap. Fix one thing that matters.</h3>
            <p className="mt-5 leading-7 text-[#50675e]">Bring a page, report, or conversion problem. The engagement includes an evidence-backed audit and one mutually agreed contained fix for $500.</p>
            <ul className="mt-6 space-y-3 text-sm leading-6 text-[#40564e]">
              {containedFixes.map((item) => <li key={item} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-[#126b4e]" aria-hidden="true" />{item}</li>)}
            </ul>
            <Link href={PUBLIC_OFFERS['website-improvement'].contactHref} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#126b4e] px-6 py-3 font-bold text-white">Start a website improvement <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </article>
          <article id="ai-operator" className="rounded-[2rem] bg-[#18372e] p-7 text-white sm:p-9">
            <MessageSquareText className="h-8 w-8 text-emerald-300" aria-hidden="true" />
            <p className="mt-7 text-sm font-bold text-emerald-200">Managed AI Operator</p>
            <h3 className="mt-3 text-3xl font-black">A private operator role, shaped around your bottleneck.</h3>
            <p className="mt-5 leading-7 text-emerald-50/75">Abe and Andrea run a proposal-based 30-day pilot: they research, prepare, organize, and bring only the decisions that require human judgment.</p>
            <ul className="mt-6 space-y-3 text-sm leading-6 text-emerald-50/85">
              {['A written operating brief and prohibited-action list', 'Weekly human-led client briefs with recorded outcomes', 'No client-facing dashboard and no autonomous outreach'].map((item) => <li key={item} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />{item}</li>)}
            </ul>
            <Link href={PUBLIC_OFFERS['ai-operator'].contactHref} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-300 px-6 py-3 font-bold text-[#18372e]">Discuss a 30-day pilot <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </article>
        </div>
      </section>

      <section id="example-day" className="border-y border-[#183229]/10 bg-[#e4eee6]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-28 lg:px-12">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">AI operator proof</p>
            <h2 className="mt-4 font-playfair text-4xl font-black leading-tight md:text-6xl">Three check-ins. No client portal to manage.</h2>
            <p className="mt-5 text-lg leading-8 text-[#50675e]">The current example day remains the proof: the operator prepares work privately, human reviewers decide, and the client receives a useful weekly brief.</p>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {checkIns.map(({ time, title, description, icon: Icon }, index) => (
              <article key={time} className="rounded-3xl border border-[#183229]/15 bg-white/75 p-7">
                <div className="flex items-center justify-between"><Icon className="h-6 w-6 text-[#126b4e]" aria-hidden="true" /><span className="font-playfair text-4xl text-[#126b4e]/25">0{index + 1}</span></div>
                <p className="mt-8 text-xs font-bold uppercase tracking-[.18em] text-[#126b4e]">{time}</p>
                <h3 className="mt-3 text-2xl font-bold">{title}</h3>
                <p className="mt-4 leading-7 text-[#50675e]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-28 lg:px-12">
        <div className="rounded-[2rem] bg-[#d9b96e] px-6 py-10 text-center sm:px-10">
          <ShieldCheck className="mx-auto h-7 w-7" aria-hidden="true" />
          <h2 className="mx-auto mt-4 max-w-3xl font-playfair text-3xl font-black md:text-5xl">Start with the proof that matches your immediate problem.</h2>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-[#40564e]">A website report can become one contained improvement. A recurring bottleneck can become a supervised operator pilot.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/site-analyzer" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#18372e] px-7 py-3 font-bold text-white">Run the free site audit</Link>
            <Link href={PUBLIC_OFFERS['ai-operator'].contactHref} className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#18372e]/30 bg-white/40 px-7 py-3 font-bold">Start a project</Link>
          </div>
        </div>
      </section>

      {recentBlogPosts.length > 0 && (
        <section className="border-t border-[#183229]/10 px-5 py-14 text-center">
          <Link href="/blog" className="font-bold text-[#126b4e] hover:underline">Read website and operator insights →</Link>
        </section>
      )}
    </main>
  );
}
