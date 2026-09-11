import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  WorkspaceArtifact,
  WorkspaceData,
  WorkspaceEvent,
  WorkspaceStatus,
  WorkspaceWorkflow,
} from '@/lib/workspace-types';

type PlanRow = {
  id: string;
  workflow_type: string;
  original_request: string;
  rewritten_instruction: string;
  status: string;
  estimated_cost_usd: number | string | null;
  run_id: string | null;
  created_at: string;
  updated_at: string;
};

type RunRow = {
  id: string;
  plan_id: string | null;
  workflow_type: string;
  status: string;
  title: string;
  output: unknown;
  created_at: string;
  updated_at: string;
};

type PlanEventRow = {
  id: number;
  plan_id: string;
  event_type: string;
  created_at: string;
};

type RunEventRow = {
  id: number;
  run_id: string;
  event_type: string;
  created_at: string;
};

type ArtifactRow = {
  id: string;
  run_id: string;
  artifact_type: string;
  title: string;
  status: string;
  current_version_id: string | null;
  metadata: unknown;
  created_at: string;
  updated_at: string;
};

type ArtifactVersionRow = {
  id: string;
  artifact_id: string;
  version_number: number;
  content_text: string | null;
  storage_path: string | null;
  metadata: unknown;
};

type WorkspaceQueryError = { code?: string; message?: string } | null;

