'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, Check, CircleAlert, ExternalLink, FileCheck2, Loader2, Pause, Play, RotateCcw, ShieldAlert, Square, Video } from 'lucide-react';
import AgentPlannerPanel from '@/components/AgentPlannerPanel';

type Task = {
  id: string;
  task_key: string;
  agent_role: string;
  agent_provider: string;
  model_id: string | null;
  status: string;
  progress: number;
  last_error?: string | null;
};

type Artifact = {
  id: string;
  artifact_type: string;
  title: string;
  status: string;
  metadata: Record<string, unknown>;
  current_version_id: string | null;
};

type Run = {
  id: string;
  workflow_type: 'research_outreach' | 'daily_content';
  status: string;
  title: string;
  created_at: string;
  tasks: Task[];
  artifacts: Artifact[];
};

type DashboardData = {
  runs: Run[];
  schedules: Array<{ id: string; local_date: string; status: string; scheduled_for: string; run_id: string | null }>;
  brandProfile: { timezone: string; default_schedule_time: string; daily_media_cap: number | string } | null;
  workerHeartbeats: Array<{
    worker_id: string;
    status: string;
    version: string;
    capabilities: unknown[];
    last_seen_at: string;
    last_error: string | null;
    active_task_id: string | null;
  }>;
  approvals: Artifact[];
  outreach: Array<{ id: string; subject: string; approval_status: string; recipient_email: string }>;
  counts: { activeRuns: number; pendingApprovals: number; pendingOutreach: number };
};

const previewDashboardData: DashboardData = {
  runs: [{
    id: '00000000-0000-4000-8000-000000000001',
    workflow_type: 'research_outreach',
    status: 'running',
    title: 'Find local operators who need a simpler growth system',
    created_at: '2026-08-09T12:05:00.000Z',
    tasks: [
      { id: '00000000-0000-4000-8000-000000000011', task_key: 'coordinator', agent_role: 'coordinator', agent_provider: 'openclaw', model_id: null, status: 'succeeded', progress: 100 },
      { id: '00000000-0000-4000-8000-000000000012', task_key: 'public-web-researcher', agent_role: 'public_web_researcher', agent_provider: 'openrouter', model_id: null, status: 'running', progress: 68 },
      { id: '00000000-0000-4000-8000-000000000013', task_key: 'outreach-writer', agent_role: 'outreach_writer', agent_provider: 'anthropic', model_id: null, status: 'queued', progress: 0 },
      { id: '00000000-0000-4000-8000-000000000014', task_key: 'reviewer', agent_role: 'reviewer', agent_provider: 'openclaw', model_id: null, status: 'blocked', progress: 0 },
    ],
    artifacts: [],
  }, {
    id: '00000000-0000-4000-8000-000000000002',
    workflow_type: 'daily_content',
    status: 'completed',
    title: 'Minimum effective dose content package · Aug 9',
    created_at: '2026-08-09T09:00:00.000Z',
    tasks: [
      { id: '00000000-0000-4000-8000-000000000021', task_key: 'coordinator', agent_role: 'coordinator', agent_provider: 'openclaw', model_id: null, status: 'succeeded', progress: 100 },
      { id: '00000000-0000-4000-8000-000000000022', task_key: 'daily-content-producer', agent_role: 'daily_content_producer', agent_provider: 'openrouter', model_id: null, status: 'succeeded', progress: 100 },
      { id: '00000000-0000-4000-8000-000000000023', task_key: 'reviewer', agent_role: 'reviewer', agent_provider: 'local', model_id: null, status: 'succeeded', progress: 100 },
    ],
    artifacts: [],
  }],
  schedules: [{ id: '00000000-0000-4000-8000-000000000031', local_date: '2026-08-09', status: 'approval_ready', scheduled_for: '2026-08-09T13:00:00.000Z', run_id: '00000000-0000-4000-8000-000000000002' }],
  brandProfile: { timezone: 'America/New_York', default_schedule_time: '09:00:00', daily_media_cap: 0.99 },
  workerHeartbeats: [{ worker_id: 'mac-mini-local', status: 'online', version: '0.1.0-preview', capabilities: ['openclaw-gateway', 'openrouter', 'ffmpeg', 'signed-uploads'], last_seen_at: new Date().toISOString(), last_error: null, active_task_id: null }],
  approvals: [{ id: '00000000-0000-4000-8000-000000000041', artifact_type: 'content_package', title: 'One useful 10-second vertical package', status: 'pending_review', metadata: { durationSeconds: 10, aspectRatio: '9:16', mediaCost: 0.74 }, current_version_id: '00000000-0000-4000-8000-000000000042' }],
  outreach: [{ id: '00000000-0000-4000-8000-000000000051', subject: 'A practical way to reduce follow-up friction', approval_status: 'pending', recipient_email: 'operator@example.com' }],
  counts: { activeRuns: 1, pendingApprovals: 1, pendingOutreach: 1 },
};

