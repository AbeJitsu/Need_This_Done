-- ============================================================================
-- MIGRATION 054: Workflow Automation System
-- ============================================================================
-- What: Complete workflow automation system for event-driven actions
-- Why: Enable no-code automation (product out-of-stock alerts, email campaigns, etc.)
-- How: React Flow nodes → JSONB storage → execution engine → audit log
--
-- Three tables work together:
-- 1. workflows: Define automation rules (trigger type + node graph)
-- 2. workflow_executions: Track each time a workflow runs
-- 3. workflow_logs: Detailed step-by-step execution trace for debugging

-- ============================================================================
-- Create Workflows Table
-- ============================================================================
-- Stores the automation definition: trigger type + React Flow graph
-- Status: draft (editing), active (running), paused (inactive), archived (old)

CREATE TABLE IF NOT EXISTS workflows (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Workflow identity and metadata
  name TEXT NOT NULL,
  description TEXT,

  -- Trigger configuration
  trigger_type TEXT NOT NULL,
    -- Examples: 'product.out_of_stock', 'order.placed', 'customer.signup',
    -- 'order.completed', 'product.created', 'manual'
  trigger_config JSONB DEFAULT '{}',
    -- Trigger-specific settings
    -- E.g., { "product_id": "prod_123", "notify_admins": true }

  -- React Flow graph (nodes and edges)
  nodes JSONB NOT NULL DEFAULT '[]',
    -- Array of React Flow nodes: { id, type, data, position }
    -- Node types: trigger, condition, action (email, webhook, update)
  edges JSONB NOT NULL DEFAULT '[]',
    -- Array of React Flow edges: { id, source, target, sourceHandle, targetHandle }

  -- Workflow state
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused', 'archived')),

  -- Admin metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Create Workflow Executions Table
-- ============================================================================
-- Tracks each time a workflow runs (one row per execution)
-- Status: queued → running → completed (or failed)

CREATE TABLE IF NOT EXISTS workflow_executions (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference to workflow definition
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,

  -- What triggered this execution
  triggered_by TEXT,
    -- Examples:
    -- 'event:product.out_of_stock:prod_123'
    -- 'event:order.placed:order_456'
    -- 'manual:user_789'
    -- 'test_run'

  -- Execution state
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),

  -- Result summary (populated when completed or failed)
  result JSONB,
    -- { "success": true, "actions_executed": 3, "duration_ms": 1234 }
    -- or { "success": false, "actions_executed": 1, "duration_ms": 234 }

  -- Error details (only if status = 'failed')
  error TEXT,

  -- Execution timing
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_test_run BOOLEAN NOT NULL DEFAULT FALSE
);

-- ============================================================================
-- Create Workflow Logs Table
-- ============================================================================
-- Detailed step-by-step trace of what happened during execution
-- For debugging and audit trail

CREATE TABLE IF NOT EXISTS workflow_logs (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference to execution
  execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,

  -- Step tracking
  step_number INTEGER NOT NULL,
    -- Execution order: 1, 2, 3, etc.

  -- Node information
  node_id TEXT NOT NULL,
    -- React Flow node ID: 'node_1', 'node_2', etc.
  node_type TEXT NOT NULL,
    -- 'trigger', 'condition', 'action'
  node_label TEXT,
    -- Human-readable label: 'Check Stock', 'Send Email', etc.

  -- Step data
  input_data JSONB,
    -- What data was passed into this step
    -- { "product_id": "prod_123", "stock": 0 }
  output_data JSONB,
    -- What this step produced
    -- { "should_notify": true, "emails_sent": 5 }

  -- Step execution
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),

  -- Error details (only if status = 'failed')
  error TEXT,

  -- Performance
  duration_ms INTEGER,
    -- How long this step took to execute

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Create Indexes for Fast Lookups
-- ============================================================================

-- Workflows: Fast lookup by status, trigger type, creator
CREATE INDEX IF NOT EXISTS workflows_status_idx ON workflows(status);
CREATE INDEX IF NOT EXISTS workflows_trigger_type_idx ON workflows(trigger_type);
CREATE INDEX IF NOT EXISTS workflows_created_by_idx ON workflows(created_by);
CREATE INDEX IF NOT EXISTS workflows_created_at_idx ON workflows(created_at DESC);

-- Workflow Executions: Fast lookup by workflow, status, creation time
CREATE INDEX IF NOT EXISTS workflow_executions_workflow_id_idx ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS workflow_executions_status_idx ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS workflow_executions_created_at_idx ON workflow_executions(created_at DESC);
CREATE INDEX IF NOT EXISTS workflow_executions_triggered_by_idx ON workflow_executions(triggered_by);

-- Workflow Logs: Fast lookup by execution and step order
CREATE INDEX IF NOT EXISTS workflow_logs_execution_id_idx ON workflow_logs(execution_id);
CREATE INDEX IF NOT EXISTS workflow_logs_step_number_idx ON workflow_logs(execution_id, step_number);
CREATE INDEX IF NOT EXISTS workflow_logs_node_type_idx ON workflow_logs(node_type);

