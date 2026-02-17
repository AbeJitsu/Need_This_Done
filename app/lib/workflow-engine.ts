import { Queue, Worker, Job } from 'bullmq';
import { getSupabaseAdmin } from '@/lib/supabase';
import {
  WorkflowEventName,
  onWorkflowEvent,
  getSampleData,
  WORKFLOW_TRIGGERS,
} from '@/lib/workflow-events';

// ============================================================================
// WORKFLOW ENGINE
// ============================================================================
// What: Async workflow execution engine using BullMQ
// Why: Execute automation workflows in background without blocking requests
// How: Event fires → find matching workflows → queue execution → worker processes
//
// Architecture:
//   Event (order.placed) → WorkflowEngine.handleEvent()
//     → Query DB for active workflows with matching trigger_type
//     → For each match: add job to BullMQ queue
//     → Worker picks up job → walks the node graph → executes actions
//     → Logs every step to workflow_logs table
//
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

interface WorkflowNodeRow {
  id: string;
  type: 'trigger' | 'condition' | 'action';
  position: { x: number; y: number };
  data: {
    label: string;
    config?: Record<string, unknown>;
  };
}

interface WorkflowEdgeRow {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  label?: string;
}

interface ExecutionJob {
  workflowId: string;
  workflowName: string;
  triggeredBy: string;
  eventData: Record<string, unknown>;
  isTestRun: boolean;
}

interface StepResult {
  nodeId: string;
  nodeType: string;
  nodeLabel: string;
  status: 'completed' | 'failed' | 'skipped';
  inputData: Record<string, unknown>;
  outputData: Record<string, unknown>;
  error?: string;
  durationMs: number;
}

// ============================================================================
// REDIS CONNECTION CONFIG
// ============================================================================
// BullMQ uses ioredis internally, configured with same Redis URL

function getRedisConnection() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn('[WorkflowEngine] REDIS_URL not set, using localhost');
    return { host: 'localhost', port: 6379 };
  }

  // Parse Upstash Redis URL (rediss://default:password@host:port)
  try {
    const url = new URL(redisUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port || '6379', 10),
      password: url.password || undefined,
      tls: url.protocol === 'rediss:' ? {} : undefined,
      maxRetriesPerRequest: null, // Required by BullMQ
    };
  } catch {
    console.error('[WorkflowEngine] Failed to parse REDIS_URL');
    return { host: 'localhost', port: 6379, maxRetriesPerRequest: null };
  }
}

// ============================================================================
// QUEUE SETUP
// ============================================================================

const QUEUE_NAME = 'workflow-execution';

let queue: Queue | null = null;
let worker: Worker | null = null;

function getQueue(): Queue {
  if (!queue) {
    queue = new Queue(QUEUE_NAME, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000, // 1s, 2s, 4s
        },
        removeOnComplete: { count: 100 }, // Keep last 100 completed
        removeOnFail: { count: 50 },      // Keep last 50 failed
      },
    });
  }
  return queue;
}

// ============================================================================
// CONDITION EVALUATOR
// ============================================================================
// Evaluates if/else conditions against event data

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function evaluateCondition(
  condition: { field: string; operator: string; value: string | number | boolean },
  eventData: Record<string, unknown>
): boolean {
  const fieldValue = getNestedValue(eventData, condition.field);

  switch (condition.operator) {
    case 'eq':
      return fieldValue === condition.value;
    case 'neq':
      return fieldValue !== condition.value;
    case 'gt':
      return typeof fieldValue === 'number' && fieldValue > Number(condition.value);
    case 'gte':
      return typeof fieldValue === 'number' && fieldValue >= Number(condition.value);
    case 'lt':
      return typeof fieldValue === 'number' && fieldValue < Number(condition.value);
    case 'lte':
      return typeof fieldValue === 'number' && fieldValue <= Number(condition.value);
    case 'contains':
      return typeof fieldValue === 'string' && fieldValue.includes(String(condition.value));
    case 'not_contains':
      return typeof fieldValue === 'string' && !fieldValue.includes(String(condition.value));
    default:
      console.warn(`[WorkflowEngine] Unknown operator: ${condition.operator}`);
      return false;
  }
}

