import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';
import { handleApiError, badRequest } from '@/lib/api-errors';
import { CreateWorkflowSchema } from '@/lib/workflow-validator';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// ============================================================================
// Workflows API Route - /api/workflows
// ============================================================================
// GET: List all workflows with optional status filter
// POST: Create a new workflow
//
// What: Admin endpoints for managing workflow automations
// Why: Admins need to create and view workflows without direct database access
// How: Authenticates with verifyAdmin, validates with Zod schemas, queries Supabase

// ============================================================================
// GET - List All Workflows (Admin Only)
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // ====================================================================
    // Verify Admin Access
    // ====================================================================
    const adminResult = await verifyAdmin();
    if (adminResult.error) return adminResult.error;

    // ====================================================================
    // Parse Query Parameters
    // ====================================================================
    // Optional: ?status=active|draft|paused|archived
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    // Validate status filter if provided
    const validStatuses = ['draft', 'active', 'paused', 'archived'];
    if (statusFilter && !validStatuses.includes(statusFilter)) {
      return badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // ====================================================================
    // Fetch Workflows from Database
    // ====================================================================
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from('workflows')
      .select('*')
      .order('updated_at', { ascending: false });

    // Apply status filter if provided
    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    const { data: workflows, error } = await query;

    if (error) {
      console.error('[Workflows GET] Database error:', error);
      throw new Error(`Failed to fetch workflows: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: workflows || [],
      count: (workflows || []).length,
    });
  } catch (error) {
    return handleApiError(error, 'Workflows GET');
  }
}

// ============================================================================
// POST - Create New Workflow (Admin Only)
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // ====================================================================
    // Verify Admin Access
    // ====================================================================
    const adminResult = await verifyAdmin();
    if (adminResult.error) return adminResult.error;
    const admin = adminResult.user;

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
    const validationResult = CreateWorkflowSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((issue) => {
        const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
        return `${path}${issue.message}`;
      });
      return badRequest(`Validation failed: ${errors.join(', ')}`);
    }

    const workflowData = validationResult.data;

    // ====================================================================
    // Insert Workflow into Database
    // ====================================================================
    const supabase = getSupabaseAdmin();
    const { data: workflow, error } = await supabase
      .from('workflows')
      .insert([
        {
          name: workflowData.name,
          description: workflowData.description || null,
          trigger_type: workflowData.trigger_type,
          trigger_config: workflowData.trigger_config || {},
          nodes: workflowData.nodes,
          edges: workflowData.edges,
          status: 'draft', // Always create as draft
          created_by: admin.id,
        },
      ])
      .select('*')
      .single();

    if (error) {
      console.error('[Workflows POST] Database error:', error);
      throw new Error(`Failed to create workflow: ${error.message}`);
    }

    return NextResponse.json(
      {
        success: true,
        data: workflow,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, 'Workflows POST');
  }
}
