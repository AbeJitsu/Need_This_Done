import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const MISSION = 'Turn meaningful growth work into clear, approved next actions that move the business forward.';

type SourceWorkItem = {
  id: string;
  title: string;
  proposed_action: string;
  expected_outcome: string | null;
  queue: string;
  scheduled_date: string;
  status: string;
  priority: number;
};

type SourceMessage = {
  id: string;
  prospect_id: string;
  subject: string;
  approval_status: string;
  replied_at: string | null;
  follow_up_eligible: boolean;
  next_action_at: string | null;
  prospects: { company_name: string; contact_name: string | null } | null;
};

type SourceOutcome = {
  id: string;
  prospect_id: string;
  outcome_type: string;
  notes: string;
  occurred_at: string;
  prospects?: { company_name: string; contact_name: string | null } | null;
};

type PriorityRow = {
  id: string;
  position: number;
  outcome: string;
  owner_name: string;
  due_date: string;
  status: 'active' | 'completed' | 'dropped';
  next_action: string;
};

function dateOnly(value: string | null | undefined) {
  return value ? value.slice(0, 10) : null;
}

function todayInUtc() {
  return new Date().toISOString().slice(0, 10);
}

function weekStartFor(value: Date) {
  const start = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  const daysSinceMonday = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - daysSinceMonday);
  return start.toISOString().slice(0, 10);
}

function prospectLabel(message: SourceMessage) {
  return message.prospects?.company_name || message.prospects?.contact_name || message.subject || 'prospect';
}

function outcomeLabel(outcome: SourceOutcome) {
  return outcome.prospects?.company_name || 'prospect';
}

function uniqueSignals<T extends { id: string }>(signals: T[]) {
  return [...new Map(signals.map((signal) => [signal.id, signal])).values()];
}

async function upsertSuggestedActions(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  ownerId: string,
  weekStart: string,
  priorities: PriorityRow[],
  workItems: SourceWorkItem[],
  messages: SourceMessage[],
  outcomes: SourceOutcome[],
) {
  const rows: Array<Record<string, unknown>> = [];

  for (const priority of priorities.filter((item) => item.status === 'active')) {
    rows.push({
      owner_id: ownerId,
      week_start: weekStart,
      priority_id: priority.id,
      source_type: 'priority',
      source_id: priority.id,
      action_type: 'big_rock',
      title: priority.next_action,
      description: `Move this weekly outcome forward: ${priority.outcome}`,
      due_date: priority.due_date,
      rank: priority.position,
    });
  }

  for (const item of workItems.filter((candidate) => ['pending', 'approved', 'revised'].includes(candidate.status))) {
    rows.push({
      owner_id: ownerId,
      week_start: weekStart,
      source_type: 'employee_work',
      source_id: item.id,
      action_type: 'employee',
      title: item.proposed_action || item.title,
      description: item.expected_outcome || `Review ${item.queue} work: ${item.title}`,
      due_date: item.scheduled_date,
      rank: 10 + item.priority,
    });
  }

  for (const message of messages) {
    const label = prospectLabel(message);
    if (message.replied_at) {
      rows.push({
        owner_id: ownerId,
        week_start: weekStart,
        source_type: 'outreach_message',
        source_id: message.id,
        action_type: 'reply',
        title: `Reply to ${label}`,
        description: 'A reply is waiting for an operator review and next step.',
        due_date: dateOnly(message.next_action_at) || todayInUtc(),
        rank: 25,
      });
    } else if (message.approval_status === 'pending') {
      rows.push({
        owner_id: ownerId,
        week_start: weekStart,
        source_type: 'outreach_message',
        source_id: message.id,
        action_type: 'draft',
        title: `Review draft for ${label}`,
        description: message.subject,
        due_date: todayInUtc(),
        rank: 30,
      });
    } else if (message.follow_up_eligible) {
      rows.push({
        owner_id: ownerId,
        week_start: weekStart,
        source_type: 'outreach_message',
        source_id: message.id,
        action_type: 'follow_up',
        title: `Follow up with ${label}`,
        description: 'This message is eligible for a supervised follow-up.',
        due_date: dateOnly(message.next_action_at) || todayInUtc(),
        rank: 32,
      });
    }
  }

  for (const outcome of outcomes.slice(0, 20)) {
    rows.push({
      owner_id: ownerId,
      week_start: weekStart,
      source_type: 'prospect_outcome',
      source_id: outcome.id,
      action_type: 'outcome',
      title: `Review ${outcome.outcome_type.replace(/_/g, ' ')} from ${outcomeLabel(outcome)}`,
      description: outcome.notes || 'Record the next useful step from this outcome.',
      due_date: dateOnly(outcome.occurred_at) || todayInUtc(),
      rank: 35,
    });
  }

  if (!rows.length) return null;
  return supabase.from('operator_cockpit_actions').upsert(rows, {
    onConflict: 'owner_id,source_type,source_id',
  });
}