// ============================================================================
// ACTION EXECUTORS
// ============================================================================
// Each action type has a handler that performs the actual work

type ActionExecutor = (
  config: Record<string, unknown>,
  eventData: Record<string, unknown>,
  isTestRun: boolean
) => Promise<Record<string, unknown>>;

const actionExecutors: Record<string, ActionExecutor> = {
  send_email: async (config, eventData, isTestRun) => {
    const toField = config.toField as string;
    const recipientEmail = getNestedValue(eventData, toField) as string;
    const subject = interpolateTemplate(config.subject as string, eventData);
    const body = interpolateTemplate(config.body as string, eventData);

    if (isTestRun) {
      return {
        action: 'send_email',
        wouldSendTo: recipientEmail || 'unknown',
        subject,
        body: body.substring(0, 200),
        skipped: true,
        reason: 'Test run - no email sent',
      };
    }

    // Dynamic import to avoid bundling issues (matches project pattern)
    try {
      const { sendEmailWithRetry } = await import('@/lib/email');
      const React = await import('react');
      // Create a simple React element for the email body
      const emailContent = React.createElement('div', null,
        body.split('\n').map((line: string, i: number) =>
          React.createElement('p', { key: i, style: { margin: '0 0 8px 0' } }, line)
        )
      );
      const messageId = await sendEmailWithRetry(
        recipientEmail,
        subject,
        emailContent
      );
      return { action: 'send_email', sentTo: recipientEmail, subject, messageId };
    } catch (error) {
      throw new Error(`Failed to send email to ${recipientEmail}: ${error}`);
    }
  },

  tag_customer: async (config, eventData, isTestRun) => {
    const tag = config.tag as string;
    const customerId = (eventData.customerId as string) || '';

    if (isTestRun) {
      return { action: 'tag_customer', wouldTag: customerId, tag, skipped: true };
    }

    const supabase = getSupabaseAdmin();
    // Add tag to customer metadata (upsert pattern)
    const { data, error } = await supabase
      .from('profiles')
      .select('metadata')
      .eq('id', customerId)
      .single();

    if (error) throw new Error(`Failed to fetch customer ${customerId}: ${error.message}`);

    const currentTags = ((data?.metadata as Record<string, unknown>)?.tags as string[]) || [];
    if (!currentTags.includes(tag)) {
      currentTags.push(tag);
      await supabase
        .from('profiles')
        .update({ metadata: { ...(data?.metadata as Record<string, unknown>), tags: currentTags } })
        .eq('id', customerId);
    }

    return { action: 'tag_customer', customerId, tag, added: !currentTags.includes(tag) };
  },

  tag_order: async (config, eventData, isTestRun) => {
    const tag = config.tag as string;
    const orderId = (eventData.orderId as string) || '';

    if (isTestRun) {
      return { action: 'tag_order', wouldTag: orderId, tag, skipped: true };
    }

    // Tag order in Supabase metadata
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('orders')
      .select('metadata')
      .eq('id', orderId)
      .single();

    if (error) throw new Error(`Failed to fetch order ${orderId}: ${error.message}`);

    const currentTags = ((data?.metadata as Record<string, unknown>)?.tags as string[]) || [];
    if (!currentTags.includes(tag)) {
      currentTags.push(tag);
      await supabase
        .from('orders')
        .update({ metadata: { ...(data?.metadata as Record<string, unknown>), tags: currentTags } })
        .eq('id', orderId);
    }

    return { action: 'tag_order', orderId, tag };
  },

  tag_product: async (config, eventData, isTestRun) => {
    const tag = config.tag as string;
    const productId = (eventData.productId as string) || '';

    if (isTestRun) {
      return { action: 'tag_product', wouldTag: productId, tag, skipped: true };
    }

    return { action: 'tag_product', productId, tag, note: 'Product tagging via Medusa API' };
  },

  webhook: async (config, eventData, isTestRun) => {
    const url = config.url as string;
    const method = (config.method as string) || 'POST';
    const headers = (config.headers as Record<string, string>) || {};
    const bodyTemplate = config.bodyTemplate as string | undefined;

    const body = bodyTemplate
      ? interpolateTemplate(bodyTemplate, eventData)
      : JSON.stringify(eventData);

    if (isTestRun) {
      return {
        action: 'webhook',
        wouldCallUrl: url,
        method,
        bodyPreview: body.substring(0, 200),
        skipped: true,
      };
    }

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: method !== 'GET' ? body : undefined,
      signal: AbortSignal.timeout(8000), // 8s timeout (matches project pattern)
    });

    return {
      action: 'webhook',
      url,
      method,
      statusCode: response.status,
      success: response.ok,
    };
  },

  update_product_status: async (config, eventData, isTestRun) => {
    const status = config.status as string;
    const productId = (eventData.productId as string) || '';

    if (isTestRun) {
      return { action: 'update_product_status', wouldUpdate: productId, newStatus: status, skipped: true };
    }

    return { action: 'update_product_status', productId, newStatus: status, note: 'Update via Medusa API' };
  },

  create_notification: async (config, eventData, isTestRun) => {
    const message = interpolateTemplate(config.message as string, eventData);
    const priority = (config.priority as string) || 'medium';

    if (isTestRun) {
      return { action: 'create_notification', message, priority, skipped: true };
    }

    // Store notification in database
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('admin_notifications').insert({
      message,
      priority,
      source: 'workflow',
      metadata: { eventData },
    });

    if (error) {
      console.warn('[WorkflowEngine] Notification insert failed (table may not exist):', error.message);
    }

    return { action: 'create_notification', message, priority, created: !error };
  },
};

