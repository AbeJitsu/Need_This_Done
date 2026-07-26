import { NextRequest, NextResponse } from 'next/server';
import { resolveOffering } from '@/lib/offering-catalog';

export const dynamic = 'force-dynamic';

function isStripePaymentLink(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      (url.hostname === 'buy.stripe.com' || url.hostname.endsWith('.stripe.com'));
  } catch {
    return false;
  }
}

// Redirect only to reviewed Stripe-hosted Payment Links. Missing or malformed
// configuration falls back to a project request instead of creating checkout.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const offering = resolveOffering(slug);
  if (!offering) return NextResponse.json({ error: 'Offering not found.' }, { status: 404 });

  if (offering.paymentLink && isStripePaymentLink(offering.paymentLink)) {
    return NextResponse.redirect(offering.paymentLink, 303);
  }

  const contactUrl = new URL('/contact', request.url);
  contactUrl.searchParams.set('offering', offering.slug);
  return NextResponse.redirect(contactUrl, 303);
}
