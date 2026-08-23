'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Activity, AlertCircle, BarChart3, Check, Clock3, FileText, History,
  Loader2, RefreshCw, ShieldCheck, SunMedium, Target,
} from 'lucide-react';
import type {
  EmployeeDecision,
  EmployeeQueue,
  EmployeeWorkItem,
  EmployeeWorkspaceData,
} from '@/lib/ai-employee-types';
import { AddWorkItemForm, CompletionForm, OutcomeForm } from './EmployeeLifecycleForms';

type View = EmployeeQueue | 'activity' | 'outcomes' | 'guardrails';
const MAX_QUEUE_ITEMS = 5;

const primaryTabs: Array<[EmployeeQueue, string, React.ElementType]> = [
  ['morning', 'Morning Brief', SunMedium],
  ['midday', 'Midday Decisions', Clock3],
  ['evening', 'End-of-Day Review', BarChart3],
];

const secondaryTabs: Array<[View, string, React.ElementType]> = [
  ['activity', 'Activity', History],
  ['outcomes', 'Outcomes', Target],
  ['guardrails', 'Role & Guardrails', ShieldCheck],
];

function readable(value: unknown) {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return String(record.label || record.title || record.url || record.description || JSON.stringify(value));
  }
  return String(value);
}

function money(cents: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(cents / 100);
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-[#183229]/25 bg-white/60 px-6 py-14 text-center">
      <FileText className="mx-auto h-7 w-7 text-[#126b4e]" aria-hidden="true" />
      <h2 className="mt-4 text-2xl font-black">{title}</h2>
      <p className="mx-auto mt-3 max-w-lg leading-7 text-[#50675e]">{description}</p>
    </div>
  );
}

