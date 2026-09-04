-- Purpose: persist optional versioned public-intake context and privacy-safe daily counters.
-- Impact: additive nullable column, new RLS-protected aggregate table, service-role RPC.
-- Data handling: no raw events, network identifiers, browser identifiers, or intake answers enter metrics.
-- Verification: legacy project insert, structured insert, atomic RPC increment, anon read/write denial.
-- Rollback: forward-only migration may stop callers, revoke the RPC, then remove objects after retention review.

alter table public.projects add column if not exists intake_context jsonb;

create table if not exists public.public_engagement_daily_metrics (
  metric_date date not null default (now() at time zone 'utc')::date,
  event text not null,
  route text not null,
  element text not null,
  variant text not null,
  count bigint not null default 0 check (count >= 0),
  primary key (metric_date, event, route, element, variant)
);

alter table public.public_engagement_daily_metrics enable row level security;
revoke all on public.public_engagement_daily_metrics from anon, authenticated;

create or replace function public.increment_public_engagement_metric(p_event text, p_route text, p_element text, p_variant text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_event not in ('page_view','primary_action_click','secondary_action_click','intake_step_view','intake_step_complete','intake_submit','intake_success','intake_error','snapshot_submit','snapshot_success','snapshot_error','report_cta_click')
    or p_route not in ('home','services','website_fix','managed_automation','about','how_it_works','work','pricing','contact','site_analyzer','report','ada_compliance','faq','blog','blog_post','privacy','terms','not_found','error')
    or p_element !~ '^[a-z0-9_]{1,64}$' or p_variant <> 'match-crib-v1' then raise exception 'invalid engagement metric';
  end if;
  insert into public.public_engagement_daily_metrics(metric_date,event,route,element,variant,count)
  values ((now() at time zone 'utc')::date,p_event,p_route,p_element,p_variant,1)
  on conflict (metric_date,event,route,element,variant) do update set count = public.public_engagement_daily_metrics.count + 1;
end; $$;

revoke all on function public.increment_public_engagement_metric(text,text,text,text) from public, anon, authenticated;
grant execute on function public.increment_public_engagement_metric(text,text,text,text) to service_role;
