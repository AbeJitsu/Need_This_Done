-- Tighten planner writes after the first local proof. Browser sessions may
-- read their own plans, but only the authenticated, security-definer planner
-- lifecycle functions may create, edit, approve, reject, or dispatch them.

drop policy if exists "operators own agent plans" on public.agent_plans;
create policy "operators own agent plans" on public.agent_plans
  for select using (public.is_admin(auth.uid()) and owner_id = auth.uid());

revoke insert, update, delete on table public.agent_plans from authenticated;
grant select on table public.agent_plans to authenticated;
