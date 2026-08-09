import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const schema = z.object({
  decision: z.enum(['approve', 'reject', 'edit', 'regenerate']),
  idempotencyKey: z.string().uuid(),
  note: z.string().trim().max(2_000).default(''),
  contentText: z.string().max(200_000).optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
}).strict();

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;
  if (!z.string().uuid().safeParse(params.id).success) return NextResponse.json({ error: 'Invalid agent artifact.' }, { status: 400 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid artifact decision.' }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('record_agent_artifact_decision', {
    target_artifact_id: params.id,
    target_decision: parsed.data.decision,
    target_idempotency_key: parsed.data.idempotencyKey,
    target_note: parsed.data.note,
    target_content_text: parsed.data.contentText || null,
    target_metadata: parsed.data.metadata,
  });
  if (error) {
    const status = error.code === 'P0002' ? 404 : error.code === '23505' ? 409 : 409;
    return NextResponse.json({
      error: error.code === 'P0002' ? 'Agent artifact not found.' : 'The artifact decision could not be recorded.',
    }, { status });
  }
  return NextResponse.json(data);
}
