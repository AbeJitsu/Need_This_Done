-- NeedThisDone authenticated owner workspace read surface.
--
-- Purpose: let an authenticated account review only its own durable workflow
-- plans, runs, events, and artifact versions in the browser workspace.
-- Impact: this adds read-only owner policies to existing orchestration tables;
-- it does not restore the retired customer-membership model or grant any
-- browser role the ability to create, approve, dispatch, control, or mutate
-- worker records.
-- Data handling: all predicates use auth.uid() against the durable owner_id.
-- The application still applies the same owner filter and does not return
-- worker, queue, credential, or raw internal payload fields to the browser.
-- Verification: run the local schema/RLS suite and the authenticated workspace
-- route tests before any separately reviewed hosted migration.
-- Rollback: deploy the prior application version, then use a separately
-- reviewed forward migration to adjust these read policies if needed. Do not
-- reset hosted Supabase or delete durable workflow history as rollback.

create policy "authenticated owners read agent plans" on public.agent_plans
  for select using (owner_id = auth.uid());

create policy "authenticated owners read agent runs" on public.agent_runs
  for select using (owner_id = auth.uid());

create policy "authenticated owners read agent plan events" on public.agent_plan_events
  for select using (owner_id = auth.uid());

create policy "authenticated owners read agent run events" on public.agent_run_events
  for select using (owner_id = auth.uid());

create policy "authenticated owners read agent artifacts" on public.agent_artifacts
  for select using (owner_id = auth.uid());

create policy "authenticated owners read artifact versions" on public.agent_artifact_versions
  for select using (owner_id = auth.uid());

grant select on table public.agent_plans, public.agent_runs,
  public.agent_plan_events, public.agent_run_events,
  public.agent_artifacts, public.agent_artifact_versions to authenticated;
