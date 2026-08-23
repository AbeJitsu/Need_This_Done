import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sha256, verifyResendWebhook } from '@/lib/provider-adapters';
import { recordProspectingWebhookEvent } from '@/lib/prospecting-webhook-service';

export const dynamic = 'force-dynamic';
const typeMap: Record<string, 'delivered' | 'bounced' | 'replied' | 'unsubscribed'> = { 'email.delivered': 'delivered', 'email.bounced': 'bounced', 'email.received': 'replied', 'email.unsubscribed': 'unsubscribed' };

async function markReceiptRetryable(receiptId: string, reason: string) {
  await getSupabaseAdmin().rpc('fail_provider_webhook_receipt', {
    target_receipt_id: receiptId,
    target_failure_reason: reason,
    target_permanent: false,
  });
}

export async function POST(request: Request) {
  const body = await request.text(); const eventId = request.headers.get('svix-id');
  if (!eventId || !verifyResendWebhook(body, request.headers, process.env.PROSPECTING_RESEND_WEBHOOK_SECRET)) return NextResponse.json({ error: 'Invalid prospecting webhook signature.' }, { status: 401 });
  let event: { type?: string; data?: { email_id?: string; to?: string[]; created_at?: string } };
  try { event = JSON.parse(body); } catch { return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 }); }
  const mapped = event.type ? typeMap[event.type] : undefined;
  if (!mapped) return NextResponse.json({ ignored: true });
  const admin = getSupabaseAdmin();
  const receipt = await admin.rpc('record_provider_webhook_receipt', { target_provider: 'resend_prospecting', target_provider_event_id: eventId, target_payload_sha256: sha256(body), target_signature_verified: true });
  if (receipt.error || !receipt.data) return NextResponse.json({ error: 'Webhook receipt could not be recorded.' }, { status: 503 });
  if ((receipt.data as { duplicate?: boolean }).duplicate) return NextResponse.json({ duplicate: true });
  const receiptId = (receipt.data as { receipt?: { id?: string } }).receipt?.id;
  if (!receiptId) return NextResponse.json({ error: 'Webhook receipt is malformed.' }, { status: 503 });
  try {
    await recordProspectingWebhookEvent({
      providerEventId: eventId,
      eventType: mapped,
      providerMessageId: event.data?.email_id || '',
      address: event.data?.to?.[0] || '',
      payloadSha256: sha256(body),
      occurredAt: event.data?.created_at || null,
    });
  } catch {
    await markReceiptRetryable(receiptId, 'Prospecting event persistence did not complete.');
    return NextResponse.json({ error: 'Prospecting event could not be recorded.' }, { status: 503 });
  }
  const completed = await admin.rpc('complete_provider_webhook_receipt', { target_receipt_id: receiptId });
  if (completed.error) {
    await markReceiptRetryable(receiptId, 'Prospecting receipt completion did not complete.');
    return NextResponse.json({ error: 'Prospecting event was recorded but its receipt needs reconciliation.' }, { status: 503 });
  }
  return NextResponse.json({ accepted: true }, { status: 201 });
}
