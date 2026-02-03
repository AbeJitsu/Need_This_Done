import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createCustomerPortalSession, getStripeCustomerId } from '@/lib/stripe';
import { unauthorized, badRequest, handleApiError } from '@/lib/api-errors';

export const dynamic = 'force-dynamic';

// ============================================================================
// Stripe Customer Portal API Route - /api/stripe/customer-portal
// ============================================================================
// POST: Create a Stripe Customer Portal session
//
// What: Generate a URL for Stripe's subscription management portal
// Why: Let users manage their subscriptions, payment methods, billing
// How: Create portal session with return URL, redirect user

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return unauthorized('You must be logged in to access the customer portal');
    }

    // Get user's Stripe customer ID
    const customerId = await getStripeCustomerId(user.id);

    if (!customerId) {
      return badRequest('No billing account found. Please make a purchase first.');
    }

    // Create portal session
    const returnUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/account`
      : 'http://localhost:3000/account';

    const portalSession = await createCustomerPortalSession(customerId, returnUrl);

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error) {
    return handleApiError(error, 'Customer Portal POST');
  }
}
