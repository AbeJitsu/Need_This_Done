import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';

const {
  verifyAdmin,
  verifyProjectAccess,
  getSupabaseAdmin,
  sendProjectGithubHandoff,
  invalidate,
  wrap,
} = vi.hoisted(() => ({
  verifyAdmin: vi.fn(),
  verifyProjectAccess: vi.fn(),
  getSupabaseAdmin: vi.fn(),
  sendProjectGithubHandoff: vi.fn(),
  invalidate: vi.fn().mockResolvedValue(undefined),
  wrap: vi.fn(async (_key: string, fetcher: () => Promise<unknown>) => ({
    data: await fetcher(), cached: false, source: 'database' as const,
  })),
}));

vi.mock('@/lib/api-auth', () => ({ verifyAdmin, verifyProjectAccess }));
vi.mock('@/lib/supabase', () => ({ getSupabaseAdmin }));
vi.mock('@/lib/email-service', () => ({ sendProjectGithubHandoff }));
vi.mock('@/lib/cache', () => ({
  cache: { invalidate, wrap },
  CACHE_KEYS: {
    userProjects: (userId: string) => `user:projects:${userId}`,
    projectDeliveries: (projectId: string, isAdmin: boolean) =>
      `project:deliveries:${projectId}${isAdmin ? ':admin' : ''}`,
  },
}));

import { GET, POST } from '@/app/api/projects/[id]/deliveries/route';
import { POST as retryNotification } from '@/app/api/projects/[id]/deliveries/[deliveryId]/retry-notification/route';

const project = { id: 'project-1', name: 'Client project', email: 'client@example.com', user_id: 'client-1' };
const handoff = {
  id: 'handoff-1', project_id: 'project-1', github_url: 'https://github.com/acme/client-site', note: 'Ready for review.',
  notification_status: 'pending', notification_attempts: 1, notification_sent_at: null, notification_error: null,
  created_at: '2026-07-26T12:00:00.000Z',
};
const projectParams = Promise.resolve({ id: 'project-1' });

function request(body: unknown) {
  return new Request('http://localhost/api/projects/project-1/deliveries', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
}

function singleQuery(data: unknown, error: unknown = null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data, error });
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  return { select, eq, maybeSingle };
}

function insertQuery(data: unknown, error: unknown = null) {
  const single = vi.fn().mockResolvedValue({ data, error });
  const select = vi.fn(() => ({ single }));
  const insert = vi.fn(() => ({ select }));
  return { insert, select, single };
}

function updateQuery(data: unknown, error: unknown = null) {
  const single = vi.fn().mockResolvedValue({ data, error });
  const select = vi.fn(() => ({ single }));
  const eq = vi.fn(() => ({ select }));
  const update = vi.fn(() => ({ eq }));
  return { update, eq, select, single };
}

