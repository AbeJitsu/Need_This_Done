-- ============================================================================
-- Stripe Integration Tables
-- ============================================================================
-- What: Store Stripe customer IDs, subscriptions, and payment history
-- Why: Link Stripe data to Supabase users for billing management
-- How: Foreign keys to auth.users, RLS policies for security

-- ============================================================================
-- Stripe Customers Table
-- ============================================================================
-- Maps Supabase users to Stripe customer IDs for payment processing

create table if not exists stripe_customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  stripe_customer_id text unique not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================================
-- Subscriptions Table
-- ============================================================================
-- Track active subscriptions, billing periods, and cancellation status

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  stripe_subscription_id text unique not null,
  stripe_price_id text not null,
  status text not null, -- 'active', 'canceled', 'past_due', 'trialing', 'incomplete'
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================================
-- Payments Table
-- ============================================================================
-- Record one-time payments for order history and reconciliation

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  order_id uuid references orders(id) on delete set null,
  stripe_payment_intent_id text unique not null,
  amount integer not null, -- Amount in cents
  currency text default 'usd',
  status text not null, -- 'succeeded', 'pending', 'failed', 'refunded'
  email text,
  created_at timestamp with time zone default now()
);

-- ============================================================================
-- Add Stripe Fields to Orders Table
-- ============================================================================
-- Link orders to Stripe payment intents and track payment status

alter table orders add column if not exists stripe_payment_intent_id text;
alter table orders add column if not exists payment_status text default 'pending';
-- payment_status: 'pending', 'paid', 'failed', 'refunded'

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================
-- Users can view their own data, service role manages all via webhooks

alter table stripe_customers enable row level security;
alter table subscriptions enable row level security;
alter table payments enable row level security;

-- Users can view their own Stripe customer record
create policy "Users view own stripe_customers"
  on stripe_customers for select
  using (auth.uid() = user_id);

-- Users can view their own subscriptions
create policy "Users view own subscriptions"
  on subscriptions for select
  using (auth.uid() = user_id);

-- Users can view their own payments
create policy "Users view own payments"
  on payments for select
  using (auth.uid() = user_id);

-- Service role can manage all Stripe data (for webhooks)
-- Note: Service role bypasses RLS, so these policies are for authenticated users only

-- Admins can view all Stripe customers
create policy "Admins can view all stripe_customers"
  on stripe_customers for select
  using (
    auth.role() = 'authenticated' and
    coalesce(
      (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true',
      false
    )
  );

-- Admins can view all subscriptions
create policy "Admins can view all subscriptions"
  on subscriptions for select
  using (
    auth.role() = 'authenticated' and
    coalesce(
      (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true',
      false
    )
  );

-- Admins can view all payments
create policy "Admins can view all payments"
  on payments for select
  using (
    auth.role() = 'authenticated' and
    coalesce(
      (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true',
      false
    )
  );

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Look up Stripe customer by Supabase user
create index if not exists stripe_customers_user_id_idx on stripe_customers(user_id);

-- Look up Stripe customer by Stripe ID (for webhooks)
create index if not exists stripe_customers_stripe_id_idx on stripe_customers(stripe_customer_id);

-- Look up subscriptions by user
create index if not exists subscriptions_user_id_idx on subscriptions(user_id);

-- Look up subscription by Stripe ID (for webhooks)
create index if not exists subscriptions_stripe_id_idx on subscriptions(stripe_subscription_id);

-- Look up subscriptions by status
create index if not exists subscriptions_status_idx on subscriptions(status);

-- Look up payments by user
create index if not exists payments_user_id_idx on payments(user_id);

-- Look up payments by order
create index if not exists payments_order_id_idx on payments(order_id);

-- Look up payment by Stripe ID (for webhooks)
create index if not exists payments_stripe_id_idx on payments(stripe_payment_intent_id);

-- Look up orders by payment status
create index if not exists orders_payment_status_idx on orders(payment_status);

-- ============================================================================
-- Auto-update Timestamps
-- ============================================================================

create trigger update_stripe_customers_updated_at
  before update on stripe_customers
  for each row
  execute function update_updated_at_column();

create trigger update_subscriptions_updated_at
  before update on subscriptions
  for each row
  execute function update_updated_at_column();
