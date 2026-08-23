import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

/** Non-advertised compatibility boundary for the canonical Website Fix route. */
export async function POST(request: Request) {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;
  const target = new URL('/api/admin/website-fix/invoices', request.url);
  return NextResponse.redirect(target, 307);
}
