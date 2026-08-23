import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import { executeCalendarOperation } from '@/lib/calendar-operation-service';

export const dynamic = 'force-dynamic';

const common = { confirmOperatorAction: z.literal(true), projectId: z.string().uuid() };
const newOperation = z.discriminatedUnion('action', [
  z.object({ ...common, action: z.literal('create'), startsAt: z.string().datetime().optional(), endsAt: z.string().datetime(), summary: z.string().trim().min(1).max(300) }).strict(),
  z.object({ ...common, action: z.literal('update'), startsAt: z.string().datetime(), endsAt: z.string().datetime(), summary: z.string().trim().min(1).max(300) }).strict(),
  z.object({ ...common, action: z.literal('cancel') }).strict(),
  z.object({ ...common, action: z.literal('delete'), cleanupReason: z.literal('test_or_accidental') }).strict(),
]);
const retryOperation = z.object({
  operationId: z.string().uuid(), confirmOperatorAction: z.literal(true),
}).strict();
const schema = z.union([retryOperation, newOperation]);

export async function POST(request: Request) {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return NextResponse.json({ error: input.error.issues[0]?.message || 'Invalid Calendar operation.' }, { status: 400 });
  }
  const result = 'operationId' in input.data
    ? await executeCalendarOperation({ userId: auth.user.id, operationId: input.data.operationId })
    : await executeCalendarOperation({
      userId: auth.user.id,
      projectId: input.data.projectId,
      action: input.data.action,
      ...('startsAt' in input.data ? { startsAt: input.data.startsAt } : {}),
      ...('endsAt' in input.data ? { endsAt: input.data.endsAt } : {}),
      ...('summary' in input.data ? { summary: input.data.summary } : {}),
      ...('cleanupReason' in input.data ? { cleanupReason: input.data.cleanupReason } : {}),
    });
  return NextResponse.json(result.body, { status: result.status });
}