describe('project GitHub handoff API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyAdmin.mockResolvedValue({ user: { id: 'operator-1' } });
    verifyProjectAccess.mockResolvedValue({ hasAccess: true, isAdmin: false, isOwner: true });
  });

  it('does not access handoffs when project authorization fails', async () => {
    verifyProjectAccess.mockResolvedValue({
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    });

    const response = await GET(new Request('http://localhost') as never, { params: projectParams });

    expect(response.status).toBe(403);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it('does not publish a handoff when the operator check fails', async () => {
    verifyAdmin.mockResolvedValue({
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    });

    const response = await POST(request({ githubUrl: handoff.github_url }) as never, { params: projectParams });

    expect(response.status).toBe(403);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it('accepts only HTTPS GitHub links', async () => {
    const response = await POST(request({ githubUrl: 'https://example.com/client-site' }) as never, { params: projectParams });

    expect(response.status).toBe(400);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it('requires a linked client account before publishing', async () => {
    const lookup = singleQuery({ ...project, user_id: null });
    getSupabaseAdmin.mockReturnValue({ from: vi.fn(() => ({ select: lookup.select })) });

    const response = await POST(request({ githubUrl: handoff.github_url }) as never, { params: projectParams });

    expect(response.status).toBe(409);
    expect(sendProjectGithubHandoff).not.toHaveBeenCalled();
  });

  it('publishes a handoff, emails the linked client, and invalidates both delivery views', async () => {
    const projectLookup = singleQuery(project);
    const insert = insertQuery(handoff);
    const notification = updateQuery({ ...handoff, notification_status: 'sent', notification_sent_at: '2026-07-26T12:01:00.000Z' });
    const from = vi.fn()
      .mockReturnValueOnce({ select: projectLookup.select })
      .mockReturnValueOnce({ insert: insert.insert })
      .mockReturnValueOnce({ update: notification.update });
    getSupabaseAdmin.mockReturnValue({ from });
    sendProjectGithubHandoff.mockResolvedValue('email-1');

    const response = await POST(request({ githubUrl: handoff.github_url, note: handoff.note }) as never, { params: projectParams });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({ notificationSent: true, handoff: { notification_status: 'sent' } });
    expect(insert.insert).toHaveBeenCalledWith(expect.objectContaining({ project_id: 'project-1', created_by: 'operator-1', notification_attempts: 1 }));
    expect(sendProjectGithubHandoff).toHaveBeenCalledWith(expect.objectContaining({ email: project.email, githubUrl: handoff.github_url }));
    expect(invalidate).toHaveBeenCalledWith('user:projects:client-1');
    expect(invalidate).toHaveBeenCalledWith('project:deliveries:project-1:admin');
    expect(invalidate).toHaveBeenCalledWith('project:deliveries:project-1');
  });

  it('publishes the handoff and records a visible failure when email delivery fails', async () => {
    const projectLookup = singleQuery(project);
    const insert = insertQuery(handoff);
    const notification = updateQuery({ ...handoff, notification_status: 'failed', notification_error: 'The delivery email could not be sent. Retry it from this project.' });
    const from = vi.fn()
      .mockReturnValueOnce({ select: projectLookup.select })
      .mockReturnValueOnce({ insert: insert.insert })
      .mockReturnValueOnce({ update: notification.update });
    getSupabaseAdmin.mockReturnValue({ from });
    sendProjectGithubHandoff.mockResolvedValue(null);

    const response = await POST(request({ githubUrl: handoff.github_url }) as never, { params: projectParams });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({ notificationSent: false, handoff: { notification_status: 'failed' } });
  });

  it('claims a failed notification once before retrying it', async () => {
    const projectLookup = singleQuery(project);
    const handoffLookup = (() => {
      const maybeSingle = vi.fn().mockResolvedValue({ data: { ...handoff, notification_status: 'failed', notification_attempts: 1 }, error: null });
      const projectEq = vi.fn(() => ({ maybeSingle }));
      const idEq = vi.fn(() => ({ eq: projectEq }));
      const select = vi.fn(() => ({ eq: idEq }));
      return { select };
    })();
    const claim = (() => {
      const maybeSingle = vi.fn().mockResolvedValue({ data: { id: handoff.id }, error: null });
      const select = vi.fn(() => ({ maybeSingle }));
      const stateEq = vi.fn(() => ({ select }));
      const idEq = vi.fn(() => ({ eq: stateEq }));
      const update = vi.fn(() => ({ eq: idEq }));
      return { update };
    })();
    const notification = updateQuery({ ...handoff, notification_status: 'sent', notification_attempts: 2, notification_sent_at: '2026-07-26T12:01:00.000Z' });
    const from = vi.fn()
      .mockReturnValueOnce({ select: projectLookup.select })
      .mockReturnValueOnce({ select: handoffLookup.select })
      .mockReturnValueOnce({ update: claim.update })
      .mockReturnValueOnce({ update: notification.update });
    getSupabaseAdmin.mockReturnValue({ from });
    sendProjectGithubHandoff.mockResolvedValue('email-2');

    const response = await retryNotification(new Request('http://localhost', { method: 'POST' }) as never, {
      params: Promise.resolve({ id: 'project-1', deliveryId: 'handoff-1' }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ notificationSent: true, handoff: { notification_status: 'sent', notification_attempts: 2 } });
    expect(sendProjectGithubHandoff).toHaveBeenCalledTimes(1);
  });
});
