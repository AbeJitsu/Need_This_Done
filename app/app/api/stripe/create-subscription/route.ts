import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createSubscription,
  getOrCreateStripeCustomer,
} from '@/lib/stripe';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { badRequest, unauthorized, handleApiError } from '@/lib/api-errors';

// Schema validates subscription price ID
const SubscriptionSchema = z.object({
  price_id: z.string().min(1, 'price_id is required'),
});

export const dynamic = 'force-dynamic';

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

    // Validate input with Zod schema
    const parsed = SubscriptionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }
    const { price_id } = parsed.data;

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
