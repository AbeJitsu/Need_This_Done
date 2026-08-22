import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { invoiceAdapter, newOperationKey } from '@/lib/provider-adapters';

export const dynamic = 'force-dynamic';
const schema = z.object({ projectId: z.string().uuid(), confirmOperatorAction: z.literal(true), idempotencyKey: z.string().uuid().optional() }).strict();
export async function POST(request: Request) {
  const auth = await verifyAdmin(); if (auth.error) return auth.error;
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: input.error.issues[0]?.message || 'Invalid invoice request.' }, { status: 400 });
  const admin = getSupabaseAdmin();
  const project = await admin.from('projects').select('id').eq('id', input.data.projectId).maybeSingle();
  if (project.error || !project.data) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  const idempotencyKey = input.data.idempotencyKey || newOperationKey();
  const requestMetadata = { project_id: input.data.projectId, amount_cents: 25000, currency: 'usd', test_mode: true };
  const operation = await admin.rpc('upsert_provider_operation', { target_provider: 'stripe', target_operation_type: 'website_improvement_start_invoice', target_idempotency_key: idempotencyKey, target_status: 'pending', target_request_metadata: requestMetadata });
  const operationId = (operation.data as { id?: string } | null)?.id;
  if (operation.error || !operationId) return NextResponse.json({ error: 'Invoice operation could not be created.' }, { status: 503 });
  const { mode, adapter } = invoiceAdapter();
  if (!adapter) {
    await admin.rpc('upsert_provider_operation', { target_provider: 'stripe', target_operation_type: 'website_improvement_start_invoice', target_idempotency_key: idempotencyKey, target_status: 'failed_retryable', target_request_metadata: requestMetadata, target_error: 'Stripe test-mode adapter is disabled.' });
    return NextResponse.json({ error: 'Stripe test-mode adapter is disabled; no provider action was attempted.' }, { status: 503 });
  }
  try {
    const result = await adapter.createStartInvoice({ idempotencyKey, projectId: input.data.projectId });
    const reference = await admin.rpc('accept_website_improvement_invoice', { target_operation_id: operationId, target_project_id: input.data.projectId, target_stripe_invoice_id: result.invoiceId });
    if (reference.error) return NextResponse.json({ error: 'Invoice was created but its durable reference needs reconciliation.' }, { status: 503 });
    return NextResponse.json({ invoice: reference.data, providerMode: mode, amountCents: 25000, currency: 'usd', testMode: true }, { status: 201 });
  } catch (error) {
    await admin.rpc('upsert_provider_operation', { target_provider: 'stripe', target_operation_type: 'website_improvement_start_invoice', target_idempotency_key: idempotencyKey, target_status: 'failed_retryable', target_request_metadata: requestMetadata, target_error: error instanceof Error ? error.message : 'Stripe provider failed.' });
    return NextResponse.json({ error: 'Stripe provider action failed; it can be reconciled with the same idempotency key.' }, { status: 502 });
  }
}
