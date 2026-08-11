'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, CircleAlert, FilePenLine, Loader2, Play, RotateCcw, ShieldX } from 'lucide-react';

type PlanStep = {
  key: string;
  title: string;
  instruction: string;
  taskType: string;
  agentRole: string;
  capabilities: string[];
  expectedArtifacts: string[];
  estimatedCostUsd: number;
};

type Plan = {
  id: string;
  original_request: string;
  rewritten_instruction: string;
  workflow_type: string;
  growth_profile_id: string;
  steps: PlanStep[];
  allowed_capabilities: string[];
  forbidden_actions: string[];
  expected_artifacts: string[];
  selected_model_id: string;
  estimated_prompt_tokens: number;
  estimated_completion_tokens: number;
  estimated_cost_usd: number | string;
  status: 'draft' | 'approved' | 'rejected' | 'dispatched';
  run_id: string | null;
  updated_at: string;
};

type Profile = {
  id: string;
  name: string;
  target_market: string;
  geography: string;
  selected_model_id: string | null;
  model_route: string;
  emergency_stop: boolean;
};

const panelClass = 'rounded-3xl border border-[#183229]/15 bg-white p-5 shadow-[0_12px_32px_rgba(24,50,41,0.04)]';
const buttonClass = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-bold';

function key() {
  return crypto.randomUUID();
}

function formatUsd(value: number | string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? `$${amount.toFixed(4)}` : 'unavailable';
}

function samplePlan(): Plan {
  return {
    id: '00000000-0000-4000-8000-000000000071',
    original_request: 'Find two local operators that show public signs of follow-up friction and prepare evidence-backed drafts for review.',
    rewritten_instruction: 'Research up to two distinct local operators using public HTTPS sources, document evidence-backed fit, and prepare drafts for human review without sending or publishing anything.',
    workflow_type: 'research_outreach',
    growth_profile_id: '00000000-0000-4000-8000-000000000072',
    steps: [
      { key: 'research', title: 'Research public evidence', instruction: 'Find distinct businesses and cite public evidence for every fit claim.', taskType: 'research_public_web', agentRole: 'public_web_researcher', capabilities: ['read_public_web', 'research_public_web'], expectedArtifacts: ['research dossier', 'public citations'], estimatedCostUsd: 0.02 },
      { key: 'draft', title: 'Prepare drafts', instruction: 'Turn accepted evidence into a concise draft that remains pending human review.', taskType: 'draft_outreach', agentRole: 'outreach_writer', capabilities: ['draft_outreach'], expectedArtifacts: ['email draft'], estimatedCostUsd: 0.01 },
      { key: 'review', title: 'Check the result', instruction: 'Review citations, claims, and prohibited actions before returning the queue to the operator.', taskType: 'review_artifacts', agentRole: 'reviewer', capabilities: ['review_artifacts'], expectedArtifacts: ['review report'], estimatedCostUsd: 0.01 },
    ],
    allowed_capabilities: ['read_public_web', 'research_public_web', 'draft_outreach', 'review_artifacts'],
    forbidden_actions: ['send_external_messages', 'publish_content', 'spend_money', 'change_connected_accounts', 'deliver_external_content'],
    expected_artifacts: ['research dossier', 'public citations', 'email draft', 'review report'],
    selected_model_id: 'configured model (server pinned)',
    estimated_prompt_tokens: 900,
    estimated_completion_tokens: 1200,
    estimated_cost_usd: 0.018,
    status: 'draft',
    run_id: null,
    updated_at: new Date().toISOString(),
  };
}

