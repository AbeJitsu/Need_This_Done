import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { expect, test } from '@playwright/test';

const localUrl = 'http://127.0.0.1:54321';
const password = 'local-hermes-plan-preview-123!';
const planId = '00000000-0000-4000-8000-000000000071';
let admin: SupabaseClient;
let userId: string;
let email: string;

function plan(status: 'draft' | 'approved') {
  return {
    id: planId,
    original_request: 'Find one public source and prepare a private review asset.',
    rewritten_instruction: 'Research one public source and return a reviewable private asset without external delivery.',
    workflow_type: 'research_outreach',
    growth_profile_id: '00000000-0000-4000-8000-000000000072',
    steps: [{
      key: 'research', title: 'Research public evidence', instruction: 'Use public HTTPS sources only.',
      taskType: 'research_public_web', agentRole: 'public_web_researcher', capabilities: ['research_public_web'],
      expectedArtifacts: ['research dossier'], estimatedCostUsd: 0,
    }],
    allowed_capabilities: ['research_public_web'],
    forbidden_actions: ['send_external_messages', 'publish_content', 'spend_money', 'change_connected_accounts', 'deliver_external_content'],
    expected_artifacts: ['research dossier'],
    selected_model_id: 'provider/free-model',
    model_route: 'selected-free',
    estimated_prompt_tokens: 900,
    estimated_completion_tokens: 1200,
    estimated_cost_usd: 0,
    status,
    run_id: null,
    updated_at: '2026-09-03T12:00:00.000Z',
  };
}

test.beforeAll(async ({}, workerInfo) => {
  if (process.env.ENV_TARGET !== 'local' || process.env.NEXT_PUBLIC_SUPABASE_URL !== localUrl) {
    throw new Error('Hermes browser contract is local-only.');
  }
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for Hermes browser contract.');
  admin = createClient(localUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  email = `hermes-plan-${Date.now()}-${workerInfo.workerIndex}@example.test`;
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) throw new Error(error?.message || 'Could not create Hermes browser fixture user.');
  userId = data.user.id;
  const role = await admin.from('user_roles').upsert({ user_id: userId, role: 'admin' });
  if (role.error) throw new Error(role.error.message);
});

test.afterAll(async () => {
  if (!admin || !userId) return;
  await admin.from('user_roles').delete().eq('user_id', userId);
  await admin.auth.admin.deleteUser(userId);
});

test('an authenticated browser reviews route, cost, and approval before frozen-plan dispatch', async ({ page }, testInfo) => {
  let currentPlan = plan('draft');
  let approvalBody: Record<string, unknown> | null = null;
  let dispatchCalls = 0;

  await page.route('**/api/agent-runs', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      runs: [], schedules: [], brandProfile: null, workerHeartbeats: [], approvals: [], outreach: [],
      counts: { activeRuns: 0, pendingApprovals: 0, pendingOutreach: 0 },
    }),
  }));
  await page.route('**/api/agent-plans', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ plans: [currentPlan], growthProfiles: [] }),
  }));
  await page.route(`**/api/agent-plans/${planId}/approve`, async (route) => {
    approvalBody = await route.request().postDataJSON() as Record<string, unknown>;
    currentPlan = plan('approved');
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ plan: currentPlan }) });
  });
  await page.route(`**/api/agent-plans/${planId}/dispatch`, async (route) => {
    dispatchCalls += 1;
    await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Dispatch must not be called by approval.' }) });
  });

  const login = await page.request.post('/api/auth/login', {
    headers: { 'x-forwarded-for': `127.0.0.${testInfo.workerIndex + 70}` },
    data: { email, password },
  });
  expect(login.ok()).toBe(true);
  await page.goto('/dashboard');

  await expect(page.getByRole('heading', { name: 'Review a Hermes plan before OpenClaw runs' })).toBeVisible();
  await expect(page.getByText('Route: selected-free.')).toBeVisible();
  await expect(page.getByText('$0.0000 estimated')).toBeVisible();
  await expect(page.getByText('send_external_messages')).toBeVisible();
  await expect(page.getByText('No automatic dispatch')).toBeVisible();

  await page.getByRole('button', { name: 'Approve and freeze' }).click();
  await expect.poll(() => approvalBody).toMatchObject({ note: 'Reviewed in the authenticated operations dashboard.' });
  expect(String(approvalBody?.idempotencyKey)).toMatch(/^[0-9a-f-]{36}$/);
  await expect(page.getByRole('status')).toContainText('Hermes plan approved and frozen.');
  await expect(page.getByRole('button', { name: 'Dispatch frozen plan' })).toBeVisible();
  expect(dispatchCalls).toBe(0);
});
