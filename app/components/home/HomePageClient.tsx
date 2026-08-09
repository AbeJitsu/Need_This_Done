import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  ClipboardCheck,
  CircleCheck,
  Cpu,
  FileSearch,
  Globe2,
  LockKeyhole,
  MessageSquareText,
  PanelTop,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
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

const previewAgents = [
  { name: 'Coordinator', provider: 'OpenClaw', model: 'orchestrator', icon: Bot, status: 'Routing', progress: 82, color: 'bg-[#d9b96e]' },
  { name: 'Researcher', provider: 'OpenRouter', model: 'web evidence', icon: Globe2, status: 'Gathering', progress: 64, color: 'bg-[#b8d9c7]' },
  { name: 'Writer', provider: 'Anthropic', model: 'drafting', icon: MessageSquareText, status: 'Queued', progress: 28, color: 'bg-[#c9c1e8]' },
  { name: 'Reviewer', provider: 'Local', model: 'approval gate', icon: CircleCheck, status: 'Waiting', progress: 0, color: 'bg-[#dce8e2]' },
];

const heroSteps = [
  { label: 'Define the outcome', icon: Cpu },
  { label: 'Coordinate the agents', icon: Workflow },
  { label: 'Review before action', icon: CircleCheck },
];

function DashboardPreview() {
  return (
    <div className="relative" aria-label="Preview of the multi-agent browser command center">
      <div className="absolute -inset-3 rounded-[2.25rem] bg-[#18372e]/10 blur-xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-[#183229]/20 bg-[#18372e] shadow-2xl shadow-emerald-950/20">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-white sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5" aria-hidden="true"><span className="h-2.5 w-2.5 rounded-full bg-[#f28b82]" /><span className="h-2.5 w-2.5 rounded-full bg-[#e8c66a]" /><span className="h-2.5 w-2.5 rounded-full bg-[#8ed3ac]" /></div>
            <div className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-emerald-50/75 sm:flex"><PanelTop className="h-3.5 w-3.5" aria-hidden="true" /> needthisdone.com/dashboard</div>
          </div>
          <span className="flex items-center gap-2 text-xs font-bold text-emerald-200"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />Live workspace</span>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-300">Today&apos;s command center</p><h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">Research → draft → review</h2><p className="mt-2 text-sm text-emerald-50/65">One run. Four specialists. One human decision.</p></div>
            <span className="rounded-full bg-emerald-300/15 px-3 py-1.5 text-xs font-bold text-emerald-200">1 active run</span>
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {previewAgents.map(({ name, provider, model, icon: Icon, status, progress, color }) => (
              <div key={name} className="rounded-2xl border border-white/10 bg-white/[.07] p-4">
                <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className={`grid h-9 w-9 place-items-center rounded-xl ${color} text-[#183229]`}><Icon className="h-4 w-4" aria-hidden="true" /></span><div><p className="text-sm font-bold text-white">{name}</p><p className="text-[11px] text-emerald-50/55">{provider} · {model}</p></div></div><span className="text-[11px] font-bold text-emerald-200">{status}</span></div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-300" style={{ width: `${progress}%` }} /></div>
              </div>
            ))}
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-[1.15fr_.85fr]">
            <div className="rounded-2xl bg-[#f7f4ed] p-4 text-[#183229]"><div className="flex items-center justify-between gap-3"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#126b4e]"><Workflow className="h-4 w-4" aria-hidden="true" />Evidence bundle</p><span className="text-xs font-bold text-[#50675e]">2 sources</span></div><p className="mt-3 font-bold">Public research dossier ready for the writer</p><p className="mt-1 text-xs leading-5 text-[#50675e]">Sources, notes, confidence, and next questions stay attached to the run.</p></div>
            <div className="rounded-2xl bg-[#d9b96e] p-4 text-[#183229]"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest"><CircleCheck className="h-4 w-4" aria-hidden="true" />Approval queue</p><p className="mt-3 font-bold">1 content package waiting</p><p className="mt-1 text-xs leading-5 text-[#40564e]">10 sec · 9:16 · $0.74 used of $0.99</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePageClient({ recentBlogPosts = [] }: HomePageClientProps) {
  return (
    <main className="overflow-hidden bg-[#f7f4ed] text-[#183229]">
      <section className="relative border-b border-[#183229]/10 bg-[#f7f4ed]">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-[#b8d9c7]/55 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 left-1/3 h-[28rem] w-[28rem] rounded-full bg-[#d9b96e]/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 md:py-20 lg:grid-cols-[.8fr_1.2fr] lg:px-12 lg:py-24">
          <div className="max-w-xl">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-900/15 bg-white/75 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-900 shadow-sm">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              The problem: good work gets lost between tools
            </p>
            <h1 className="font-playfair text-5xl font-black leading-[.98] tracking-tight sm:text-6xl md:text-7xl">
              Your AI work is scattered.
              <span className="block text-[#126b4e]">Your decisions shouldn&apos;t be.</span>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-[#40564e] md:text-xl">
              Research lives in one tab, drafts in another, and nobody can see what is ready, blocked, or worth doing next. NeedThisDone turns that scattered work into one browser-accessible command center for multiple LLMs and agents.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/how-it-works" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white transition hover:bg-[#0c563e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#126b4e] focus-visible:ring-offset-4">
                See how it works <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/dashboard" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#183229]/20 bg-white/70 px-7 py-3 font-bold hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#126b4e] focus-visible:ring-offset-4">
                Preview the workspace
              </Link>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-[#50675e]">
              <LockKeyhole className="h-4 w-4 text-[#126b4e]" aria-hidden="true" />
              Start with the outcome. Keep the human decision visible.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-2 border-t border-[#183229]/10 pt-5">
              {heroSteps.map(({ label, icon: Icon }) => <div key={label} className="text-xs font-bold leading-5 text-[#50675e]"><Icon className="mb-2 h-4 w-4 text-[#126b4e]" aria-hidden="true" />{label}</div>)}
            </div>
          </div>

          <DashboardPreview />
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
            <p className="mt-5 leading-7 text-emerald-50/75">Abe and Andrea shape a proposal-based 30-day pilot around your bottleneck. The browser workspace keeps the work, evidence, and human decisions visible.</p>
            <ul className="mt-6 space-y-3 text-sm leading-6 text-emerald-50/85">
              {['A written operating brief and prohibited-action list', 'One browser view for runs, evidence, costs, and approvals', 'No automatic publishing, sending, or account changes'].map((item) => <li key={item} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />{item}</li>)}
            </ul>
            <Link href={PUBLIC_OFFERS['ai-operator'].contactHref} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-300 px-6 py-3 font-bold text-[#18372e]">Discuss a 30-day pilot <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </article>
        </div>
      </section>

      <section id="example-day" className="border-y border-[#183229]/10 bg-[#e4eee6]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-28 lg:px-12">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">AI operator proof</p>
            <h2 className="mt-4 font-playfair text-4xl font-black leading-tight md:text-6xl">One browser view. No black box to manage.</h2>
            <p className="mt-5 text-lg leading-8 text-[#50675e]">The example day is simple: agents gather evidence, prepare useful work, and surface the next human decision with a clear record of what happened.</p>
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