export default function EmployeeWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<View>('morning');
  const [workspace, setWorkspace] = useState<EmployeeWorkspaceData | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<Record<string, string>>({});
  const [deferDates, setDeferDates] = useState<Record<string, string>>({});
  const pendingRequests = useRef<Record<string, { fingerprint: string; idempotencyKey: string }>>({});

  const loadWorkspace = useCallback(async (customerId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const query = customerId ? `?customerId=${encodeURIComponent(customerId)}` : '';
      const response = await fetch(`/api/employee/workspace${query}`, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Workspace could not be loaded.');
      setWorkspace(payload.workspace);
      setReason(payload.reason || null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Workspace could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadWorkspace(searchParams.get('customerId') || undefined); }, [loadWorkspace, searchParams]);

  const pendingByQueue = useMemo(() => {
    const grouped: Record<EmployeeQueue, EmployeeWorkItem[]> = { morning: [], midday: [], evening: [] };
    for (const item of workspace?.workItems || []) {
      if (item.status === 'pending' && item.scheduled_date === workspace?.scheduledDate && grouped[item.queue].length < MAX_QUEUE_ITEMS) {
        grouped[item.queue].push(item);
      }
    }
    for (const items of Object.values(grouped)) items.sort((left, right) => left.priority - right.priority);
    return grouped;
  }, [workspace]);

  const decide = async (item: EmployeeWorkItem, decision: EmployeeDecision) => {
    const instruction = instructions[item.id]?.trim() || '';
    const deferDate = decision === 'defer' ? deferDates[item.id] || '' : '';
    const fingerprint = JSON.stringify({ decision, instructions: instruction, deferDate });
    const previousRequest = pendingRequests.current[item.id];
    const idempotencyKey = previousRequest?.fingerprint === fingerprint
      ? previousRequest.idempotencyKey
      : crypto.randomUUID();
    pendingRequests.current[item.id] = { fingerprint, idempotencyKey };
    setSubmittingId(item.id);
    setError(null);
    try {
      const response = await fetch(`/api/employee/work-items/${item.id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          instructions: instruction,
          deferDate: deferDate || undefined,
          idempotencyKey,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Decision could not be recorded.');
      delete pendingRequests.current[item.id];
      await loadWorkspace(workspace?.customer.id);
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : 'Decision could not be recorded.');
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return <div className="grid min-h-[65vh] place-items-center bg-[#f7f4ed] text-[#183229]"><p className="flex items-center gap-3 font-bold"><Loader2 className="h-5 w-5 animate-spin" />Loading employee workspace…</p></div>;
  }

  if (error && !workspace) {
    return (
      <div className="grid min-h-[65vh] place-items-center bg-[#f7f4ed] px-5 text-[#183229]">
        <div className="max-w-lg rounded-3xl border border-red-900/15 bg-white p-8 text-center">
          <AlertCircle className="mx-auto h-7 w-7 text-red-700" />
          <h1 className="mt-4 text-2xl font-black">The workspace is unavailable</h1>
          <p className="mt-3 text-[#50675e]">{error}</p>
          <button onClick={() => void loadWorkspace(searchParams.get('customerId') || undefined)} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#126b4e] px-5 font-bold text-white"><RefreshCw className="h-4 w-4" />Try again</button>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="grid min-h-[65vh] place-items-center bg-[#f7f4ed] px-5 text-[#183229]">
        <EmptyState
          title={reason === 'no_employee' ? 'Your employee is not designed yet' : 'No employee workspace is linked'}
          description="An operator must create the customer membership, operating brief, guardrails, and check-in schedule before work appears here."
        />
      </div>
    );
  }

  const scheduleFor = (queue: EmployeeQueue) => workspace.schedules.find((schedule) => schedule.check_in_type === queue && schedule.enabled);
  const queueItems = view === 'morning' || view === 'midday' || view === 'evening' ? pendingByQueue[view] : [];

  return (
    <div className="min-h-screen bg-[#f7f4ed] text-[#183229]">
      <header className="border-b border-[#183229]/10 bg-white/70">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">{workspace.customer.name} · {workspace.employee.status}</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div><h1 className="font-playfair text-4xl font-black">{workspace.employee.name}</h1><p className="mt-2 text-[#50675e]">{workspace.employee.role_name} · {workspace.workItems.filter((item) => item.status === 'pending' && item.scheduled_date === workspace.scheduledDate).length} decisions for {workspace.scheduledDate}</p></div>
            <span className="rounded-full bg-[#e4eee6] px-4 py-2 text-sm font-bold text-[#126b4e]">Supervised mode</span>
          </div>
          {workspace.availableCustomers.length > 1 && <label className="mt-5 block max-w-sm text-sm font-bold">Customer workspace<select value={workspace.customer.id} onChange={(event) => router.replace(`/employee?customerId=${encodeURIComponent(event.target.value)}`)} className="mt-2 min-h-11 w-full rounded-xl border border-[#183229]/20 bg-white px-3">{workspace.availableCustomers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} · {customer.role}</option>)}</select></label>}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        {error && <div role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-red-800">{error}</div>}
        <nav aria-label="Daily check-ins" className="grid gap-2 sm:grid-cols-3">
          {primaryTabs.map(([id, label, Icon]) => {
            const schedule = scheduleFor(id);
            return <button key={id} onClick={() => setView(id)} aria-current={view === id ? 'page' : undefined} className={`min-h-14 rounded-xl px-4 text-left font-bold ${view === id ? 'bg-[#18372e] text-white' : 'border border-[#183229]/15 bg-white'}`}><span className="flex items-center gap-2"><Icon className="h-4 w-4" />{label}</span>{schedule && <span className={`mt-1 block text-xs ${view === id ? 'text-emerald-100' : 'text-[#50675e]'}`}>{schedule.local_time.slice(0, 5)} · {schedule.timezone}</span>}</button>;
          })}
        </nav>
        <nav aria-label="Employee records" className="mt-3 flex flex-wrap gap-2">
          {secondaryTabs.map(([id, label, Icon]) => <button key={id} onClick={() => setView(id)} aria-current={view === id ? 'page' : undefined} className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-bold ${view === id ? 'bg-[#d9b96e] text-[#183229]' : 'border border-[#183229]/15 bg-white'}`}><Icon className="h-4 w-4" />{label}</button>)}
        </nav>

        <section className="mt-8">
          {(view === 'morning' || view === 'midday' || view === 'evening') && (
            <>
            <AddWorkItemForm workspace={workspace} queue={view} onRefresh={() => loadWorkspace(workspace.customer.id)} onError={setError} />
            {queueItems.length === 0
              ? <EmptyState title="This check-in is clear" description="There are no pending decisions in this capped queue. Completed and deferred work remains available in Activity." />
              : <div className="space-y-5">{queueItems.map((item, index) => (
                <article key={item.id} className="rounded-3xl border border-[#183229]/15 bg-white p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#126b4e]">Priority {index + 1} of {queueItems.length}</p><span className={`rounded-full px-3 py-1 text-xs font-bold ${item.risk_level === 'high' ? 'bg-red-100 text-red-800' : item.risk_level === 'medium' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-50 text-emerald-800'}`}>{item.risk_level} risk</span></div>
                  <h2 className="mt-4 text-3xl font-black">{item.title}</h2>
                  <dl className="mt-8 grid gap-5 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[#f7f4ed] p-5"><dt className="text-sm font-bold">Evidence</dt><dd className="mt-2 space-y-2 leading-6 text-[#50675e]">{item.evidence.length ? item.evidence.map((entry, evidenceIndex) => <p key={evidenceIndex}>{readable(entry)}</p>) : <p>No evidence was attached.</p>}</dd></div>
                    <div className="rounded-2xl bg-[#f7f4ed] p-5"><dt className="text-sm font-bold">Proposed action</dt><dd className="mt-2 leading-6 text-[#50675e]">{item.proposed_action}</dd></div>
                    <div className="rounded-2xl bg-[#f7f4ed] p-5"><dt className="text-sm font-bold">Expected outcome</dt><dd className="mt-2 leading-6 text-[#50675e]">{item.expected_outcome || 'No expected outcome recorded.'}</dd></div>
                    <div className="rounded-2xl bg-[#f7f4ed] p-5"><dt className="text-sm font-bold">Approval boundary</dt><dd className="mt-2 leading-6 text-[#50675e]">This decision is recorded before any external action. Approval does not send or publish automatically.</dd></div>
                  </dl>
                  <label className="mt-7 block font-semibold">Optional instructions<textarea value={instructions[item.id] || ''} onChange={(event) => setInstructions((current) => ({ ...current, [item.id]: event.target.value }))} maxLength={2000} className="mt-2 min-h-24 w-full rounded-xl border border-[#183229]/20 p-3" placeholder="Adjust tone, add context, or explain your decision…" /></label>
                  <label className="mt-4 block font-semibold">Defer until<input type="date" min={new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)} value={deferDates[item.id] || ''} onChange={(event) => setDeferDates((current) => ({ ...current, [item.id]: event.target.value }))} className="mt-2 block min-h-11 rounded-xl border border-[#183229]/20 px-3" /></label>
                  <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">{(['approve', 'revise', 'defer', 'reject'] as EmployeeDecision[]).map((action) => <button key={action} disabled={submittingId === item.id || (action === 'revise' && !instructions[item.id]?.trim()) || (action === 'defer' && !deferDates[item.id])} onClick={() => void decide(item, action)} className={action === 'approve' ? 'min-h-11 rounded-full bg-[#126b4e] px-4 font-bold capitalize text-white disabled:opacity-60' : 'min-h-11 rounded-full border border-[#183229]/20 px-4 font-bold capitalize disabled:opacity-60'}>{submittingId === item.id ? 'Saving…' : action}</button>)}</div>
                </article>
              ))}</div>}
            </>
          )}

          {view === 'activity' && (
            workspace.decisions.length === 0 ? <EmptyState title="No decisions recorded yet" description="Approved, revised, deferred, and rejected work will form the immutable activity history." /> :
            <div className="space-y-3">{workspace.decisions.map((decision) => {
              const item = workspace.workItems.find((candidate) => candidate.id === decision.work_item_id);
              return <article key={decision.id} className="rounded-2xl border border-[#183229]/15 bg-white p-5"><div className="flex flex-wrap justify-between gap-2"><h2 className="font-bold">{item?.title || 'Work item'}</h2><time className="text-sm text-[#50675e]">{new Date(decision.created_at).toLocaleString()}</time></div><p className="mt-2 text-sm capitalize"><Activity className="mr-2 inline h-4 w-4 text-[#126b4e]" />{decision.decision}{item?.status === 'completed' ? ' · completed' : ''}</p>{decision.instructions && <p className="mt-3 rounded-xl bg-[#f7f4ed] p-3 text-sm">{decision.instructions}</p>}{item?.completion_notes && <p className="mt-3 rounded-xl bg-[#e4eee6] p-3 text-sm"><strong>Completion evidence:</strong> {item.completion_notes}</p>}{item?.status === 'approved' && <CompletionForm item={item} onRefresh={() => loadWorkspace(workspace.customer.id)} onError={setError} />}</article>;
            })}</div>
          )}

          {view === 'outcomes' && (
            <div className="space-y-6">
              <OutcomeForm workspace={workspace} onRefresh={() => loadWorkspace(workspace.customer.id)} onError={setError} />
              <section aria-labelledby="daily-scorecard-title">
                <h2 id="daily-scorecard-title" className="text-2xl font-black">Today&apos;s scorecard</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {workspace.dailyScorecards.map((scorecard) => [
                    ['Gross revenue', money(scorecard.grossRevenueCents, scorecard.currency)],
                    ['Costs', money(scorecard.totalCostCents, scorecard.currency)],
                    ['Net revenue', money(scorecard.netRevenueCents, scorecard.currency)],
                    ['Net $500/day progress', `${Math.round((scorecard.netRevenueCents / scorecard.goalCents) * 100)}%`],
                  ].map(([label, value]) => <article key={`${scorecard.currency}-${label}`} className="rounded-2xl border border-[#183229]/15 bg-white p-5"><p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">{label} · {scorecard.currency}</p><p className="mt-3 text-2xl font-black">{value}</p></article>))}
                  <article className="rounded-2xl border border-[#183229]/15 bg-white p-5"><p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">Funnel movement</p><p className="mt-3 font-black">{workspace.funnel.leads} leads · {workspace.funnel.replies} replies · {workspace.funnel.meetings} meetings · {workspace.funnel.projects} projects</p></article>
                  <article className="rounded-2xl border border-[#183229]/15 bg-white p-5"><p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">Operator time</p><p className="mt-3 text-2xl font-black">{workspace.operatorMinutes} minutes</p></article>
                </div>
              </section>
              {workspace.outcomes.length === 0 ? <EmptyState title="No outcomes recorded yet" description="Revenue, costs, funnel movement, and time spent will appear after an operator closes the loop." /> :
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{workspace.outcomes.map((outcome) => <article key={outcome.id} className="rounded-2xl border border-[#183229]/15 bg-white p-5"><p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">{outcome.kind.replace('_', ' ')}</p><p className="mt-3 text-3xl font-black">{outcome.amount_cents && outcome.currency ? money(outcome.amount_cents, outcome.currency) : outcome.value}</p>{outcome.cost_category && <p className="mt-2 text-sm capitalize text-[#50675e]">{outcome.cost_category} cost</p>}{outcome.notes && <p className="mt-2 text-sm text-[#50675e]">{outcome.notes}</p>}<time className="mt-4 block text-xs text-[#50675e]">{new Date(outcome.occurred_at).toLocaleDateString()}</time></article>)}</div>}
            </div>
          )}

          {view === 'guardrails' && (
            <div className="grid gap-5 md:grid-cols-2">
              {[
                ['Responsibilities', workspace.brief?.responsibilities || []],
                ['Prohibited actions', workspace.brief?.prohibited_actions || []],
                ['Approved channels', workspace.brief?.channels || []],
                ['Approval rules', workspace.brief?.approval_rules || []],
              ].map(([title, values]) => <article key={title as string} className="rounded-2xl border border-[#183229]/15 bg-white p-6"><h2 className="text-xl font-black">{title as string}</h2><ul className="mt-4 space-y-2">{(values as unknown[]).length ? (values as unknown[]).map((value, index) => <li key={index} className="flex gap-2"><Check className="mt-1 h-4 w-4 shrink-0 text-[#126b4e]" />{readable(value)}</li>) : <li className="text-[#50675e]">Not defined yet.</li>}</ul></article>)}
              <article className="rounded-2xl bg-[#d9b96e]/35 p-6 md:col-span-2"><h2 className="font-black">Tone</h2><p className="mt-2">{workspace.brief?.tone || 'Not defined yet.'}</p><p className="mt-4 text-sm font-bold">No outreach, publishing, system changes, or spending without a recorded approval.</p></article>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
