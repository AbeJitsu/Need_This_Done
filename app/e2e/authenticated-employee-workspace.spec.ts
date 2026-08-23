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

function dateInNewYork() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

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
  if (process.env.OFFLINE_ASSEMBLY_PROOF === 'true') {
    const externalProviderVariables = [
      'REDIS_URL', 'OPENAI_API_KEY', 'RESEND_API_KEY', 'RESEND_ADMIN_EMAIL',
      'RESEND_FROM_EMAIL', 'RESEND_WEBHOOK_SECRET', 'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI', 'GOOGLE_OAUTH_STATE_SECRET',
      'CALENDAR_TOKEN_ENCRYPTION_KEY', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'STRIPE_SECRET_KEY', 'STRIPE_TEST_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET',
      'OPENROUTER_API_KEY', 'OPENROUTER_PRIMARY_MODEL', 'OPENROUTER_TEST_MODEL', 'OPENROUTER_BACKUP_MODEL',
    ];
    const configured = externalProviderVariables.filter((name) => Boolean(process.env[name]));
    if (configured.length) throw new Error(`Offline assembly received provider credentials: ${configured.join(', ')}`);
    if (process.env.SKIP_EMAILS !== 'true') throw new Error('Offline assembly must disable provider email delivery.');
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
  const scheduledDate = dateInNewYork();

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

async function authenticate(page: Page, user: FixtureUser) {
  await page.goto('/login');
  const loginResponse = await page.request.post('/api/auth/login', {
    headers: { 'x-forwarded-for': `127.0.0.${Number.parseInt(user.id.slice(-2), 16) % 200 + 20}` },
    data: { email: user.email, password: user.password },
  });
  expect(loginResponse.ok()).toBe(true);
}

async function login(
  page: Page,
  user: FixtureUser,
  employeeName = 'Authenticated Growth Employee',
  customerId?: string,
) {
  await authenticate(page, user);
  await page.goto(customerId ? `/employee?customerId=${customerId}` : '/employee');
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
    if (process.env.OFFLINE_ASSEMBLY_PROOF === 'true') {
      await page.goto('/login');
      await expect(page.getByRole('button', { name: 'Continue with Google' })).toHaveCount(0);
      await expect(page.getByLabel('Email Address')).toBeVisible();
    }
    await context.close();
  });

  test('historical customer memberships remain stored but grant no workspace access', async ({ browser }) => {
    const historicalMemberships = await expectNoError(await fixture.admin
      .from('customer_memberships')
      .select('user_id')
      .in('user_id', Object.values(fixture.users).map((user) => user.id)));
    expect(historicalMemberships).toHaveLength(4);

    for (const user of Object.values(fixture.users)) {
      const context = await browser.newContext();
      const page = await context.newPage();
      await authenticate(page, user);
      const workspace = await api(page, '/api/employee/workspace');
      expect(workspace.status).toBe(403);
      expect(JSON.stringify(workspace.body)).not.toContain(fixture.employeeA);
      const decision = await api(page, `/api/employee/work-items/${fixture.work.owner}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'approve', instructions: '', idempotencyKey: crypto.randomUUID() }),
      });
      expect(decision.status).toBe(403);
      await page.goto('/employee');
      await expect(page).toHaveURL(/\/login$/);
      await context.close();
    }
  });

  test('an operator can select retained customer work and record a supervised decision', async ({ browser }) => {
    await expectNoError(await fixture.admin.from('user_roles').upsert({ user_id: fixture.users.owner.id, role: 'admin' }));
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await login(page, fixture.users.owner, 'Authenticated Growth Employee', fixture.customerA);
      const workspace = await api(page, `/api/employee/workspace?customerId=${fixture.customerA}`);
      expect(workspace.status).toBe(200);
      expect(workspace.body.workspace.membershipRole).toBe('operator');
      expect(workspace.body.workspace.availableCustomers).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: fixture.customerA, role: 'operator' }),
        expect.objectContaining({ id: fixture.customerB, role: 'operator' }),
      ]));
      await page.getByRole('button', { name: 'Morning Brief', exact: false }).click();
      await expect(page.getByRole('button', { name: 'approve', exact: true })).toBeEnabled();
      const decision = await api(page, `/api/employee/work-items/${fixture.work.owner}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'approve', instructions: '', idempotencyKey: crypto.randomUUID() }),
      });
      expect(decision.status).toBe(201);
    } finally {
      await context.close();
      await fixture.admin.from('user_roles').delete().eq('user_id', fixture.users.owner.id);
    }
  });

  test('an operator provisions and closes one retained pilot lifecycle through authenticated APIs', async ({ browser }) => {
    const projectId = crypto.randomUUID();
    let pilotCustomerId: string | undefined;
    const projectInsert = await fixture.admin.from('projects').insert({
      id: projectId,
      name: 'Lifecycle Pilot',
      email: fixture.users.owner.email,
      company: 'Lifecycle Company',
      message: 'Prove the retained internal pilot lifecycle.',
      user_id: fixture.users.owner.id,
    });
    await expectNoError(projectInsert);
    await expectNoError(await fixture.admin.from('user_roles').upsert({ user_id: fixture.users.owner.id, role: 'admin' }));

    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await login(page, fixture.users.owner, 'Authenticated Growth Employee', fixture.customerA);
      const provision = await api(page, `/api/projects/${projectId}/pilot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeName: 'Lifecycle Growth Desk',
          roleName: 'AI Growth Employee',
          timezone: 'America/New_York',
          morningTime: '09:00',
          middayTime: '13:00',
          eveningTime: '17:00',
          responsibilities: ['Prepare retained work'],
          prohibitedActions: ['No external action without approval'],
          channels: ['Operator workspace'],
          tone: 'Clear and direct',
          approvalRules: ['Every external action requires approval'],
        }),
      });
      expect(provision.status).toBe(201);
      pilotCustomerId = provision.body.pilot.customer_id;
      const employeeId = provision.body.pilot.employee_id;

      const selectedWorkspace = await api(page, `/api/employee/workspace?customerId=${pilotCustomerId}`);
      expect(selectedWorkspace.status).toBe(200);
      expect(selectedWorkspace.body.workspace.availableCustomers.length).toBeGreaterThan(1);

      const authored = await api(page, '/api/employee/work-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          queue: 'morning',
          scheduledDate: selectedWorkspace.body.workspace.scheduledDate,
          title: 'Review the retained pilot follow-up',
          evidence: ['Project requested a supervised lifecycle'],
          proposedAction: 'Send the approved follow-up manually',
          expectedOutcome: 'Receive a qualified reply',
          riskLevel: 'low',
          priority: 1,
          sourceType: 'project',
          sourceId: projectId,
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      expect(authored.status).toBe(201);
      const workItemId = authored.body.workItem.id;

      const decision = await api(page, `/api/employee/work-items/${workItemId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'approve', instructions: 'Keep the evidence URL.', idempotencyKey: crypto.randomUUID() }),
      });
      expect(decision.status).toBe(201);
      const completion = await api(page, `/api/employee/work-items/${workItemId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Sent manually; reply saved in project notes.', idempotencyKey: crypto.randomUUID() }),
      });
      expect(completion.status).toBe(201);
      const outcome = await api(page, '/api/employee/outcomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          workItemId,
          kind: 'reply',
          value: 1,
          notes: 'Qualified reply from lifecycle proof.',
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      expect(outcome.status).toBe(201);

      await page.goto(`/employee?customerId=${pilotCustomerId}`);
      await expect(page.getByRole('heading', { name: 'Lifecycle Growth Desk' })).toBeVisible();
      await page.getByRole('button', { name: 'Activity' }).click();
      await expect(page.getByText('approve · completed')).toBeVisible();
      await expect(page.getByText(/Sent manually; reply saved/)).toBeVisible();
      await page.getByRole('button', { name: 'Outcomes' }).click();
      await expect(page.getByText('Qualified reply from lifecycle proof.')).toBeVisible();
    } finally {
      await context.close();
      await fixture.admin.from('user_roles').delete().eq('user_id', fixture.users.owner.id);
      await fixture.admin.from('projects').delete().eq('id', projectId);
      if (pilotCustomerId) await fixture.admin.from('customer_accounts').delete().eq('id', pilotCustomerId);
    }
  });
});
