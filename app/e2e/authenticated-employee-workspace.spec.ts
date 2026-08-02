import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { expect, test, type Page } from '@playwright/test';

type FixtureUser = {
  id: string;
  email: string;
  password: string;
};

type Fixture = {
  admin: SupabaseClient;
  customerA: string;
  customerB: string;
  employeeA: string;
  work: {
    owner: string;
    manager: string;
    viewer: string;
  };
  users: {
    owner: FixtureUser;
    manager: FixtureUser;
    viewer: FixtureUser;
    otherCustomer: FixtureUser;
  };
};

const localUrl = 'http://127.0.0.1:54321';
const password = 'local-auth-contract-123!';

function requiredEnvironment(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} for authenticated browser proof.`);
  return value;
}

async function expectNoError<T>(result: { data: T; error: { message: string } | null }) {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

async function createFixture(): Promise<Fixture> {
  if (process.env.ENV_TARGET !== 'local') throw new Error('Authenticated browser proof is local-only.');
  if (process.env.NEXT_PUBLIC_SUPABASE_URL !== localUrl) {
    throw new Error('Authenticated browser proof must use local Supabase.');
  }

  const admin = createClient(
    requiredEnvironment('NEXT_PUBLIC_SUPABASE_URL'),
    requiredEnvironment('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const userDefinitions = [
    ['owner', `auth-owner-${suffix}@example.test`],
    ['manager', `auth-manager-${suffix}@example.test`],
    ['viewer', `auth-viewer-${suffix}@example.test`],
    ['otherCustomer', `auth-other-${suffix}@example.test`],
  ] as const;
  const users = {} as Fixture['users'];

  for (const [role, email] of userDefinitions) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) throw new Error(error?.message || `Could not create ${role} fixture user.`);
    users[role] = { id: data.user.id, email, password };
  }

  const customerA = crypto.randomUUID();
  const customerB = crypto.randomUUID();
  const employeeA = crypto.randomUUID();
  const employeeB = crypto.randomUUID();
  const work = {
    owner: crypto.randomUUID(),
    manager: crypto.randomUUID(),
    viewer: crypto.randomUUID(),
  };
  const scheduledDate = new Date().toISOString().slice(0, 10);

  await expectNoError(await admin.from('customer_accounts').insert([
    { id: customerA, name: 'Authenticated Customer A' },
    { id: customerB, name: 'Authenticated Customer B' },
  ]));
  await expectNoError(await admin.from('customer_memberships').insert([
    { customer_id: customerA, user_id: users.owner.id, role: 'owner' },
    { customer_id: customerA, user_id: users.manager.id, role: 'manager' },
    { customer_id: customerA, user_id: users.viewer.id, role: 'viewer' },
    { customer_id: customerB, user_id: users.otherCustomer.id, role: 'owner' },
  ]));
  await expectNoError(await admin.from('ai_employees').insert([
    { id: employeeA, customer_id: customerA, name: 'Authenticated Growth Employee', role_name: 'AI Growth Employee' },
    { id: employeeB, customer_id: customerB, name: 'Other Customer Employee', role_name: 'AI Growth Employee' },
  ]));
  await expectNoError(await admin.from('ai_employee_operating_briefs').insert({
    employee_id: employeeA,
    responsibilities: ['Review qualified opportunities'],
    prohibited_actions: ['Send outreach without approval'],
    channels: ['Operator workspace'],
    tone: 'Clear and useful',
    approval_rules: ['Every external action requires approval'],
  }));
  await expectNoError(await admin.from('ai_employee_check_in_schedules').insert([
    { employee_id: employeeA, check_in_type: 'morning', local_time: '09:00', timezone: 'America/New_York' },
    { employee_id: employeeA, check_in_type: 'midday', local_time: '13:00', timezone: 'America/New_York' },
    { employee_id: employeeA, check_in_type: 'evening', local_time: '17:00', timezone: 'America/New_York' },
  ]));
  await expectNoError(await admin.from('ai_employee_work_items').insert([
    { id: work.owner, employee_id: employeeA, queue: 'morning', scheduled_date: scheduledDate, title: 'Owner approval item', proposed_action: 'Review owner item', expected_outcome: 'Owner records a supervised decision', priority: 1 },
    { id: work.manager, employee_id: employeeA, queue: 'midday', scheduled_date: scheduledDate, title: 'Manager approval item', proposed_action: 'Review manager item', expected_outcome: 'Manager records a supervised decision', priority: 1 },
    { id: work.viewer, employee_id: employeeA, queue: 'evening', scheduled_date: scheduledDate, title: 'Viewer review item', proposed_action: 'Review viewer item', expected_outcome: 'Viewer remains read-only', priority: 1 },
  ]));

  return { admin, customerA, customerB, employeeA, work, users };
}

async function login(page: Page, user: FixtureUser, employeeName = 'Authenticated Growth Employee') {
  await page.goto('/login');
  await page.getByLabel('Email Address').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.waitForURL('**/dashboard', { timeout: 15_000 });
  await page.goto('/employee');
  await expect(page.getByRole('heading', { name: employeeName })).toBeVisible({ timeout: 15_000 });
}

async function api(page: Page, path: string, init?: RequestInit) {
  return page.evaluate(async ({ path, init }) => {
    const response = await fetch(path, init);
    return { status: response.status, body: await response.json() };
  }, { path, init });
}

test.describe('real authenticated employee authorization', () => {
  test.describe.configure({ mode: 'serial' });
  let fixture: Fixture;

  test.beforeAll(async () => {
    fixture = await createFixture();
  });

  test.afterAll(async () => {
    if (!fixture) return;
    await fixture.admin.from('customer_accounts').delete().in('id', [fixture.customerA, fixture.customerB]);
    for (const user of Object.values(fixture.users)) {
      await fixture.admin.auth.admin.deleteUser(user.id);
    }
  });

  test('rejects anonymous workspace access before any role is considered', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/');
    const result = await api(page, '/api/employee/workspace');
    expect(result.status).toBe(401);
    await context.close();
  });

  test('owner and manager use real sessions and can record supervised decisions', async ({ browser }) => {
    for (const [role, workItemId, expectedQueue] of [
      ['owner', fixture.work.owner, 'Morning Brief'],
      ['manager', fixture.work.manager, 'Midday Decisions'],
    ] as const) {
      const context = await browser.newContext();
      const page = await context.newPage();
      await login(page, fixture.users[role]);
      const workspace = await api(page, '/api/employee/workspace');
      expect(workspace.status).toBe(200);
      expect(workspace.body.workspace.membershipRole).toBe(role);
      await page.getByRole('button', { name: expectedQueue, exact: false }).click();
      await expect(page.getByRole('button', { name: 'approve', exact: true })).toBeEnabled();

      const decision = await api(page, `/api/employee/work-items/${workItemId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'approve', instructions: '', idempotencyKey: crypto.randomUUID() }),
      });
      expect(decision.status).toBe(201);
      await context.close();
    }
  });

  test('viewer is read-only and another customer cannot decide customer A work', async ({ browser }) => {
    const viewerContext = await browser.newContext();
    const viewerPage = await viewerContext.newPage();
    await login(viewerPage, fixture.users.viewer);
    const viewerWorkspace = await api(viewerPage, '/api/employee/workspace');
    expect(viewerWorkspace.status).toBe(200);
    expect(viewerWorkspace.body.workspace.membershipRole).toBe('viewer');
    await viewerPage.getByRole('button', { name: 'End-of-Day Review', exact: false }).click();
    await expect(viewerPage.getByRole('button', { name: 'approve', exact: true })).toBeDisabled();

    const viewerDecision = await api(viewerPage, `/api/employee/work-items/${fixture.work.viewer}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: 'approve', instructions: '', idempotencyKey: crypto.randomUUID() }),
    });
    expect(viewerDecision.status).toBe(403);
    await viewerContext.close();

    const otherContext = await browser.newContext();
    const otherPage = await otherContext.newPage();
    await login(otherPage, fixture.users.otherCustomer, 'Other Customer Employee');
    const otherWorkspace = await api(otherPage, '/api/employee/workspace');
    expect(otherWorkspace.status).toBe(200);
    expect(otherWorkspace.body.workspace.customer.id).toBe(fixture.customerB);
    expect(JSON.stringify(otherWorkspace.body)).not.toContain(fixture.employeeA);
    const crossCustomerDecision = await api(otherPage, `/api/employee/work-items/${fixture.work.viewer}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: 'approve', instructions: '', idempotencyKey: crypto.randomUUID() }),
    });
    expect(crossCustomerDecision.status).toBe(403);
    await otherContext.close();
  });
});
