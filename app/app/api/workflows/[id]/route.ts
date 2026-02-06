import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';
import { handleApiError, badRequest, notFound } from '@/lib/api-errors';
import { UpdateWorkflowSchema } from '@/lib/workflow-validator';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// ============================================================================
// Single Workflow API Route - /api/workflows/[id]
// ============================================================================
// GET: Retrieve a single workflow with execution statistics
// PUT: Update a workflow
// DELETE: Soft-delete a workflow (set status to archived)
//
// What: Admin endpoints for managing individual workflows
// Why: Admins need to view, edit, and delete workflows
// How: Authenticates with verifyAdmin, validates updates, performs database operations

// ============================================================================
// GET - Retrieve Single Workflow with Stats (Admin Only)
// ============================================================================

export async function GET(
  _request: NextRequest,
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
    // Fetch Workflow and Execution Statistics
    // ====================================================================
    const supabase = getSupabaseAdmin();

    // Get workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .single();

    if (workflowError || !workflow) {
      return notFound('Workflow not found');
    }

    // Get execution statistics
    const { data: executions, error: executionsError } = await supabase
      .from('workflow_executions')
      .select('id, status, created_at')
      .eq('workflow_id', workflowId);

    if (executionsError) {
      console.error('[Workflow GET Stats] Database error:', executionsError);
      throw new Error(`Failed to fetch execution stats: ${executionsError.message}`);
    }

    // ====================================================================
    // Calculate Statistics
    // ====================================================================
    const execList = executions || [];
    const successCount = execList.filter((e) => e.status === 'completed').length;
    const failedCount = execList.filter((e) => e.status === 'failed').length;
    const totalRuns = execList.length;
    const successRate = totalRuns > 0 ? (successCount / totalRuns) * 100 : 0;

    // Get last run timestamp
    const lastRun = execList.length > 0
      ? new Date(
          Math.max(
            ...execList.map((e) => new Date(e.created_at).getTime())
          )
        ).toISOString()
      : null;

    return NextResponse.json({
      success: true,
      data: {
        ...workflow,
        stats: {
          total_runs: totalRuns,
          success_runs: successCount,
          failed_runs: failedCount,
          success_rate: parseFloat(successRate.toFixed(2)),
          last_run: lastRun,
        },
      },
    });
  } catch (error) {
    return handleApiError(error, 'Workflow GET');
  }
}

// ============================================================================
// PUT - Update Workflow (Admin Only)
// ============================================================================

export async function PUT(
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
    const validationResult = UpdateWorkflowSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((issue) => {
        const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
        return `${path}${issue.message}`;
      });
      return badRequest(`Validation failed: ${errors.join(', ')}`);
    }

    const updateData = validationResult.data;

    // ====================================================================
    // Check if Workflow Exists
    // ====================================================================
    const supabase = getSupabaseAdmin();
    const { data: existing, error: existError } = await supabase
      .from('workflows')
      .select('id')
      .eq('id', workflowId)
      .single();

    if (existError || !existing) {
      return notFound('Workflow not found');
    }

    // ====================================================================
    // Update Workflow
    // ====================================================================
    const { data: updated, error } = await supabase
      .from('workflows')
      .update({
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.description !== undefined && {
          description: updateData.description || null,
        }),
        ...(updateData.trigger_type && { trigger_type: updateData.trigger_type }),
        ...(updateData.trigger_config && { trigger_config: updateData.trigger_config }),
        ...(updateData.nodes && { nodes: updateData.nodes }),
        ...(updateData.edges && { edges: updateData.edges }),
        ...(updateData.status && { status: updateData.status }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', workflowId)
      .select('*')
      .single();

    if (error) {
      console.error('[Workflow PUT] Database error:', error);
      throw new Error(`Failed to update workflow: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return handleApiError(error, 'Workflow PUT');
  }
}

// ============================================================================
// DELETE - Soft-Delete Workflow (Admin Only)
// ============================================================================

export async function DELETE(
  _request: NextRequest,
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
    // Check if Workflow Exists
    // ====================================================================
    const supabase = getSupabaseAdmin();
    const { data: existing, error: existError } = await supabase
      .from('workflows')
      .select('id')
      .eq('id', workflowId)
      .single();

    if (existError || !existing) {
      return notFound('Workflow not found');
    }

    // ====================================================================
    // Soft-Delete Workflow (Set Status to Archived)
    // ====================================================================
    const { error } = await supabase
      .from('workflows')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', workflowId);

    if (error) {
      console.error('[Workflow DELETE] Database error:', error);
      throw new Error(`Failed to delete workflow: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Workflow archived successfully',
    });
  } catch (error) {
    return handleApiError(error, 'Workflow DELETE');
  }
}