const panelClass = 'rounded-3xl border border-[#183229]/15 bg-white p-5 shadow-[0_12px_32px_rgba(24,50,41,0.04)]';
const buttonClass = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-bold';

function key() {
  return crypto.randomUUID();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function runProgress(run: Run) {
  if (!run.tasks.length) return 0;
  return Math.round(run.tasks.reduce((total, task) => total + task.progress, 0) / run.tasks.length);
}

function workerIsStale(lastSeen: string) {
  return Date.now() - new Date(lastSeen).getTime() > 90_000;
}

export default function AgentOperationsDashboard({ previewMode = false }: { previewMode?: boolean }) {
  const [data, setData] = useState<DashboardData | null>(previewMode ? previewDashboardData : null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editText, setEditText] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    if (previewMode) {
      setData(previewDashboardData);
      setError(null);
      setLoading(false);
      return;
    }
    try {
      const response = await fetch('/api/agent-runs', { cache: 'no-store' });
      const payload = await response.json() as DashboardData & { error?: string };
      if (!response.ok) throw new Error(payload.error || 'Agent operations could not be loaded.');
      setData(payload);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Agent operations could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [previewMode]);

  useEffect(() => { void load(); }, [load]);

  const createRun = async (workflowType: 'research_outreach' | 'daily_content') => {
    if (previewMode) {
      setNotice('Local preview is read-only. Disable NEXT_PUBLIC_DASHBOARD_PREVIEW to use live actions.');
      return;
    }
    setBusy(workflowType);
    setError(null);
    try {
      const response = await fetch('/api/agent-runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowType,
          title: workflowType === 'daily_content' ? 'Minimum effective dose content package' : 'Public evidence and outreach preparation',
          idempotencyKey: key(),
          input: {
            humanApprovalRequired: true,
            automaticPublishing: false,
            automaticSending: false,
            mediaCeilingUsd: 0.99,
          },
          ...(workflowType === 'daily_content' ? {
            localDate: new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date()),
            timezone: 'America/New_York',
            scheduleTime: '09:00',
          } : {}),
        }),
      });
      const payload = await response.json() as { error?: string; duplicate?: boolean };
      if (!response.ok) throw new Error(payload.error || 'Agent run could not be created.');
      setNotice(payload.duplicate ? 'That scheduled run already exists.' : 'Agent run queued.');
      await load();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Agent run could not be created.');
    } finally {
      setBusy(null);
    }
  };

  const control = async (run: Run, action: 'pause' | 'resume' | 'cancel' | 'retry' | 'emergency-stop') => {
    if (previewMode) {
      setNotice('Local preview is read-only. No run command was sent.');
      return;
    }
    setBusy(run.id + action);
    setError(null);
    try {
      const response = await fetch('/api/agent-runs/' + run.id + '/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, idempotencyKey: key(), note: 'Operator action from the browser dashboard.' }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || 'Run control action failed.');
      setNotice(action === 'emergency-stop' ? 'Emergency stop recorded.' : 'Run ' + action + ' recorded.');
      await load();
    } catch (controlError) {
      setError(controlError instanceof Error ? controlError.message : 'Run control action failed.');
    } finally {
      setBusy(null);
    }
  };

  const decide = async (artifact: Artifact, decision: 'approve' | 'reject' | 'edit' | 'regenerate') => {
    if (previewMode) {
      setNotice('Local preview is read-only. No approval decision was sent.');
      return;
    }
    setBusy(artifact.id + decision);
    setError(null);
    try {
      const response = await fetch('/api/agent-artifacts/' + artifact.id + '/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          idempotencyKey: key(),
          note: 'Reviewed in the browser operations dashboard.',
          ...(decision === 'edit' ? { contentText: editText[artifact.id] || 'Operator-edited version; review the associated artifact metadata.' } : {}),
        }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || 'Artifact decision failed.');
      setNotice('Artifact ' + decision + ' recorded.');
      await load();
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : 'Artifact decision failed.');
    } finally {
      setBusy(null);
    }
  };

  const openPreview = async (artifact: Artifact) => {
    if (previewMode) {
      setNotice('Local preview uses sample artifact metadata; private media URLs are disabled.');
      return;
    }
    setBusy(artifact.id + 'preview');
    try {
      const response = await fetch('/api/agent-artifacts/' + artifact.id + '/preview', { cache: 'no-store' });
      const payload = await response.json() as { error?: string; url?: string };
      if (!response.ok || !payload.url) throw new Error(payload.error || 'Preview is unavailable.');
      window.open(payload.url, '_blank', 'noopener,noreferrer');
    } catch (previewError) {
      setError(previewError instanceof Error ? previewError.message : 'Preview is unavailable.');
    } finally {
      setBusy(null);
    }
  };

  const pendingTasks = useMemo(
    () => data?.runs.flatMap((run) => run.tasks).filter((task) => ['queued', 'leased', 'running'].includes(task.status)).length || 0,
    [data],
  );

  return (
    <section className="bg-[#f7f4ed] px-5 py-10 text-[#183229] sm:px-8" aria-labelledby="agent-operations-heading">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">Private browser command center</p>
            <h1 id="agent-operations-heading" className="mt-2 text-4xl font-black">Agent operations</h1>
            <p className="mt-3 max-w-3xl leading-7 text-[#50675e]">
              Coordinate multiple agents and model providers from any authenticated browser. Every result keeps its dependencies, provenance, cost, and human approval boundary.
            </p>
          </div>
          <div className="rounded-2xl bg-[#18372e] px-4 py-3 text-sm font-bold text-white">
            Minimum effective dose · $0.99 daily media ceiling
          </div>
        </header>

        {previewMode && <div role="note" className="mt-6 rounded-2xl border border-[#d9b96e] bg-[#fff8df] p-4 text-sm font-bold text-[#5c4818]">Local preview · read-only sample data · no database writes, provider calls, uploads, or approvals are enabled.</div>}

        {error && <div role="alert" className="mt-6 flex gap-2 rounded-2xl bg-red-50 p-4 text-red-800"><CircleAlert className="h-5 w-5 shrink-0" />{error}</div>}
        {notice && <div role="status" className="mt-6 rounded-2xl bg-emerald-50 p-4 text-emerald-900">{notice}</div>}
        {loading && <div className="mt-8 flex items-center gap-2 text-sm font-bold"><Loader2 className="h-4 w-4 animate-spin" />Loading agent operations…</div>}
        {!loading && error?.includes('not configured') && <p className="mt-6 text-sm text-[#50675e]">Apply the agent-operations migration to activate this command center.</p>}
        {!loading && !error?.includes('not configured') && data && (
          <>
            <AgentPlannerPanel previewMode={previewMode} />
            <section className="mt-8 grid gap-3 sm:grid-cols-3" aria-label="Agent operation summary">
              <Summary label="Active runs" value={data.counts.activeRuns} />
              <Summary label="Tasks in motion" value={pendingTasks} />
              <Summary label="Approvals waiting" value={data.counts.pendingApprovals} />
            </section>

            <section className="mt-8 grid gap-4 lg:grid-cols-2" aria-label="Start an agent run">
              <article className={panelClass}>
                <div className="flex items-start justify-between gap-4">
                  <div><p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">Research → draft → review</p><h2 className="mt-2 text-2xl font-black">Start a coordinated run</h2><p className="mt-2 text-sm leading-6 text-[#50675e]">Coordinator, public-web researcher, outreach writer, and reviewer work in dependency order. Sending remains separate.</p></div>
                  <Activity className="h-6 w-6 text-[#126b4e]" aria-hidden="true" />
                </div>
                <button className={buttonClass + ' mt-5 bg-[#126b4e] text-white disabled:opacity-50'} disabled={previewMode || busy === 'research_outreach'} onClick={() => void createRun('research_outreach')}>{busy === 'research_outreach' ? 'Queueing…' : previewMode ? 'Preview only' : 'Queue research run'}</button>
              </article>
              <article className={panelClass}>
                <div className="flex items-start justify-between gap-4">
                  <div><p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">Daily content</p><h2 className="mt-2 text-2xl font-black">One useful package</h2><p className="mt-2 text-sm leading-6 text-[#50675e]">Default 10 seconds, 9:16 MP4, caption, thumbnail, storyboard, and subtitles. Voiceover is optional; publishing is never automatic.</p></div>
                  <Video className="h-6 w-6 text-[#126b4e]" aria-hidden="true" />
                </div>
                <button className={buttonClass + ' mt-5 bg-[#18372e] text-white disabled:opacity-50'} disabled={previewMode || busy === 'daily_content'} onClick={() => void createRun('daily_content')}>{busy === 'daily_content' ? 'Queueing…' : previewMode ? 'Preview only' : 'Queue today’s package'}</button>
              </article>
            </section>

            <Runs runs={data.runs} busy={busy} onControl={(run, action) => void control(run, action)} />
            <DailyContent schedules={data.schedules} brandProfile={data.brandProfile} />
            <Outreach outreach={data.outreach} />
            <Approvals approvals={data.approvals} editText={editText} setEditText={setEditText} busy={busy} onDecision={(artifact, decision) => void decide(artifact, decision)} onPreview={(artifact) => void openPreview(artifact)} />
            <WorkerHealth workers={data.workerHeartbeats} />
          </>
        )}
      </div>
    </section>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return <article className={panelClass}><p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></article>;
}

function Runs({ runs, busy, onControl }: { runs: Run[]; busy: string | null; onControl: (run: Run, action: 'pause' | 'resume' | 'cancel' | 'retry' | 'emergency-stop') => void }) {
  return <section className="mt-8" aria-labelledby="agent-runs-heading"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">Durable orchestration</p><h2 id="agent-runs-heading" className="mt-2 text-3xl font-black">Runs</h2></div><span className="text-sm text-[#50675e]">{runs.length} recent runs</span></div>{!runs.length ? <p className={panelClass + ' mt-4 text-sm text-[#50675e]'}>No runs yet. Start with the smallest useful research or content package above.</p> : <div className="mt-4 space-y-4">{runs.slice(0, 8).map((run) => <article className={panelClass} key={run.id}><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">{run.workflow_type.replace('_', ' ')} · {run.status}</p><h3 className="mt-2 text-xl font-black">{run.title}</h3><p className="mt-1 text-xs text-[#50675e]">Started {formatDate(run.created_at)} · {runProgress(run)}% complete</p></div><div className="flex flex-wrap gap-2">{run.status === 'paused' && <button className={buttonClass + ' border border-[#183229]/20'} disabled={busy === run.id + 'resume'} onClick={() => onControl(run, 'resume')}><Play className="h-4 w-4" />Resume</button>}{['queued', 'running'].includes(run.status) && <button className={buttonClass + ' border border-[#183229]/20'} disabled={busy === run.id + 'pause'} onClick={() => onControl(run, 'pause')}><Pause className="h-4 w-4" />Pause</button>}{['queued', 'running', 'paused'].includes(run.status) && <button className={buttonClass + ' border border-red-900/20 text-red-800'} disabled={busy === run.id + 'emergency-stop'} onClick={() => onControl(run, 'emergency-stop')}><ShieldAlert className="h-4 w-4" />Stop</button>}{['failed', 'cancelled', 'emergency_stopped'].includes(run.status) && <button className={buttonClass + ' border border-[#183229]/20'} disabled={busy === run.id + 'retry'} onClick={() => onControl(run, 'retry')}><RotateCcw className="h-4 w-4" />Retry</button>}{['queued', 'running', 'paused'].includes(run.status) && <button className={buttonClass + ' border border-[#183229]/20'} disabled={busy === run.id + 'cancel'} onClick={() => onControl(run, 'cancel')}><Square className="h-4 w-4" />Cancel</button>}</div></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-[#dfe9e3]"><div className="h-full rounded-full bg-[#126b4e]" style={{ width: runProgress(run) + '%' }} /></div><div className="mt-4 grid gap-2 md:grid-cols-2">{run.tasks.map((task) => <div className="rounded-xl bg-[#f7f4ed] p-3 text-sm" key={task.id}><div className="flex justify-between gap-2"><span className="font-bold">{task.agent_role.replace(/_/g, ' ')}</span><span className="text-[#50675e]">{task.status}</span></div><p className="mt-1 text-xs text-[#50675e]">{task.agent_provider}{task.model_id ? ' · ' + task.model_id : ''}</p>{task.last_error && <p className="mt-1 text-xs text-red-800">{task.last_error}</p>}</div>)}</div></article>)}</div>}</section>;
}

function DailyContent({ schedules, brandProfile }: { schedules: DashboardData['schedules']; brandProfile: DashboardData['brandProfile'] }) {
  const next = schedules[0];
  return <section className="mt-10" aria-labelledby="daily-content-heading"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">Minimum effective dose</p><h2 id="daily-content-heading" className="mt-2 text-3xl font-black">Daily Content</h2></div><span className="text-sm text-[#50675e]">No automatic publishing</span></div><div className={panelClass + ' mt-4'}><div className="grid gap-4 md:grid-cols-3"><div><p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">Schedule</p><p className="mt-2 font-bold">{brandProfile ? brandProfile.default_schedule_time.slice(0, 5) + ' · ' + brandProfile.timezone : '09:00 · America/New_York'}</p><p className="mt-1 text-sm text-[#50675e]">{next ? next.local_date + ' · ' + next.status : 'No content package scheduled yet.'}</p></div><div><p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">Format</p><p className="mt-2 font-bold">7–15 sec · 9:16 · MP4</p><p className="mt-1 text-sm text-[#50675e]">10-second default with caption, thumbnail, script/storyboard, and subtitles.</p></div><div><p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">Budget</p><p className="mt-2 font-bold">$0.99 hard ceiling</p><p className="mt-1 text-sm text-[#50675e]">Unknown or unreservable costs fail closed before generation.</p></div></div></div></section>;
}

function Outreach({ outreach }: { outreach: DashboardData['outreach'] }) {
  return <section className="mt-10" aria-labelledby="outreach-heading"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">Existing supervised workflow</p><h2 id="outreach-heading" className="mt-2 text-3xl font-black">Outreach</h2></div><a className="inline-flex items-center gap-2 text-sm font-bold text-[#126b4e] underline" href="/prospecting">Open full queue <ExternalLink className="h-4 w-4" /></a></div><div className={panelClass + ' mt-4'}><p className="text-sm leading-6 text-[#50675e]">Public-evidence research and email drafts remain linked to the existing prospecting tables. This dashboard shows the handoff; the prospecting workspace remains the sender approval boundary.</p>{outreach.length ? <ul className="mt-4 grid gap-2 md:grid-cols-2">{outreach.slice(0, 6).map((message) => <li className="rounded-xl bg-[#f7f4ed] p-3 text-sm" key={message.id}><span className="font-bold">{message.subject}</span><span className="ml-2 text-[#50675e]">· {message.approval_status} · {message.recipient_email}</span></li>)}</ul> : <p className="mt-4 text-sm text-[#50675e]">No outreach drafts are waiting for review.</p>}</div></section>;
}

function Approvals({ approvals, editText, setEditText, busy, onDecision, onPreview }: { approvals: Artifact[]; editText: Record<string, string>; setEditText: (value: Record<string, string>) => void; busy: string | null; onDecision: (artifact: Artifact, decision: 'approve' | 'reject' | 'edit' | 'regenerate') => void; onPreview: (artifact: Artifact) => void }) {
  return <section className="mt-10" aria-labelledby="approvals-heading"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">Human gate</p><h2 id="approvals-heading" className="mt-2 text-3xl font-black">Approvals</h2></div><span className="text-sm text-[#50675e]">{approvals.length} waiting</span></div>{!approvals.length ? <p className={panelClass + ' mt-4 text-sm text-[#50675e]'}>The approval queue is clear.</p> : <div className="mt-4 grid gap-4 lg:grid-cols-2">{approvals.map((artifact) => <article className={panelClass} key={artifact.id}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">{artifact.artifact_type.replace(/_/g, ' ')}</p><h3 className="mt-2 text-xl font-black">{artifact.title}</h3></div>{artifact.current_version_id && <button className={buttonClass + ' border border-[#183229]/20'} disabled={busy === artifact.id + 'preview'} onClick={() => onPreview(artifact)}><ExternalLink className="h-4 w-4" />Preview</button>}</div><textarea aria-label={'Edit ' + artifact.title} value={editText[artifact.id] || ''} onChange={(event) => setEditText({ ...editText, [artifact.id]: event.target.value })} placeholder="Optional operator edit for a new immutable version" className="mt-4 min-h-24 w-full rounded-xl border border-[#183229]/15 bg-[#f7f4ed] p-3 text-sm" /><div className="mt-4 flex flex-wrap gap-2"><button className={buttonClass + ' bg-[#126b4e] text-white'} disabled={busy === artifact.id + 'approve'} onClick={() => onDecision(artifact, 'approve')}><Check className="h-4 w-4" />Approve</button><button className={buttonClass + ' border border-[#183229]/20'} disabled={busy === artifact.id + 'edit'} onClick={() => onDecision(artifact, 'edit')}><FileCheck2 className="h-4 w-4" />Save edit</button><button className={buttonClass + ' border border-[#183229]/20'} disabled={busy === artifact.id + 'regenerate'} onClick={() => onDecision(artifact, 'regenerate')}><RotateCcw className="h-4 w-4" />Regenerate</button><button className={buttonClass + ' border border-red-900/20 text-red-800'} disabled={busy === artifact.id + 'reject'} onClick={() => onDecision(artifact, 'reject')}>Reject</button></div></article>)}</div>}</section>;
}

function WorkerHealth({ workers }: { workers: DashboardData['workerHeartbeats'] }) {
  return <section className="mt-10 pb-8" aria-labelledby="worker-health-heading"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">Outbound bridge status</p><h2 id="worker-health-heading" className="mt-2 text-3xl font-black">Worker Health</h2></div><span className="text-sm text-[#50675e]">Signed heartbeat · lease-based</span></div>{!workers.length ? <p className={panelClass + ' mt-4 text-sm text-[#50675e]'}>No Mac-mini heartbeat has been recorded. The browser surface is ready, but worker execution is offline.</p> : <div className="mt-4 grid gap-4 md:grid-cols-2">{workers.map((worker) => { const stale = workerIsStale(worker.last_seen_at); const healthy = !stale && worker.status === 'online'; return <article className={panelClass} key={worker.worker_id}><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">Mac-mini bridge</p><h3 className="mt-2 text-xl font-black">{worker.worker_id}</h3><p className="mt-1 text-sm text-[#50675e]">v{worker.version || 'unknown'} · last seen {formatDate(worker.last_seen_at)}</p></div><span className={'rounded-full px-3 py-1 text-xs font-bold ' + (healthy ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900')}>{healthy ? 'Online' : stale ? 'Stale' : worker.status}</span></div><p className="mt-4 text-sm text-[#50675e]">Capabilities: {worker.capabilities.length ? worker.capabilities.join(', ') : 'not reported'}</p>{worker.last_error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">{worker.last_error}</p>}<p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#126b4e]">{worker.active_task_id ? 'Executing a leased task' : 'Waiting for work'}</p></article>; })}</div>}</section>;
}
