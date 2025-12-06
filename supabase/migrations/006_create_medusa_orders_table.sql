-- ============================================================================
-- Create Orders Table for Medusa Integration
-- ============================================================================
-- What: Maps Medusa ecommerce orders to Supabase users
-- Why: Links customer orders to user accounts for order history tracking
-- How: Stores Medusa order ID, user ID, and order metadata

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),

  -- Link to Supabase user
  user_id uuid references auth.users(id) on delete cascade,

  -- Link to Medusa order
  medusa_order_id text not null unique,

  -- Order data snapshot (for quick access without calling Medusa)
  total integer, -- Amount in cents
  status text, -- 'pending', 'completed', 'canceled'
  email text, -- Customer email from order

  -- Timestamps
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================
-- Users can only see their own orders

alter table orders enable row level security;

-- Users can view their own orders
create policy "Users can view own orders"
  on orders for select
  using (auth.uid() = user_id);

-- Users can insert their own orders (via API)
create policy "Users can insert own orders"
  on orders for insert
  with check (auth.uid() = user_id);

-- Admins can view all orders
create policy "Admins can view all orders"
  on orders for select
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

-- Look up orders by user
create index if not exists orders_user_id_idx on orders(user_id);

-- Look up order by Medusa ID
create index if not exists orders_medusa_order_id_idx on orders(medusa_order_id);

-- Sort by creation date
create index if not exists orders_created_at_idx on orders(created_at desc);

-- ============================================================================
-- Auto-update updated_at Timestamp
-- ============================================================================

create trigger update_orders_updated_at
  before update on orders
  for each row
  execute function update_updated_at_column();
