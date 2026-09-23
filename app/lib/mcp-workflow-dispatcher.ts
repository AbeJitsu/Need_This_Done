import 'server-only';

import { createHash, randomUUID } from 'node:crypto';
import {
  listWorkflowsResultSchema,
  startWorkflowResultSchema,
  workflowStateSchema,
  workflowStatusResultSchema,
  type GetWorkflowStatusInput,
  type WorkflowMcpAuthContext,
  type WorkflowMcpDispatcher,
  type ListWorkflowsInput,
  type StartWorkflowInput,
  type WorkflowStatusResult,
} from '@/lib/workflow-mcp-contract';
import { getSupabaseAdmin } from '@/lib/supabase';

const SELECT_FIELDS = [
  'id',
  'owner_id',
  'request',
  'request_hash',
  'status',
  'approval_required',
  'worker',
  'summary',
  'result_ref',
  'updated_at',
].join(', ');

const INITIAL_SUMMARY = 'Awaiting review. No worker has been assigned.';
const MAX_CURSOR_OFFSET = 10_000;

export type McpWorkflowRow = {
  id: string;
  ownerId: string;
  request: string;
  requestHash: string;
  status: WorkflowStatusResult['status'];
  approvalRequired: boolean;
  worker: string | null;
  summary: string | null;
  resultRef: string | null;
  updatedAt: string;
};

export type McpWorkflowRepository = {
  createDraft(input: {
    ownerId: string;
    request: string;
    requestHash: string;
    idempotencyKey: string;
  }): Promise<McpWorkflowRow>;
  getByOwner(ownerId: string, workflowId: string): Promise<McpWorkflowRow | null>;
  listByOwner(ownerId: string, page: { limit: number; offset: number }): Promise<{
    rows: McpWorkflowRow[];
    hasMore: boolean;
  }>;
};

export class McpWorkflowNotFoundError extends Error {
  constructor() {
    super('The workflow was not found.');
  }
}

export class McpWorkflowCursorError extends Error {
  constructor() {
    super('The workflow cursor is invalid.');
  }
}

export class McpWorkflowConflictError extends Error {
  constructor() {
    super('The idempotency key belongs to a different workflow request.');
  }
}

export class McpWorkflowStorageError extends Error {
  constructor() {
    super('MCP workflow storage is unavailable.');
  }
}

type DatabaseWorkflowRow = {
  id: unknown;
  owner_id: unknown;
  request: unknown;
  request_hash: unknown;
  status: unknown;
  approval_required: unknown;
  worker: unknown;
  summary: unknown;
  result_ref: unknown;
  updated_at: unknown;
};

function requestHash(request: string) {
  return createHash('sha256').update(request).digest('hex');
}

function timestamp(value: unknown) {
  if (typeof value !== 'string') throw new McpWorkflowStorageError();
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds)) throw new McpWorkflowStorageError();
  return new Date(milliseconds).toISOString();
}

function record(value: unknown): DatabaseWorkflowRow {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new McpWorkflowStorageError();
  return value as DatabaseWorkflowRow;
}

function workflowRow(value: unknown): McpWorkflowRow {
  const row = record(value);
  if (
    typeof row.id !== 'string'
    || typeof row.owner_id !== 'string'
    || typeof row.request !== 'string'
    || typeof row.request_hash !== 'string'
    || typeof row.approval_required !== 'boolean'
    || (row.worker !== null && typeof row.worker !== 'string')
    || (row.summary !== null && typeof row.summary !== 'string')
    || (row.result_ref !== null && typeof row.result_ref !== 'string')
    || !workflowStateSchema.safeParse(row.status).success
  ) {
    throw new McpWorkflowStorageError();
  }

  const status = workflowStatusResultSchema.safeParse({
    workflowId: row.id,
    status: row.status,
    updatedAt: timestamp(row.updated_at),
    approvalRequired: row.approval_required,
    worker: row.worker,
    summary: row.summary,
    resultRef: row.result_ref,
  });
  if (!status.success) throw new McpWorkflowStorageError();

  return {
    id: row.id,
    ownerId: row.owner_id,
    request: row.request,
    requestHash: row.request_hash,
    status: status.data.status,
    approvalRequired: status.data.approvalRequired,
    worker: status.data.worker,
    summary: status.data.summary,
    resultRef: status.data.resultRef,
    updatedAt: status.data.updatedAt,
  };
}

function encodeCursor(offset: number) {
  return Buffer.from(JSON.stringify({ version: 1, offset }), 'utf8').toString('base64url');
}

