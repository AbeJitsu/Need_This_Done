import Link from 'next/link';
import {
  ArrowRight,
  CircleCheck,
  Clock3,
  Database,
  FileCheck2,
  ShieldCheck,
  Workflow,
} from 'lucide-react';

const evidenceCards = [
  {
    title: 'Runs have a record',
    description: 'A run keeps its status, tasks, model choices, failures, and controls together so progress can be inspected instead of guessed.',
    icon: Workflow,
  },
  {
    title: 'Evidence travels with work',
    description: 'Sources, notes, drafts, previews, and versions stay attached to the work that produced them.',
    icon: Database,
  },
  {
    title: 'Decisions are explicit',
    description: 'Approval, revision, defer, rejection, and stop are recorded actions—not assumptions hidden in a chat thread.',
    icon: ShieldCheck,
  },
];

function EvidencePanel() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-[#183229]/20 bg-[#18372e] shadow-2xl shadow-emerald-950/20">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-white sm:px-6">
        <div className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-emerald-300" /><p className="text-sm font-bold">Run record</p></div>
        <span className="rounded-full bg-emerald-300/15 px-3 py-1 text-xs font-bold text-emerald-200">Review ready</span>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-300">Research → draft → review</p><h2 className="mt-2 text-2xl font-black text-white">One work package</h2><p className="mt-2 text-sm text-emerald-50/65">Every handoff remains visible.</p></div>
          <div className="text-right"><p className="text-xs text-emerald-50/55">Cost so far</p><p className="mt-1 text-xl font-black text-white">$0.74</p></div>
        </div>
        <div className="mt-6 space-y-2">
          {[
            ['Researcher', '3 public sources attached', 'Complete'],
            ['Writer', 'Draft version 2 ready', 'Complete'],
            ['Reviewer', 'One approval waiting', 'Review'],
          ].map(([role, detail, status]) => (
            <div key={role} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[.07] p-4">
              <div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-300 text-[#18372e]"><CircleCheck className="h-4 w-4" aria-hidden="true" /></span><div><p className="text-sm font-bold text-white">{role}</p><p className="text-xs text-emerald-50/60">{detail}</p></div></div>
              <span className="text-xs font-bold text-emerald-200">{status}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#f7f4ed] p-4 text-[#183229]"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#126b4e]"><FileCheck2 className="h-4 w-4" aria-hidden="true" />Evidence</p><p className="mt-3 font-bold">Sources and versions attached</p></div>
          <div className="rounded-2xl bg-[#d9b96e] p-4 text-[#183229]"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest"><Clock3 className="h-4 w-4" aria-hidden="true" />Human gate</p><p className="mt-3 font-bold">No external action yet</p></div>
        </div>
      </div>
    </div>
  );
}

export default function WorkPageClient() {
  return (
    <main className="bg-[#f7f4ed] text-[#183229]">
      <section className="bg-[#18372e] text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[.8fr_1.2fr] lg:px-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-200">Work</p>
            <h1 className="mt-5 font-playfair text-5xl font-black leading-tight md:text-7xl">See the record behind the work.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-emerald-50/75">A useful system makes progress, evidence, cost, and the next decision easier to inspect. This is what that looks like in practice.</p>
          </div>
          <EvidencePanel />
        </div>
      </section>

      <section aria-labelledby="evidence-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-28 lg:px-12">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">System evidence</p>
          <h2 id="evidence-heading" className="mt-4 font-playfair text-4xl font-black leading-tight md:text-6xl">Useful work leaves a trail.</h2>
          <p className="mt-5 text-lg leading-8 text-[#50675e]">The point of coordination is not more activity. It is a clearer record of what happened and what should happen next.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {evidenceCards.map(({ title, description, icon: Icon }) => (
            <article key={title} className="rounded-3xl border border-[#183229]/15 bg-white p-7">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e4eee6] text-[#126b4e]"><Icon className="h-5 w-5" aria-hidden="true" /></div>
              <h3 className="mt-6 text-2xl font-black">{title}</h3>
              <p className="mt-3 leading-7 text-[#50675e]">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#183229]/10 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <div className="grid gap-10 md:grid-cols-[.75fr_1.25fr] md:items-start">
            <div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">Follow the handoff</p><h2 className="mt-4 font-playfair text-4xl font-black">From context to outcome.</h2></div>
            <div className="grid gap-3 sm:grid-cols-5">
              {[
                ['Context', 'The request is specific'],
                ['Work', 'Tasks have owners'],
                ['Evidence', 'Sources stay attached'],
                ['Review', 'A decision is visible'],
                ['Outcome', 'The record closes the loop'],
              ].map(([title, description], index) => (
                <div key={title} className="relative rounded-2xl bg-[#f7f4ed] p-4 sm:min-h-36">
                  <span className="text-xs font-bold text-[#126b4e]">{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="mt-4 font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-5 text-[#50675e]">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8 md:py-24">
        <h2 className="font-playfair text-3xl font-black md:text-5xl">Bring the work that is hard to see.</h2>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-[#50675e]">Share the context and the result you want. We will help define the smallest useful next step.</p>
        <Link href="/contact" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white">Contact <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </section>
    </main>
  );
}
