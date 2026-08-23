import { NextResponse } from 'next/server';
import { forwardInboundEmail, type InboundEmailEvent } from '@/lib/inbound-email-forwarding';
import { sha256, verifyResendWebhook } from '@/lib/provider-adapters';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

type TransactionalEvent = {
  type?: string;
  created_at?: string;
  data?: {
    email_id?: string;
    created_at?: string;
    from?: string;
    to?: string[];
    subject?: string;
  };
};

async function markReceiptRetryable(receiptId: string, reason: string) {
  await getSupabaseAdmin().rpc('fail_provider_webhook_receipt', {
    target_receipt_id: receiptId,
    target_failure_reason: reason,
    target_permanent: false,
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  const eventId = request.headers.get('svix-id');
  if (!eventId || !verifyResendWebhook(
    body,
    request.headers,
    process.env.TRANSACTIONAL_RESEND_WEBHOOK_SECRET,
  )) {
    return NextResponse.json({ error: 'Invalid transactional webhook signature.' }, { status: 401 });
  }

  let event: TransactionalEvent;
  try {
    event = JSON.parse(body) as TransactionalEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 });
  }
  if (!event.type) {
    return NextResponse.json({ error: 'Webhook event type is required.' }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const receipt = await admin.rpc('record_provider_webhook_receipt', {
    target_provider: 'resend_transactional',
    target_provider_event_id: eventId,
    target_payload_sha256: sha256(body),
    target_signature_verified: true,
  });
  if (receipt.error || !receipt.data) {
    return NextResponse.json({ error: 'Webhook receipt could not be recorded.' }, { status: 503 });
  }
  const receiptData = receipt.data as { receipt?: { id?: string }; duplicate?: boolean };
  const receiptId = receiptData.receipt?.id;
  if (!receiptId) return NextResponse.json({ error: 'Webhook receipt is malformed.' }, { status: 503 });
  if (receiptData.duplicate) return NextResponse.json({ duplicate: true });

  if (event.type === 'email.received') {
    try {
      const forwarded = await forwardInboundEmail(
        event as InboundEmailEvent,
        `inbound-email:${event.data?.email_id || eventId}:forward`,
      );
      if (!forwarded) throw new Error('Inbound forwarding is disabled.');
    } catch {
      await markReceiptRetryable(receiptId, 'Inbound forwarding did not complete.');
      return NextResponse.json({ error: 'Inbound email could not be forwarded.' }, { status: 503 });
    }
  }

  const persisted = await admin.rpc('record_resend_transactional_event', {
    target_receipt_id: receiptId,
    target_provider_message_id: event.data?.email_id || '',
    target_event_type: event.type,
    target_occurred_at: event.data?.created_at || event.created_at || null,
  });
  if (persisted.error) {
    await markReceiptRetryable(receiptId, 'Transactional event persistence did not complete.');
    return NextResponse.json({ error: 'Webhook event could not be recorded.' }, { status: 503 });
  }
  return NextResponse.json({ accepted: true }, { status: 201 });
}
