import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { isApprovedSenderConfigured, isPublicSourceUrl } from '@/lib/prospecting';

const schema = z.object({ prospectId: z.string().uuid(), subject: z.string().trim().min(1).max(300), body: z.string().trim().min(1).max(10000), evidence: z.array(z.string().trim().min(1).max(1000)).min(1).max(20), campaign: z.string().trim().max(160).default('default'), sequenceStep: z.number().int().min(1).max(20).default(1) });

export async function POST(request: Request) {
  const auth = await verifyAdmin(); if (auth.error) return auth.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid draft.' }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const { data: prospect, error: prospectError } = await supabase.from('prospects').select('id, profile_id, email, suppression_status, outreach_status, prospect_sources(source_url)').eq('id', parsed.data.prospectId).single();
  if (prospectError || !prospect) return NextResponse.json({ error: 'Prospect not found.' }, { status: 404 });
  if (!prospect.email || prospect.suppression_status !== 'clear') return NextResponse.json({ error: 'This prospect has no eligible email path.' }, { status: 409 });
  const sources = (prospect.prospect_sources || []) as Array<{ source_url: string }>;
  if (!sources.some((source) => isPublicSourceUrl(source.source_url))) return NextResponse.json({ error: 'A public evidence source is required.' }, { status: 400 });
  const { data: profile } = await supabase.from('growth_profiles').select('sender_name, sender_email, emergency_stop').eq('id', prospect.profile_id).single();
  if (!profile || profile.emergency_stop) return NextResponse.json({ error: 'Outreach is stopped or not configured.' }, { status: 409 });
  if (!isApprovedSenderConfigured(profile.sender_name, profile.sender_email)) return NextResponse.json({ error: 'Configure an approved sender before promoting a draft into outreach.' }, { status: 409 });
  const { data, error } = await supabase.from('outreach_messages').insert({ prospect_id: prospect.id, profile_id: prospect.profile_id, campaign: parsed.data.campaign, sequence_step: parsed.data.sequenceStep, subject: parsed.data.subject, body: parsed.data.body, personalization_evidence: parsed.data.evidence, sender_email: profile.sender_email, recipient_email: prospect.email, idempotency_key: crypto.randomUUID() }).select('*').single();
  if (error) return NextResponse.json({ error: 'Draft could not be saved.' }, { status: 500 });
  await supabase.from('prospects').update({ outreach_status: 'drafted' }).eq('id', prospect.id);
  return NextResponse.json({ message: data }, { status: 201 });
}
