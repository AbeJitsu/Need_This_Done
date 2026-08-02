-- Sanitized retained-product restore fixture.
-- This contains no hosted identities or customer content. It proves the lean
-- chain can be restored: intake -> audit -> work item -> decision -> outcome -> scorecard.

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data
) values (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'local-operator@example.test', '', now(),
  now(), now(), '', '{}', '{}'
) on conflict (id) do nothing;

insert into public.user_roles (user_id, role) values
  ('00000000-0000-4000-8000-000000000001', 'admin')
on conflict (user_id) do update set role = excluded.role;

insert into public.customer_accounts (id, name) values
  ('10000000-0000-4000-8000-000000000001', 'Sanitized Local Customer');

insert into public.customer_memberships (customer_id, user_id, role) values
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'owner');

insert into public.ai_employees (id, customer_id, name, role_name) values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Local Growth Employee', 'AI Growth Employee');

insert into public.ai_employee_operating_briefs (
  employee_id, responsibilities, prohibited_actions, channels, tone, approval_rules
) values (
  '20000000-0000-4000-8000-000000000001',
  '["Research and audit prospect sites", "Draft prioritized recommendations"]',
  '["Send initial outreach", "Spend money", "Publish without approval"]',
  '["operator workspace"]', 'Clear and useful',
  '["Abe or Andrea approves and manually sends initial outreach"]'
);

insert into public.ai_employee_check_in_schedules (employee_id, check_in_type, local_time, timezone) values
  ('20000000-0000-4000-8000-000000000001', 'morning', '09:00', 'America/New_York'),
  ('20000000-0000-4000-8000-000000000001', 'midday', '13:00', 'America/New_York'),
  ('20000000-0000-4000-8000-000000000001', 'evening', '17:00', 'America/New_York');

insert into public.projects (
  id, user_id, name, email, service, message, status
) values (
  '30000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000001',
  'Sanitized Intake', 'local-customer@example.test', 'Website audit', 'Improve a sample service website', 'submitted'
);

insert into public.site_reports (
  id, url, email, score, grade, categories, accessibility, metrics,
  ai_analysis, executive_summary, pages_crawled
) values (
  '40000000-0000-4000-8000-000000000001',
  'https://example.test', 'local-customer@example.test', 72, 'C',
  '[{"name":"Content clarity","earned":7,"possible":10,"note":"Sanitized fixture"}]',
  '{"hasLangAttribute":true,"hasSkipNav":true,"landmarks":{"main":1,"nav":1}}',
  '[{"url":"https://example.test/","title":"Example","wordCount":250,"h1Count":1,"images":{"total":0,"withAlt":0,"withoutAlt":0,"altCoverage":"n/a"}}]',
  'Sanitized analysis', 'Sanitized audit fixture', 1
);

insert into public.ai_employee_work_items (
  id, employee_id, source_type, source_id, queue, scheduled_date, title,
  evidence, proposed_action, expected_outcome, priority
) values (
  '50000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001', 'site_report',
  '40000000-0000-4000-8000-000000000001', 'morning', current_date,
  'Review sanitized audit', '[{"score":72}]',
  'Prepare a draft recommendation for human review', 'One approved next step', 1
);

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', false);
select set_config('request.jwt.claim.role', 'authenticated', false);
select public.record_ai_employee_decision(
  '50000000-0000-4000-8000-000000000001', 'approve',
  'Operator reviewed; manual sending remains required.',
  '60000000-0000-4000-8000-000000000001', null
);
select set_config('request.jwt.claim.sub', '', false);
select set_config('request.jwt.claim.role', '', false);

insert into public.ai_employee_outcomes (
  employee_id, work_item_id, kind, value, amount_cents, currency, cost_category, notes
) values
  ('20000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', 'lead', 1, null, null, null, 'Qualified lead'),
  ('20000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', 'time_saved', 15, null, null, null, 'Operator minutes'),
  ('20000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', 'revenue', 1, 65000, 'USD', null, 'Sanitized revenue'),
  ('20000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', 'cost', 1, 5000, 'USD', 'model', 'Sanitized model cost'),
  ('20000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', 'cost', 1, 10000, 'USD', 'delivery', 'Sanitized delivery cost');
