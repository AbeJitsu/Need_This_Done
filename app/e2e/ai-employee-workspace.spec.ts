import { expect, test } from '@playwright/test';

const workspace = {
  customer: { id: 'customer-1', name: 'NeedThisDone' },
  membershipRole: 'owner',
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
    queue: 'morning',
    title: 'Review a warm audit lead',
    evidence: ['The prospect opened the report twice.'],
    proposed_action: 'Review the prepared follow-up.',
    expected_outcome: 'Start a qualified conversation.',
    risk_level: 'low',
    priority: 1,
    status: 'pending',
    created_at: '2026-07-27T12:00:00.000Z',
  }],
  decisions: [],
  outcomes: [{ id: 'outcome-1', kind: 'time_saved', value: 20, amount_cents: null, currency: null, cost_category: null, notes: 'Research preparation', occurred_at: '2026-07-27T12:00:00.000Z' }],
  dailyScorecards: [{ currency: 'USD', grossRevenueCents: 65000, totalCostCents: 15000, netRevenueCents: 50000, goalCents: 50000 }],
  funnel: { leads: 3, replies: 2, meetings: 1, projects: 1 },
  operatorMinutes: 20,
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/employee/workspace', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ workspace }),
  }));
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
