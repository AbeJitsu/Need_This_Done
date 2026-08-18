import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { localDateForTimezone } from '@/lib/prospecting';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await verifyAdmin(); if (auth.error) return auth.error;
  const supabase = await createSupabaseServerClient();
  const { data: profile, error: profileError } = await supabase.from('growth_profiles').select('*').eq('owner_id', auth.user.id).maybeSingle();
  if (profileError) return NextResponse.json({ error: 'Prospecting is not configured yet.' }, { status: 503 });
  if (!profile) return NextResponse.json({ profile: null, prospects: [], dossiers: [], messages: [], outcomes: [], tasks: [], usageLedger: [], stats: { discoveredToday: 0, acceptedDossiersToday: 0, approvedToday: 0, sentToday: 0, pendingDrafts: 0, replies: 0, bounces: 0, unsubscribes: 0, modelSpendToday: 0, reservedModelSpendToday: 0, taskFailures: 0 } });
  const [prospects, dossiers, messages, tasks, usageLedger] = await Promise.all([
    supabase.from('prospects').select('*, prospect_sources(*)').eq('profile_id', profile.id).order('created_at', { ascending: false }).limit(200),
    supabase.from('prospect_dossiers').select('*').eq('profile_id', profile.id).order('created_at', { ascending: false }).limit(200),
    supabase.from('outreach_messages').select('*').eq('profile_id', profile.id).order('created_at', { ascending: false }).limit(200),
    supabase.from('agent_tasks').select('id, profile_id, task_type, status, input, output, attempt_count, max_attempts, idempotency_key, last_error, model_name, cost, created_at, completed_at').eq('profile_id', profile.id).order('created_at', { ascending: false }).limit(50),
    // Keep this read compatible with hosted schema 095 until the separately
    // approved 096 migration adds actual_model_id to the usage ledger.
    supabase.from('model_usage_ledger').select('id, task_id, usage_kind, model_id, reserved_cost, actual_cost, status, local_usage_date, created_at').eq('profile_id', profile.id).order('created_at', { ascending: false }).limit(200),
  ]);
  // Outcomes are loaded separately because Supabase does not expose a portable
  // nested filter for all prospects in this query shape.
  const prospectIds = (prospects.data || []).map((item) => item.id);
  const outcomeResult = prospectIds.length ? await supabase.from('prospect_outcomes').select('*').in('prospect_id', prospectIds).order('occurred_at', { ascending: false }).limit(200) : { data: [], error: null };
  const queryError = prospects.error || dossiers.error || messages.error || tasks.error || usageLedger.error || outcomeResult.error;
  if (queryError) return NextResponse.json({ error: 'Prospecting queue could not be loaded.' }, { status: 500 });
  const profileToday = localDateForTimezone(profile.timezone);
  const today = (value: string | null) => Boolean(value && profileToday && localDateForTimezone(profile.timezone, new Date(value)) === profileToday);
  const messageRows = messages.data || [];
  const usageRows = usageLedger.data || [];
  const todaysUsage = usageRows.filter((item) => item.local_usage_date === profileToday);
  const pendingMessages = messageRows.filter((item) => item.approval_status === 'pending' || item.approval_status === 'deferred').length;
  const pendingDossiers = (dossiers.data || []).filter((item) => item.review_status === 'pending_review').length;
  return NextResponse.json({ profile, prospects: prospects.data || [], dossiers: dossiers.data || [], messages: messageRows, outcomes: outcomeResult.data || [], tasks: tasks.data || [], usageLedger: usageRows, stats: { discoveredToday: (prospects.data || []).filter((item) => today(item.discovered_at)).length, acceptedDossiersToday: (dossiers.data || []).filter((item) => today(item.created_at)).length, approvedToday: messageRows.filter((item) => today(item.approved_at)).length, sentToday: messageRows.filter((item) => today(item.sent_at)).length, pendingDrafts: pendingMessages + pendingDossiers, replies: messageRows.filter((item) => item.replied_at).length, bounces: messageRows.filter((item) => item.bounced_at).length, unsubscribes: messageRows.filter((item) => item.unsubscribed_at).length, modelSpendToday: todaysUsage.reduce((sum, item) => sum + Number(item.actual_cost || 0), 0), reservedModelSpendToday: todaysUsage.reduce((sum, item) => sum + Number(item.actual_cost ?? item.reserved_cost ?? 0), 0), taskFailures: (tasks.data || []).filter((item) => item.status === 'failed').length } });
}
