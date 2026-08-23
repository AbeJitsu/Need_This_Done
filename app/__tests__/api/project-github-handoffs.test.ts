import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';

const { verifyAdmin, getSupabaseAdmin, sendProjectGithubHandoff, invalidate, wrap } = vi.hoisted(() => ({
  verifyAdmin: vi.fn(),
  getSupabaseAdmin: vi.fn(),
  sendProjectGithubHandoff: vi.fn(),
  invalidate: vi.fn().mockResolvedValue(undefined),
  wrap: vi.fn(async (_key: string, fetcher: () => Promise<unknown>) => ({
    data: await fetcher(), cached: false, source: 'database' as const,
  })),
}));

vi.mock('@/lib/api-auth', () => ({ verifyAdmin }));
vi.mock('@/lib/supabase', () => ({ getSupabaseAdmin }));
vi.mock('@/lib/email-service', () => ({ sendProjectGithubHandoff }));
vi.mock('@/lib/cache', () => ({
  cache: { invalidate, wrap },
  CACHE_KEYS: { projectDeliveries: (id: string) => `project:deliveries:${id}:admin` },
}));

import { GET, POST } from '@/app/api/projects/[id]/deliveries/route';
import { POST as retryNotification } from '@/app/api/projects/[id]/deliveries/[deliveryId]/retry-notification/route';

const params = Promise.resolve({ id: 'project-1' });
const githubUrl = 'https://github.com/acme/client-site';
const handoff = {
  id: 'handoff-1', project_id: 'project-1', github_url: githubUrl,
  note: 'Ready for operator review.', notification_status: 'draft',
  notification_attempts: 0, notification_sent_at: null,
  notification_error: null, created_at: '2026-08-22T12:00:00.000Z',
};
const linkedHandoff = {
  ...handoff,
  notification_idempotency_key: '60000000-0000-4000-8000-000000000106',
  notification_operation_id: 'operation-1',
  projects: { name: 'Client Name', email: 'client@example.test' },
};

function request(body: unknown) {
  return new Request('http://localhost/api/projects/project-1/deliveries', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
}

function lookup(data: unknown) {
  const maybeSingle = vi.fn().mockResolvedValue({ data, error: null });
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  return { select };
}

function insert(data: unknown) {
  const single = vi.fn().mockResolvedValue({ data, error: null });
  const select = vi.fn(() => ({ single }));
  const insert = vi.fn(() => ({ select }));
  return { insert };
}

describe('project GitHub handoff API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyAdmin.mockResolvedValue({ user: { id: 'operator-1' } });
  });

  it.each([401, 403])('returns %s without reading handoffs', async (status) => {
    verifyAdmin.mockResolvedValue({
      error: NextResponse.json({ error: status === 401 ? 'Unauthorized' : 'Forbidden' }, { status }),
    });
    const response = await GET(new Request('http://localhost') as never, { params });
    expect(response.status).toBe(status);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it('accepts only HTTPS GitHub repository links', async () => {
    const response = await POST(request({ githubUrl: 'https://example.com/site' }) as never, { params });
    expect(response.status).toBe(400);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it('creates a draft without requiring client access or sending a notification', async () => {
    const project = lookup({ id: 'project-1' });
    const draft = insert(handoff);
    getSupabaseAdmin.mockReturnValue({
      from: vi.fn()
        .mockReturnValueOnce({ select: project.select })
        .mockReturnValueOnce({ insert: draft.insert }),
    });

    const response = await POST(request({ githubUrl, note: handoff.note }) as never, { params });
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({ draft: true, notificationSent: false, handoff });
    expect(draft.insert).toHaveBeenCalledWith(expect.objectContaining({
      project_id: 'project-1', created_by: 'operator-1',
      notification_status: 'draft', notification_attempts: 0,
    }));
    expect(invalidate).toHaveBeenCalledWith('project:deliveries:project-1:admin');
  });

  it('sends only after explicit operator confirmation and reuses the stored key', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: linkedHandoff, error: null });
    const secondEq = vi.fn(() => ({ maybeSingle }));
    const firstEq = vi.fn(() => ({ eq: secondEq }));
    const select = vi.fn(() => ({ eq: firstEq }));
    getSupabaseAdmin.mockReturnValue({ from: vi.fn(() => ({ select })) });
    sendProjectGithubHandoff.mockResolvedValue({
      providerMessageId: 'resend-handoff-1',
      handoff: { ...handoff, notification_status: 'sent', notification_sent_at: '2026-08-23T12:00:00.000Z' },
    });

    const response = await retryNotification(new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: true }),
    }) as never, {
      params: Promise.resolve({ id: 'project-1', deliveryId: 'handoff-1' }),
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ notificationSent: true });
    expect(sendProjectGithubHandoff).toHaveBeenCalledWith(expect.objectContaining({
      email: 'client@example.test',
      name: 'Client Name',
      githubUrl,
    }), {
      operationKey: linkedHandoff.notification_idempotency_key,
      operationId: linkedHandoff.notification_operation_id,
      handoffId: 'handoff-1',
      projectId: 'project-1',
    });
  });

  it('rejects a handoff send without the explicit confirmation flag', async () => {
    const response = await retryNotification(new Request('http://localhost', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    }) as never, { params: Promise.resolve({ id: 'project-1', deliveryId: 'handoff-1' }) });
    expect(response.status).toBe(400);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });
});
