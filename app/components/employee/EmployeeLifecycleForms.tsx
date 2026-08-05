'use client';

import { useRef, useState } from 'react';
import type { EmployeeQueue, EmployeeWorkItem, EmployeeWorkspaceData } from '@/lib/ai-employee-types';

type RefreshProps = {
  workspace: EmployeeWorkspaceData;
  onRefresh: () => Promise<void>;
  onError: (message: string | null) => void;
};

function requestIdentity(previous: React.MutableRefObject<{ fingerprint: string; key: string } | null>, payload: unknown) {
  const fingerprint = JSON.stringify(payload);
  if (previous.current?.fingerprint === fingerprint) return previous.current.key;
  const key = crypto.randomUUID();
  previous.current = { fingerprint, key };
  return key;
}

export function AddWorkItemForm({ workspace, queue, onRefresh, onError }: RefreshProps & { queue: EmployeeQueue }) {
  const [title, setTitle] = useState('');
  const [evidence, setEvidence] = useState('');
  const [proposedAction, setProposedAction] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [scheduledDate, setScheduledDate] = useState(workspace.scheduledDate);
  const [priority, setPriority] = useState(1);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [sourceType, setSourceType] = useState('manual');
  const [sourceId, setSourceId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const request = useRef<{ fingerprint: string; key: string } | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const core = {
      employeeId: workspace.employee.id,
      queue,
      scheduledDate,
      title: title.trim(),
      evidence: evidence.split('\n').map((entry) => entry.trim()).filter(Boolean),
      proposedAction: proposedAction.trim(),
      expectedOutcome: expectedOutcome.trim(),
      riskLevel,
      priority,
      sourceType: sourceType.trim(),
      sourceId: sourceId.trim(),
    };
    const idempotencyKey = requestIdentity(request, core);
    setSubmitting(true);
    onError(null);
    try {
      const response = await fetch('/api/employee/work-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...core, idempotencyKey }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Work item could not be created.');
      request.current = null;
      setTitle('');
      setEvidence('');
      setProposedAction('');
      setExpectedOutcome('');
      setSourceId('');
      await onRefresh();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Work item could not be created.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <details className="mb-6 rounded-2xl border border-[#183229]/15 bg-white p-5">
      <summary className="cursor-pointer font-black">Add supervised work</summary>
      <p className="mt-2 text-sm leading-6 text-[#50675e]">Prepare an evidence-backed item for this queue. Creating it does not perform an external action.</p>
      <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="font-semibold sm:col-span-2">Title<input required maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-[#183229]/20 px-3" /></label>
        <label className="font-semibold sm:col-span-2">Evidence, one item per line<textarea value={evidence} onChange={(event) => setEvidence(event.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-[#183229]/20 p-3" /></label>
        <label className="font-semibold sm:col-span-2">Proposed manual action<textarea required maxLength={4000} value={proposedAction} onChange={(event) => setProposedAction(event.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-[#183229]/20 p-3" /></label>
        <label className="font-semibold sm:col-span-2">Expected outcome<textarea maxLength={2000} value={expectedOutcome} onChange={(event) => setExpectedOutcome(event.target.value)} className="mt-2 min-h-20 w-full rounded-xl border border-[#183229]/20 p-3" /></label>
        <label className="font-semibold">Scheduled date<input required type="date" min={workspace.scheduledDate} value={scheduledDate} onChange={(event) => setScheduledDate(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-[#183229]/20 px-3" /></label>
        <label className="font-semibold">Priority<select value={priority} onChange={(event) => setPriority(Number(event.target.value))} className="mt-2 min-h-11 w-full rounded-xl border border-[#183229]/20 px-3">{[1, 2, 3, 4, 5].map((slot) => <option key={slot} value={slot}>{slot}</option>)}</select></label>
        <label className="font-semibold">Risk<select value={riskLevel} onChange={(event) => setRiskLevel(event.target.value as typeof riskLevel)} className="mt-2 min-h-11 w-full rounded-xl border border-[#183229]/20 px-3"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
        <label className="font-semibold">Source<select value={sourceType} onChange={(event) => setSourceType(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-[#183229]/20 px-3"><option value="manual">Manual</option><option value="project">Project</option><option value="site_report">Site report</option></select></label>
        <label className="font-semibold sm:col-span-2">Source record ID or note<input maxLength={200} value={sourceId} onChange={(event) => setSourceId(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-[#183229]/20 px-3" /></label>
        <button disabled={submitting} className="min-h-11 rounded-full bg-[#126b4e] px-5 font-bold text-white disabled:opacity-60 sm:col-span-2">{submitting ? 'Adding…' : `Add to ${queue} queue`}</button>
      </form>
    </details>
  );
}

export function CompletionForm({ item, onRefresh, onError }: Pick<RefreshProps, 'onRefresh' | 'onError'> & { item: EmployeeWorkItem }) {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const request = useRef<{ fingerprint: string; key: string } | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const core = { notes: notes.trim() };
    const idempotencyKey = requestIdentity(request, core);
    setSubmitting(true);
    onError(null);
    try {
      const response = await fetch(`/api/employee/work-items/${item.id}/complete`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...core, idempotencyKey }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Work item could not be completed.');
      request.current = null;
      await onRefresh();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Work item could not be completed.');
    } finally {
      setSubmitting(false);
    }
  };

  return <form onSubmit={submit} className="mt-4 rounded-xl bg-[#e4eee6] p-4"><label className="text-sm font-semibold">Manual action evidence<textarea required maxLength={4000} value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-2 min-h-20 w-full rounded-xl border border-[#183229]/20 bg-white p-3" placeholder="What was done, where, and the evidence or follow-up…" /></label><button disabled={submitting} className="mt-3 min-h-11 rounded-full bg-[#126b4e] px-4 font-bold text-white disabled:opacity-60">{submitting ? 'Completing…' : 'Mark manual action complete'}</button></form>;
}

export function OutcomeForm({ workspace, onRefresh, onError }: RefreshProps) {
  const [kind, setKind] = useState<'lead' | 'reply' | 'meeting' | 'project' | 'time_saved' | 'revenue' | 'cost'>('lead');
  const [value, setValue] = useState('1');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [costCategory, setCostCategory] = useState('model');
  const [workItemId, setWorkItemId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const request = useRef<{ fingerprint: string; key: string } | null>(null);
  const financial = kind === 'revenue' || kind === 'cost';

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const core = {
      employeeId: workspace.employee.id,
      workItemId: workItemId || undefined,
      kind,
      value: Number(value),
      amountCents: financial ? Math.round(Number(amount) * 100) : undefined,
      currency: financial ? currency.toUpperCase() : undefined,
      costCategory: kind === 'cost' ? costCategory : undefined,
      notes: notes.trim(),
    };
    const idempotencyKey = requestIdentity(request, core);
    setSubmitting(true);
    onError(null);
    try {
      const response = await fetch('/api/employee/outcomes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...core, idempotencyKey }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Outcome could not be recorded.');
      request.current = null;
      setNotes('');
      setAmount('');
      await onRefresh();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Outcome could not be recorded.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <details className="rounded-2xl border border-[#183229]/15 bg-white p-5">
      <summary className="cursor-pointer font-black">Record measured outcome</summary>
      <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="font-semibold">Outcome<select value={kind} onChange={(event) => setKind(event.target.value as typeof kind)} className="mt-2 min-h-11 w-full rounded-xl border border-[#183229]/20 px-3"><option value="lead">Lead</option><option value="reply">Reply</option><option value="meeting">Meeting</option><option value="project">Project</option><option value="time_saved">Operator minutes</option><option value="revenue">Revenue</option><option value="cost">Cost</option></select></label>
        <label className="font-semibold">Count or minutes<input required type="number" min="0.01" step="0.01" value={value} onChange={(event) => setValue(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-[#183229]/20 px-3" /></label>
        {financial && <><label className="font-semibold">Amount<input required type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-[#183229]/20 px-3" /></label><label className="font-semibold">Currency<input required pattern="[A-Za-z]{3}" maxLength={3} value={currency} onChange={(event) => setCurrency(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-[#183229]/20 px-3 uppercase" /></label></>}
        {kind === 'cost' && <label className="font-semibold">Cost category<select value={costCategory} onChange={(event) => setCostCategory(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-[#183229]/20 px-3"><option value="model">Model</option><option value="tooling">Tooling</option><option value="payment">Payment</option><option value="advertising">Advertising</option><option value="contractor">Contractor</option><option value="delivery">Delivery</option></select></label>}
        <label className="font-semibold">Related work<select value={workItemId} onChange={(event) => setWorkItemId(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-[#183229]/20 px-3"><option value="">No specific item</option>{workspace.workItems.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
        <label className="font-semibold sm:col-span-2">Evidence or notes<textarea maxLength={4000} value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-[#183229]/20 p-3" /></label>
        <button disabled={submitting} className="min-h-11 rounded-full bg-[#126b4e] px-5 font-bold text-white disabled:opacity-60 sm:col-span-2">{submitting ? 'Recording…' : 'Record outcome'}</button>
      </form>
    </details>
  );
}
