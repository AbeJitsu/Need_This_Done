import Stripe from 'stripe';
import { getSupabaseAdmin } from './supabase';
import { withSupabaseRetry } from './supabase-retry';

// ============================================================================
// Stripe Server-Side Client
// ============================================================================
// What: Centralized Stripe SDK configuration and helper functions
// Why: Process payments, manage subscriptions, handle billing operations
// How: Lazy initialization with helper functions for common operations
//
// IMPORTANT: This module runs SERVER-SIDE ONLY
// Never import this in client components - use StripeContext instead

// ============================================================================
// Stripe Client Initialization
// ============================================================================
// Lazy initialization to avoid issues during build time
// The client is created on first use, not at module load

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new Error(
        'STRIPE_SECRET_KEY is not defined. ' +
          'Add it to your .env.local file to enable payment processing.'
      );
    }

    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    });
  }

  return stripeInstance;
}

// ============================================================================
// Customer Management
// ============================================================================
// Link Supabase users to Stripe customers for payment processing

/**
 * Get or create a Stripe customer for a Supabase user.
 * Checks the database first, creates a new customer if none exists.
 *
 * RELIABILITY: Includes retry logic for database failures
 * - Retries database insert if transient failure
 * - Returns customer ID on success
 * - Throws if database becomes permanently unavailable
 *
 * @param userId - Supabase user ID
 * @param email - User's email address
 * @returns Stripe customer ID
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const stripe = getStripe();

  // Check if customer already exists in our database
  const { data: existingCustomer } = await supabase
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single();

  if (existingCustomer?.stripe_customer_id) {
    return existingCustomer.stripe_customer_id;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      supabase_user_id: userId,
    },
  });

  // Store the mapping in our database with retry logic
  // CRITICAL: If this fails, Stripe customer is created but not stored in DB.
  // Retry on transient failures (connection timeouts, pool exhaustion).
  // If permanent failure, throw so caller knows to retry the whole operation.
  let storeError: unknown;
  try {
    await withSupabaseRetry(
      async () => {
        const { error } = await supabase.from('stripe_customers').insert({
          user_id: userId,
          stripe_customer_id: customer.id,
        });
        if (error) throw error;
      },
      { operation: 'Store Stripe customer mapping' }
    );
  } catch (error) {
    storeError = error;
    console.error(
      `[Stripe] Failed to store Stripe customer mapping after creating customer`,
      {
        userId,
        stripeCustomerId: customer.id,
        error: String(error),
      }
    );

    // If it's a unique constraint violation, check if another instance created it
    if (
      String(error).includes('duplicate') ||
      String(error).includes('unique') ||
      String(error).includes('23505')
    ) {
      const { data: retryCheck } = await supabase
        .from('stripe_customers')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single();

      if (retryCheck?.stripe_customer_id) {
        // Another instance successfully created the mapping, use theirs
        console.log(`[Stripe] Another instance created mapping for user ${userId}`);
        return retryCheck.stripe_customer_id;
      }
    }

    // Re-throw permanent errors so caller can decide what to do
    throw new Error(`Failed to store Stripe customer: ${storeError}`);
  }

  return customer.id;
}

/**
 * Get Stripe customer ID for a user (if exists).
 * Returns null if no customer record exists.
 */
export async function getStripeCustomerId(
  userId: string
): Promise<string | null> {
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single();

  return data?.stripe_customer_id || null;
}

// ============================================================================
// Payment Intent Management
// ============================================================================
// PaymentIntents track the lifecycle of a payment from creation to completion

/**
 * Create a PaymentIntent for one-time payment.
 * Returns a client secret that the frontend uses with Stripe Elements.
 *
 * @param amount - Amount in cents (e.g., 1000 = $10.00)
 * @param currency - Three-letter currency code (default: 'usd')
 * @param metadata - Optional metadata to attach (e.g., order_id, email)
 * @param customerId - Optional Stripe customer ID for authenticated users
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  metadata?: Record<string, string>,
  customerId?: string
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe();

  // Stripe requires minimum amount of 50 cents
  if (amount < 50) {
    throw new Error('Amount must be at least 50 cents ($0.50)');
  }

  const params: Stripe.PaymentIntentCreateParams = {
    amount,
    currency,
    automatic_payment_methods: { enabled: true },
    metadata: metadata || {},
  };

  // Attach to customer if provided (enables saved payment methods)
  if (customerId) {
    params.customer = customerId;
  }

  return stripe.paymentIntents.create(params);
}

/**
 * Retrieve a PaymentIntent by ID.
 * Useful for checking payment status.
 */
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe();
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

// ============================================================================
// Subscription Management
// ============================================================================
// Handle recurring billing with Stripe Subscriptions

/**
 * Create a subscription for a customer.
 * Returns the subscription with the latest invoice's payment intent for payment collection.
 *
 * @param customerId - Stripe customer ID
 * @param priceId - Stripe price ID for the subscription plan
 */
export async function createSubscription(
  customerId: string,
  priceId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe();

  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
  });
}

/**
 * Cancel a subscription at the end of the billing period.
 * The subscription remains active until the period ends.
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe();

  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Immediately cancel a subscription.
 * The subscription is terminated right away.
 */
export async function cancelSubscriptionImmediately(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  return stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Get a subscription by ID.
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  return stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * List all subscriptions for a customer.
 */
export async function listCustomerSubscriptions(
  customerId: string
): Promise<Stripe.Subscription[]> {
  const stripe = getStripe();

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
  });

  return subscriptions.data;
}

// ============================================================================
// Webhook Verification
// ============================================================================
// Verify that webhook events actually came from Stripe

/**
 * Construct and verify a Stripe webhook event.
 * Throws an error if the signature is invalid.
 *
 * @param payload - Raw request body as string
 * @param signature - Stripe-Signature header value
 */
export function constructWebhookEvent(
  payload: string,
  signature: string
): Stripe.Event {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error(
      'STRIPE_WEBHOOK_SECRET is not defined. ' +
        'Add it to your .env.local file to handle webhooks.'
    );
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

// ============================================================================
// Customer Portal
// ============================================================================
// Allow customers to manage their subscriptions and payment methods

/**
 * Create a customer portal session for subscription management.
 * Returns a URL to redirect the customer to.
 *
 * @param customerId - Stripe customer ID
 * @param returnUrl - URL to redirect to after portal session
 */
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  const stripe = getStripe();

  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

// ============================================================================
// Price and Product Helpers
// ============================================================================
// Retrieve pricing information for display

/**
 * Get a price by ID with product information.
 */
export async function getPrice(priceId: string): Promise<Stripe.Price> {
  const stripe = getStripe();
  return stripe.prices.retrieve(priceId, {
    expand: ['product'],
  });
}

/**
 * List all active prices for display on pricing page.
 */
export async function listActivePrices(): Promise<Stripe.Price[]> {
  const stripe = getStripe();

  const prices = await stripe.prices.list({
    active: true,
    expand: ['data.product'],
  });

  return prices.data;
}