function decodeCursor(cursor: string | undefined) {
  if (!cursor) return 0;
  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as unknown;
    if (
      !parsed
      || typeof parsed !== 'object'
      || Array.isArray(parsed)
      || (parsed as { version?: unknown }).version !== 1
      || !Number.isSafeInteger((parsed as { offset?: unknown }).offset)
      || (parsed as { offset: number }).offset < 0
      || (parsed as { offset: number }).offset > MAX_CURSOR_OFFSET
    ) {
      throw new Error('invalid');
    }
    return (parsed as { offset: number }).offset;
  } catch {
    throw new McpWorkflowCursorError();
  }
}

/**
 * Durable server-side repository for MCP-originated workflow drafts. A record
 * here is a request and review boundary, never a task queue or worker command.
 */
export function createSupabaseMcpWorkflowRepository(): McpWorkflowRepository {
  return {
    async createDraft(input) {
      let admin;
      try {
        admin = getSupabaseAdmin();
      } catch {
        throw new McpWorkflowStorageError();
      }

      const created = await admin
        .from('mcp_workflows')
        .upsert({
          owner_id: input.ownerId,
          request: input.request,
          request_hash: input.requestHash,
          idempotency_key: input.idempotencyKey,
          status: 'draft',
          approval_required: true,
          summary: INITIAL_SUMMARY,
        }, {
          onConflict: 'owner_id,idempotency_key',
          ignoreDuplicates: true,
        });
      if (created.error) throw new McpWorkflowStorageError();

      const existing = await admin
        .from('mcp_workflows')
        .select(SELECT_FIELDS)
        .eq('owner_id', input.ownerId)
        .eq('idempotency_key', input.idempotencyKey)
        .maybeSingle();
      if (existing.error || !existing.data) throw new McpWorkflowStorageError();

      const row = workflowRow(existing.data);
      if (row.request !== input.request || row.requestHash !== input.requestHash) {
        throw new McpWorkflowConflictError();
      }
      return row;
    },

    async getByOwner(ownerId, workflowId) {
      let admin;
      try {
        admin = getSupabaseAdmin();
      } catch {
        throw new McpWorkflowStorageError();
      }

      const result = await admin
        .from('mcp_workflows')
        .select(SELECT_FIELDS)
        .eq('owner_id', ownerId)
        .eq('id', workflowId)
        .maybeSingle();
      if (result.error) throw new McpWorkflowStorageError();
      return result.data ? workflowRow(result.data) : null;
    },

    async listByOwner(ownerId, page) {
      let admin;
      try {
        admin = getSupabaseAdmin();
      } catch {
        throw new McpWorkflowStorageError();
      }

      const result = await admin
        .from('mcp_workflows')
        .select(SELECT_FIELDS)
        .eq('owner_id', ownerId)
        .order('updated_at', { ascending: false })
        .order('id', { ascending: false })
        .range(page.offset, page.offset + page.limit);
      if (result.error) throw new McpWorkflowStorageError();

      const rows = (result.data || []).map(workflowRow);
      return {
        rows: rows.slice(0, page.limit),
        hasMore: rows.length > page.limit,
      };
    },
  };
}

function summary(row: McpWorkflowRow) {
  return {
    workflowId: row.id,
    status: row.status,
    updatedAt: row.updatedAt,
    approvalRequired: row.approvalRequired,
    worker: row.worker,
    summary: row.summary,
  };
}

function status(row: McpWorkflowRow) {
  return {
    ...summary(row),
    resultRef: row.resultRef,
  };
}

/**
 * Connects the small MCP contract to durable request records. It deliberately
 * creates only a review-gated draft; planning, approval, and worker dispatch
 * remain separate actions.
 */
export function createMcpWorkflowDispatcher(
  repository: McpWorkflowRepository = createSupabaseMcpWorkflowRepository(),
): WorkflowMcpDispatcher {
  return {
    async startWorkflow(input: StartWorkflowInput, context: WorkflowMcpAuthContext) {
      const idempotencyKey = input.idempotencyKey || randomUUID();
      const row = await repository.createDraft({
        ownerId: context.ownerId,
        request: input.request,
        requestHash: requestHash(input.request),
        idempotencyKey,
      });
      return startWorkflowResultSchema.parse({
        workflowId: row.id,
        status: 'draft',
        approvalRequired: true,
        nextAction: 'review',
      });
    },

    async getWorkflowStatus(input: GetWorkflowStatusInput, context: WorkflowMcpAuthContext) {
      const row = await repository.getByOwner(context.ownerId, input.workflowId);
      if (!row) throw new McpWorkflowNotFoundError();
      return workflowStatusResultSchema.parse(status(row));
    },

    async listWorkflows(input: ListWorkflowsInput, context: WorkflowMcpAuthContext) {
      const offset = decodeCursor(input.cursor);
      const result = await repository.listByOwner(context.ownerId, { limit: input.limit, offset });
      return listWorkflowsResultSchema.parse({
        workflows: result.rows.map(summary),
        nextCursor: result.hasMore ? encodeCursor(offset + input.limit) : null,
      });
    },
  };
}
