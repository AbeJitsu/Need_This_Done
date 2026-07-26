import { NextResponse } from 'next/server';
import { publicOfferings } from '@/lib/offering-catalog';

export const dynamic = 'force-dynamic';

// Public catalog source for the Phase 4 Stripe-hosted handoff. Until an
// offering has a reviewed Payment Link configured, callers use /contact.
export async function GET() {
  return NextResponse.json({ offerings: publicOfferings() });
}
