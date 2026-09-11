'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type {
  WorkspaceArtifact,
  WorkspaceData,
  WorkspaceStatus,
  WorkspaceWorkflow,
} from '@/lib/workspace-types';

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function readableWorkflowType(value: string) {
  const labels: Record<string, string> = {
    research_outreach: 'Research and outreach',
    daily_content: 'Content package',
  };
  return labels[value] || value.replace(/_/g, ' ');
}

function statusClasses(status: WorkspaceStatus) {
  const classes: Record<WorkspaceStatus, string> = {
    awaiting_approval: 'bg-amber-100 text-amber-900 ring-amber-200',
    approved: 'bg-emerald-100 text-emerald-900 ring-emerald-200',
    queued: 'bg-sky-100 text-sky-900 ring-sky-200',
    in_progress: 'bg-sky-100 text-sky-900 ring-sky-200',
    awaiting_review: 'bg-violet-100 text-violet-900 ring-violet-200',
    completed: 'bg-emerald-100 text-emerald-900 ring-emerald-200',
    needs_attention: 'bg-red-100 text-red-900 ring-red-200',
    cancelled: 'bg-slate-100 text-slate-700 ring-slate-200',
    rejected: 'bg-slate-100 text-slate-700 ring-slate-200',
  };
  return classes[status];
}

function StatusIcon({ status }: { status: WorkspaceStatus }) {
  if (status === 'completed' || status === 'approved') {
    return <CheckCircle2 className="h-5 w-5" aria-hidden="true" />;
  }
  if (status === 'needs_attention' || status === 'rejected') {
    return <TriangleAlert className="h-5 w-5" aria-hidden="true" />;
  }
  if (status === 'cancelled') {
    return <XCircle className="h-5 w-5" aria-hidden="true" />;
  }
  if (status === 'in_progress') {
    return <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />;
  }
  return <Clock3 className="h-5 w-5" aria-hidden="true" />;
}

