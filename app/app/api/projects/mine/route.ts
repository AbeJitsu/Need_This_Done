import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

/** Historical client-project listing. Records remain stored for operators. */
export async function GET() {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;
  return NextResponse.json(
    { error: 'Client project access is retired. Use the private operator project list.' },
    { status: 410 },
  );
}
