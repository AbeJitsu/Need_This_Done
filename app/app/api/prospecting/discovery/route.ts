import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { isPublicSourceUrl, taskIdempotencyKey } from '@/lib/prospecting';

const prospectSchema = z.object({ companyName: z.string().trim().min(1).max(240), contactName: z.string().trim().max(160).optional(), contactTitle: z.string().trim().max(160).optional(), email: z.string().email().optional(), websiteUrl: z.string().url(), icpMatchScore: z.number().int().min(0).max(100), icpMatchReason: z.string().trim().min(1).max(2000), sourceUrl: z.string().url(), evidence: z.array(z.string().trim().min(1).max(1000)).min(1).max(20), contactPath: z.string().trim().max(500).optional(), emailStatus: z.enum(['unknown', 'public', 'verified', 'invalid']).default('unknown') });
const schema = z.object({ prospects: z.array(prospectSchema).max(100).optional(), requestedDate: z.string().date().optional() });

export async function POST(request: Request) {
  const auth = await verifyAdmin(); if (auth.error) return auth.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid discovery request.' }, { status: 400 });
  if ((parsed.data.prospects || []).some((prospect) => !isPublicSourceUrl(prospect.sourceUrl) || !isPublicSourceUrl(prospect.websiteUrl))) return NextResponse.json({ error: 'Discovery only accepts public HTTPS source URLs.' }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const { data: profile, error: profileError } = await supabase.from('growth_profiles').select('id, daily_prospect_cap, emergency_stop').eq('owner_id', auth.user.id).maybeSingle();
  if (profileError) return NextResponse.json({ error: 'Growth profile is not available yet.' }, { status: 503 });
  if (!profile) return NextResponse.json({ error: 'Configure a growth profile first.' }, { status: 409 });
  if (profile.emergency_stop) return NextResponse.json({ error: 'Emergency stop is active.' }, { status: 409 });
  const candidates = parsed.data.prospects || [];
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const { count: discoveredToday } = await supabase.from('prospects').select('id', { count: 'exact', head: true }).eq('profile_id', profile.id).gte('discovered_at', todayStart.toISOString());
  const remaining = Math.max(0, profile.daily_prospect_cap - (discoveredToday || 0));
  const inserted = [];
  for (const prospect of candidates.slice(0, remaining)) {
    const { data, error } = await supabase.rpc('upsert_discovered_prospect', { target_profile_id: profile.id, target_company_name: prospect.companyName, target_contact_name: prospect.contactName || '', target_contact_title: prospect.contactTitle || '', target_email: prospect.email || '', target_website_url: prospect.websiteUrl, target_icp_match_score: prospect.icpMatchScore, target_icp_match_reason: prospect.icpMatchReason, target_source_url: prospect.sourceUrl, target_evidence: prospect.evidence, target_contact_path: prospect.contactPath || '', target_email_status: prospect.emailStatus, target_idempotency_key: crypto.randomUUID() });
    if (error) return NextResponse.json({ error: error.code === '42501' ? 'Only operators can run discovery.' : 'A prospect could not be saved.' }, { status: 500 });
    inserted.push(data);
  }
  if (!candidates.length) {
    const key = taskIdempotencyKey('discover_prospects', `${profile.id}:${parsed.data.requestedDate || new Date().toISOString().slice(0, 10)}`);
    const { data: task, error } = await supabase.from('agent_tasks').upsert({ profile_id: profile.id, task_type: 'discover_prospects', input: { requestedDate: parsed.data.requestedDate || new Date().toISOString().slice(0, 10), publicWebOnly: true }, idempotency_key: key }, { onConflict: 'idempotency_key' }).select('*').single();
    if (error) return NextResponse.json({ error: 'Discovery task could not be queued.' }, { status: 500 });
    return NextResponse.json({ queued: true, task });
  }
  return NextResponse.json({ prospects: inserted, count: inserted.length }, { status: 201 });
}
