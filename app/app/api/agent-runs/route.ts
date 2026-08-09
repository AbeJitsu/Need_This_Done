import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { localDateForTimezone, scheduledInstantForLocalDate } from '@/lib/agent-operations';

export const dynamic = 'force-dynamic';

const createSchema = z.object({
  workflowType: z.enum(['research_outreach', 'daily_content']),
  title: z.string().trim().min(1).max(240),
  input: z.record(z.string(), z.unknown()).default({}),
  idempotencyKey: z.string().uuid(),
  localDate: z.string().date().optional(),
  timezone: z.string().trim().min(1).max(120).default('America/New_York'),
  scheduleTime: z.string().regex(/^\d{2}:\d{2}$/).default('09:00'),
}).strict();

function migrationUnavailable(error: { code?: string } | null) {
  return error?.code === '42P01' || error?.code === '42883';
}

export async function GET() {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;
  const supabase = await createSupabaseServerClient();

  const [runsResult, schedulesResult, heartbeatResult, brandResult, profileResult] = await Promise.all([
    supabase.from('agent_runs').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('content_schedules').select('*').order('local_date', { ascending: false }).limit(30),
    supabase.from('worker_heartbeats').select('*').order('last_seen_at', { ascending: false }).limit(20),
    supabase.from('brand_profiles').select('*').maybeSingle(),
    supabase.from('growth_profiles').select('id').eq('owner_id', auth.user.id).maybeSingle(),
  ]);
  const baseError = runsResult.error || schedulesResult.error || heartbeatResult.error || brandResult.error;
  if (baseError) {
    return NextResponse.json({
      error: migrationUnavailable(baseError) ? 'Agent operations are not configured yet.' : 'Agent operations could not be loaded.',
    }, { status: migrationUnavailable(baseError) ? 503 : 500 });
  }

  const runs = runsResult.data || [];
  const runIds = runs.map((run) => run.id);
  const [tasksResult, artifactsResult, outreachResult] = await Promise.all([
    runIds.length
      ? supabase.from('agent_orchestration_tasks').select('*').in('run_id', runIds).order('created_at', { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    runIds.length
      ? supabase.from('agent_artifacts').select('*').in('run_id', runIds).order('created_at', { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    profileResult.data?.id
      ? supabase.from('outreach_messages').select('id, prospect_id, subject, approval_status, recipient_email, created_at').eq('profile_id', profileResult.data.id).in('approval_status', ['pending', 'deferred', 'approved']).order('created_at', { ascending: false }).limit(50)
      : Promise.resolve({ data: [], error: null }),
  ]);
  const relatedError = tasksResult.error || artifactsResult.error || outreachResult.error;
  if (relatedError) return NextResponse.json({ error: 'Agent operations related records could not be loaded.' }, { status: 500 });

  const tasks = tasksResult.data || [];
  const artifacts = artifactsResult.data || [];
  return NextResponse.json({
    runs: runs.map((run) => ({
      ...run,
      tasks: tasks.filter((task) => task.run_id === run.id),
      artifacts: artifacts.filter((artifact) => artifact.run_id === run.id),
    })),
    schedules: schedulesResult.data || [],
    brandProfile: brandResult.data || null,
    workerHeartbeats: heartbeatResult.data || [],
    approvals: artifacts.filter((artifact) => artifact.status === 'pending_review'),
    outreach: outreachResult.data || [],
    counts: {
      runs: runs.length,
      activeRuns: runs.filter((run) => ['queued', 'running', 'paused'].includes(run.status)).length,
      pendingApprovals: artifacts.filter((artifact) => artifact.status === 'pending_review').length,
      pendingOutreach: (outreachResult.data || []).length,
    },
  });
}

export async function POST(request: Request) {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid agent run request.' }, { status: 400 });
  }

  let localDate: string | null = null;
  let scheduledFor: string | null = null;
  if (parsed.data.workflowType === 'daily_content') {
    localDate = parsed.data.localDate || localDateForTimezone(parsed.data.timezone);
    if (!localDate) return NextResponse.json({ error: 'The content timezone is invalid.' }, { status: 400 });
    const today = localDateForTimezone(parsed.data.timezone);
    if (!today && !parsed.data.localDate) return NextResponse.json({ error: 'The content timezone is invalid.' }, { status: 400 });
    scheduledFor = scheduledInstantForLocalDate(localDate, parsed.data.timezone, parsed.data.scheduleTime);
    if (!scheduledFor) return NextResponse.json({ error: 'The content schedule is invalid.' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('create_agent_run', {
    target_workflow_type: parsed.data.workflowType,
    target_title: parsed.data.title,
    target_input: parsed.data.input,
    target_idempotency_key: parsed.data.idempotencyKey,
    target_local_date: localDate,
    target_timezone: parsed.data.timezone,
    target_scheduled_for: scheduledFor,
  });
  if (error) {
    return NextResponse.json({
      error: migrationUnavailable(error) ? 'Agent operations are not configured yet.' : 'Agent run could not be created.',
    }, { status: migrationUnavailable(error) ? 503 : 409 });
  }
  const result = data as { duplicate?: boolean };
  return NextResponse.json(data, { status: result.duplicate ? 200 : 201 });
}