// ============================================================================
// TEMPLATE INTERPOLATION
// ============================================================================
// Replace {{field}} placeholders with event data values

function interpolateTemplate(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
    const value = getNestedValue(data, path);
    return value !== undefined ? String(value) : match;
  });
}

// ============================================================================
// GRAPH WALKER
// ============================================================================
// Walks the React Flow node graph to determine execution order

function getNextNodes(
  currentNodeId: string,
  edges: WorkflowEdgeRow[],
  nodes: WorkflowNodeRow[],
  conditionResult?: boolean
): WorkflowNodeRow[] {
  // Find edges leaving the current node
  let outgoingEdges = edges.filter((e) => e.source === currentNodeId);

  // For condition nodes, filter by sourceHandle (true/false)
  if (conditionResult !== undefined) {
    const handleValue = conditionResult ? 'true' : 'false';
    outgoingEdges = outgoingEdges.filter(
      (e) => !e.sourceHandle || e.sourceHandle === handleValue
    );
  }

  // Map edges to target nodes
  return outgoingEdges
    .map((edge) => nodes.find((n) => n.id === edge.target))
    .filter((n): n is WorkflowNodeRow => n !== undefined);
}

function getTriggerNode(nodes: WorkflowNodeRow[]): WorkflowNodeRow | undefined {
  return nodes.find((n) => n.type === 'trigger');
}

// ============================================================================
// WORKFLOW EXECUTOR
// ============================================================================
// Core execution logic: walks the graph, evaluates conditions, runs actions

