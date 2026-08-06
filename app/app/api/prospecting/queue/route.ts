import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await verifyAdmin(); if (auth.error) return auth.error;
  const supabase = await createSupabaseServerClient();
  const { data: profile, error: profileError } = await supabase.from('growth_profiles').select('*').eq('owner_id', auth.user.id).maybeSingle();
  if (profileError) return NextResponse.json({ error: 'Prospecting is not configured yet.' }, { status: 503 });
  if (!profile) return NextResponse.json({ profile: null, prospects: [], messages: [], outcomes: [], tasks: [], stats: { discoveredToday: 0, approvedToday: 0, sentToday: 0, pendingDrafts: 0, replies: 0, bounces: 0, unsubscribes: 0, modelSpendToday: 0 } });
  const [prospects, messages, tasks] = await Promise.all([
    supabase.from('prospects').select('*, prospect_sources(*)').eq('profile_id', profile.id).order('created_at', { ascending: false }).limit(200),
    supabase.from('outreach_messages').select('*').eq('profile_id', profile.id).order('created_at', { ascending: false }).limit(200),
    supabase.from('agent_tasks').select('id, task_type, status, attempt_count, max_attempts, last_error, model_name, cost, created_at, completed_at').eq('profile_id', profile.id).order('created_at', { ascending: false }).limit(50),
  ]);
  // Outcomes are loaded separately because Supabase does not expose a portable
  // nested filter for all prospects in this query shape.
  const prospectIds = (prospects.data || []).map((item) => item.id);
  const outcomeResult = prospectIds.length ? await supabase.from('prospect_outcomes').select('*').in('prospect_id', prospectIds).order('occurred_at', { ascending: false }).limit(200) : { data: [], error: null };
  const queryError = prospects.error || messages.error || tasks.error || outcomeResult.error;
  if (queryError) return NextResponse.json({ error: 'Prospecting queue could not be loaded.' }, { status: 500 });
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const today = (value: string | null) => value ? new Date(value) >= start : false;
  const messageRows = messages.data || [];
  return NextResponse.json({ profile, prospects: prospects.data || [], messages: messageRows, outcomes: outcomeResult.data || [], tasks: tasks.data || [], stats: { discoveredToday: (prospects.data || []).filter((item) => today(item.discovered_at)).length, approvedToday: messageRows.filter((item) => today(item.approved_at)).length, sentToday: messageRows.filter((item) => today(item.sent_at)).length, pendingDrafts: messageRows.filter((item) => item.approval_status === 'pending' || item.approval_status === 'deferred').length, replies: messageRows.filter((item) => item.replied_at).length, bounces: messageRows.filter((item) => item.bounced_at).length, unsubscribes: messageRows.filter((item) => item.unsubscribed_at).length, modelSpendToday: (tasks.data || []).filter((item) => today(item.completed_at)).reduce((sum, item) => sum + Number(item.cost || 0), 0) } });
}
