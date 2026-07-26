import { NextResponse } from 'next/server';
import { hasAdminRole, verifyAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

// Browser metadata never authorizes dashboard access; this endpoint reports
// only the authenticated user's database-backed operator capability.
export async function GET() {
  const auth = await verifyAuth();
  if (auth.error) return auth.error;

  return NextResponse.json({ isAdmin: await hasAdminRole(auth.user.id) });
}
