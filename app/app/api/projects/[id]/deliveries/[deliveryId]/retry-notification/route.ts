import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

/** Notification delivery remains unavailable until its durable operation is linked. */
export async function POST(
  _request: NextRequest,
  { params: _params }: { params: Promise<{ id: string; deliveryId: string }> },
) {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;
  return NextResponse.json(
    { error: 'GitHub handoff notifications are draft-only until durable delivery is available.' },
    { status: 409 },
  );
}
