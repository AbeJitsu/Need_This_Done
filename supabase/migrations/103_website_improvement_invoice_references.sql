-- A minimal server-owned test-mode start-invoice reference: USD 250 only.
-- No checkout, card, subscription, portal, or commerce-table restoration.

create table public.website_improvement_invoice_references (
  id uuid primary key default gen_random_uuid(),
  operation_id uuid not null unique references public.provider_operations(id) on delete restrict,
  project_id uuid not null references public.projects(id) on delete restrict,
  stripe_invoice_id text unique,
  amount_cents integer not null default 25000 check (amount_cents = 25000),
  currency text not null default 'usd' check (currency = 'usd'),
  test_mode boolean not null default true check (test_mode),
  status text not null default 'pending' check (status in ('pending','open','paid','declined','void','refunded','failed_retryable','failed_permanent')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.website_improvement_invoice_references enable row level security;
revoke all on table public.website_improvement_invoice_references from public, anon, authenticated;

create or replace function public.record_website_improvement_invoice_reference(
  target_operation_id uuid, target_project_id uuid, target_stripe_invoice_id text, target_status text
) returns jsonb language plpgsql security definer set search_path = public as $$
declare result public.website_improvement_invoice_references;
begin
  if auth.role() <> 'service_role' or target_operation_id is null or target_project_id is null
    or target_status not in ('pending','open','paid','declined','void','refunded','failed_retryable','failed_permanent') then
    raise exception 'invoice_reference_not_authorized' using errcode = '42501';
  end if;
  insert into public.website_improvement_invoice_references (operation_id, project_id, stripe_invoice_id, status)
  values (target_operation_id, target_project_id, nullif(trim(target_stripe_invoice_id), ''), target_status)
  on conflict (operation_id) do update set stripe_invoice_id = coalesce(excluded.stripe_invoice_id, public.website_improvement_invoice_references.stripe_invoice_id), status = excluded.status, updated_at = now()
  returning * into result;
  return to_jsonb(result);
end;
$$;
revoke all on function public.record_website_improvement_invoice_reference(uuid,uuid,text,text) from public, anon, authenticated;
grant execute on function public.record_website_improvement_invoice_reference(uuid,uuid,text,text) to service_role;

create or replace function public.record_stripe_invoice_event(
  target_receipt_id uuid, target_stripe_invoice_id text, target_status text
) returns jsonb language plpgsql security definer set search_path = public as $$
declare result public.website_improvement_invoice_references;
begin
  if auth.role() <> 'service_role' or target_receipt_id is null or nullif(trim(target_stripe_invoice_id), '') is null
    or target_status not in ('paid','declined','void','refunded') then
    raise exception 'stripe_invoice_event_not_authorized' using errcode = '42501';
  end if;
  update public.website_improvement_invoice_references set status = target_status, updated_at = now()
    where stripe_invoice_id = trim(target_stripe_invoice_id) returning * into result;
  update public.provider_webhook_receipts set status = 'processed', processed_at = now() where id = target_receipt_id;
  return to_jsonb(result);
end;
$$;
revoke all on function public.record_stripe_invoice_event(uuid,text,text) from public, anon, authenticated;
grant execute on function public.record_stripe_invoice_event(uuid,text,text) to service_role;
