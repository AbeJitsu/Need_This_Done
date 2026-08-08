import { expect, test } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const localUrl = 'http://127.0.0.1:54321';
const password = 'local-daily-cockpit-123!';

let admin: SupabaseClient;
let userId: string;
let email: string;
let profileId: string;

async function expectNoError<T>(result: { data: T; error: { message: string } | null }) {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

function futureDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

test.beforeAll(async ({}, workerInfo) => {
  if (process.env.ENV_TARGET !== 'local' || process.env.NEXT_PUBLIC_SUPABASE_URL !== localUrl) {
    throw new Error('Daily cockpit browser proof is local-only.');
  }
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for daily cockpit browser proof.');
  admin = createClient(localUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  email = `cockpit-${Date.now()}-${workerInfo.workerIndex}-${crypto.randomUUID().slice(0, 8)}@example.test`;
  profileId = crypto.randomUUID();
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (created.error || !created.data.user) throw new Error(created.error?.message || 'Could not create cockpit fixture user.');
  userId = created.data.user.id;
  await expectNoError(await admin.from('user_roles').insert({ user_id: userId, role: 'admin' }));
  await expectNoError(await admin.from('growth_profiles').insert({
    id: profileId,
    owner_id: userId,
    name: 'Cockpit browser profile',
    target_market: 'Owner-led service businesses',
    geography: 'United States',
    business_size: 'Small teams',
    pain_signals: ['Unclear follow-up'],
    exclusion_rules: ['No regulated outreach'],
    offer: 'A focused growth review',
    sender_name: 'NeedThisDone',
    sender_email: 'operator@example.test',
  }));

  const prospectId = crypto.randomUUID();
  await expectNoError(await admin.from('prospects').insert({
    id: prospectId,
    profile_id: profileId,
    company_name: 'Browser Example Studio',
    contact_name: 'Jordan Example',
    email: 'jordan@example.test',
    website_url: 'https://example.com',
    deduplication_key: `cockpit-${prospectId}`,
    icp_match_score: 88,
    icp_match_reason: 'Public evidence supports the configured fit.',
  }));
  await expectNoError(await admin.from('outreach_messages').insert({
    prospect_id: prospectId,
    profile_id: profileId,
    subject: 'A practical growth idea',
    body: 'A supervised browser-proof message.',
    sender_email: 'operator@example.test',
    recipient_email: 'jordan@example.test',
    idempotency_key: crypto.randomUUID(),
    replied_at: new Date().toISOString(),
    follow_up_eligible: true,
    next_action_at: new Date(Date.now() + 86_400_000).toISOString(),
  }));
});

test.afterAll(async () => {
  if (!admin || !userId) return;
  await admin.from('growth_profiles').delete().eq('owner_id', userId);
  await admin.from('user_roles').delete().eq('user_id', userId);
  await admin.auth.admin.deleteUser(userId);
});

test('creates weekly rocks, works the next actions, reloads durable state, and records reflection', async ({ page }) => {
  const loginResponse = await page.request.post('/api/auth/login', {
    headers: { 'x-forwarded-for': '127.0.0.61' },
    data: { email, password },
  });
  expect(loginResponse.ok()).toBe(true);

  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Daily cockpit' })).toBeVisible();
  await expect(page.getByText('Current growth profile')).toBeVisible();
  await expect(page.getByText('Reply from Browser Example Studio')).toBeVisible();

  const priorityForm = page.locator('form').filter({ hasText: 'Add a big rock' });
  for (const [outcome, nextAction] of [
    ['Make the weekly plan visible', 'Plan the first operator move'],
    ['Turn replies into useful conversations', 'Plan the second operator move'],
    ['Protect delivery focus', 'Plan the third operator move'],
  ]) {
    await priorityForm.getByLabel('Outcome').fill(outcome);
    await priorityForm.getByLabel('Next action').fill(nextAction);
    await priorityForm.getByRole('button', { name: /Add big rock/ }).click();
    await expect(page.getByRole('status')).toContainText('Weekly big rock saved.');
  }

  await expect(page.getByRole('heading', { name: 'Make the weekly plan visible' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Turn replies into useful conversations' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Protect delivery focus' })).toBeVisible();
  await expect(page.getByRole('heading', { name: "Today's next actions" })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Plan the first operator move' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Plan the second operator move' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Plan the third operator move' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Add a big rock' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Complete action' }).first().click();
  await expect(page.getByRole('status')).toContainText('Action completed.');

  const deferredAction = page.locator('[data-action-title="Plan the second operator move"]');
  await deferredAction.getByLabel('Defer Plan the second operator move until').fill(futureDate(2));
  await deferredAction.getByRole('button', { name: 'Defer action' }).click();
  await expect(page.getByRole('status')).toContainText('Action deferred.');
  await expect(page.getByRole('heading', { name: 'Waiting items' })).toBeVisible();
  await expect(page.getByText('Plan the second operator move').first()).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Daily cockpit' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Recently completed' })).toBeVisible();
  await expect(page.getByText('Plan the first operator move').first()).toBeVisible();
  await expect(page.getByText('Plan the second operator move').first()).toBeVisible();

  await page.getByRole('button', { name: 'Reopen action' }).first().click();
  await expect(page.getByRole('status')).toContainText('Action reopened.');
  await expect(page.getByRole('heading', { name: 'Plan the first operator move' })).toBeVisible();

  const reflection = 'The important work is visible; tomorrow I will review the deferred reply with fresh context.';
  await page.getByLabel('Evening reflection').fill(reflection);
  await page.getByRole('button', { name: 'Save reflection' }).click();
  await expect(page.getByRole('status')).toContainText('Evening reflection saved.');
  await page.reload();
  await expect(page.getByLabel('Evening reflection')).toHaveValue(reflection);
});
