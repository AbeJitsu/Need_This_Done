import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sha256, verifyWebhookSecret } from '@/lib/provider-adapters';

export const dynamic = 'force-dynamic';
const typeMap: Record<string, 'delivered' | 'bounced' | 'replied' | 'unsubscribed'> = { 'email.delivered': 'delivered', 'email.bounced': 'bounced', 'email.received': 'replied', 'email.unsubscribed': 'unsubscribed' };

export async function POST(request: Request) {
  const body = await request.text(); const eventId = request.headers.get('svix-id') || request.headers.get('x-resend-event-id');
  if (!eventId || !verifyWebhookSecret(body, request.headers.get('x-resend-signature') || request.headers.get('svix-signature'), process.env.PROSPECTING_RESEND_WEBHOOK_SECRET)) return NextResponse.json({ error: 'Invalid prospecting webhook signature.' }, { status: 401 });
  let event: { type?: string; data?: { email_id?: string; to?: string[]; created_at?: string } };
  try { event = JSON.parse(body); } catch { return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 }); }
  const mapped = event.type ? typeMap[event.type] : undefined;
  if (!mapped) return NextResponse.json({ ignored: true });
  const admin = getSupabaseAdmin();
  const receipt = await admin.rpc('record_provider_webhook_receipt', { target_provider: 'resend_prospecting', target_provider_event_id: eventId, target_payload_sha256: sha256(body), target_signature_verified: true });
  if (receipt.error || !receipt.data) return NextResponse.json({ error: 'Webhook receipt could not be recorded.' }, { status: 503 });
  if ((receipt.data as { duplicate?: boolean }).duplicate) return NextResponse.json({ duplicate: true });
  const eventWrite = await admin.rpc('record_sender_event', { target_provider_event_id: eventId, target_event_type: mapped, target_provider_message_id: event.data?.email_id || '', target_address: event.data?.to?.[0] || '', target_payload: { payload_sha256: sha256(body) }, target_occurred_at: event.data?.created_at || null });
  if (eventWrite.error) return NextResponse.json({ error: 'Prospecting event could not be recorded.' }, { status: 503 });
  return NextResponse.json({ accepted: true }, { status: 201 });
}
