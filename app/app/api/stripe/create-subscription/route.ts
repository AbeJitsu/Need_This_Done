import { NextRequest, NextResponse } from 'next/server';
import {
  createSubscription,
  getOrCreateStripeCustomer,
} from '@/lib/stripe';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { badRequest, unauthorized, handleApiError } from '@/lib/api-errors';

// ============================================================================
// Create Subscription API Route
// ============================================================================
// What: Start a new Stripe subscription for an authenticated user
// Why: Enable recurring billing for subscription-based products
// How: Creates subscription with incomplete status, returns client_secret for payment
//
// POST /api/stripe/create-subscription
// Body: { price_id: string }
// Returns: { subscriptionId: string, clientSecret: string }
//
// Note: Requires authentication - subscriptions must be linked to a user

export async function POST(request: NextRequest) {
  try {
    // Verify authentication - subscriptions require a logged-in user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return unauthorized('You must be logged in to create a subscription');
    }

    if (!user.email) {
      return badRequest('User email is required for subscriptions');
    }

    // Parse request body
    const body = await request.json();
    const { price_id } = body;

    if (!price_id) {
      return badRequest('price_id is required');
    }

    // Get or create Stripe customer for this user
    const customerId = await getOrCreateStripeCustomer(user.id, user.email);

    // Create the subscription (starts as incomplete until payment is confirmed)
    const subscription = await createSubscription(customerId, price_id);

    // Extract the client secret from the latest invoice's payment intent
    // This is used by Stripe Elements to collect payment
    const invoice = subscription.latest_invoice as {
      payment_intent?: { client_secret?: string };
    };
    const clientSecret = invoice?.payment_intent?.client_secret;

    if (!clientSecret) {
      return badRequest('Failed to create subscription payment intent');
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret,
    });
  } catch (error) {
    return handleApiError(error, 'Create Subscription');
  }
}