async function executeWorkflow(job: ExecutionJob): Promise<StepResult[]> {
  const supabase = getSupabaseAdmin();
  const { workflowId, triggeredBy, eventData, isTestRun } = job;

  // Fetch workflow definition
  const { data: workflow, error: fetchError } = await supabase
    .from('workflows')
    .select('*')
    .eq('id', workflowId)
    .single();

  if (fetchError || !workflow) {
    throw new Error(`Workflow ${workflowId} not found: ${fetchError?.message}`);
  }

  const nodes = workflow.nodes as WorkflowNodeRow[];
  const edges = workflow.edges as WorkflowEdgeRow[];
  const steps: StepResult[] = [];

  // Create execution record
  const { data: execution, error: execError } = await supabase
    .from('workflow_executions')
    .insert({
      workflow_id: workflowId,
      triggered_by: triggeredBy,
      status: 'running',
      is_test_run: isTestRun,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (execError || !execution) {
    throw new Error(`Failed to create execution record: ${execError?.message}`);
  }

  const executionId = execution.id;

  try {
    // Start from trigger node
    const triggerNode = getTriggerNode(nodes);
    if (!triggerNode) {
      throw new Error('Workflow has no trigger node');
    }

    // BFS through the graph
    const queue: { node: WorkflowNodeRow; data: Record<string, unknown> }[] = [];

    // Log trigger step
    const triggerStep: StepResult = {
      nodeId: triggerNode.id,
      nodeType: 'trigger',
      nodeLabel: triggerNode.data.label,
      status: 'completed',
      inputData: eventData,
      outputData: eventData,
      durationMs: 0,
    };
    steps.push(triggerStep);

    // Add trigger's children to processing queue
    const triggerChildren = getNextNodes(triggerNode.id, edges, nodes);
    for (const child of triggerChildren) {
      queue.push({ node: child, data: eventData });
    }

    // Process nodes breadth-first
    while (queue.length > 0) {
      const current = queue.shift()!;
      const { node, data } = current;
      const stepStart = Date.now();

      let stepResult: StepResult;

      if (node.type === 'condition') {
        // Evaluate condition
        const config = node.data.config as { field: string; operator: string; value: string | number | boolean } | undefined;

        if (!config) {
          stepResult = {
            nodeId: node.id,
            nodeType: 'condition',
            nodeLabel: node.data.label,
            status: 'failed',
            inputData: data,
            outputData: {},
            error: 'Condition node has no configuration',
            durationMs: Date.now() - stepStart,
          };
        } else {
          const result = evaluateCondition(config, data);
          stepResult = {
            nodeId: node.id,
            nodeType: 'condition',
            nodeLabel: node.data.label,
            status: 'completed',
            inputData: data,
            outputData: { conditionResult: result, field: config.field, operator: config.operator, value: config.value },
            durationMs: Date.now() - stepStart,
          };

          // Add next nodes based on condition result
          const nextNodes = getNextNodes(node.id, edges, nodes, result);
          for (const next of nextNodes) {
            queue.push({ node: next, data });
          }
        }
      } else if (node.type === 'action') {
        // Execute action
        const actionType = (node.data.config?.actionType as string) || '';
        const actionConfig = node.data.config || {};
        const executor = actionExecutors[actionType];

        if (!executor) {
          stepResult = {
            nodeId: node.id,
            nodeType: 'action',
            nodeLabel: node.data.label,
            status: 'failed',
            inputData: data,
            outputData: {},
            error: `Unknown action type: ${actionType}`,
            durationMs: Date.now() - stepStart,
          };
        } else {
          try {
            const output = await executor(actionConfig, data, isTestRun);
            stepResult = {
              nodeId: node.id,
              nodeType: 'action',
              nodeLabel: node.data.label,
              status: 'completed',
              inputData: data,
              outputData: output,
              durationMs: Date.now() - stepStart,
            };

            // Add next nodes (actions can chain to more actions/conditions)
            const nextNodes = getNextNodes(node.id, edges, nodes);
            for (const next of nextNodes) {
              queue.push({ node: next, data: { ...data, ...output } });
            }
          } catch (error) {
            stepResult = {
              nodeId: node.id,
              nodeType: 'action',
              nodeLabel: node.data.label,
              status: 'failed',
              inputData: data,
              outputData: {},
              error: error instanceof Error ? error.message : String(error),
              durationMs: Date.now() - stepStart,
            };
          }
        }
      } else {
        // Unknown node type — skip
        stepResult = {
          nodeId: node.id,
          nodeType: node.type,
          nodeLabel: node.data.label,
          status: 'skipped',
          inputData: data,
          outputData: {},
          durationMs: Date.now() - stepStart,
        };
      }

      steps.push(stepResult);

      // Log step to database
      await supabase.from('workflow_logs').insert({
        execution_id: executionId,
        step_number: steps.length,
        node_id: stepResult.nodeId,
        node_type: stepResult.nodeType,
        node_label: stepResult.nodeLabel,
        input_data: stepResult.inputData,
        output_data: stepResult.outputData,
        status: stepResult.status,
        error: stepResult.error || null,
        duration_ms: stepResult.durationMs,
      });
    }

    // Update execution as completed
    const totalDuration = steps.reduce((sum, s) => sum + s.durationMs, 0);
    const actionsExecuted = steps.filter((s) => s.nodeType === 'action' && s.status === 'completed').length;
    const failedSteps = steps.filter((s) => s.status === 'failed').length;

    await supabase
      .from('workflow_executions')
      .update({
        status: failedSteps > 0 ? 'failed' : 'completed',
        result: {
          success: failedSteps === 0,
          totalSteps: steps.length,
          actionsExecuted,
          failedSteps,
          durationMs: totalDuration,
        },
        completed_at: new Date().toISOString(),
      })
      .eq('id', executionId);

    return steps;
  } catch (error) {
    // Mark execution as failed
    await supabase
      .from('workflow_executions')
      .update({
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
        completed_at: new Date().toISOString(),
      })
      .eq('id', executionId);

    throw error;
  }
}

// ============================================================================
// BULLMQ WORKER
// ============================================================================
// Background worker that processes queued workflow executions

function startWorker(): Worker {
  if (worker) return worker;

  worker = new Worker(
    QUEUE_NAME,
    async (job: Job<ExecutionJob>) => {
      console.log(`[WorkflowEngine] Processing job ${job.id}: ${job.data.workflowName}`);

      try {
        const steps = await executeWorkflow(job.data);
        const failed = steps.filter((s) => s.status === 'failed');

        if (failed.length > 0) {
          console.warn(`[WorkflowEngine] Workflow ${job.data.workflowName} completed with ${failed.length} failed steps`);
        } else {
          console.log(`[WorkflowEngine] Workflow ${job.data.workflowName} completed successfully (${steps.length} steps)`);
        }

        return { steps, success: failed.length === 0 };
      } catch (error) {
        console.error(`[WorkflowEngine] Workflow ${job.data.workflowName} failed:`, error);
        throw error;
      }
    },
    {
      connection: getRedisConnection(),
      concurrency: 5, // Process up to 5 workflows simultaneously
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`[WorkflowEngine] Job ${job?.id} failed after ${job?.attemptsMade} attempts:`, err.message);
  });

  worker.on('completed', (job) => {
    console.log(`[WorkflowEngine] Job ${job.id} completed`);
  });

  return worker;
}

// ============================================================================
// EVENT HANDLER — Connects events to workflow execution
// ============================================================================

async function handleEvent(
  eventType: WorkflowEventName,
  eventData: Record<string, unknown>
): Promise<void> {
  const supabase = getSupabaseAdmin();

  // Find active workflows matching this trigger type
  const { data: workflows, error } = await supabase
    .from('workflows')
    .select('id, name, trigger_type, trigger_config')
    .eq('trigger_type', eventType)
    .eq('status', 'active');

  if (error) {
    console.error(`[WorkflowEngine] Failed to query workflows for ${eventType}:`, error.message);
    return;
  }

  if (!workflows || workflows.length === 0) {
    console.log(`[WorkflowEngine] No active workflows for trigger: ${eventType}`);
    return;
  }

  console.log(`[WorkflowEngine] Found ${workflows.length} workflow(s) for ${eventType}`);

  // Queue each matching workflow for execution
  const q = getQueue();
  for (const wf of workflows) {
    await q.add(`exec-${wf.id}`, {
      workflowId: wf.id,
      workflowName: wf.name,
      triggeredBy: `event:${eventType}:${Date.now()}`,
      eventData,
      isTestRun: false,
    } satisfies ExecutionJob);

    console.log(`[WorkflowEngine] Queued workflow "${wf.name}" (${wf.id})`);
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Initialize the workflow engine
 * - Starts the BullMQ worker
 * - Registers event listeners for all trigger types
 *
 * Call this once at app startup (e.g., in a server-side init file)
 */
export function initWorkflowEngine(): void {
  if (process.env.WORKFLOW_ENGINE_ENABLED !== 'true') {
    console.log('[WorkflowEngine] Disabled (set WORKFLOW_ENGINE_ENABLED=true to enable)');
    return;
  }

  console.log('[WorkflowEngine] Initializing...');

  // Start the background worker
  startWorker();

  // Register listeners for all event types
  for (const trigger of WORKFLOW_TRIGGERS) {
    onWorkflowEvent(trigger.type, async (data) => {
      await handleEvent(trigger.type, data as unknown as Record<string, unknown>);
    });
  }

  console.log(`[WorkflowEngine] Listening for ${WORKFLOW_TRIGGERS.length} trigger types`);
}

/**
 * Manually trigger a workflow execution
 * Used by the admin dashboard "Run Now" button
 */
export async function triggerWorkflow(
  workflowId: string,
  triggeredBy: string,
  customData?: Record<string, unknown>
): Promise<string> {
  const supabase = getSupabaseAdmin();

  const { data: workflow, error } = await supabase
    .from('workflows')
    .select('id, name, trigger_type')
    .eq('id', workflowId)
    .single();

  if (error || !workflow) {
    throw new Error(`Workflow ${workflowId} not found`);
  }

  // Use sample data if no custom data provided
  const eventData = customData || getSampleData(workflow.trigger_type as WorkflowEventName) || {};

  const q = getQueue();
  const job = await q.add(`manual-${workflowId}`, {
    workflowId: workflow.id,
    workflowName: workflow.name,
    triggeredBy: `manual:${triggeredBy}`,
    eventData,
    isTestRun: false,
  } satisfies ExecutionJob);

  return job.id || workflowId;
}

/**
 * Execute a test run of a workflow
 * Uses sample data, skips side effects (no real emails, no DB writes)
 * Returns step-by-step execution trace for the UI
 */
export async function testRunWorkflow(
  workflowId: string,
  customData?: Record<string, unknown>
): Promise<StepResult[]> {
  const supabase = getSupabaseAdmin();

  const { data: workflow, error } = await supabase
    .from('workflows')
    .select('id, name, trigger_type')
    .eq('id', workflowId)
    .single();

  if (error || !workflow) {
    throw new Error(`Workflow ${workflowId} not found`);
  }

  // Use sample data for test runs
  const eventData = customData || getSampleData(workflow.trigger_type as WorkflowEventName) || {};

  // Execute synchronously (not queued) for immediate feedback
  const steps = await executeWorkflow({
    workflowId: workflow.id,
    workflowName: workflow.name,
    triggeredBy: 'test_run',
    eventData,
    isTestRun: true,
  });

  return steps;
}

/**
 * Get execution history for a workflow
 */
export async function getWorkflowExecutions(
  workflowId: string,
  limit = 20
): Promise<unknown[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('workflow_executions')
    .select('*')
    .eq('workflow_id', workflowId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch executions: ${error.message}`);
  }

  return data || [];
}

/**
 * Get detailed logs for an execution
 */
export async function getExecutionLogs(
  executionId: string
): Promise<unknown[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('workflow_logs')
    .select('*')
    .eq('execution_id', executionId)
    .order('step_number', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch logs: ${error.message}`);
  }

  return data || [];
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}> {
  const q = getQueue();
  const [waiting, active, completed, failed] = await Promise.all([
    q.getWaitingCount(),
    q.getActiveCount(),
    q.getCompletedCount(),
    q.getFailedCount(),
  ]);

  return { waiting, active, completed, failed };
}

/**
 * Gracefully shutdown the workflow engine
 */
export async function shutdownWorkflowEngine(): Promise<void> {
  console.log('[WorkflowEngine] Shutting down...');

  if (worker) {
    await worker.close();
    worker = null;
  }

  if (queue) {
    await queue.close();
    queue = null;
  }

  console.log('[WorkflowEngine] Shutdown complete');
}
