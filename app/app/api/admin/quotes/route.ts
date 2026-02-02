import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import { handleApiError } from '@/lib/api-errors';
import { validateRequest, commonSchemas } from '@/lib/api-validation';
import { cache, CACHE_TTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// ============================================================================
// Admin Quotes API Route - /api/admin/quotes
// ============================================================================
// GET: List all quotes (admin only)
// POST: Create a new quote (admin only)
//
// What: Admin endpoint for managing customer quotes
// Why: Admins create quotes from project inquiries, customers pay deposits
// How: CRUD operations on the quotes table

// ============================================================================
// GET - List All Quotes (Admin Only)
// ============================================================================

export async function GET() {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;

    const result = await cache.wrap(
      'admin:quotes:all',
      async () => {
        const { createSupabaseServerClient } = await import('@/lib/supabase-server');
        const supabase = await createSupabaseServerClient();

        const { data: quotes, error: fetchError } = await supabase
          .from('quotes')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error('[Admin Quotes] Fetch error:', fetchError);
          throw new Error('Failed to fetch quotes');
        }

        return quotes || [];
      },
      CACHE_TTL.MEDIUM
    );

    return NextResponse.json({
      quotes: result.data,
      count: result.data.length,
      cached: result.cached,
      source: result.source,
    });
  } catch (error) {
    return handleApiError(error, 'Admin Quotes GET');
  }
}

// ============================================================================
// POST - Create New Quote (Admin Only)
// ============================================================================

// Zod schema for quote creation validation
const CreateQuoteSchema = z.object({
  customerName: commonSchemas.nonEmptyString,
  customerEmail: commonSchemas.email,
  projectId: commonSchemas.uuid.optional(),
  totalAmount: commonSchemas.positiveInt,
  notes: commonSchemas.optionalString,
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;

    // ====================================================================
    // Validate Request Body with Zod Schema
    // ====================================================================
    // Use centralized validation for consistency and clear error messages.
    // All fields are sanitized and transformed during validation.

    const result = await validateRequest(request, CreateQuoteSchema);
    if (!result.success) return result.error;

    const { customerName, customerEmail, projectId, totalAmount, notes } = result.data;

    const { createSupabaseServerClient } = await import('@/lib/supabase-server');
    const supabase = await createSupabaseServerClient();

    // Calculate deposit (50% of total)
    const depositAmount = Math.round(totalAmount / 2);

    // Calculate expiration (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // ========================================================================
    // Transaction: Create quote and update project atomically
    // ========================================================================
    // If projectId is provided, we need to link the quote to the project
    // AND update the project status. This must be atomic - either both
    // operations succeed or both fail.

    let quote;

    if (projectId) {
      // Use Supabase RPC for transactional quote creation with project update
      const { data: result, error: rpcError } = await supabase.rpc(
        'create_quote_with_project_update',
        {
          p_customer_name: customerName,
          p_customer_email: customerEmail,
          p_project_id: projectId,
          p_total_amount: totalAmount,
          p_deposit_amount: depositAmount,
          p_expires_at: expiresAt.toISOString(),
          p_notes: notes || null,
        }
      );

      if (rpcError) {
        console.error('[Admin Quotes] Transaction error:', rpcError);
        throw new Error('Failed to create quote and update project');
      }

      quote = result;
    } else {
      // No project linkage - simple insert
      const { data: insertData, error: insertError } = await supabase
        .from('quotes')
        .insert({
          customer_name: customerName,
          customer_email: customerEmail,
          project_id: null,
          total_amount: totalAmount,
          deposit_amount: depositAmount,
          status: 'draft',
          expires_at: expiresAt.toISOString(),
          notes: notes || null,
        })
        .select()
        .single();

      if (insertError) {
        console.error('[Admin Quotes] Insert error:', insertError);
        throw new Error('Failed to create quote');
      }

      quote = insertData;
    }

    // Invalidate cache
    await cache.invalidate('admin:quotes:all');
    if (projectId) {
      await cache.invalidatePattern('admin:projects:*');
    }

    return NextResponse.json({
      success: true,
      quote,
    });
  } catch (error) {
    return handleApiError(error, 'Admin Quotes POST');
  }
}
