import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

/** Historical access-management boundary. Existing links remain stored. */
export async function PATCH(
  _request: NextRequest,
  { params: _params }: { params: Promise<{ id: string }> },
) {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;
  return NextResponse.json(
    { error: 'Project client-access management is retired.' },
    { status: 410 },
  );
}