-- ============================================================================
-- Create Function to Update Workflows Timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_workflows_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Create Trigger to Auto-Update Workflows Timestamp
-- ============================================================================

DROP TRIGGER IF EXISTS update_workflows_timestamp_trigger ON workflows;
CREATE TRIGGER update_workflows_timestamp_trigger
BEFORE UPDATE ON workflows
FOR EACH ROW
EXECUTE FUNCTION update_workflows_timestamp();

-- ============================================================================
-- Enable RLS for Security
-- ============================================================================

ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies: Admin-Only Access
-- ============================================================================
-- All three tables: Only admins can view or modify

-- Workflows: Admin full access
CREATE POLICY "admin_workflows_full_access" ON workflows
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid()
    )
  );

-- Workflow Executions: Admin full access
CREATE POLICY "admin_executions_full_access" ON workflow_executions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid()
    )
  );

-- Workflow Logs: Admin full access
CREATE POLICY "admin_logs_full_access" ON workflow_logs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid()
    )
  );

-- System can insert executions and logs (used by workflow engine API)
CREATE POLICY "system_insert_executions" ON workflow_executions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "system_insert_logs" ON workflow_logs
  FOR INSERT
  WITH CHECK (true);

-- System can update executions (status, result, timing)
CREATE POLICY "system_update_executions" ON workflow_executions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- Table Comments
-- ============================================================================

COMMENT ON TABLE workflows IS
  'Automation workflow definitions using React Flow. Defines trigger type and action graph.';

COMMENT ON COLUMN workflows.id IS
  'Unique workflow identifier';

COMMENT ON COLUMN workflows.name IS
  'User-friendly workflow name (e.g., "Notify when product out of stock")';

COMMENT ON COLUMN workflows.description IS
  'Optional description of what this workflow does';

COMMENT ON COLUMN workflows.trigger_type IS
  'When to run: product.out_of_stock, order.placed, customer.signup, manual, etc.';

COMMENT ON COLUMN workflows.trigger_config IS
  'Trigger-specific settings (e.g., which product to monitor, notification recipients)';

COMMENT ON COLUMN workflows.nodes IS
  'React Flow nodes array: { id, type, data, position, ... }';

COMMENT ON COLUMN workflows.edges IS
  'React Flow edges array: { id, source, target, sourceHandle, targetHandle, ... }';

COMMENT ON COLUMN workflows.status IS
  'Workflow state: draft (editing), active (enabled), paused (disabled), archived (old)';

COMMENT ON COLUMN workflows.created_by IS
  'Admin who created this workflow';

COMMENT ON TABLE workflow_executions IS
  'Audit log of each workflow execution. One row = one run.';

COMMENT ON COLUMN workflow_executions.id IS
  'Unique execution identifier';

COMMENT ON COLUMN workflow_executions.workflow_id IS
  'Which workflow ran';

COMMENT ON COLUMN workflow_executions.triggered_by IS
  'What caused this execution: event:type:id, manual:user_id, or test_run';

COMMENT ON COLUMN workflow_executions.status IS
  'Current execution state: queued, running, completed, failed, cancelled';

COMMENT ON COLUMN workflow_executions.result IS
  'Summary JSON: { success: boolean, actions_executed: int, duration_ms: int, ... }';

COMMENT ON COLUMN workflow_executions.error IS
  'Human-readable error message if status=failed';

COMMENT ON COLUMN workflow_executions.started_at IS
  'When execution began (status changed to running)';

COMMENT ON COLUMN workflow_executions.completed_at IS
  'When execution finished (status changed to completed or failed)';

COMMENT ON COLUMN workflow_executions.is_test_run IS
  'True if this was a test execution (no side effects)';

COMMENT ON TABLE workflow_logs IS
  'Detailed step-by-step trace for each workflow execution. For debugging.';

COMMENT ON COLUMN workflow_logs.id IS
  'Unique log entry identifier';

COMMENT ON COLUMN workflow_logs.execution_id IS
  'Which execution this log belongs to';

COMMENT ON COLUMN workflow_logs.step_number IS
  'Execution order (1st step, 2nd step, etc.)';

COMMENT ON COLUMN workflow_logs.node_id IS
  'React Flow node ID (e.g., "node_1", "condition_check_stock")';

COMMENT ON COLUMN workflow_logs.node_type IS
  'Node category: trigger, condition, action';

COMMENT ON COLUMN workflow_logs.node_label IS
  'User-facing label (e.g., "Check Stock Level", "Send Email to Admins")';

COMMENT ON COLUMN workflow_logs.input_data IS
  'Input to this step. Example: { product_id, stock_level, threshold }';

COMMENT ON COLUMN workflow_logs.output_data IS
  'Output from this step. Example: { should_notify: true, emails_sent: 5 }';

COMMENT ON COLUMN workflow_logs.status IS
  'Step outcome: pending, running, completed, failed, skipped';

COMMENT ON COLUMN workflow_logs.error IS
  'Error message if step failed (status=failed)';

COMMENT ON COLUMN workflow_logs.duration_ms IS
  'How long this step took to execute (milliseconds)';

-- ============================================================================
-- Migration Complete
-- ============================================================================
