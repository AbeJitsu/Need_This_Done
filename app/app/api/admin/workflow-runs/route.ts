import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const DECISIONS = new Set(['approved', 'rejected', 'manual_action_required']);

export async function GET() {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;

  const supabase = getSupabaseAdmin();
  const { data: runs, error } = await supabase
    .from('workflow_runs')
    .select('id, workflow_type, status, source_id, input, outcome, created_at, decided_at')
    .eq('workflow_type', 'site_audit')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'Failed to load report queue.' }, { status: 500 });

  const reportIds = (runs || []).map((run) => run.source_id);
  const { data: reports, error: reportsError } = reportIds.length
    ? await supabase.from('site_reports').select('id, url, score, grade, executive_summary').in('id', reportIds)
    : { data: [], error: null };

  if (reportsError) {
    return NextResponse.json({ error: 'Failed to load site reports for the queue.' }, { status: 500 });
  }
  const reportsById = new Map((reports || []).map((report) => [report.id, report]));

  return NextResponse.json({
    runs: (runs || []).map((run) => ({ ...run, report: reportsById.get(run.source_id) || null })),
  });
}

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  if (!body || typeof body.id !== 'string' || !DECISIONS.has(body.status)) {
    return NextResponse.json({ error: 'A workflow id and valid decision are required.' }, { status: 400 });
  }

  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 1000) : '';
  const { data, error } = await getSupabaseAdmin()
    .from('workflow_runs')
    .update({
      status: body.status,
      decided_by: auth.user.id,
      decided_at: new Date().toISOString(),
      outcome: note ? { decision_note: note } : {},
    })
    .eq('id', body.id)
    .eq('status', 'pending_review')
    .select('id, status, decided_at, outcome')
    .maybeSingle();

  if (error) return NextResponse.json({ error: 'Failed to save decision.' }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'This item was already decided.' }, { status: 409 });
  return NextResponse.json({ run: data });
}
