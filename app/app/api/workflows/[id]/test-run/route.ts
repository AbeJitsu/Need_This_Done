import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';
import { handleApiError, badRequest, notFound } from '@/lib/api-errors';
import { getSupabaseAdmin } from '@/lib/supabase';
import { testRunWorkflow } from '@/lib/workflow-engine';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// ============================================================================
// Workflow Test Run API Route - /api/workflows/[id]/test-run
// ============================================================================
// POST: Execute a test run of a workflow (synchronous)
//
// What: Admin endpoint to preview workflow execution without side effects
// Why: Admins need to validate workflow logic before activating it
// How: Executes workflow synchronously, logs each step, returns execution trace

// ============================================================================
// POST - Test Run Workflow (Admin Only)
// ============================================================================

// Schema for test run request
const TestRunWorkflowSchema = z.object({
  customData: z.record(z.string(), z.unknown()).optional(),
});

type TestRunWorkflowRequest = z.infer<typeof TestRunWorkflowSchema>;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ====================================================================
    // Verify Admin Access
    // ====================================================================
    const adminResult = await verifyAdmin();
    if (adminResult.error) return adminResult.error;

    const workflowId = params.id;

    // ====================================================================
    // Parse Request Body
    // ====================================================================
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest('Invalid JSON in request body');
    }

    // ====================================================================
    // Validate Request Schema
    // ====================================================================
    const validationResult = TestRunWorkflowSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((issue) => {
        const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
        return `${path}${issue.message}`;
      });
      return badRequest(`Validation failed: ${errors.join(', ')}`);
    }

    const { customData } = validationResult.data as TestRunWorkflowRequest;

    // ====================================================================
    // Verify Workflow Exists
    // ====================================================================
    const supabase = getSupabaseAdmin();
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('id, status, name, nodes, edges')
      .eq('id', workflowId)
      .single();

    if (workflowError || !workflow) {
      return notFound('Workflow not found');
    }

    // ====================================================================
    // Execute Test Run (Synchronous)
    // ====================================================================
    // The testRunWorkflow function:
    // 1. Executes workflow steps synchronously
    // 2. Logs step inputs, outputs, duration
    // 3. Returns array of StepResult with detailed trace
    // 4. Does NOT create side effects (no emails sent, no data updated)
    let executionTrace: Array<{
      nodeId: string;
      nodeType: string;
      nodeLabel: string;
      status: 'completed' | 'failed' | 'skipped';
      inputData: Record<string, unknown>;
      outputData: Record<string, unknown>;
      error?: string;
      durationMs: number;
    }>;

    try {
      executionTrace = await testRunWorkflow(
        workflowId,
        customData
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[Workflow Test Run] Failed to execute test run:', errorMessage);
      throw new Error(`Failed to execute test run: ${errorMessage}`);
    }

    // ====================================================================
    // Calculate Summary Statistics
    // ====================================================================
    const totalSteps = executionTrace.length;
    const completedSteps = executionTrace.filter((s) => s.status === 'completed').length;
    const failedSteps = executionTrace.filter((s) => s.status === 'failed').length;
    const skippedSteps = executionTrace.filter((s) => s.status === 'skipped').length;
    const totalDurationMs = executionTrace.reduce((sum, s) => sum + s.durationMs, 0);

    return NextResponse.json({
      success: true,
      data: {
        workflow_id: workflowId,
        workflow_name: workflow.name,
        summary: {
          total_steps: totalSteps,
          completed_steps: completedSteps,
          failed_steps: failedSteps,
          skipped_steps: skippedSteps,
          total_duration_ms: totalDurationMs,
          status: failedSteps > 0 ? 'failed' : 'success',
        },
        trace: executionTrace,
      },
    });
  } catch (error) {
    return handleApiError(error, 'Workflow Test Run POST');
  }
}
