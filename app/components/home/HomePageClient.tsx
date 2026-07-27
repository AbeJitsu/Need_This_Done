import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Check,
  ClipboardCheck,
  Clock3,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { HomePageContent } from '@/lib/page-content-types';
import type { BlogPostSummary } from '@/lib/blog-types';

interface HomePageClientProps {
  content: HomePageContent;
  recentBlogPosts?: BlogPostSummary[];
}

const checkIns = [
  {
    time: 'Morning · 8:30',
    title: 'Choose today’s priorities',
    description: 'Review the strongest opportunities, conversion risks, and the three decisions most likely to move the business.',
    icon: Search,
  },
  {
    time: 'Midday · 12:30',
    title: 'Approve prepared work',
    description: 'See the evidence, proposed action, expected outcome, and risk before approving, revising, deferring, or rejecting.',
    icon: ClipboardCheck,
  },
  {
    time: 'End of day · 4:30',
    title: 'Review outcomes',
    description: 'Close the loop on replies, leads, unresolved work, and the follow-ups already prepared for tomorrow.',
    icon: BarChart3,
  },
];

const handles = [
  'Researches growth opportunities and customer signals',
  'Audits websites and conversion paths for costly gaps',
  'Prepares follow-up and messages for your approval',
  'Prioritizes a short queue instead of creating more noise',
  'Tracks replies, meetings, projects, and time saved',
  'Learns from every edit, rejection, deferral, and outcome',
];

