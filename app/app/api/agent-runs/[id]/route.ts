import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const idSchema = z.string().uuid();

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;
  if (!idSchema.safeParse(params.id).success) return NextResponse.json({ error: 'Invalid agent run.' }, { status: 400 });
  const supabase = await createSupabaseServerClient();

  const { data: run, error: runError } = await supabase
    .from('agent_runs')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();
  if (runError) return NextResponse.json({ error: 'Agent run could not be loaded.' }, { status: 500 });
  if (!run) return NextResponse.json({ error: 'Agent run not found.' }, { status: 404 });

  const [tasksResult, artifactsResult, eventsResult, scheduleResult] = await Promise.all([
    supabase.from('agent_orchestration_tasks').select('*').eq('run_id', params.id).order('created_at', { ascending: true }),
    supabase.from('agent_artifacts').select('*').eq('run_id', params.id).order('created_at', { ascending: false }),
    supabase.from('agent_run_events').select('*').eq('run_id', params.id).order('created_at', { ascending: true }).limit(500),
    supabase.from('content_schedules').select('*').eq('run_id', params.id).maybeSingle(),
  ]);
  const relatedError = tasksResult.error || artifactsResult.error || eventsResult.error || scheduleResult.error;
  if (relatedError) return NextResponse.json({ error: 'Agent run details could not be loaded.' }, { status: 500 });

  const tasks = tasksResult.data || [];
  const artifacts = artifactsResult.data || [];
  const [dependenciesResult, versionsResult] = await Promise.all([
    tasks.length
      ? supabase.from('agent_task_dependencies').select('*').in('task_id', tasks.map((task) => task.id))
      : Promise.resolve({ data: [], error: null }),
    artifacts.length
      ? supabase.from('agent_artifact_versions').select('*').in('artifact_id', artifacts.map((artifact) => artifact.id)).order('version_number', { ascending: false })
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (dependenciesResult.error || versionsResult.error) {
    return NextResponse.json({ error: 'Agent run provenance could not be loaded.' }, { status: 500 });
  }
  return NextResponse.json({
    run,
    tasks,
    dependencies: dependenciesResult.data || [],
    artifacts: artifacts.map((artifact) => ({
      ...artifact,
      versions: (versionsResult.data || []).filter((version) => version.artifact_id === artifact.id),
    })),
    events: eventsResult.data || [],
    schedule: scheduleResult.data || null,
    ownerId: auth.user.id,
  });
}
