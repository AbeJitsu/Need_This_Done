import { describe, expect, it } from 'vitest';
import {
  getWorkflowStatusInputSchema,
  listWorkflowsInputSchema,
  listWorkflowsResultSchema,
  MCP_TOOL_NAMES,
  startWorkflowInputSchema,
  startWorkflowResultSchema,
  workflowStatusResultSchema,
} from '@/lib/hermes-mcp-contract';

const workflowId = '11111111-1111-4111-8111-111111111111';

describe('Hermes MCP workflow contract', () => {
  it('exposes exactly the three read/create workflow tools', () => {
    expect(MCP_TOOL_NAMES).toEqual([
      'start_workflow',
      'get_workflow_status',
      'list_workflows',
    ]);
  });

  it('accepts a bounded natural-language request and rejects server-owned fields', () => {
    expect(startWorkflowInputSchema.safeParse({
      request: 'Fix the broken deployment check and return the commit evidence.',
      idempotencyKey: workflowId,
    }).success).toBe(true);

    expect(startWorkflowInputSchema.safeParse({
      request: 'Do the work.',
      workflowId,
      status: 'running',
      approved: true,
    }).success).toBe(false);
    expect(startWorkflowInputSchema.safeParse({ request: 'x'.repeat(12_001) }).success).toBe(false);
  });

  it('requires every started workflow to remain approval-gated', () => {
    const result = startWorkflowResultSchema.safeParse({
      workflowId,
      status: 'draft',
      approvalRequired: true,
      nextAction: 'review',
    });
    expect(result.success).toBe(true);
    expect(startWorkflowResultSchema.safeParse({
      workflowId,
      status: 'queued',
      approvalRequired: false,
      nextAction: 'wait',
    }).success).toBe(false);
  });

  it('validates status lookups and returns bounded reviewable state', () => {
    expect(getWorkflowStatusInputSchema.safeParse({ workflowId }).success).toBe(true);
    expect(getWorkflowStatusInputSchema.safeParse({ workflowId: 'not-a-uuid' }).success).toBe(false);
    expect(workflowStatusResultSchema.safeParse({
      workflowId,
      status: 'running',
      updatedAt: '2026-09-09T16:00:00.000Z',
      approvalRequired: false,
      worker: 'codex',
      summary: 'The worker is running focused checks.',
      resultRef: null,
    }).success).toBe(true);
  });

  it('bounds workflow listings and returns a cursor rather than internal records', () => {
    expect(listWorkflowsInputSchema.parse({})).toEqual({ limit: 20, cursor: undefined });
    expect(listWorkflowsInputSchema.safeParse({ limit: 51 }).success).toBe(false);
    expect(listWorkflowsResultSchema.safeParse({
      workflows: [{
        workflowId,
        status: 'completed',
        updatedAt: '2026-09-09T16:00:00.000Z',
        approvalRequired: false,
        worker: 'codex',
        summary: 'Checks passed.',
      }],
      nextCursor: null,
    }).success).toBe(true);
  });
});