export default function AgentPlannerPanel({ previewMode = false }: { previewMode?: boolean }) {
  const [plans, setPlans] = useState<Plan[]>(previewMode ? [samplePlan()] : []);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [request, setRequest] = useState('');
  const [workflowType, setWorkflowType] = useState<'research_outreach' | 'daily_content'>('research_outreach');
  const [profileId, setProfileId] = useState('');
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(!previewMode);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (previewMode) return;
    setLoading(true);
    try {
      const response = await fetch('/api/agent-plans', { cache: 'no-store' });
      const payload = await response.json() as { plans?: Plan[]; growthProfiles?: Profile[]; error?: string };
      if (!response.ok) throw new Error(payload.error || 'Agent plans could not be loaded.');
      setPlans(payload.plans || []);
      setProfiles(payload.growthProfiles || []);
      setProfileId((current) => current || payload.growthProfiles?.find((profile) => !profile.emergency_stop)?.id || '');
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Agent plans could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [previewMode]);

  useEffect(() => { void load(); }, [load]);

  const selectedProfile = useMemo(() => profiles.find((profile) => profile.id === profileId) || null, [profiles, profileId]);

  async function createPlan() {
    if (previewMode) { setNotice('Local preview is read-only. No planner request was sent.'); return; }
    if (!request.trim() || !profileId) { setError('Choose a growth profile and enter the operator request.'); return; }
    setBusy('create'); setError(null);
    try {
      const response = await fetch('/api/agent-plans', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalRequest: request, workflowType, growthProfileId: profileId, idempotencyKey: key() }),
      });
      const payload = await response.json() as { error?: string; plan?: Plan; duplicate?: boolean };
      if (!response.ok) throw new Error(payload.error || 'The planner could not create a draft.');
      setNotice(payload.duplicate ? 'The planner request was already saved.' : 'Draft plan created. Review it before approval.');
      setRequest('');
      await load();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'The planner could not create a draft.');
    } finally { setBusy(null); }
  }

  async function action(plan: Plan, actionName: 'approve' | 'reject' | 'dispatch') {
    if (previewMode) { setNotice('Local preview is read-only. No approval or dispatch was sent.'); return; }
    setBusy(plan.id + actionName); setError(null);
    try {
      const response = await fetch(`/api/agent-plans/${plan.id}/${actionName}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idempotencyKey: key(), note: 'Reviewed in the authenticated operations dashboard.' }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || `Plan ${actionName} failed.`);
      setNotice(actionName === 'dispatch' ? 'Approved plan dispatched to the signed Mac bridge queue.' : `Plan ${actionName} recorded.`);
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : `Plan ${actionName} failed.`);
    } finally { setBusy(null); }
  }

  async function saveEdit(plan: Plan) {
    if (previewMode) { setNotice('Local preview is read-only. No edit was sent.'); return; }
    const rewrittenInstruction = editing[plan.id]?.trim();
    if (!rewrittenInstruction) { setError('Enter a rewritten instruction before saving the edit.'); return; }
    setBusy(plan.id + 'edit'); setError(null);
    try {
      const response = await fetch(`/api/agent-plans/${plan.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'edit', rewrittenInstruction, idempotencyKey: key() }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || 'Plan edit failed.');
      setNotice('Plan edit saved as a new draft version.');
      setEditing((current) => ({ ...current, [plan.id]: '' }));
      await load();
    } catch (editError) {
      setError(editError instanceof Error ? editError.message : 'Plan edit failed.');
    } finally { setBusy(null); }
  }

  return (
    <section className="mt-8" aria-labelledby="agent-planner-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">App-side LLM · draft only</p><h2 id="agent-planner-heading" className="mt-2 text-3xl font-black">Plan before OpenClaw runs</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-[#50675e]">The app rewrites and decomposes the request. A human approves the frozen plan; only then does Vercel create a run for the Mac-mini OpenClaw bridge.</p></div>
        <span className="rounded-full bg-[#e5f2eb] px-3 py-2 text-xs font-bold text-[#126b4e]">No automatic dispatch</span>
      </div>

      {error && <div role="alert" className="mt-4 flex gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-800"><CircleAlert className="h-5 w-5 shrink-0" />{error}</div>}
      {notice && <div role="status" className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">{notice}</div>}
      {loading && <div className="mt-5 flex items-center gap-2 text-sm font-bold"><Loader2 className="h-4 w-4 animate-spin" />Loading plans…</div>}

      <article className={panelClass + ' mt-5'}>
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px_auto] lg:items-end">
          <label className="block text-sm font-bold">Operator request<textarea value={request} onChange={(event) => setRequest(event.target.value)} placeholder="Describe the outcome you want prepared for review…" className="mt-2 min-h-24 w-full rounded-xl border border-[#183229]/15 bg-[#f7f4ed] p-3 text-sm font-normal" disabled={previewMode} /></label>
          <label className="block text-sm font-bold">Workflow<select value={workflowType} onChange={(event) => setWorkflowType(event.target.value as typeof workflowType)} className="mt-2 min-h-10 w-full rounded-xl border border-[#183229]/15 bg-[#f7f4ed] px-3 text-sm" disabled={previewMode}><option value="research_outreach">Research + drafts</option><option value="daily_content">Daily content</option></select></label>
          <label className="block text-sm font-bold">Growth profile<select value={profileId} onChange={(event) => setProfileId(event.target.value)} className="mt-2 min-h-10 w-full rounded-xl border border-[#183229]/15 bg-[#f7f4ed] px-3 text-sm" disabled={previewMode || !profiles.length}><option value="">Select profile</option>{profiles.map((profile) => <option value={profile.id} key={profile.id} disabled={profile.emergency_stop}>{profile.name}{profile.selected_model_id ? '' : ' · pin model first'}</option>)}</select></label>
          <button className={buttonClass + ' bg-[#126b4e] text-white disabled:opacity-50'} disabled={previewMode || busy === 'create' || !selectedProfile} onClick={() => void createPlan()}>{busy === 'create' ? 'Planning…' : 'Create draft'}</button>
        </div>
      </article>

      <div className="mt-5 space-y-4">
        {plans.length === 0 && !loading && <p className={panelClass + ' text-sm text-[#50675e]'}>No planner drafts yet.</p>}
        {plans.slice(0, 8).map((plan) => <PlanCard key={plan.id} plan={plan} editing={editing[plan.id] ?? plan.rewritten_instruction} setEditing={(value) => setEditing((current) => ({ ...current, [plan.id]: value }))} busy={busy} previewMode={previewMode} onSave={() => void saveEdit(plan)} onAction={(name) => void action(plan, name)} />)}
      </div>
    </section>
  );
}

