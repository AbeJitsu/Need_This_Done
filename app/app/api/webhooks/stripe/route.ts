import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sha256 } from '@/lib/provider-adapters';

export const dynamic = 'force-dynamic';
const statusByEvent: Record<string, 'paid' | 'declined' | 'void' | 'refunded'> = { 'invoice.paid': 'paid', 'invoice.payment_failed': 'declined', 'invoice.voided': 'void', 'charge.refunded': 'refunded' };

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get('stripe-signature');
  const body = await request.text();
  if (!secret || !signature) return NextResponse.json({ error: 'Invalid Stripe webhook signature.' }, { status: 401 });
  let event: Stripe.Event;
  try { event = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder').webhooks.constructEvent(body, signature, secret); }
  catch { return NextResponse.json({ error: 'Invalid Stripe webhook signature.' }, { status: 401 }); }
  const mapped = statusByEvent[event.type];
  if (!mapped) return NextResponse.json({ ignored: true });
  const invoiceId = typeof event.data.object === 'object' && 'invoice' in event.data.object ? String(event.data.object.invoice || '') : ('id' in event.data.object ? String(event.data.object.id) : '');
  if (!invoiceId) return NextResponse.json({ error: 'Stripe event has no invoice reference.' }, { status: 400 });
  const admin = getSupabaseAdmin();
  const receipt = await admin.rpc('record_provider_webhook_receipt', { target_provider: 'stripe', target_provider_event_id: event.id, target_payload_sha256: sha256(body), target_signature_verified: true });
  if (receipt.error || !receipt.data) return NextResponse.json({ error: 'Webhook receipt could not be recorded.' }, { status: 503 });
  if ((receipt.data as { duplicate?: boolean }).duplicate) return NextResponse.json({ duplicate: true });
  const receiptId = (receipt.data as { receipt?: { id?: string } }).receipt?.id;
  const persisted = await admin.rpc('record_stripe_invoice_event', { target_receipt_id: receiptId, target_stripe_invoice_id: invoiceId, target_status: mapped });
  if (persisted.error) return NextResponse.json({ error: 'Stripe event could not be recorded.' }, { status: 503 });
  return NextResponse.json({ accepted: true }, { status: 201 });
}
