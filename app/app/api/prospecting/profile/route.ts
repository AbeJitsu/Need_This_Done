import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { normalizedFollowUpDays } from '@/lib/prospecting';

const profileSchema = z.object({
  name: z.string().trim().min(1).max(120), targetMarket: z.string().trim().min(1).max(300), geography: z.string().trim().min(1).max(300), businessSize: z.string().trim().max(200), painSignals: z.array(z.string().trim().min(1).max(300)).max(20), exclusionRules: z.array(z.string().trim().min(1).max(300)).max(20), offer: z.string().trim().min(1).max(2000), senderName: z.string().trim().max(160).optional().default(''), senderEmail: z.union([z.literal(''), z.string().email().max(320)]).optional().default(''), dailyProspectCap: z.number().int().min(1).max(100), dailySendCap: z.number().int().min(1).max(100), workingHoursStart: z.string().regex(/^\d{2}:\d{2}$/), workingHoursEnd: z.string().regex(/^\d{2}:\d{2}$/), timezone: z.string().min(1).max(120), followUpDays: z.array(z.number().int()).max(20), emergencyStop: z.boolean().optional(),
});

export async function GET() {
  const auth = await verifyAdmin(); if (auth.error) return auth.error;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('growth_profiles').select('*').eq('owner_id', auth.user.id).maybeSingle();
  if (error) return NextResponse.json({ error: 'Growth profile is not available yet.' }, { status: 503 });
  return NextResponse.json({ profile: data });
}

export async function PUT(request: Request) {
  const auth = await verifyAdmin(); if (auth.error) return auth.error;
  const parsed = profileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid growth profile.' }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const value = parsed.data;
  const { data, error } = await supabase.from('growth_profiles').upsert({ owner_id: auth.user.id, name: value.name, target_market: value.targetMarket, geography: value.geography, business_size: value.businessSize, pain_signals: value.painSignals, exclusion_rules: value.exclusionRules, offer: value.offer, sender_name: value.senderName || null, sender_email: value.senderEmail ? value.senderEmail.toLowerCase() : null, daily_prospect_cap: value.dailyProspectCap, daily_send_cap: value.dailySendCap, working_hours_start: value.workingHoursStart, working_hours_end: value.workingHoursEnd, timezone: value.timezone, follow_up_days: normalizedFollowUpDays(value.followUpDays), emergency_stop: value.emergencyStop ?? false }, { onConflict: 'owner_id' }).select('*').single();
  if (error) return NextResponse.json({ error: 'Growth profile could not be saved.' }, { status: 500 });
  return NextResponse.json({ profile: data });
}
