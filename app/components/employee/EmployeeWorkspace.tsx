'use client';

import { useState } from 'react';
import { BarChart3, Check, Clock3, FileText, History, ShieldCheck, SunMedium } from 'lucide-react';

type Queue = 'morning' | 'midday' | 'evening';
type Decision = 'approve' | 'revise' | 'defer' | 'reject';

const sample = {
  morning: { title: 'Prioritize four warm audit leads', evidence: 'Each opened the report more than once in the last seven days.', action: 'Review four tailored follow-up drafts for manual sending.', expected: 'Start 1–2 qualified conversations.', risk: 'Low · no message sends automatically' },
  midday: { title: 'Approve the strongest follow-up', evidence: 'The lead viewed the pricing and conversion sections of their report.', action: 'Approve, revise, defer, or reject the prepared email.', expected: 'Secure a 20-minute discovery call.', risk: 'Low · approval and manual send required' },
  evening: { title: 'Resolve two unanswered conversations', evidence: 'No reply after the agreed follow-up window.', action: 'Choose tomorrow’s next action or close the loop.', expected: 'Keep the active queue accurate.', risk: 'Low · internal planning only' },
};

export default function EmployeeWorkspace() {
  const [queue, setQueue] = useState<Queue>('morning');
  const [decision, setDecision] = useState<Decision | null>(null);
  const [instructions, setInstructions] = useState('');
  const item = sample[queue];
  const tabs: Array<[Queue, string, React.ElementType]> = [['morning', 'Morning Brief', SunMedium], ['midday', 'Midday Decisions', Clock3], ['evening', 'End-of-Day Review', BarChart3]];

  return (
    <div className="min-h-screen bg-[#f7f4ed] text-[#183229]">
      <header className="border-b border-[#183229]/10 bg-white/70">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">NeedThisDone internal pilot</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-playfair text-4xl font-black">AI Growth Employee</h1><p className="mt-2 text-[#50675e]">Today’s capped queue · 1 of 3 decisions</p></div><span className="rounded-full bg-[#e4eee6] px-4 py-2 text-sm font-bold text-[#126b4e]">Supervised mode</span></div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <nav aria-label="Employee workspace" className="grid gap-2 sm:grid-cols-3">
          {tabs.map(([id, label, Icon]) => <button key={id} onClick={() => { setQueue(id); setDecision(null); }} aria-current={queue === id ? 'page' : undefined} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 font-bold ${queue === id ? 'bg-[#18372e] text-white' : 'border border-[#183229]/15 bg-white'}`}><Icon className="h-4 w-4" />{label}</button>)}
        </nav>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
          <section className="rounded-3xl border border-[#183229]/15 bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#126b4e]">Priority 1 · decision</p><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">~6 minutes</span></div>
            <h2 className="mt-4 text-3xl font-black">{item.title}</h2>
            <dl className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#f7f4ed] p-5"><dt className="text-sm font-bold">Evidence</dt><dd className="mt-2 leading-6 text-[#50675e]">{item.evidence}</dd></div>
              <div className="rounded-2xl bg-[#f7f4ed] p-5"><dt className="text-sm font-bold">Proposed action</dt><dd className="mt-2 leading-6 text-[#50675e]">{item.action}</dd></div>
              <div className="rounded-2xl bg-[#f7f4ed] p-5"><dt className="text-sm font-bold">Expected outcome</dt><dd className="mt-2 leading-6 text-[#50675e]">{item.expected}</dd></div>
              <div className="rounded-2xl bg-[#f7f4ed] p-5"><dt className="text-sm font-bold">Risk</dt><dd className="mt-2 leading-6 text-[#50675e]">{item.risk}</dd></div>
            </dl>
            {decision ? <div className="mt-7 rounded-2xl bg-[#e4eee6] p-5" role="status"><p className="font-bold"><Check className="mr-2 inline h-5 w-5" />Decision staged: {decision}</p><p className="mt-2 text-sm text-[#50675e]">The production queue records this as an immutable decision before any next action. This internal preview does not execute external work.</p></div> : <>
              <label className="mt-7 block font-semibold">Optional instructions<textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-[#183229]/20 p-3" placeholder="Adjust tone, add context, or explain your decision…" /></label>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">{(['approve', 'revise', 'defer', 'reject'] as Decision[]).map((action) => <button key={action} onClick={() => setDecision(action)} className={action === 'approve' ? 'min-h-11 rounded-full bg-[#126b4e] px-4 font-bold capitalize text-white' : 'min-h-11 rounded-full border border-[#183229]/20 px-4 font-bold capitalize'}>{action}</button>)}</div>
            </>}
          </section>
          <aside className="space-y-4">
            {[['Activity', 'Immutable history and evidence', History], ['Outcomes', 'Leads, replies, meetings, projects, time saved', BarChart3], ['Role & Guardrails', 'Responsibilities, channels, tone, approval rules', ShieldCheck]].map(([title, text, Icon]) => { const ItemIcon = Icon as React.ElementType; return <div key={title as string} className="rounded-2xl border border-[#183229]/15 bg-white p-5"><ItemIcon className="h-5 w-5 text-[#126b4e]" /><h3 className="mt-3 font-bold">{title as string}</h3><p className="mt-1 text-sm leading-6 text-[#50675e]">{text as string}</p></div>; })}
            <div className="rounded-2xl bg-[#d9b96e]/35 p-5"><FileText className="h-5 w-5" /><p className="mt-3 text-sm font-bold">Approval boundary</p><p className="mt-1 text-sm leading-6">No outreach, publishing, system changes, or spending without a recorded approval.</p></div>
          </aside>
        </div>
      </main>
    </div>
  );
}
