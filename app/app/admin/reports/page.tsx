'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type Report = {
  id: string;
  url: string;
  score: number;
  grade: string;
  executive_summary: string;
};

type Run = {
  id: string;
  status: string;
  created_at: string;
  decided_at: string | null;
  outcome: { decision_note?: string } | null;
  report: Report | null;
};

function reportDomain(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export default function ReportQueuePage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [runs, setRuns] = useState<Run[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [view, setView] = useState<'pending' | 'all'>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/workflow-runs');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load report queue.');
      setRuns(data.runs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report queue.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
    if (!isLoading && isAuthenticated && !isAdmin) router.push('/dashboard');
  }, [isLoading, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const decide = async (id: string, status: string) => {
    setSaving(id);
    setError('');

    try {
      const response = await fetch('/api/admin/workflow-runs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, note: notes[id] || '' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save decision.');

      setRuns((current) => current.map((run) => (
        run.id === id
          ? { ...run, status: data.run.status, outcome: data.run.outcome, decided_at: data.run.decided_at }
          : run
      )));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save decision.');
    } finally {
      setSaving(null);
    }
  };

  if (isLoading || loading) return <p className="text-slate-500">Loading report queue…</p>;
  if (!isAuthenticated || !isAdmin) return null;

  const pendingRuns = runs.filter((run) => run.status === 'pending_review');
  const displayedRuns = view === 'pending' ? pendingRuns : runs;

  return (
    <section className="max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-emerald-600">Operator workspace</p>
        <h1 className="text-3xl font-bold text-slate-900">Site report queue</h1>
        <p className="mt-2 text-slate-600">
          Review the evidence, record the rationale, then choose the next human action. Nothing is sent automatically.
        </p>
      </div>

      <div className="flex flex-wrap gap-3" aria-label="Report queue view">
        <button
          type="button"
          onClick={() => setView('pending')}
          aria-pressed={view === 'pending'}
          className={`rounded-md px-4 py-2 text-sm font-semibold ${view === 'pending' ? 'bg-emerald-600 text-white' : 'border border-slate-300 text-slate-700'}`}
        >
          Needs decisions ({pendingRuns.length})
        </button>
        <button
          type="button"
          onClick={() => setView('all')}
          aria-pressed={view === 'all'}
          className={`rounded-md px-4 py-2 text-sm font-semibold ${view === 'all' ? 'bg-emerald-600 text-white' : 'border border-slate-300 text-slate-700'}`}
        >
          All reports ({runs.length})
        </button>
      </div>

      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{error}</p>}

      {displayedRuns.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
          {view === 'pending' ? 'No site reports need a decision.' : 'No site reports are available.'}
        </p>
      ) : (
        <div className="space-y-4">
          {displayedRuns.map((run) => {
            const domain = run.report ? reportDomain(run.report.url) : 'Report unavailable';
            const pending = run.status === 'pending_review';
            const decisionNote = run.outcome?.decision_note;

            return (
              <article key={run.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{domain}</h2>
                    <p className="text-sm text-slate-500">Received {new Date(run.created_at).toLocaleString()}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                    {run.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {run.report ? (
                  <>
                    <p className="mt-4 text-3xl font-bold text-slate-900">
                      {run.report.score}/100 <span className="text-base font-medium text-slate-500">Grade {run.report.grade}</span>
                    </p>
                    <p className="mt-3 text-slate-700">{run.report.executive_summary}</p>
                    <a className="mt-3 inline-block text-sm font-medium text-emerald-700 underline" href={`/report/${run.report.id}`}>
                      Open customer report
                    </a>
                  </>
                ) : (
                  <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    The source report is unavailable. Keep this workflow record for investigation.
                  </p>
                )}

                {pending ? (
                  <div className="mt-5 space-y-3">
                    <label className="block text-sm font-medium text-slate-700" htmlFor={`decision-note-${run.id}`}>
                      Decision note <span className="font-normal text-slate-500">(optional)</span>
                    </label>
                    <textarea
                      id={`decision-note-${run.id}`}
                      value={notes[run.id] || ''}
                      onChange={(event) => setNotes((current) => ({ ...current, [run.id]: event.target.value }))}
                      maxLength={1000}
                      rows={3}
                      className="w-full rounded-md border border-slate-300 p-3 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      placeholder="What should the operator remember about this decision?"
                    />
                    <div className="flex flex-wrap gap-3">
                      <button disabled={saving === run.id} onClick={() => decide(run.id, 'approved')} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                        Approve follow-up
                      </button>
                      <button disabled={saving === run.id} onClick={() => decide(run.id, 'manual_action_required')} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">
                        Needs review
                      </button>
                      <button disabled={saving === run.id} onClick={() => decide(run.id, 'rejected')} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">
                        Reject
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                    <p className="font-medium">Decision recorded{run.decided_at ? ` ${new Date(run.decided_at).toLocaleString()}` : ''}.</p>
                    {decisionNote && <p className="mt-1 whitespace-pre-wrap">{decisionNote}</p>}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
