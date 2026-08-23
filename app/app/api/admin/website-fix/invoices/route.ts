import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import { executeWebsiteFixInvoice } from '@/lib/website-fix-invoice-service';

export const dynamic = 'force-dynamic';
const newInvoice = z.object({
  projectId: z.string().uuid(), confirmOperatorAction: z.literal(true),
}).strict();
const retryInvoice = z.object({
  operationId: z.string().uuid(), confirmOperatorAction: z.literal(true),
}).strict();
const schema = z.union([retryInvoice, newInvoice]);

export async function POST(request: Request) {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return NextResponse.json({ error: input.error.issues[0]?.message || 'Invalid invoice request.' }, { status: 400 });
  }
  const result = 'operationId' in input.data
    ? await executeWebsiteFixInvoice({ userId: auth.user.id, operationId: input.data.operationId })
    : await executeWebsiteFixInvoice({ userId: auth.user.id, projectId: input.data.projectId });
  return NextResponse.json(result.body, { status: result.status });
}
