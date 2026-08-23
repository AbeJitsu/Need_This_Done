import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const reconciliation = z.discriminatedUnion('resolution', [
  z.object({
    operationId: z.string().uuid(),
    resolution: z.literal('confirmed_accepted'),
    providerMessageId: z.string().trim().min(1).max(500),
  }),
  z.object({
    operationId: z.string().uuid(),
    resolution: z.literal('confirmed_not_accepted'),
    providerMessageId: z.never().optional(),
  }),
]);

/** Records a reviewed fact only. This route never constructs a provider adapter. */
export async function POST(request: Request) {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;
  const parsed = reconciliation.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Provide one operation and a complete reconciliation decision.' }, { status: 400 });
  }
  const result = await getSupabaseAdmin().rpc('reconcile_resend_provider_operation', {
    target_operation_id: parsed.data.operationId,
    target_resolution: parsed.data.resolution,
    target_provider_message_id: parsed.data.resolution === 'confirmed_accepted'
      ? parsed.data.providerMessageId
      : null,
  });
  if (result.error || !result.data) {
    return NextResponse.json({ error: 'The Resend operation could not be reconciled.' }, { status: 409 });
  }
  return NextResponse.json({ operation: result.data, providerContacted: false });
}
