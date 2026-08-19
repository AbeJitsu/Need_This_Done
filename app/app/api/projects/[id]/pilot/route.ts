import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { isValidTimeZone } from '@/lib/timezone';
import { cache } from '@/lib/cache';

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const shortList = z.array(z.string().trim().min(1).max(500)).max(25);
const pilotSchema = z.object({
  employeeName: z.string().trim().min(1).max(120),
  roleName: z.string().trim().min(1).max(120),
  timezone: z.string().trim().min(1).max(120).refine(isValidTimeZone, 'Invalid timezone.'),
  morningTime: time,
  middayTime: time,
  eveningTime: time,
  responsibilities: shortList,
  prohibitedActions: shortList,
  channels: shortList,
  tone: z.string().trim().max(2000),
  approvalRules: shortList,
});

const databaseErrors: Record<string, { status: number; error: string }> = {
  '22023': { status: 400, error: 'Invalid pilot details.' },
  '42501': { status: 403, error: 'Admin access is required to start a pilot.' },
  'P0002': { status: 404, error: 'Project not found.' },
  '42883': { status: 503, error: 'Pilot provisioning is not configured yet.' },
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!z.string().uuid().safeParse((await params).id).success) {
    return NextResponse.json({ error: 'Invalid project.' }, { status: 400 });
  }
  const authResult = await verifyAdmin();
  if (authResult.error) return authResult.error;

  const parsed = pilotSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid pilot details.' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('provision_ai_employee_pilot', {
    target_project_id: (await params).id,
    target_employee_name: parsed.data.employeeName,
    target_role_name: parsed.data.roleName,
    target_timezone: parsed.data.timezone,
    target_morning_time: parsed.data.morningTime,
    target_midday_time: parsed.data.middayTime,
    target_evening_time: parsed.data.eveningTime,
    target_responsibilities: parsed.data.responsibilities,
    target_prohibited_actions: parsed.data.prohibitedActions,
    target_channels: parsed.data.channels,
    target_tone: parsed.data.tone,
    target_approval_rules: parsed.data.approvalRules,
  });

  if (error) {
    const mapped = databaseErrors[error.code];
    return NextResponse.json({ error: mapped?.error || 'Pilot could not be started.' }, { status: mapped?.status || 500 });
  }
  await cache.invalidatePattern('admin:projects:*');
  return NextResponse.json({ pilot: data, duplicate: Boolean(data?.duplicate) }, { status: data?.duplicate ? 200 : 201 });
}
