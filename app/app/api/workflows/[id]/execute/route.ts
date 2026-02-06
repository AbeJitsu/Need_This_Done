import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';
import { handleApiError, badRequest, notFound } from '@/lib/api-errors';
import { getSupabaseAdmin } from '@/lib/supabase';
import { triggerWorkflow } from '@/lib/workflow-engine';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// ============================================================================
// Workflow Execute API Route - /api/workflows/[id]/execute
// ============================================================================
// POST: Manually trigger a workflow execution
//
// What: Admin endpoint to manually execute a workflow (for testing or one-off runs)
// Why: Admins need to test workflows without waiting for trigger events
// How: Validates workflow exists, queues execution via triggerWorkflow, returns job ID

// ============================================================================
// POST - Manually Trigger Workflow Execution (Admin Only)
// ============================================================================

// Schema for manual execution request
const ExecuteWorkflowSchema = z.object({
  customData: z.record(z.string(), z.unknown()).optional(),
});

type ExecuteWorkflowRequest = z.infer<typeof ExecuteWorkflowSchema>;

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
    const validationResult = ExecuteWorkflowSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((issue) => {
        const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
        return `${path}${issue.message}`;
      });
      return badRequest(`Validation failed: ${errors.join(', ')}`);
    }

    const { customData } = validationResult.data as ExecuteWorkflowRequest;

    // ====================================================================
    // Verify Workflow Exists and Is Not Archived
    // ====================================================================
    const supabase = getSupabaseAdmin();
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('id, status, trigger_type, name')
      .eq('id', workflowId)
      .single();

    if (workflowError || !workflow) {
      return notFound('Workflow not found');
    }

    if (workflow.status === 'archived') {
      return badRequest('Cannot execute archived workflow');
    }

    // ====================================================================
    // Trigger Workflow Execution
    // ====================================================================
    // Use the triggerWorkflow function from workflow-engine to queue execution
    // This function handles:
    // - Creating workflow_executions record
    // - Queueing job in BullMQ
    // - Returning job ID for polling
    let jobId: string;
    try {
      jobId = await triggerWorkflow(
        workflowId,
        'manual',
        customData
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[Workflow Execute] Failed to trigger workflow:', errorMessage);
      throw new Error(`Failed to queue workflow execution: ${errorMessage}`);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          job_id: jobId,
          workflow_id: workflowId,
          workflow_name: workflow.name,
          triggered_by: 'manual',
          message: 'Workflow execution queued successfully',
        },
      },
      { status: 202 } // 202 Accepted - processing asynchronously
    );
  } catch (error) {
    return handleApiError(error, 'Workflow Execute POST');
  }
}
