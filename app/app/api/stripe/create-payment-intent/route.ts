import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createPaymentIntent,
  getOrCreateStripeCustomer,
} from '@/lib/stripe';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { badRequest, handleApiError } from '@/lib/api-errors';
import { redis } from '@/lib/redis';

// Schema validates payment amount and optional metadata
// Max amount of $10,000 (1,000,000 cents) prevents abuse via unreasonably large intents
const PaymentIntentSchema = z.object({
  amount: z.number({ message: 'Amount must be a number' })
    .int('Amount must be a whole number (cents)')
    .min(50, 'Amount must be at least 50 cents ($0.50)')
    .max(1000000, 'Amount cannot exceed $10,000'),
  order_id: z.string().min(1).optional(),
  email: z.string().email().optional(),
  // Deposit payment support: is_deposit indicates this is a 50% deposit charge
  // The amount passed is already calculated (50% of total)
  is_deposit: z.boolean().optional().default(false),
  // save_payment_method indicates we should set up_future_usage for saving the card
  save_payment_method: z.boolean().optional().default(false),
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
    // Rate limit payment intent creation to prevent card testing attacks
    // Card testing: attackers create many small payment intents to validate stolen card numbers
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    try {
      const rateLimitKey = `rate:payment-intent:${clientIp}`;
      const requestCount = await redis.incr(rateLimitKey);
      if (requestCount === 1) {
        // Set TTL on first increment - prevents orphaned keys if client doesn't complete payment
        // Must use safe wrapper to ensure expiration is actually set
        await redis.expire(rateLimitKey, 300); // 5-minute window
      }
      // Max 10 payment intents per 5 minutes per IP
      if (requestCount > 10) {
        console.warn(`[Payment Intent] Rate limit exceeded for IP: ${clientIp}`);
        return NextResponse.json(
          { error: 'Too many payment requests. Please wait before trying again.' },
          { status: 429, headers: { 'Retry-After': '300' } }
        );
      }
    } catch (error) {
      // If rate limiting fails, log it but allow through (fail open)
      console.error(`[Payment Intent] Rate limiting failed:`, error);
    }

    // Validate input with Zod schema
    const parsed = PaymentIntentSchema.safeParse(await request.json());
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }
    const { amount, order_id, email, is_deposit, save_payment_method } = parsed.data;

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

    // Add payment type metadata
    metadata.payment_type = is_deposit ? 'deposit' : 'full_payment';

    // Create PaymentIntent parameters
    const piParams: any = {
      amount,
      currency: 'usd',
      metadata,
    };

    // For deposit payments or when explicitly saving payment method:
    // Enable setup_future_usage to save the card for later charges
    if (is_deposit || save_payment_method) {
      piParams.setup_future_usage = 'off_session';
    }

    // Create the PaymentIntent with deposit support
    const paymentIntent = await createPaymentIntent(
      amount,
      'usd',
      metadata,
      customerId,
      // Pass setup_future_usage in the options if needed
      is_deposit || save_payment_method ? { setup_future_usage: 'off_session' } : undefined
    );

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    return handleApiError(error, 'Create Payment Intent');
  }
}