function StatusBadge({ workflow }: { workflow: WorkspaceWorkflow }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${statusClasses(workflow.status)}`}>
      <StatusIcon status={workflow.status} />
      {workflow.statusLabel}
    </span>
  );
}

function ResultCard({ artifact }: { artifact: WorkspaceArtifact }) {
  return (
    <article className="rounded-3xl border border-[#183229]/15 bg-white p-5 shadow-sm sm:p-6" aria-labelledby={`artifact-${artifact.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e4eee6] text-[#126b4e]">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#126b4e]">Result</p>
            <h3 id={`artifact-${artifact.id}`} className="mt-1 text-lg font-black text-[#183229]">{artifact.title}</h3>
          </div>
        </div>
        <span className="rounded-full bg-[#f7f4ed] px-3 py-1.5 text-xs font-bold capitalize text-[#50675e]">
          {artifact.statusLabel}
        </span>
      </div>

      {artifact.content ? (
        <pre className="mt-5 max-h-[28rem] overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-[#f7f4ed] p-4 text-sm leading-6 text-[#183229]">
          {artifact.content}
        </pre>
      ) : artifact.hasPrivateFile ? (
        <div className="mt-5 rounded-2xl bg-[#f7f4ed] p-4 text-sm leading-6 text-[#50675e]">
          A private file is attached to this result. Its workspace preview will appear here when the file is ready for this account.
        </div>
      ) : (
        <p className="mt-5 rounded-2xl bg-[#f7f4ed] p-4 text-sm leading-6 text-[#50675e]">
          The result record is ready, but it does not contain a readable preview yet.
        </p>
      )}

      {artifact.references.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#126b4e]">References</p>
          <ul className="mt-2 space-y-2">
            {artifact.references.map((reference) => (
              <li key={reference}>
                <a
                  href={reference}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex max-w-full items-center gap-2 break-all text-sm font-semibold text-[#126b4e] underline decoration-[#126b4e]/30 underline-offset-4 hover:decoration-[#126b4e]"
                >
                  <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {reference}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-5 text-xs text-[#50675e]">Added {formatDate(artifact.createdAt)}</p>
    </article>
  );
}

function WorkflowThread({ workflow }: { workflow: WorkspaceWorkflow }) {
  return (
    <section className="min-w-0" aria-labelledby="selected-work-heading">
      <div className="rounded-3xl border border-[#183229]/15 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#126b4e]">{readableWorkflowType(workflow.workflowType)}</p>
            <h2 id="selected-work-heading" className="mt-2 break-words text-2xl font-black tracking-tight text-[#183229] sm:text-3xl">{workflow.title}</h2>
            <p className="mt-2 text-sm text-[#50675e]">Updated {formatDate(workflow.updatedAt)}</p>
          </div>
          <StatusBadge workflow={workflow} />
        </div>

        <div className="mt-7 space-y-5">
          <div className="ml-auto max-w-2xl rounded-3xl rounded-tr-md bg-[#183229] p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#d9b96e]">Your request</p>
            <p className="mt-2 whitespace-pre-wrap text-base leading-7">{workflow.request}</p>
          </div>

          {workflow.instruction && workflow.instruction !== workflow.request && (
            <div className="max-w-2xl rounded-3xl rounded-tl-md border border-[#183229]/10 bg-[#f7f4ed] p-5">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#126b4e]">NeedThisDone understood</p>
              <p className="mt-2 text-sm leading-6 text-[#50675e]">{workflow.instruction}</p>
            </div>
          )}

          <div className="rounded-2xl border border-[#d9b96e]/60 bg-[#fff8df] p-4 sm:flex sm:items-start sm:justify-between sm:gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#6f571e]">Next step</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-[#5c4818]">{workflow.nextAction}</p>
            </div>
            {workflow.approvalRequired && (
              <div className="mt-3 flex shrink-0 items-center gap-2 text-xs font-bold text-[#6f571e] sm:mt-0">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Review required
              </div>
            )}
          </div>
        </div>

        {workflow.events.filter((event) => !event.id.startsWith('request-')).length > 0 && (
          <div className="mt-8 border-t border-[#183229]/10 pt-7">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#126b4e]">Updates</p>
            <ol className="mt-5 space-y-5" aria-label="Request updates">
              {workflow.events.filter((event) => !event.id.startsWith('request-')).map((event) => (
                <li key={event.id} className="relative pl-8">
                  <span className={`absolute left-0 top-1.5 h-3 w-3 rounded-full ${event.tone === 'danger' ? 'bg-red-500' : event.tone === 'warning' ? 'bg-amber-500' : event.tone === 'positive' ? 'bg-[#126b4e]' : 'bg-sky-500'}`} aria-hidden="true" />
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <h3 className="font-bold text-[#183229]">{event.title}</h3>
                    <time className="text-xs text-[#50675e]" dateTime={event.createdAt}>{formatDate(event.createdAt)}</time>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-[#50675e]">{event.body}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {(workflow.checks.length > 0 || workflow.blockers.length > 0 || workflow.references.length > 0) && (
          <div className="mt-8 grid gap-4 border-t border-[#183229]/10 pt-7 md:grid-cols-2">
            {workflow.checks.length > 0 && (
              <div className="rounded-2xl bg-[#e4eee6] p-4">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-[#126b4e]">Checks and evidence</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-[#183229]">
                  {workflow.checks.map((check) => <li key={check} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#126b4e]" aria-hidden="true" />{check}</li>)}
                </ul>
              </div>
            )}
            {workflow.blockers.length > 0 && (
              <div className="rounded-2xl bg-red-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-red-800">Needs attention</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-red-950">
                  {workflow.blockers.map((blocker) => <li key={blocker} className="flex gap-2"><TriangleAlert className="mt-1 h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />{blocker}</li>)}
                </ul>
              </div>
            )}
            {workflow.references.length > 0 && (
              <div className="rounded-2xl bg-[#f7f4ed] p-4 md:col-span-2">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-[#126b4e]">Supporting references</p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                  {workflow.references.map((reference) => <a key={reference} href={reference} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-2 break-all text-sm font-semibold text-[#126b4e] underline decoration-[#126b4e]/30 underline-offset-4"><ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />{reference}</a>)}
                </div>
              </div>
            )}
          </div>
        )}

        {workflow.estimatedCostUsd !== null && (
          <p className="mt-6 text-xs text-[#50675e]">Estimated cost recorded with this request: ${workflow.estimatedCostUsd.toFixed(4)}</p>
        )}
      </div>

      {workflow.artifacts.length > 0 && (
        <section className="mt-6 space-y-4" aria-labelledby="results-heading">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#126b4e]">Reviewable output</p>
            <h2 id="results-heading" className="mt-2 text-2xl font-black text-[#183229]">Results and evidence</h2>
          </div>
          {workflow.artifacts.map((artifact) => <ResultCard key={artifact.id} artifact={artifact} />)}
        </section>
      )}
    </section>
  );
}

function EmptySelection() {
  return (
    <section className="flex min-h-[28rem] flex-col items-center justify-center rounded-3xl border border-dashed border-[#183229]/20 bg-white/70 p-8 text-center" aria-labelledby="empty-selection-heading">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e4eee6] text-[#126b4e]">
        <FileText className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 id="empty-selection-heading" className="mt-5 text-2xl font-black text-[#183229]">No requests yet</h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-[#50675e]">When a request has a durable NeedThisDone record, its status, updates, and reviewable results will appear here.</p>
      <Link href="/contact" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#126b4e] px-5 text-sm font-bold text-white hover:bg-[#0d5740] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#126b4e] focus-visible:ring-offset-2">
        Share a request
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}

export default function WorkspacePage() {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/workspace', { cache: 'no-store' });
      const payload = await response.json() as WorkspaceData & { error?: string };
      if (!response.ok) throw new Error(payload.error || 'Your workspace could not be loaded.');
      setData(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Your workspace could not be loaded.');
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!data?.workflows.length) {
      setSelectedId(null);
      return;
    }
    setSelectedId((current) => current && data.workflows.some((workflow) => workflow.id === current) ? current : data.workflows[0].id);
  }, [data]);

  const selectedWorkflow = useMemo(
    () => data?.workflows.find((workflow) => workflow.id === selectedId) || null,
    [data, selectedId],
  );

  useEffect(() => {
    if (!data?.workflows.some((workflow) => ['queued', 'in_progress', 'approved'].includes(workflow.status))) return;
    const interval = window.setInterval(() => void load(true), 30_000);
    return () => window.clearInterval(interval);
  }, [data, load]);

  const metadataName = typeof user?.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : null;
  const firstName = metadataName?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#f7f4ed]" aria-labelledby="workspace-heading">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">Private workspace</p>
            <h1 id="workspace-heading" className="mt-3 text-4xl font-black tracking-tight text-[#183229] sm:text-5xl">What&apos;s happening with your work?</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#50675e]">Hi {firstName}. See each request, its current status, the latest update, and the result in one clear place.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && <Link href="/admin/operations" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#183229]/20 bg-white px-4 text-sm font-bold text-[#183229] hover:bg-[#e4eee6]">Open operations</Link>}
            <button type="button" onClick={() => void load(true)} disabled={loading || refreshing} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#183229]/20 bg-white px-4 text-sm font-bold text-[#183229] hover:bg-[#e4eee6] disabled:cursor-wait disabled:opacity-60">
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </header>

        {data && (
          <div className="mt-8 grid gap-3 sm:grid-cols-3" aria-label="Workspace summary">
            {[
              ['Active', data.counts.active, 'Work moving or ready to move', 'text-sky-900 bg-sky-50'],
              ['Needs attention', data.counts.needsAttention, 'Reviews or blockers', 'text-amber-900 bg-amber-50'],
              ['Completed', data.counts.completed, 'Finished or closed requests', 'text-emerald-900 bg-emerald-50'],
            ].map(([label, count, detail, classes]) => (
              <div key={label} className={`rounded-2xl p-4 ${classes}`}>
                <div className="flex items-end justify-between gap-3"><p className="text-sm font-bold">{label}</p><p className="text-2xl font-black">{count}</p></div>
                <p className="mt-1 text-xs opacity-75">{detail}</p>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[28rem] items-center justify-center" role="status"><Loader2 className="h-8 w-8 animate-spin text-[#126b4e]" aria-hidden="true" /><span className="sr-only">Loading your workspace</span></div>
        ) : error ? (
          <section className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6" role="alert">
            <div className="flex items-start gap-3"><TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-700" aria-hidden="true" /><div><h2 className="font-black text-red-950">Your workspace is unavailable</h2><p className="mt-2 text-sm leading-6 text-red-900">{error}</p><button type="button" onClick={() => void load()} className="mt-4 inline-flex min-h-10 items-center rounded-full bg-red-900 px-4 text-sm font-bold text-white">Try again</button></div></div>
          </section>
        ) : data?.workflows.length ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(16rem,0.34fr)_minmax(0,0.66fr)]">
            <section aria-labelledby="requests-heading">
              <div className="flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#126b4e]">Your history</p><h2 id="requests-heading" className="mt-2 text-2xl font-black text-[#183229]">Requests</h2></div><span className="text-sm text-[#50675e]">{data.workflows.length}</span></div>
              <div className="mt-4 space-y-3">
                {data.workflows.map((workflow) => (
                  <button key={workflow.id} type="button" aria-pressed={workflow.id === selectedId} onClick={() => setSelectedId(workflow.id)} className={`w-full rounded-2xl border p-4 text-left transition-colors ${workflow.id === selectedId ? 'border-[#126b4e] bg-white shadow-sm' : 'border-[#183229]/10 bg-white/60 hover:border-[#126b4e]/40 hover:bg-white'}`}>
                    <div className="flex items-start justify-between gap-3"><p className="line-clamp-3 font-bold leading-6 text-[#183229]">{workflow.title}</p><span className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${workflow.status === 'needs_attention' || workflow.status === 'rejected' ? 'bg-red-500' : workflow.status === 'completed' ? 'bg-[#126b4e]' : 'bg-sky-500'}`} aria-hidden="true" /></div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[#50675e]"><span>{workflow.statusLabel}</span><span>{formatDate(workflow.updatedAt)}</span></div>
                  </button>
                ))}
              </div>
            </section>
            {selectedWorkflow ? <WorkflowThread workflow={selectedWorkflow} /> : <EmptySelection />}
          </div>
        ) : (
          <div className="mt-8"><EmptySelection /></div>
        )}
      </div>
    </main>
  );
}
