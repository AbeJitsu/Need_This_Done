import { NextResponse } from 'next/server';
import { engagementSchema } from '@/lib/engagement';
import { checkRateLimit, RATE_LIMITS, rateLimitResponse } from '@/lib/rate-limit';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_DASHBOARD_PREVIEW === 'true' || process.env.VERCEL_ENV !== 'production') return new NextResponse(null, { status: 204 });
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const limit = await checkRateLimit(`engagement:${ip}`, RATE_LIMITS.API_GENERAL, 'engagement');
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);
  const parsed = engagementSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid engagement event' }, { status: 400 });
  try {
    const { error } = await getSupabaseAdmin().rpc('increment_public_engagement_metric', parsed.data);
    if (error) console.error('[Engagement] Increment failed:', error.message);
  } catch (error) { console.error('[Engagement] Unavailable:', error); }
  return new NextResponse(null, { status: 204 });
}
