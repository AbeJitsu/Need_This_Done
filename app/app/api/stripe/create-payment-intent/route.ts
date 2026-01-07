import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createPaymentIntent,
  getOrCreateStripeCustomer,
} from '@/lib/stripe';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { badRequest, handleApiError } from '@/lib/api-errors';

// Schema validates payment amount and optional metadata
const PaymentIntentSchema = z.object({
  amount: z.number({ message: 'Amount must be a number' }).min(50, 'Amount must be at least 50 cents ($0.50)'),
  order_id: z.string().optional(),
  email: z.string().email().optional(),
});

export const dynamic = 'force-dynamic';

// ============================================================================
// Create Payment Intent API Route
// ============================================================================
// What: Initialize a Stripe PaymentIntent for checkout
// Why: PaymentIntent tracks the payment lifecycle and provides client_secret
// How: Returns client_secret for Stripe Elements to collect payment details
//
// POST /api/stripe/create-payment-intent
// Body: { amount: number, order_id?: string, email?: string }
// Returns: { clientSecret: string, paymentIntentId: string }

export async function POST(request: NextRequest) {
  try {
    // Validate input with Zod schema
    const parsed = PaymentIntentSchema.safeParse(await request.json());
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }
    const { amount, order_id, email } = parsed.data;

    // Check if user is authenticated (optional - supports guest checkout)
    let customerId: string | undefined;

    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // If authenticated and we have an email, create/get Stripe customer
      if (user && (email || user.email)) {
        customerId = await getOrCreateStripeCustomer(
          user.id,
          email || user.email!
        );
      }
    } catch {
      // Guest checkout - no customer ID needed
      // Payment will still work, just won't be linked to a customer
    }

    // Build metadata for tracking
    const metadata: Record<string, string> = {};
    if (order_id) metadata.order_id = order_id;
    if (email) metadata.email = email;

    // Create the PaymentIntent
    const paymentIntent = await createPaymentIntent(
      amount,
      'usd',
      metadata,
      customerId
    );

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    return handleApiError(error, 'Create Payment Intent');
  }
}
