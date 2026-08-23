import { expect, test } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const localUrl = 'http://127.0.0.1:54321';
const password = 'local-workspace-ui-123!';
let email: string;
let admin: SupabaseClient;
let userId: string;

const workspace = {
  customer: { id: 'customer-1', name: 'NeedThisDone' },
  availableCustomers: [{ id: 'customer-1', name: 'NeedThisDone', role: 'owner' }],
  membershipRole: 'owner',
  scheduledDate: '2026-07-27',
  timezone: 'America/New_York',
  employee: { id: 'employee-1', name: 'Growth Desk', role_name: 'AI Growth Employee', status: 'pilot' },
  brief: {
    responsibilities: ['Research qualified growth opportunities'],
    prohibited_actions: ['Send outreach without approval'],
    channels: ['Email'],
    tone: 'Clear, direct, and useful.',
    approval_rules: ['Every external action requires approval'],
  },
  schedules: [
    { check_in_type: 'morning', local_time: '08:30:00', timezone: 'America/New_York', enabled: true },
    { check_in_type: 'midday', local_time: '12:30:00', timezone: 'America/New_York', enabled: true },
    { check_in_type: 'evening', local_time: '16:30:00', timezone: 'America/New_York', enabled: true },
  ],
  workItems: [{
    id: 'work-1',
    predecessor_work_item_id: null,
    source_type: 'manual',
    source_id: null,
    queue: 'morning',
    scheduled_date: '2026-07-27',
    title: 'Review a warm audit lead',
    evidence: ['The prospect opened the report twice.'],
    proposed_action: 'Review the prepared follow-up.',
    expected_outcome: 'Start a qualified conversation.',
    risk_level: 'low',
    priority: 1,
    status: 'pending',
    created_by: null,
    completed_by: null,
    completed_at: null,
    completion_notes: null,
    created_at: '2026-07-27T12:00:00.000Z',
  }],
  decisions: [],
  outcomes: [{ id: 'outcome-1', work_item_id: null, kind: 'time_saved', value: 20, amount_cents: null, currency: null, cost_category: null, notes: 'Research preparation', recorded_by: null, occurred_at: '2026-07-27T12:00:00.000Z' }],
  dailyScorecards: [{ currency: 'USD', grossRevenueCents: 65000, totalCostCents: 15000, netRevenueCents: 50000, goalCents: 50000 }],
  funnel: { leads: 3, replies: 2, meetings: 1, projects: 1 },
  operatorMinutes: 20,
};

test.beforeAll(async ({}, workerInfo) => {
  if (process.env.ENV_TARGET !== 'local' || process.env.NEXT_PUBLIC_SUPABASE_URL !== localUrl) {
    throw new Error('Employee workspace UI proof is local-only.');
  }
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for workspace UI proof.');

  admin = createClient(localUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  email = `workspace-${Date.now()}-${workerInfo.workerIndex}-${crypto.randomUUID().slice(0, 8)}@example.test`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) throw new Error(error?.message || 'Could not create workspace UI fixture user.');
  userId = data.user.id;
  const role = await admin.from('user_roles').insert({ user_id: userId, role: 'admin' });
  if (role.error) throw new Error(role.error.message);
});

test.afterAll(async () => {
  if (!admin || !userId) return;
  await admin.from('user_roles').delete().eq('user_id', userId);
  await admin.auth.admin.deleteUser(userId);
});

test.beforeEach(async ({ page }, testInfo) => {
  await page.route('**/api/employee/workspace', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ workspace }),
  }));
  const loginResponse = await page.request.post('/api/auth/login', {
    headers: { 'x-forwarded-for': `127.0.0.${testInfo.workerIndex + 10}` },
    data: { email, password },
  });
  expect(loginResponse.ok()).toBe(true);
});

test('renders capped evidence-first queues and records a decision request', async ({ page }) => {
  let decisionBody: Record<string, unknown> | null = null;
  await page.route('**/api/employee/work-items/work-1/decision', async (route) => {
    decisionBody = await route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ decision: { id: 'decision-1' }, duplicate: false }),
    });
  });

  await page.goto('/employee');
  await expect(page.getByRole('heading', { name: 'Growth Desk' })).toBeVisible();
  await expect(page.getByText('The prospect opened the report twice.')).toBeVisible();
  await page.getByLabel('Optional instructions').fill('Keep it concise.');
  await page.getByRole('button', { name: 'Approve' }).click();
  await expect.poll(() => decisionBody).toMatchObject({
    decision: 'approve',
    instructions: 'Keep it concise.',
  });
  expect(String(decisionBody?.idempotencyKey)).toMatch(/^[0-9a-f-]{36}$/);
});

test('shows outcomes and guardrails without horizontal overflow', async ({ page }) => {
  await page.goto('/employee');
  await page.getByRole('button', { name: 'Outcomes' }).click();
  await expect(page.getByText('$500.00')).toBeVisible();
  await expect(page.getByText('3 leads · 2 replies · 1 meetings · 1 projects')).toBeVisible();
  await expect(page.getByText('Research preparation')).toBeVisible();
  await page.getByRole('button', { name: 'Role & Guardrails' }).click();
  await expect(page.getByText('Send outreach without approval')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
});
