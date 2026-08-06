import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function GET() {
  const auth = await verifyAdmin(); if (auth.error) return auth.error;
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase.from('growth_profiles').select('id, emergency_stop, updated_at').eq('owner_id', auth.user.id).maybeSingle();
  if (!profile) return NextResponse.json({ configured: false, queueDepth: 0 });
  const { count } = await supabase.from('agent_tasks').select('id', { count: 'exact', head: true }).eq('profile_id', profile.id).in('status', ['queued', 'leased']);
  return NextResponse.json({ configured: true, emergencyStop: profile.emergency_stop, queueDepth: count || 0, checkedAt: new Date().toISOString() });
}
