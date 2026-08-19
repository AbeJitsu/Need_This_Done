import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { calendarAdapter, newOperationKey } from '@/lib/provider-adapters';

export const dynamic = 'force-dynamic';
const schema = z.object({ projectId: z.string().uuid(), action: z.enum(['create', 'update', 'cancel', 'delete']), confirmOperatorAction: z.literal(true), idempotencyKey: z.string().uuid().optional(), externalEventId: z.string().trim().max(300).optional(), startsAt: z.string().datetime().optional(), endsAt: z.string().datetime().optional(), summary: z.string().trim().max(300).optional() }).strict();

export async function POST(request: Request) {
  const auth = await verifyAdmin(); if (auth.error) return auth.error;
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: input.error.issues[0]?.message || 'Invalid Calendar operation.' }, { status: 400 });
  const admin = getSupabaseAdmin();
  const project = await admin.from('projects').select('id, preferred_consultation_at').eq('id', input.data.projectId).maybeSingle();
  if (project.error || !project.data) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  const token = await admin.from('google_calendar_tokens').select('id').eq('user_id', auth.user.id).maybeSingle();
  if (token.error || !token.data) return NextResponse.json({ error: 'No server-side Calendar connection is available.' }, { status: 409 });
  const idempotencyKey = input.data.idempotencyKey || newOperationKey();
  const operation = await admin.rpc('upsert_provider_operation', { target_provider: 'google_calendar', target_operation_type: input.data.action, target_idempotency_key: idempotencyKey, target_status: 'pending', target_request_metadata: { project_id: input.data.projectId } });
  const operationId = (operation.data as { id?: string } | null)?.id;
  if (operation.error || !operationId) return NextResponse.json({ error: 'Calendar operation could not be created.' }, { status: 503 });
  const { mode, adapter } = calendarAdapter();
  if (!adapter) {
    await admin.rpc('upsert_provider_operation', { target_provider: 'google_calendar', target_operation_type: input.data.action, target_idempotency_key: idempotencyKey, target_status: 'failed_retryable', target_error: 'Calendar adapter is disabled.' });
    return NextResponse.json({ error: 'Calendar adapter is disabled; no provider action was attempted.' }, { status: 503 });
  }
  try {
    const result = await adapter.execute(input.data.action, { idempotencyKey, externalEventId: input.data.externalEventId, startsAt: input.data.startsAt || project.data.preferred_consultation_at, endsAt: input.data.endsAt, summary: input.data.summary });
    await admin.rpc('upsert_provider_operation', { target_provider: 'google_calendar', target_operation_type: input.data.action, target_idempotency_key: idempotencyKey, target_status: 'succeeded', target_provider_reference: result.externalEventId });
    const reference = await admin.rpc('record_calendar_operation_reference', { target_operation_id: operationId, target_project_id: input.data.projectId, target_calendar_token_id: token.data.id, target_external_event_id: result.externalEventId, target_action: input.data.action, target_status: 'succeeded' });
    if (reference.error) return NextResponse.json({ error: 'Calendar action completed but its reference needs reconciliation.' }, { status: 503 });
    return NextResponse.json({ operation: reference.data, providerMode: mode }, { status: 201 });
  } catch (error) {
    await admin.rpc('upsert_provider_operation', { target_provider: 'google_calendar', target_operation_type: input.data.action, target_idempotency_key: idempotencyKey, target_status: 'failed_retryable', target_error: error instanceof Error ? error.message : 'Calendar provider failed.' });
    return NextResponse.json({ error: 'Calendar provider action failed; it can be reconciled with the same idempotency key.' }, { status: 502 });
  }
}
