import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sha256, verifyResendWebhook } from '@/lib/provider-adapters';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.text();
  const eventId = request.headers.get('svix-id');
  if (!eventId || !verifyResendWebhook(body, request.headers, process.env.TRANSACTIONAL_RESEND_WEBHOOK_SECRET)) return NextResponse.json({ error: 'Invalid transactional webhook signature.' }, { status: 401 });
  let event: { type?: string; data?: { email_id?: string; created_at?: string } };
  try { event = JSON.parse(body); } catch { return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 }); }
  if (!event.type) return NextResponse.json({ error: 'Webhook event type is required.' }, { status: 400 });
  const admin = getSupabaseAdmin();
  const receipt = await admin.rpc('record_provider_webhook_receipt', { target_provider: 'resend_transactional', target_provider_event_id: eventId, target_payload_sha256: sha256(body), target_signature_verified: true });
  if (receipt.error || !receipt.data) return NextResponse.json({ error: 'Webhook receipt could not be recorded.' }, { status: 503 });
  const row = (receipt.data as { receipt?: { id?: string }; duplicate?: boolean }).receipt;
  if (!row?.id) return NextResponse.json({ error: 'Webhook receipt is malformed.' }, { status: 503 });
  if ((receipt.data as { duplicate?: boolean }).duplicate) return NextResponse.json({ duplicate: true });
  const persisted = await admin.rpc('record_resend_transactional_event', { target_receipt_id: row.id, target_provider_message_id: event.data?.email_id || '', target_event_type: event.type, target_occurred_at: event.data?.created_at || null });
  if (persisted.error) return NextResponse.json({ error: 'Webhook event could not be recorded.' }, { status: 503 });
  return NextResponse.json({ accepted: true }, { status: 201 });
}
