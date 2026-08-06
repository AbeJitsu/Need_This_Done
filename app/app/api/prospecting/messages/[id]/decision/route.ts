import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const schema = z.object({ decision: z.enum(['approve', 'reject', 'defer', 'cancel', 'edit']), subject: z.string().trim().max(300).optional(), body: z.string().trim().max(10000).optional(), nextActionAt: z.string().datetime().optional() });

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAdmin(); if (auth.error) return auth.error;
  if (!z.string().uuid().safeParse(params.id).success) return NextResponse.json({ error: 'Invalid message.' }, { status: 400 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid review decision.' }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('record_outreach_decision', { target_message_id: params.id, target_decision: parsed.data.decision, target_subject: parsed.data.subject || '', target_body: parsed.data.body || '', target_next_action_at: parsed.data.nextActionAt || null });
  if (error) return NextResponse.json({ error: error.code === 'P0002' ? 'Message not found.' : error.code === '22023' ? 'Message is no longer reviewable.' : 'Decision could not be recorded.' }, { status: error.code === 'P0002' ? 404 : 409 });
  return NextResponse.json({ message: data });
}
