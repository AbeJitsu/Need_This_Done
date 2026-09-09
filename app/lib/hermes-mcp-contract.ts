import { z } from 'zod';

// Transport-neutral contract for the stable MCP control-plane surface.
//
// ChatGPT must be able to call this contract from the MacBook Pro, Mac mini,
// or another approved client. Device selection belongs to Hermes/worker
// scheduling, not to the MCP caller and not to the durable workflow identity.

export const MCP_TOOL_NAMES = [
  'start_workflow',
  'get_workflow_status',
  'list_workflows',
] as const;

export const MCP_TOOL_DESCRIPTIONS = {
  start_workflow: 'Create an approval-gated workflow draft from a natural-language request.',
  get_workflow_status: 'Read the current reviewable state of one workflow.',
  list_workflows: 'List recent workflows without exposing internal records or credentials.',
} as const;

const workflowIdSchema = z.string().uuid();
const timestampSchema = z.string().datetime();

export const startWorkflowInputSchema = z.object({
  request: z.string().trim().min(1).max(12_000),
  idempotencyKey: workflowIdSchema.optional(),
}).strict();

export const getWorkflowStatusInputSchema = z.object({
  workflowId: workflowIdSchema,
}).strict();

export const listWorkflowsInputSchema = z.object({
  limit: z.number().int().min(1).max(50).default(20),
  cursor: z.string().trim().min(1).max(256).optional(),
}).strict().transform((value) => ({
  limit: value.limit,
  cursor: value.cursor,
}));

export const workflowStateSchema = z.enum([
  'draft',
  'awaiting_approval',
  'queued',
  'running',
  'completed',
  'failed',
  'stopped',
]);

const workflowSummarySchema = z.object({
  workflowId: workflowIdSchema,
  status: workflowStateSchema,
  updatedAt: timestampSchema,
  approvalRequired: z.boolean(),
  worker: z.string().trim().min(1).max(160).nullable(),
  summary: z.string().trim().max(2_000).nullable(),
}).strict();

export const startWorkflowResultSchema = z.object({
  workflowId: workflowIdSchema,
  status: z.literal('draft'),
  approvalRequired: z.literal(true),
  nextAction: z.literal('review'),
}).strict();

export const workflowStatusResultSchema = workflowSummarySchema.extend({
  resultRef: z.string().trim().max(512).nullable(),
}).strict().superRefine((value, context) => {
  const approvalRequired = value.status === 'draft' || value.status === 'awaiting_approval';
  if (value.approvalRequired !== approvalRequired) {
    context.addIssue({
      code: 'custom',
      path: ['approvalRequired'],
      message: 'Approval state must match the workflow status.',
    });
  }
});

export const listWorkflowsResultSchema = z.object({
  workflows: z.array(workflowSummarySchema).max(50),
  nextCursor: z.string().trim().max(256).nullable(),
}).strict();

export type StartWorkflowInput = z.infer<typeof startWorkflowInputSchema>;
export type GetWorkflowStatusInput = z.infer<typeof getWorkflowStatusInputSchema>;
export type ListWorkflowsInput = z.infer<typeof listWorkflowsInputSchema>;
export type StartWorkflowResult = z.infer<typeof startWorkflowResultSchema>;
export type WorkflowStatusResult = z.infer<typeof workflowStatusResultSchema>;
export type ListWorkflowsResult = z.infer<typeof listWorkflowsResultSchema>;