export default function HomePageClient({ recentBlogPosts = [] }: HomePageClientProps) {
  return (
    <main className="overflow-hidden bg-[#f7f4ed] text-[#183229]">
      <section className="relative border-b border-[#183229]/10">
        <div className="absolute inset-y-0 right-0 hidden w-[38%] border-l border-[#183229]/10 bg-[#e4eee6] lg:block" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-[1.15fr_.85fr] lg:px-12">
          <div className="max-w-3xl">
            <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-900/15 bg-white/60 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-900">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              A managed AI employee, supervised by you
            </p>
            <h1 className="font-playfair text-5xl font-black leading-[.98] tracking-tight sm:text-6xl md:text-8xl">
              Growth work moves forward—even when you’re busy.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-[#40564e] md:text-xl">
              Your AI Growth Employee researches, audits, prepares, and tracks the work between check-ins. You make the important decisions in three focused 15–20 minute sessions.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white transition hover:bg-[#0c563e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#126b4e] focus-visible:ring-offset-4">
                Design My AI Employee <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="#example-day" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#183229]/20 bg-white/50 px-7 py-3 font-bold hover:bg-white">
                See an example day
              </Link>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-[#50675e]">
              <ShieldCheck className="h-4 w-4 text-[#126b4e]" aria-hidden="true" />
              Nothing is sent, published, changed, or purchased without your approval.
            </p>
          </div>

          <div className="self-center rounded-[2rem] border border-[#183229]/15 bg-[#17372d] p-5 text-white shadow-2xl shadow-emerald-950/15 sm:p-7">
            <div className="flex items-center justify-between border-b border-white/15 pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-200">Morning brief</p>
                <p className="mt-1 text-xl font-bold">3 decisions · about 16 min</p>
              </div>
              <Clock3 className="h-6 w-6 text-emerald-300" aria-hidden="true" />
            </div>
            <div className="mt-5 rounded-2xl bg-white p-5 text-[#183229]">
              <p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">Highest opportunity</p>
              <h2 className="mt-2 text-xl font-bold">Follow up with 4 warm audit leads</h2>
              <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <div><dt className="text-[#6c7d76]">Evidence</dt><dd className="mt-1 font-semibold">Opened report twice</dd></div>
                <div><dt className="text-[#6c7d76]">Expected</dt><dd className="mt-1 font-semibold">1–2 conversations</dd></div>
                <div><dt className="text-[#6c7d76]">Risk</dt><dd className="mt-1 font-semibold">Low · manual send</dd></div>
                <div><dt className="text-[#6c7d76]">Prepared</dt><dd className="mt-1 font-semibold">4 tailored drafts</dd></div>
              </dl>
              <div className="mt-5 flex gap-2">
                <span className="rounded-full bg-[#126b4e] px-4 py-2 text-sm font-bold text-white">Approve</span>
                <span className="rounded-full border border-[#183229]/20 px-4 py-2 text-sm font-bold">Revise</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="example-day" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-28 lg:px-12">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">An example day</p>
          <h2 className="mt-4 font-playfair text-4xl font-black leading-tight md:text-6xl">Three check-ins. No endless task list.</h2>
          <p className="mt-5 text-lg leading-8 text-[#50675e]">The employee works between sessions and brings only the decisions that need your judgment.</p>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {checkIns.map(({ time, title, description, icon: Icon }, index) => (
            <article key={time} className="rounded-3xl border border-[#183229]/15 bg-white/65 p-7">
              <div className="flex items-center justify-between">
                <Icon className="h-6 w-6 text-[#126b4e]" aria-hidden="true" />
                <span className="font-playfair text-4xl text-[#126b4e]/25">0{index + 1}</span>
              </div>
              <p className="mt-8 text-xs font-bold uppercase tracking-[.18em] text-[#126b4e]">{time}</p>
              <h3 className="mt-3 text-2xl font-bold">{title}</h3>
              <p className="mt-4 leading-7 text-[#50675e]">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#18372e] text-white">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-2 lg:px-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-200">What it handles</p>
            <h2 className="mt-4 font-playfair text-4xl font-black leading-tight md:text-6xl">A focused growth role, designed around your business.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-emerald-50/75">Websites, integrations, and automation are implementation tools—not the product. They are used only when the approved growth plan calls for them.</p>
          </div>
          <ul className="grid content-start gap-3">
            {handles.map((item) => (
              <li key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="outcomes" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-28 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">Start supervised</p>
            <h2 className="mt-4 font-playfair text-4xl font-black md:text-6xl">Prove the role before scaling it.</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <article className="rounded-3xl border border-[#183229]/15 bg-white p-7">
              <p className="text-sm font-bold text-[#126b4e]">AI Growth Employee Pilot</p>
              <h3 className="mt-3 text-2xl font-bold">Design and test the role</h3>
              <p className="mt-4 leading-7 text-[#50675e]">Discovery, operating brief, first workflows, guardrails, check-in design, and a measured trial.</p>
              <p className="mt-6 text-sm font-bold">Proposal-based</p>
            </article>
            <article className="rounded-3xl bg-[#e4eee6] p-7">
              <p className="text-sm font-bold text-[#126b4e]">Managed AI Growth Employee</p>
              <h3 className="mt-3 text-2xl font-bold">Operate and improve it</h3>
              <p className="mt-4 leading-7 text-[#50675e]">Ongoing operation, monitoring, reporting, workflow improvement, and human support.</p>
              <p className="mt-6 text-sm font-bold">Proposal-based</p>
            </article>
          </div>
        </div>
        <div className="mt-16 rounded-[2rem] bg-[#d9b96e] px-6 py-10 text-center sm:px-10">
          <MessageSquareText className="mx-auto h-7 w-7" aria-hidden="true" />
          <h2 className="mx-auto mt-4 max-w-3xl font-playfair text-3xl font-black md:text-5xl">What growth work would you stop carrying if the right employee brought you only the decisions?</h2>
          <Link href="/contact" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#18372e] px-7 py-3 font-bold text-white">
            Design My AI Employee <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {recentBlogPosts.length > 0 && (
        <section className="border-t border-[#183229]/10 px-5 py-14 text-center">
          <Link href="/blog" className="font-bold text-[#126b4e] hover:underline">Read growth operating insights →</Link>
        </section>
      )}
    </main>
  );
}
