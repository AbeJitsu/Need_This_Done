import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const schema = z.object({ providerEventId: z.string().trim().min(1).max(240), eventType: z.enum(['delivered', 'bounced', 'replied', 'unsubscribed']), providerMessageId: z.string().trim().max(240).optional(), address: z.string().email().optional(), payload: z.record(z.string(), z.unknown()).default({}), occurredAt: z.string().datetime().optional() });

export async function POST(request: Request) {
  const auth = await verifyAdmin(); if (auth.error) return auth.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid sender event.' }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('record_sender_event', { target_provider_event_id: parsed.data.providerEventId, target_event_type: parsed.data.eventType, target_provider_message_id: parsed.data.providerMessageId || '', target_address: parsed.data.address || '', target_payload: parsed.data.payload, target_occurred_at: parsed.data.occurredAt || null });
  if (error) return NextResponse.json({ error: 'Sender event could not be recorded.' }, { status: 409 });
  return NextResponse.json({ event: data, duplicate: Boolean(data?.duplicate) }, { status: data?.duplicate ? 200 : 201 });
}