function PlanCard({ plan, editing, setEditing, busy, previewMode, onSave, onAction }: { plan: Plan; editing: string; setEditing: (value: string) => void; busy: string | null; previewMode: boolean; onSave: () => void; onAction: (action: 'approve' | 'reject' | 'dispatch') => void }) {
  return <article className={panelClass}>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">{plan.workflow_type.replace('_', ' ')} · {plan.status}</p><h3 className="mt-2 text-xl font-black">{plan.rewritten_instruction}</h3><p className="mt-1 text-xs text-[#50675e]">Original request: {plan.original_request}</p></div><span className="rounded-full bg-[#f7f4ed] px-3 py-2 text-xs font-bold">{formatUsd(plan.estimated_cost_usd)} estimated</span></div>
    <div className="mt-4 grid gap-4 lg:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">Rewritten instruction</p><textarea value={editing} onChange={(event) => setEditing(event.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-[#183229]/15 bg-[#f7f4ed] p-3 text-sm" disabled={previewMode || plan.status === 'dispatched'} aria-label={`Edit ${plan.original_request}`} /></div><div><p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">Model + estimate</p><p className="mt-2 text-sm font-bold">{plan.selected_model_id}</p><p className="mt-1 text-sm text-[#50675e]">Up to {plan.estimated_prompt_tokens.toLocaleString()} prompt + {plan.estimated_completion_tokens.toLocaleString()} completion tokens. Model comparison is not used for dispatch.</p></div></div>
    <div className="mt-4 grid gap-4 md:grid-cols-3"><TagList label="Allowed capabilities" values={plan.allowed_capabilities} /><TagList label="Forbidden actions" values={plan.forbidden_actions} tone="danger" /><TagList label="Expected artifacts" values={plan.expected_artifacts} /></div>
    <div className="mt-4"><p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">Ordered steps</p><ol className="mt-2 grid gap-2 md:grid-cols-2">{plan.steps.map((step, index) => <li className="rounded-xl bg-[#f7f4ed] p-3 text-sm" key={step.key}><span className="font-black">{index + 1}. {step.title}</span><span className="ml-2 text-xs text-[#50675e]">{step.taskType} · {formatUsd(step.estimatedCostUsd)}</span><p className="mt-1 text-xs leading-5 text-[#50675e]">{step.instruction}</p></li>)}</ol></div>
    <div className="mt-5 flex flex-wrap gap-2">{['draft', 'rejected'].includes(plan.status) && <button className={buttonClass + ' border border-[#183229]/20'} disabled={previewMode || busy === plan.id + 'edit'} onClick={onSave}><FilePenLine className="h-4 w-4" />Save edit</button>}{plan.status === 'draft' && <><button className={buttonClass + ' bg-[#126b4e] text-white'} disabled={previewMode || busy === plan.id + 'approve'} onClick={() => onAction('approve')}><Check className="h-4 w-4" />Approve</button><button className={buttonClass + ' border border-red-900/20 text-red-800'} disabled={previewMode || busy === plan.id + 'reject'} onClick={() => onAction('reject')}><ShieldX className="h-4 w-4" />Reject</button></>}{plan.status === 'rejected' && <span className="rounded-full bg-amber-100 px-3 py-2 text-xs font-bold text-amber-900">Rejected · edit to reopen</span>}{plan.status === 'approved' && <button className={buttonClass + ' bg-[#18372e] text-white'} disabled={previewMode || busy === plan.id + 'dispatch'} onClick={() => onAction('dispatch')}><Play className="h-4 w-4" />Dispatch approved plan</button>}{plan.status === 'dispatched' && <span className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-900">Dispatched to bridge{plan.run_id ? ` · run ${plan.run_id.slice(0, 8)}` : ''}</span>}{plan.status === 'rejected' && <RotateCcw className="mt-2 h-4 w-4 text-[#50675e]" aria-label="Edit required before approval" />}</div>
  </article>;
}

function TagList({ label, values, tone = 'normal' }: { label: string; values: string[]; tone?: 'normal' | 'danger' }) {
  return <div><p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">{label}</p><div className="mt-2 flex flex-wrap gap-1.5">{values.map((value) => <span className={'rounded-full px-2.5 py-1 text-xs font-bold ' + (tone === 'danger' ? 'bg-red-50 text-red-800' : 'bg-[#e5f2eb] text-[#126b4e]')} key={value}>{value}</span>)}</div></div>;
}
