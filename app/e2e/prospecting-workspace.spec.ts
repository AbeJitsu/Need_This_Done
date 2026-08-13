import { expect, test } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const localUrl = 'http://127.0.0.1:54321';
const password = 'local-prospecting-123!';

let admin: SupabaseClient;
let userId: string;
let email: string;
let prospectEmail: string;
let bounceEventId: string;

async function expectNoError<T>(result: { data: T; error: { message: string } | null }) {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

async function api(page: import('@playwright/test').Page, path: string, init?: RequestInit) {
  return page.evaluate(async ({ path, init }) => {
    const response = await fetch(path, init);
    return { status: response.status, body: await response.json() };
  }, { path, init });
}

test.beforeAll(async ({}, workerInfo) => {
  if (process.env.ENV_TARGET !== 'local' || process.env.NEXT_PUBLIC_SUPABASE_URL !== localUrl) {
    throw new Error('Prospecting browser proof is local-only.');
  }
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for prospecting browser proof.');
  admin = createClient(localUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  email = `prospecting-${Date.now()}-${workerInfo.workerIndex}-${crypto.randomUUID().slice(0, 8)}@example.test`;
  prospectEmail = `jordan-${crypto.randomUUID().slice(0, 8)}@example.test`;
  bounceEventId = `browser-proof-bounce-${crypto.randomUUID()}`;
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (created.error || !created.data.user) throw new Error(created.error?.message || 'Could not create prospecting fixture user.');
  userId = created.data.user.id;
  await expectNoError(await admin.from('user_roles').insert({ user_id: userId, role: 'admin' }));
});

test.afterAll(async () => {
  if (!admin || !userId) return;
  await admin.from('growth_profiles').delete().eq('owner_id', userId);
  await admin.from('user_roles').delete().eq('user_id', userId);
  await admin.auth.admin.deleteUser(userId);
});

test('configures, reviews, sends, and suppresses an approved prospecting message', async ({ page }) => {
  const loginResponse = await page.request.post('/api/auth/login', {
    headers: { 'x-forwarded-for': '127.0.0.48' },
    data: { email, password },
  });
  expect(loginResponse.ok()).toBe(true);
  await page.goto('/prospecting');

  const profile = await api(page, '/api/prospecting/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Browser proof profile',
      targetMarket: 'Independent service businesses',
      geography: 'United States',
      businessSize: 'Owner-led',
      painSignals: ['Unclear conversion path'],
      exclusionRules: ['No regulated outreach'],
      offer: 'A focused growth review',
      senderName: 'NeedThisDone',
      senderEmail: 'operator@example.test',
      dailyProspectCap: 10,
      dailySendCap: 10,
      workingHoursStart: '09:00',
      workingHoursEnd: '17:00',
      timezone: 'America/New_York',
      followUpDays: [3, 7],
      modelRoute: 'evaluation-required',
      fallbackModel: '',
    }),
  });
  expect(profile.status).toBe(200);

  const discovery = await api(page, '/api/prospecting/discovery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prospects: [{
      companyName: 'Browser Example Studio',
      contactName: 'Jordan Example',
      contactTitle: 'Owner',
      email: prospectEmail,
      websiteUrl: 'https://example.com',
      icpMatchScore: 88,
      icpMatchReason: 'Public evidence supports the configured fit.',
      sourceUrl: 'https://example.com/about',
      evidence: ['Public about page identifies the business.'],
      contactPath: 'Public business email',
      emailStatus: 'public',
    }] }),
  });
  expect(discovery.status).toBe(201);
  const prospectId = discovery.body.prospects[0].id as string;

  const draft = await api(page, '/api/prospecting/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prospectId,
      subject: 'One practical growth idea',
      body: 'A short evidence-backed note for Jordan.',
      evidence: ['Public about page identifies the business.'],
    }),
  });
  expect(draft.status).toBe(201);
  const messageId = draft.body.message.id as string;

  const blockedSend = await api(page, '/api/prospecting/sender/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messageId }),
  });
  expect(blockedSend.status).toBe(409);

  await page.goto('/prospecting');
  await expect(page.getByRole('heading', { name: 'Prospecting & outreach' })).toBeVisible();
  await page.getByRole('button', { name: 'Midday · review drafts' }).click();
  await expect(page.getByText('Browser Example Studio')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Message preview' })).toBeVisible();
  await page.getByRole('button', { name: 'Approve' }).click();
  await expect(page.getByRole('heading', { name: 'Approved and ready to send' })).toBeVisible();
  await page.getByRole('button', { name: 'Send approved message' }).click();
  await expect(page.getByText('Approved message sent through the configured sender.')).toBeVisible();

  const sentQueue = await api(page, '/api/prospecting/queue');
  expect(sentQueue.status).toBe(200);
  const sentMessage = sentQueue.body.messages.find((item: { id: string }) => item.id === messageId);
  expect(sentMessage.approval_status).toBe('sent');
  expect(sentMessage.provider_message_id).toMatch(/^fake-/);

  const duplicateSend = await api(page, '/api/prospecting/sender/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messageId }),
  });
  expect(duplicateSend.status).toBe(200);
  expect(duplicateSend.body.duplicate).toBe(true);

  const bounce = await api(page, '/api/prospecting/sender/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      providerEventId: bounceEventId,
      eventType: 'bounced',
      providerMessageId: sentMessage.provider_message_id,
      address: prospectEmail,
      payload: { reason: 'test-double' },
    }),
  });
  expect(bounce.status).toBe(201);
  const duplicateBounce = await api(page, '/api/prospecting/sender/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      providerEventId: bounceEventId,
      eventType: 'bounced',
      providerMessageId: sentMessage.provider_message_id,
      address: prospectEmail,
    }),
  });
  expect(duplicateBounce.status).toBe(200);
  expect(duplicateBounce.body.duplicate).toBe(true);

  const queue = await api(page, '/api/prospecting/queue');
  expect(queue.status).toBe(200);
  expect(queue.body.prospects[0].outreach_status).toBe('bounced');
  expect(queue.body.stats.bounces).toBe(1);
  const suppression = await expectNoError(await admin.from('suppression_records').select('normalized_address, reason').eq('normalized_address', prospectEmail).single());
  expect(suppression).toMatchObject({ normalized_address: prospectEmail, reason: 'bounce' });
});
