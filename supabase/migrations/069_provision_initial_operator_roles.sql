-- Initial operator access is intentionally limited to the two named owners.
-- This migration is idempotent so a reviewed retry cannot create duplicates.
insert into public.user_roles (user_id, role)
values
  ('d01dad70-c47f-4e28-802d-227506c2cf8a', 'admin'), -- Abe Reyes
  ('15adf67d-e80c-49f6-ac78-d49cec8d5b8f', 'admin')  -- Andrea Caputo
on conflict (user_id) do update
  set role = excluded.role,
      updated_at = now();
