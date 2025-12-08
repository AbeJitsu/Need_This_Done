# Stripe Integration - Completion Plan

The Stripe integration code is complete and ready to test. Follow these steps to finish setup.

---

## Step 1: Create Stripe Account

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Create an account or log in
3. Stay in **Test Mode** (toggle in top-right)

---

## Step 2: Get API Keys

1. Go to **Developers → API Keys**
2. Copy these values:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

---

## Step 3: Add Environment Variables

Add to `app/.env.local`:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# Webhook secret (get from Step 5)
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

---

## Step 4: Run Database Migration

```bash
# From project root
supabase db reset
```

This creates the Stripe tables:
- `stripe_customers` - Links users to Stripe
- `subscriptions` - Tracks subscriptions
- `payments` - Payment history
- Adds `stripe_payment_intent_id` and `payment_status` to `orders`

---

## Step 5: Set Up Webhook (for local testing)

1. Install Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Log in:
   ```bash
   stripe login
   ```

3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. Copy the webhook signing secret (`whsec_...`) and add to `.env.local`

---

## Step 6: Test the Integration

1. Start the app:
   ```bash
   cd app && npm run dev
   ```

2. Go to `/shop` and add items to cart

3. Proceed to `/checkout`

4. Fill in contact/shipping info

5. Click "Continue to Payment"

6. Use test card: `4242 4242 4242 4242`
   - Any future expiry (e.g., 12/34)
   - Any CVC (e.g., 123)
   - Any ZIP (e.g., 12345)

7. Submit payment

---

## Test Cards Reference

| Card Number | Result |
|-------------|--------|
| `4242424242424242` | Success |
| `4000000000000002` | Declined |
| `4000002500003155` | Requires 3D Secure |
| `4000000000009995` | Insufficient funds |

---

## Files Created

| File | Purpose |
|------|---------|
| `app/lib/stripe.ts` | Server-side Stripe client |
| `app/context/StripeContext.tsx` | Client-side provider |
| `app/components/PaymentForm.tsx` | Stripe Elements form |
| `app/app/api/stripe/create-payment-intent/route.ts` | Create payment |
| `app/app/api/stripe/create-subscription/route.ts` | Create subscription |
| `app/app/api/stripe/webhook/route.ts` | Handle Stripe events |
| `supabase/migrations/010_create_stripe_tables.sql` | Database schema |

---

## Files Modified

| File | Change |
|------|--------|
| `app/app/layout.tsx` | Added `StripeProvider` |
| `app/app/checkout/page.tsx` | Multi-step checkout with payment |

---

## Production Checklist

Before going live:

- [ ] Switch to live API keys (remove `_test` from keys)
- [ ] Set up production webhook endpoint in Stripe Dashboard
- [ ] Configure webhook to listen for:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`
- [ ] Test with real card (small amount)
- [ ] Enable HTTPS (required for Stripe.js in production)

---

*Created: December 8, 2025*
