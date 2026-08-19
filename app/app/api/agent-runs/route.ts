import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

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

export async function POST() {
  // Plans are the only creation boundary. Keep GET for historical operator
  // visibility, but never let a dashboard action materialize a runnable run.
  return NextResponse.json({ error: 'Run creation is retired; approve and dispatch a frozen agent plan instead.' }, { status: 405, headers: { Allow: 'GET' } });
}
