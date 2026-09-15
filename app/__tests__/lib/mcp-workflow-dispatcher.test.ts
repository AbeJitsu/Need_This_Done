import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/supabase', () => ({ getSupabaseAdmin: vi.fn() }));

import {
  createSupabaseMcpWorkflowRepository,
  createMcpWorkflowDispatcher,
  type McpWorkflowRepository,
  type McpWorkflowRow,
} from '@/lib/mcp-workflow-dispatcher';
import { getSupabaseAdmin } from '@/lib/supabase';

const ownerA = '00000000-0000-4000-8000-000000000001';
const ownerB = '00000000-0000-4000-8000-000000000002';
const workflowId = '11111111-1111-4111-8111-111111111111';
const idempotencyKey = '22222222-2222-4222-8222-222222222222';

function row(overrides: Partial<McpWorkflowRow> = {}): McpWorkflowRow {
  return {
    id: workflowId,
    ownerId: ownerA,
    request: 'Review the newest failed check and prepare a small improvement.',
    requestHash: 'a'.repeat(64),
    status: 'draft',
    approvalRequired: true,
    worker: null,
    summary: 'Awaiting review. No worker has been assigned.',
    resultRef: null,
    updatedAt: '2026-09-15T12:00:00.000Z',
    ...overrides,
  };
}

function repository() {
  const createDraft = vi.fn(async () => row());
  const getByOwner = vi.fn(async (ownerId: string, id: string) => (
    ownerId === ownerA && id === workflowId ? row() : null
  ));
  const listByOwner = vi.fn(async (ownerId: string, page: { limit: number; offset: number }) => ({
    rows: ownerId === ownerA ? [row()] : [],
    hasMore: page.offset === 0,
  }));
  return {
    createDraft,
    getByOwner,
    listByOwner,
  } satisfies McpWorkflowRepository;
}

describe('MCP workflow dispatcher', () => {
  it('stores a draft through the server-side owner-scoped repository', async () => {
    const upsert = vi.fn(async () => ({ error: null }));
    const maybeSingle = vi.fn(async () => ({
      error: null,
      data: {
        id: workflowId,
        owner_id: ownerA,
        request: 'Review the newest failed check and prepare a small improvement.',
        request_hash: 'a'.repeat(64),
        status: 'draft',
        approval_required: true,
        worker: null,
        summary: 'Awaiting review. No worker has been assigned.',
        result_ref: null,
        updated_at: '2026-09-15T12:00:00.000Z',
      },
    }));
    const idempotencyFilter = vi.fn(() => ({ maybeSingle }));
    const ownerFilter = vi.fn(() => ({ eq: idempotencyFilter }));
    const select = vi.fn(() => ({ eq: ownerFilter }));
    const from = vi.fn()
      .mockReturnValueOnce({ upsert })
      .mockReturnValueOnce({ select });
    vi.mocked(getSupabaseAdmin).mockReturnValue({ from } as never);

    const repository = createSupabaseMcpWorkflowRepository();
    await expect(repository.createDraft({
      ownerId: ownerA,
      request: 'Review the newest failed check and prepare a small improvement.',
      requestHash: 'a'.repeat(64),
      idempotencyKey,
    })).resolves.toMatchObject({ id: workflowId, ownerId: ownerA, status: 'draft' });

    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({
      owner_id: ownerA,
      idempotency_key: idempotencyKey,
      status: 'draft',
      approval_required: true,
    }), {
      onConflict: 'owner_id,idempotency_key',
      ignoreDuplicates: true,
    });
    expect(ownerFilter).toHaveBeenCalledWith('owner_id', ownerA);
    expect(idempotencyFilter).toHaveBeenCalledWith('idempotency_key', idempotencyKey);
  });

  it('persists an approval-gated draft without assigning or invoking a worker', async () => {
    const store = repository();
    const dispatcher = createMcpWorkflowDispatcher(store);

    await expect(dispatcher.startWorkflow({
      request: 'Review the newest failed check and prepare a small improvement.',
      idempotencyKey,
    }, {
      ownerId: ownerA,
      credentialId: null,
      authMethod: 'bootstrap',
    })).resolves.toEqual({
      workflowId,
      status: 'draft',
      approvalRequired: true,
      nextAction: 'review',
    });

    expect(store.createDraft).toHaveBeenCalledWith(expect.objectContaining({
      ownerId: ownerA,
      idempotencyKey,
      request: 'Review the newest failed check and prepare a small improvement.',
    }));
  });

  it('reads and lists only records scoped to the authenticated MCP owner', async () => {
    const store = repository();
    const dispatcher = createMcpWorkflowDispatcher(store);
    const context = {
      ownerId: ownerA,
      credentialId: '33333333-3333-4333-8333-333333333333',
      authMethod: 'database' as const,
    };

    await expect(dispatcher.getWorkflowStatus({ workflowId }, context)).resolves.toMatchObject({
      workflowId,
      status: 'draft',
      approvalRequired: true,
      worker: null,
      resultRef: null,
    });
    await expect(dispatcher.listWorkflows({ limit: 2, cursor: undefined }, context)).resolves.toMatchObject({
      workflows: [{ workflowId, status: 'draft', approvalRequired: true }],
    });

    await expect(dispatcher.getWorkflowStatus({ workflowId }, { ...context, ownerId: ownerB }))
      .rejects.toThrow('workflow was not found');
    expect(store.getByOwner).toHaveBeenCalledWith(ownerA, workflowId);
    expect(store.getByOwner).toHaveBeenCalledWith(ownerB, workflowId);
    expect(store.listByOwner).toHaveBeenCalledWith(ownerA, { limit: 2, offset: 0 });
  });

  it('returns an opaque continuation cursor and rejects a malformed cursor', async () => {
    const store = repository();
    const dispatcher = createMcpWorkflowDispatcher(store);
    const context = { ownerId: ownerA, credentialId: null, authMethod: 'bootstrap' as const };

    const first = await dispatcher.listWorkflows({ limit: 2, cursor: undefined }, context);
    expect(first.nextCursor).toMatch(/^[A-Za-z0-9_-]+$/);

    await dispatcher.listWorkflows({ limit: 2, cursor: first.nextCursor || undefined }, context);
    expect(store.listByOwner).toHaveBeenLastCalledWith(ownerA, { limit: 2, offset: 2 });

    await expect(dispatcher.listWorkflows({ limit: 2, cursor: 'not-a-valid-cursor' }, context))
      .rejects.toThrow('workflow cursor is invalid');
  });
});
