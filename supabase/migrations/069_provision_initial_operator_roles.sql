-- Initial operator access is intentionally limited to the two named owners.
-- Provision each role only when the corresponding Auth user exists.
-- This keeps fresh local databases independent from production user data.
insert into public.user_roles (user_id, role)
select candidate.user_id, candidate.role
from (
  values
    ('d01dad70-c47f-4e28-802d-227506c2cf8a'::uuid, 'admin'::text), -- Abe Reyes
    ('15adf67d-e80c-49f6-ac78-d49cec8d5b8f'::uuid, 'admin'::text)  -- Andrea Caputo
) as candidate(user_id, role)
join auth.users as auth_user
  on auth_user.id = candidate.user_id
on conflict (user_id) do update
  set role = excluded.role,
      updated_at = now();
