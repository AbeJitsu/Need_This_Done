import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { calendarAdapter, newOperationKey } from '@/lib/provider-adapters';

export const dynamic = 'force-dynamic';
const schema = z.object({ projectId: z.string().uuid(), action: z.enum(['create', 'update', 'cancel', 'delete']), confirmOperatorAction: z.literal(true), idempotencyKey: z.string().uuid().optional(), startsAt: z.string().datetime().optional(), endsAt: z.string().datetime().optional(), summary: z.string().trim().max(300).optional() }).strict();

export async function POST(request: Request) {
  const auth = await verifyAdmin(); if (auth.error) return auth.error;
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: input.error.issues[0]?.message || 'Invalid Calendar operation.' }, { status: 400 });
  const admin = getSupabaseAdmin();
  const project = await admin.from('projects').select('id, preferred_consultation_at').eq('id', input.data.projectId).maybeSingle();
  if (project.error || !project.data) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  const token = await admin.from('google_calendar_tokens').select('id, google_calendar_id').eq('user_id', auth.user.id).maybeSingle();
  if (token.error || !token.data) return NextResponse.json({ error: 'No server-side Calendar connection is available.' }, { status: 409 });
  const existingReference = await admin.from('calendar_operation_references').select('external_event_id').eq('project_id', input.data.projectId).not('external_event_id', 'is', null).in('status', ['accepted', 'succeeded']).order('updated_at', { ascending: false }).limit(1).maybeSingle();
  if (existingReference.error) return NextResponse.json({ error: 'Calendar reference could not be read.' }, { status: 503 });
  if (input.data.action !== 'create' && !existingReference.data?.external_event_id) return NextResponse.json({ error: 'This project has no stored Calendar event reference.' }, { status: 409 });
  const idempotencyKey = input.data.idempotencyKey || newOperationKey();
  const requestMetadata = { project_id: input.data.projectId };
  const operation = await admin.rpc('upsert_provider_operation', { target_provider: 'google_calendar', target_operation_type: input.data.action, target_idempotency_key: idempotencyKey, target_status: 'pending', target_request_metadata: requestMetadata });
  const operationId = (operation.data as { id?: string } | null)?.id;
  if (operation.error || !operationId) return NextResponse.json({ error: 'Calendar operation could not be created.' }, { status: 503 });
  const { mode, adapter } = calendarAdapter();
  if (!adapter) {
    await admin.rpc('upsert_provider_operation', { target_provider: 'google_calendar', target_operation_type: input.data.action, target_idempotency_key: idempotencyKey, target_status: 'failed_retryable', target_request_metadata: requestMetadata, target_error: 'Calendar adapter is disabled.' });
    return NextResponse.json({ error: 'Calendar adapter is disabled; no provider action was attempted.' }, { status: 503 });
  }
  try {
    const result = await adapter.execute(input.data.action, {
      idempotencyKey,
      calendarUserId: auth.user.id,
      calendarId: token.data.google_calendar_id || 'primary',
      externalEventId: existingReference.data?.external_event_id,
      startsAt: input.data.startsAt || project.data.preferred_consultation_at,
      endsAt: input.data.endsAt,
      summary: input.data.summary,
    });
    const reference = await admin.rpc('accept_calendar_operation', { target_operation_id: operationId, target_project_id: input.data.projectId, target_calendar_token_id: token.data.id, target_external_event_id: result.externalEventId, target_action: input.data.action });
    if (reference.error) return NextResponse.json({ error: 'Calendar action completed but its reference needs reconciliation.' }, { status: 503 });
    return NextResponse.json({ operation: reference.data, providerMode: mode }, { status: 201 });
  } catch (error) {
    await admin.rpc('upsert_provider_operation', { target_provider: 'google_calendar', target_operation_type: input.data.action, target_idempotency_key: idempotencyKey, target_status: 'failed_retryable', target_request_metadata: requestMetadata, target_error: error instanceof Error ? error.message : 'Calendar provider failed.' });
    return NextResponse.json({ error: 'Calendar provider action failed; it can be reconciled with the same idempotency key.' }, { status: 502 });
  }
}
