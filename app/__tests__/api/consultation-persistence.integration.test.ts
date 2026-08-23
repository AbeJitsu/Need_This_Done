import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getAdminClient } from '@/__tests__/lib/db-security-helpers';

const {
  getSupabaseAdmin,
  sendProjectSubmissionEmails,
  invalidate,
  invalidatePattern,
} = vi.hoisted(() => ({
  getSupabaseAdmin: vi.fn(),
  sendProjectSubmissionEmails: vi.fn().mockResolvedValue(undefined),
  invalidate: vi.fn().mockResolvedValue(undefined),
  invalidatePattern: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/supabase', () => ({ getSupabaseAdmin }));
vi.mock('@/lib/supabase-server', () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
  }),
}));
vi.mock('@/lib/email-service', () => ({ sendProjectSubmissionEmails }));
vi.mock('@/lib/request-dedup', () => ({
  createRequestFingerprint: vi.fn(() => 'local-consultation-test'),
  checkAndMarkRequest: vi.fn().mockResolvedValue(true),
}));
vi.mock('@/lib/api-auth', () => ({
  verifyAdmin: vi.fn().mockResolvedValue({ user: { id: 'local-test-operator' } }),
}));
vi.mock('@/lib/cache', () => ({
  cache: {
    invalidate,
    invalidatePattern,
    wrap: vi.fn(async (_key: string, fetcher: () => Promise<unknown>) => ({
      data: await fetcher(),
      cached: false,
      source: 'database',
    })),
  },
  CACHE_KEYS: {
    userProjects: (userId: string) => `user:projects:${userId}`,
    adminProjects: (status?: string) => status ? `admin:projects:${status}` : 'admin:projects:all',
  },
  CACHE_TTL: { MEDIUM: 60 },
}));

import { POST } from '@/app/api/projects/route';
import { GET } from '@/app/api/projects/all/route';

const testEmail = 'consultation-integration@local.invalid';
let admin: SupabaseClient;
let projectId: string | null = null;

describe('consultation request persistence', () => {
  beforeAll(async () => {
    admin = getAdminClient();
    getSupabaseAdmin.mockReturnValue(admin);
    await admin.from('projects').delete().eq('email', testEmail);
  });

  afterAll(async () => {
    await admin.from('projects').delete().eq('email', testEmail);
  });

  it('stores consultation preferences and returns them through the operator route', async () => {
    const form = new FormData();
    form.set('name', 'Local Consultation Test');
    form.set('email', testEmail);
    form.set('company', 'NeedThisDone Local Test');
    form.set('service', 'AI Growth Employee');
    form.set('message', 'Verify the retained consultation workflow locally.');
    form.set('consultationType', 'strategy');
    form.set('preferredTime', '2026-08-03T14:00:00.000Z');
    form.set('alternateTime', '2026-08-04T15:30:00.000Z');

    const createResponse = await POST(new Request('http://localhost/api/projects', {
      method: 'POST',
      body: form,
    }));
    expect(createResponse.status).toBe(200);
    const created = await createResponse.json();
    projectId = created.projectId;
    expect(projectId).toEqual(expect.any(String));

    const operatorResponse = await GET(new NextRequest(
      `http://localhost/api/projects/all?email=${encodeURIComponent(testEmail)}`,
    ));
    expect(operatorResponse.status).toBe(200);
    const body = await operatorResponse.json();
    expect(body).toMatchObject({ count: 1, cached: false, source: 'database' });
    expect(body.projects[0]).toMatchObject({
      id: projectId,
      email: testEmail,
      consultation_type: 'strategy',
      preferred_consultation_at: '2026-08-03T14:00:00+00:00',
      alternate_consultation_at: '2026-08-04T15:30:00+00:00',
    });
    expect(sendProjectSubmissionEmails).toHaveBeenCalledOnce();
    expect(sendProjectSubmissionEmails).toHaveBeenCalledWith(
      expect.objectContaining({ projectId }),
      testEmail,
      expect.any(Object),
      {
        admin: {
          operationKey: `project:${projectId}:admin-notification`,
          domainReference: `project:${projectId}:admin-notification`,
          projectId,
        },
        client: {
          operationKey: `project:${projectId}:requester-confirmation`,
          domainReference: `project:${projectId}:requester-confirmation`,
          projectId,
        },
      },
    );
    expect(invalidatePattern).toHaveBeenCalledWith('admin:projects:*');
  });
});
