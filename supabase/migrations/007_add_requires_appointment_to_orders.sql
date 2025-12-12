-- ============================================================================
-- Add requires_appointment Column to Orders Table
-- ============================================================================
-- What: Adds a flag to track orders that require appointment scheduling
-- Why: Consultation products need appointment booking before fulfillment
-- How: Add boolean column with default false

alter table orders
  add column if not exists requires_appointment boolean default false;

-- ============================================================================
-- Index for Filtering Appointment Orders
-- ============================================================================
-- What: Index for quickly finding orders that need appointments
-- Why: Admin dashboard will filter for pending appointment requests
-- How: B-tree index on boolean column

create index if not exists orders_requires_appointment_idx
  on orders(requires_appointment)
  where requires_appointment = true;

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

comment on column orders.requires_appointment is
  'Indicates if this order contains consultation products that require appointment scheduling';