export async function GET() {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;

  const supabase = await createSupabaseServerClient();
  const today = todayInUtc();
  const weekStart = weekStartFor(new Date());

  const [priorityResult, profileResult, workResult, reflectionResult] = await Promise.all([
    supabase.from('operator_weekly_priorities').select('*').eq('owner_id', auth.user.id).eq('week_start', weekStart).order('position'),
    supabase.from('growth_profiles').select('*').eq('owner_id', auth.user.id).maybeSingle(),
    supabase.from('ai_employee_work_items').select('id, title, proposed_action, expected_outcome, queue, scheduled_date, status, priority').lte('scheduled_date', today).neq('status', 'completed').order('priority').limit(100),
    supabase.from('operator_daily_reflections').select('*').eq('owner_id', auth.user.id).eq('reflection_date', today).maybeSingle(),
  ]);

  if (priorityResult.error || workResult.error || reflectionResult.error) {
    return NextResponse.json({ error: 'The daily cockpit is not configured yet.' }, { status: 503 });
  }

  const priorities = (priorityResult.data || []) as PriorityRow[];
  const workItems = (workResult.data || []) as SourceWorkItem[];
  const profile = profileResult.data;

  let messages: SourceMessage[] = [];
  if (profile?.id) {
    const messageResult = await supabase
      .from('outreach_messages')
      .select('id, prospect_id, subject, approval_status, replied_at, follow_up_eligible, next_action_at, prospects(company_name, contact_name)')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(200);
    if (messageResult.error) return NextResponse.json({ error: 'The daily cockpit could not load outreach signals.' }, { status: 500 });
    messages = (messageResult.data || []) as unknown as SourceMessage[];
  }

  const prospectIds = messages.map((message) => message.prospect_id);
  let outcomes: SourceOutcome[] = [];
  if (prospectIds.length) {
    const outcomeResult = await supabase
      .from('prospect_outcomes')
      .select('id, prospect_id, outcome_type, notes, occurred_at')
      .in('prospect_id', prospectIds)
      .order('occurred_at', { ascending: false })
      .limit(100);
    if (outcomeResult.error) return NextResponse.json({ error: 'The daily cockpit could not load outcome signals.' }, { status: 500 });
    outcomes = (outcomeResult.data || []) as SourceOutcome[];
  }

  const syncResult = await upsertSuggestedActions(supabase, auth.user.id, weekStart, priorities, workItems, messages, outcomes);
  if (syncResult?.error) return NextResponse.json({ error: 'Suggested actions could not be synchronized.' }, { status: 500 });

  const actionResult = await supabase
    .from('operator_cockpit_actions')
    .select('*')
    .eq('owner_id', auth.user.id)
    .eq('week_start', weekStart)
    .order('rank')
    .order('due_date', { ascending: true, nullsFirst: false });
  if (actionResult.error) return NextResponse.json({ error: 'The daily cockpit actions could not be loaded.' }, { status: 500 });

  const actions = actionResult.data || [];
  const todayActions = actions
    .filter((action) => action.status === 'open' || (action.status === 'deferred' && (!action.deferred_until || action.deferred_until <= today)))
    .slice(0, 3);
  const completedActions = actions
    .filter((action) => action.status === 'completed')
    .sort((left, right) => String(right.completed_at || '').localeCompare(String(left.completed_at || '')))
    .slice(0, 10);

  const waitingItems = uniqueSignals([
    ...actions
      .filter((action) => action.status === 'deferred' && action.deferred_until && action.deferred_until > today)
      .map((action) => ({
        id: `action-${action.id}`,
        title: action.title,
        description: `Deferred until ${action.deferred_until}.`,
        kind: 'waiting' as const,
        due_date: action.deferred_until,
        status: action.status,
        source_id: action.source_id,
      })),
    ...workItems
      .filter((item) => item.status === 'deferred')
      .map((item) => ({
        id: `work-${item.id}`,
        title: item.title,
        description: item.proposed_action,
        kind: 'waiting' as const,
        due_date: item.scheduled_date,
        status: item.status,
        source_id: item.id,
      })),
    ...messages
      .filter((message) => message.approval_status === 'deferred')
      .map((message) => ({
        id: `message-${message.id}`,
        title: `Draft for ${prospectLabel(message)}`,
        description: 'Waiting for the next review window.',
        kind: 'waiting' as const,
        due_date: dateOnly(message.next_action_at),
        status: message.approval_status,
        source_id: message.id,
      })),
  ]);

  const replies = uniqueSignals(messages.filter((message) => message.replied_at).map((message) => ({
    id: `reply-${message.id}`,
    title: `Reply from ${prospectLabel(message)}`,
    description: 'Review the reply and decide the next useful step.',
    kind: 'reply' as const,
    due_date: dateOnly(message.next_action_at) || today,
    status: 'replied',
    source_id: message.id,
  })));

  const followUps = uniqueSignals(messages.filter((message) => message.follow_up_eligible || message.next_action_at).map((message) => ({
    id: `follow-up-${message.id}`,
    title: `Follow up with ${prospectLabel(message)}`,
    description: 'A supervised follow-up is eligible from this conversation.',
    kind: 'follow_up' as const,
    due_date: dateOnly(message.next_action_at),
    status: message.follow_up_eligible ? 'eligible' : 'scheduled',
    source_id: message.id,
  })));

  return NextResponse.json({
    mission: MISSION,
    today,
    weekStart,
    weeklyPriorities: priorities,
    actions,
    todayActions,
    completedActions,
    waitingItems,
    replies,
    followUps,
    growthProfile: profile || null,
    reflection: reflectionResult.data || null,
    summary: {
      openActions: actions.filter((action) => action.status === 'open').length,
      waitingItems: waitingItems.length,
      replies: replies.length,
      followUps: followUps.length,
    },
  });
}
