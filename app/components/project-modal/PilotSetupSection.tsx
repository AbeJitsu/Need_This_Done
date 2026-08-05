'use client';

import Link from 'next/link';
import { useState } from 'react';

type PilotSetupSectionProps = {
  projectId: string;
  projectName: string;
  company?: string | null;
  customerId?: string | null;
  onProvisioned: (customerId: string) => void;
};

const list = (value: string) => value.split('\n').map((entry) => entry.trim()).filter(Boolean);

export default function PilotSetupSection({ projectId, projectName, company, customerId, onProvisioned }: PilotSetupSectionProps) {
  const [employeeName, setEmployeeName] = useState(`${company || projectName} Growth Desk`);
  const [roleName, setRoleName] = useState('AI Growth Employee');
  const [timezone, setTimezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York');
  const [morningTime, setMorningTime] = useState('09:00');
  const [middayTime, setMiddayTime] = useState('13:00');
  const [eveningTime, setEveningTime] = useState('17:00');
  const [responsibilities, setResponsibilities] = useState('Review qualified opportunities\nPrepare evidence-backed follow-up\nTrack funnel and financial outcomes');
  const [prohibitedActions, setProhibitedActions] = useState('No outreach without recorded approval\nNo publishing or system changes without recorded approval\nNo spending without recorded approval');
  const [channels, setChannels] = useState('Operator workspace\nClient project workspace');
  const [tone, setTone] = useState('Clear, direct, and useful. State evidence and uncertainty plainly.');
  const [approvalRules, setApprovalRules] = useState('Every external action requires owner or manager approval\nCompletion requires manual-action evidence');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (customerId) {
    return <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4"><h3 className="font-semibold text-emerald-950">Internal pilot linked</h3><p className="mt-1 text-sm text-emerald-900">This project has a customer, employee, operating brief, and three daily check-ins.</p><Link href={`/employee?customerId=${customerId}`} className="mt-3 inline-flex min-h-11 items-center rounded-full bg-emerald-700 px-4 font-semibold text-white">Open employee workspace</Link></section>;
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/pilot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeName, roleName, timezone, morningTime, middayTime, eveningTime,
          responsibilities: list(responsibilities),
          prohibitedActions: list(prohibitedActions),
          channels: list(channels), tone,
          approvalRules: list(approvalRules),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Pilot could not be started.');
      onProvisioned(payload.pilot.customer_id);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Pilot could not be started.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <details className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <summary className="cursor-pointer font-semibold text-emerald-950">Start supervised internal pilot</summary>
      <p className="mt-2 text-sm leading-6 text-emerald-900">Creates the retained customer boundary, operator access, employee brief, and check-ins. It does not contact the customer or configure an external service.</p>
      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">Employee name<input required maxLength={120} value={employeeName} onChange={(event) => setEmployeeName(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3" /></label>
        <label className="text-sm font-semibold">Role name<input required maxLength={120} value={roleName} onChange={(event) => setRoleName(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3" /></label>
        <label className="text-sm font-semibold sm:col-span-2">IANA timezone<input required maxLength={120} value={timezone} onChange={(event) => setTimezone(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3" /></label>
        <label className="text-sm font-semibold">Morning<input required type="time" value={morningTime} onChange={(event) => setMorningTime(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3" /></label>
        <label className="text-sm font-semibold">Midday<input required type="time" value={middayTime} onChange={(event) => setMiddayTime(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3" /></label>
        <label className="text-sm font-semibold">Evening<input required type="time" value={eveningTime} onChange={(event) => setEveningTime(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3" /></label>
        <label className="text-sm font-semibold sm:col-span-2">Responsibilities, one per line<textarea required value={responsibilities} onChange={(event) => setResponsibilities(event.target.value)} className="mt-1 min-h-24 w-full rounded-lg border border-gray-300 bg-white p-3" /></label>
        <label className="text-sm font-semibold sm:col-span-2">Prohibited actions, one per line<textarea required value={prohibitedActions} onChange={(event) => setProhibitedActions(event.target.value)} className="mt-1 min-h-24 w-full rounded-lg border border-gray-300 bg-white p-3" /></label>
        <label className="text-sm font-semibold sm:col-span-2">Approved channels, one per line<textarea required value={channels} onChange={(event) => setChannels(event.target.value)} className="mt-1 min-h-20 w-full rounded-lg border border-gray-300 bg-white p-3" /></label>
        <label className="text-sm font-semibold sm:col-span-2">Tone<textarea maxLength={2000} value={tone} onChange={(event) => setTone(event.target.value)} className="mt-1 min-h-20 w-full rounded-lg border border-gray-300 bg-white p-3" /></label>
        <label className="text-sm font-semibold sm:col-span-2">Approval rules, one per line<textarea required value={approvalRules} onChange={(event) => setApprovalRules(event.target.value)} className="mt-1 min-h-20 w-full rounded-lg border border-gray-300 bg-white p-3" /></label>
        <button disabled={submitting} className="min-h-11 rounded-full bg-emerald-700 px-5 font-semibold text-white disabled:opacity-60 sm:col-span-2">{submitting ? 'Starting pilot…' : 'Create internal pilot'}</button>
      </form>
    </details>
  );
}
