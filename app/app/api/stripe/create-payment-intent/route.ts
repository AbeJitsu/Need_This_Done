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
        await redis.raw.expire(rateLimitKey, 300); // 5-minute window
      }
      // Max 10 payment intents per 5 minutes per IP
      if (requestCount > 10) {
        console.warn(`[Payment Intent] Rate limit exceeded for IP: ${clientIp}`);
        return NextResponse.json(
          { error: 'Too many payment requests. Please wait before trying again.' },
          { status: 429, headers: { 'Retry-After': '300' } }
        );
      }
    } catch {
      // If rate limiting fails (Redis down), allow through
    }

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