export class WorkspaceUnavailableError extends Error {
  constructor() {
    super('The authenticated workspace is not configured yet.');
    this.name = 'WorkspaceUnavailableError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown, maxLength = 2_000): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized ? normalized.slice(0, maxLength) : null;
}

function number(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function arrayOfText(value: unknown, maxItems = 8): string[] {
  const values = Array.isArray(value) ? value : [value];
  return values
    .map((item) => {
      if (typeof item === 'string') return text(item, 400);
      if (!isRecord(item)) return null;
      return text(item.summary ?? item.description ?? item.message ?? item.claim ?? item.title ?? item.name, 400);
    })
    .filter((item): item is string => Boolean(item))
    .slice(0, maxItems);
}

function valuesForKeys(value: unknown, keys: string[], depth = 0): unknown[] {
  if (depth > 3 || value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.flatMap((item) => valuesForKeys(item, keys, depth + 1));
  if (!isRecord(value)) return [];

  const results: unknown[] = [];
  for (const [key, child] of Object.entries(value)) {
    if (keys.includes(key.toLowerCase())) results.push(child);
    results.push(...valuesForKeys(child, keys, depth + 1));
  }
  return results;
}

function collectReferences(...values: unknown[]): string[] {
  const found = new Set<string>();
  for (const value of values) {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value ?? '');
    for (const match of serialized.matchAll(/https?:\/\/[^\s"<>]+/gi)) {
      const cleaned = match[0].replace(/[),.;]+$/, '');
      if (cleaned.length > 512) continue;
      try {
        const url = new URL(cleaned);
        const hasCredentialLikeQuery = [...url.searchParams.keys()].some((key) => /token|secret|signature|credential|password|auth|api[-_]?key/i.test(key));
        if (url.username || url.password || hasCredentialLikeQuery) continue;
        found.add(url.toString());
      } catch {
        // Ignore malformed URLs embedded in result text.
      }
      if (found.size >= 12) return [...found];
    }
  }
  return [...found];
}

function readableArtifactStatus(status: string): string {
  const labels: Record<string, string> = {
    pending_review: 'Ready for review',
    approved: 'Approved',
    rejected: 'Needs changes',
    edited: 'Updated',
    regeneration_requested: 'Being refreshed',
    archived: 'Archived',
  };
  return labels[status] || status.replace(/_/g, ' ');
}

function statusLabel(status: WorkspaceStatus): string {
  const labels: Record<WorkspaceStatus, string> = {
    awaiting_approval: 'Needs review',
    approved: 'Approved',
    queued: 'Queued',
    in_progress: 'In progress',
    awaiting_review: 'Result ready',
    completed: 'Completed',
    needs_attention: 'Needs attention',
    cancelled: 'Cancelled',
    rejected: 'Not approved',
  };
  return labels[status];
}

function eventCopy(eventType: string): Pick<WorkspaceEvent, 'title' | 'body' | 'tone'> {
  const copy: Record<string, Pick<WorkspaceEvent, 'title' | 'body' | 'tone'>> = {
    created: { title: 'Request recorded', body: 'NeedThisDone saved the request for this workspace.', tone: 'neutral' },
    edited: { title: 'Plan updated', body: 'The planned work was updated before approval.', tone: 'neutral' },
    approved: { title: 'Plan approved', body: 'The approved scope is now fixed for execution.', tone: 'positive' },
    rejected: { title: 'Plan not approved', body: 'This request needs a new decision before work can begin.', tone: 'warning' },
    dispatched: { title: 'Work started', body: 'The approved work was handed to the private execution path.', tone: 'positive' },
    queued: { title: 'Work queued', body: 'The request is waiting for its approved execution window.', tone: 'neutral' },
    leased: { title: 'Work started', body: 'The private execution path has begun working on the request.', tone: 'positive' },
    progress: { title: 'Work is moving', body: 'The request is still in progress. You can check back here for the next update.', tone: 'neutral' },
    artifact: { title: 'A result was prepared', body: 'A reviewable result has been attached to this request.', tone: 'positive' },
    succeeded: { title: 'Work completed', body: 'The private execution path finished this request.', tone: 'positive' },
    failed: { title: 'Work stopped', body: 'The request stopped before completion and needs attention.', tone: 'danger' },
    paused: { title: 'Work paused', body: 'The request is paused until the next decision.', tone: 'warning' },
    resumed: { title: 'Work resumed', body: 'The request is moving again.', tone: 'positive' },
    cancelled: { title: 'Work cancelled', body: 'The request was cancelled before completion.', tone: 'warning' },
    'emergency-stopped': { title: 'Work stopped', body: 'The request was stopped by its safety boundary.', tone: 'danger' },
    approval: { title: 'Result ready for review', body: 'A result is available for a final review decision.', tone: 'positive' },
  };
  return copy[eventType] || { title: 'Status updated', body: 'The durable request record changed.', tone: 'neutral' };
}

function deriveStatus(planStatus: string | null, runStatus: string | null, artifacts: ArtifactRow[]): WorkspaceStatus {
  if (planStatus === 'rejected') return 'rejected';
  if (planStatus === 'draft') return 'awaiting_approval';
  if (runStatus === 'failed') return 'needs_attention';
  if (runStatus === 'emergency_stopped') return 'needs_attention';
  if (runStatus === 'cancelled') return 'cancelled';
  if (runStatus === 'paused') return 'needs_attention';
  if (runStatus === 'running') return 'in_progress';
  if (runStatus === 'queued') return 'queued';
  if (runStatus === 'completed' && artifacts.some((artifact) => artifact.status === 'pending_review')) return 'awaiting_review';
  if (runStatus === 'completed') return 'completed';
  if (planStatus === 'approved') return 'approved';
  if (planStatus === 'dispatched') return 'queued';
  return 'awaiting_approval';
}

function nextAction(status: WorkspaceStatus): string {
  const actions: Record<WorkspaceStatus, string> = {
    awaiting_approval: 'Review the request before work begins.',
    approved: 'The approved request is ready to enter execution.',
    queued: 'NeedThisDone will show the next update here.',
    in_progress: 'No action is needed right now.',
    awaiting_review: 'Review the result and its supporting evidence.',
    completed: 'Review the completed work and decide what is next.',
    needs_attention: 'Review what stopped the work before deciding whether to retry.',
    cancelled: 'Decide whether this request should be started again.',
    rejected: 'Update the request if you want to ask for a new review.',
  };
  return actions[status];
}

function contentForVersion(version: ArtifactVersionRow | undefined): { content: string | null; truncated: boolean } {
  if (!version?.content_text) return { content: null, truncated: false };
  let content = version.content_text.trim();
  try {
    const parsed: unknown = JSON.parse(content);
    if (Array.isArray(parsed) || isRecord(parsed)) content = JSON.stringify(parsed, null, 2);
  } catch {
    // Plain text artifacts are already suitable for the workspace.
  }
  const truncated = content.length > 8_000;
  return { content: truncated ? `${content.slice(0, 8_000).trimEnd()}\n\n[Content shortened for the workspace view.]` : content, truncated };
}

function eventList(
  workflowId: string,
  createdAt: string,
  planEvents: PlanEventRow[],
  runEvents: RunEventRow[],
): WorkspaceEvent[] {
  const events: WorkspaceEvent[] = [
    {
      id: `request-${workflowId}`,
      title: 'Request received',
      body: 'This request has a durable record in your workspace.',
      createdAt,
      tone: 'neutral',
    },
    ...planEvents.map((event) => ({
      id: `plan-${event.id}`,
      ...eventCopy(event.event_type),
      createdAt: event.created_at,
    })),
    ...runEvents.map((event) => ({
      id: `run-${event.id}`,
      ...eventCopy(event.event_type),
      createdAt: event.created_at,
    })),
  ];
  return events.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

function workflowFromRows(
  plan: PlanRow | null,
  run: RunRow | null,
  artifacts: ArtifactRow[],
  versions: ArtifactVersionRow[],
  planEvents: PlanEventRow[],
  runEvents: RunEventRow[],
): WorkspaceWorkflow {
  const workflowId = plan?.id || run?.id || 'unknown';
  const planStatus = plan?.status || null;
  const runStatus = run?.status || null;
  const status = deriveStatus(planStatus, runStatus, artifacts);
  const output = run?.output;
  const artifactViews: WorkspaceArtifact[] = artifacts.map((artifact) => {
    const version = versions.find((candidate) => candidate.id === artifact.current_version_id);
    const content = contentForVersion(version);
    return {
      id: artifact.id,
      title: artifact.title,
      artifactType: artifact.artifact_type,
      status: artifact.status,
      statusLabel: readableArtifactStatus(artifact.status),
      content: content.content,
      contentTruncated: content.truncated,
      hasPrivateFile: Boolean(version?.storage_path),
      references: collectReferences(artifact.metadata, version?.metadata, content.content),
      createdAt: artifact.created_at,
      updatedAt: artifact.updated_at,
    };
  });
  const checks = [
    ...valuesForKeys(output, ['checks', 'checkresults', 'validation', 'evidence']).flatMap((value) => arrayOfText(value)),
    ...artifacts.flatMap((artifact) => valuesForKeys(artifact.metadata, ['checks', 'validation', 'evidence']).flatMap((value) => arrayOfText(value, 4))),
  ].filter((value, index, all) => all.indexOf(value) === index).slice(0, 8);
  const blockers = [
    ...valuesForKeys(output, ['blockers', 'errors', 'error']).flatMap((value) => arrayOfText(value)),
  ].filter((value, index, all) => all.indexOf(value) === index).slice(0, 8);
  const references = collectReferences(output, ...artifactViews.map((artifact) => artifact.references));
  const outputRecord = isRecord(output) ? output : {};
  const summary = text(outputRecord.summary ?? outputRecord.message ?? outputRecord.result, 2_000)
    || text(plan?.rewritten_instruction, 2_000);
  const createdAt = plan?.created_at || run?.created_at || new Date(0).toISOString();
  const updatedAt = [plan?.updated_at, run?.updated_at, ...artifactViews.map((artifact) => artifact.updatedAt)]
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1) || createdAt;
  const request = plan?.original_request || run?.title || 'Untitled request';

  return {
    id: workflowId,
    planId: plan?.id || null,
    runId: run?.id || null,
    title: text(plan?.original_request || run?.title, 180) || 'Untitled request',
    request,
    instruction: text(plan?.rewritten_instruction, 2_000),
    workflowType: plan?.workflow_type || run?.workflow_type || 'workflow',
    planStatus,
    runStatus,
    status,
    statusLabel: statusLabel(status),
    nextAction: nextAction(status),
    approvalRequired: status === 'awaiting_approval' || status === 'awaiting_review',
    estimatedCostUsd: number(plan?.estimated_cost_usd),
    createdAt,
    updatedAt,
    summary,
    checks,
    blockers: blockers.length || status !== 'needs_attention'
      ? blockers
      : ['The durable record shows that this request needs attention.'],
    references,
    artifacts: artifactViews,
    events: eventList(workflowId, createdAt, planEvents, runEvents),
  };
}

function firstError(...errors: WorkspaceQueryError[]): WorkspaceQueryError {
  return errors.find(Boolean) || null;
}

function throwForQuery(error: WorkspaceQueryError): void {
  if (!error) return;
  if (error.code === '42P01' || error.code === '42883') throw new WorkspaceUnavailableError();
  throw new Error(error.message || 'The authenticated workspace could not be loaded.');
}

export async function loadWorkspace(
  supabase: SupabaseClient,
  ownerId: string,
): Promise<WorkspaceData> {
  const [plansResult, runsResult] = await Promise.all([
    supabase
      .from('agent_plans')
      .select('id, workflow_type, original_request, rewritten_instruction, status, estimated_cost_usd, run_id, created_at, updated_at')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('agent_runs')
      .select('id, plan_id, workflow_type, status, title, output, created_at, updated_at')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);
  throwForQuery(firstError(plansResult.error, runsResult.error));

  const plans = (plansResult.data || []) as PlanRow[];
  const runs = (runsResult.data || []) as RunRow[];
  const planIds = plans.map((plan) => plan.id);
  const runIds = runs.map((run) => run.id);

  const [planEventsResult, runEventsResult, artifactsResult] = await Promise.all([
    planIds.length
      ? supabase.from('agent_plan_events').select('id, plan_id, event_type, created_at').eq('owner_id', ownerId).in('plan_id', planIds).order('created_at', { ascending: false }).limit(200)
      : Promise.resolve({ data: [], error: null }),
    runIds.length
      ? supabase.from('agent_run_events').select('id, run_id, event_type, created_at').eq('owner_id', ownerId).in('run_id', runIds).order('created_at', { ascending: false }).limit(300)
      : Promise.resolve({ data: [], error: null }),
    runIds.length
      ? supabase.from('agent_artifacts').select('id, run_id, artifact_type, title, status, current_version_id, metadata, created_at, updated_at').eq('owner_id', ownerId).in('run_id', runIds).order('created_at', { ascending: false }).limit(100)
      : Promise.resolve({ data: [], error: null }),
  ]);
  throwForQuery(firstError(planEventsResult.error, runEventsResult.error, artifactsResult.error));

  const planEvents = (planEventsResult.data || []) as PlanEventRow[];
  const runEvents = (runEventsResult.data || []) as RunEventRow[];
  const artifacts = (artifactsResult.data || []) as ArtifactRow[];
  const currentVersionIds = artifacts.map((artifact) => artifact.current_version_id).filter((id): id is string => Boolean(id));
  const versionsResult = currentVersionIds.length
    ? await supabase.from('agent_artifact_versions').select('id, artifact_id, version_number, content_text, storage_path, metadata').eq('owner_id', ownerId).in('id', currentVersionIds).limit(100)
    : { data: [], error: null };
  throwForQuery(versionsResult.error);
  const versions = (versionsResult.data || []) as ArtifactVersionRow[];

  const workflows = plans.map((plan) => {
    const run = runs.find((candidate) => candidate.id === plan.run_id || candidate.plan_id === plan.id) || null;
    return workflowFromRows(
      plan,
      run,
      artifacts.filter((artifact) => artifact.run_id === run?.id),
      versions.filter((version) => artifacts.some((artifact) => artifact.run_id === run?.id && artifact.id === version.artifact_id)),
      planEvents.filter((event) => event.plan_id === plan.id),
      runEvents.filter((event) => event.run_id === run?.id),
    );
  });
  const plannedRunIds = new Set(workflows.map((workflow) => workflow.runId).filter(Boolean));
  const legacyWorkflows = runs
    .filter((run) => !plannedRunIds.has(run.id) && !plans.some((plan) => plan.id === run.plan_id))
    .map((run) => workflowFromRows(
      null,
      run,
      artifacts.filter((artifact) => artifact.run_id === run.id),
      versions.filter((version) => artifacts.some((artifact) => artifact.run_id === run.id && artifact.id === version.artifact_id)),
      [],
      runEvents.filter((event) => event.run_id === run.id),
    ));
  const allWorkflows = [...workflows, ...legacyWorkflows]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 50);

  return {
    configured: true,
    workflows: allWorkflows,
    counts: {
      active: allWorkflows.filter((workflow) => ['approved', 'queued', 'in_progress'].includes(workflow.status)).length,
      needsAttention: allWorkflows.filter((workflow) => ['awaiting_approval', 'awaiting_review', 'needs_attention', 'cancelled', 'rejected'].includes(workflow.status)).length,
      completed: allWorkflows.filter((workflow) => workflow.status === 'completed').length,
    },
  };
}
