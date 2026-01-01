import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-auth';
import { handleApiError, badRequest, notFound } from '@/lib/api-errors';
import { cache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// ============================================================================
// Admin Quote Detail API Route - /api/admin/quotes/[id]
// ============================================================================
// GET: Get a single quote
// PATCH: Update quote status
// DELETE: Delete a quote (draft only)

// ============================================================================
// GET - Get Single Quote
// ============================================================================

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;

    const { id } = await context.params;

    const { createSupabaseServerClient } = await import('@/lib/supabase-server');
    const supabase = await createSupabaseServerClient();

    const { data: quote, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !quote) {
      return notFound('Quote not found');
    }

    return NextResponse.json({ quote });
  } catch (error) {
    return handleApiError(error, 'Admin Quote GET');
  }
}

// ============================================================================
// PATCH - Update Quote Status
// ============================================================================

interface UpdateQuoteRequest {
  status?: string;
  notes?: string;
  totalAmount?: number;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;

    const { id } = await context.params;
    const body: UpdateQuoteRequest = await request.json();

    const { createSupabaseServerClient } = await import('@/lib/supabase-server');
    const supabase = await createSupabaseServerClient();

    // Check quote exists
    const { data: existingQuote, error: fetchError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingQuote) {
      return notFound('Quote not found');
    }

    // Build update object
    const updates: Record<string, unknown> = {};

    if (body.status) {
      const validStatuses = ['draft', 'sent', 'authorized', 'deposit_paid', 'balance_paid', 'completed'];
      if (!validStatuses.includes(body.status)) {
        return badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }
      updates.status = body.status;
    }

    if (body.notes !== undefined) {
      updates.notes = body.notes;
    }

    if (body.totalAmount !== undefined) {
      if (typeof body.totalAmount !== 'number' || body.totalAmount <= 0) {
        return badRequest('Total amount must be a positive number (in cents)');
      }
      updates.total_amount = body.totalAmount;
      updates.deposit_amount = Math.round(body.totalAmount / 2);
    }

    // Perform update
    const { data: quote, error: updateError } = await supabase
      .from('quotes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[Admin Quote] Update error:', updateError);
      throw new Error('Failed to update quote');
    }

    // Invalidate cache
    await cache.invalidate('admin:quotes:all');

    return NextResponse.json({
      success: true,
      quote,
    });
  } catch (error) {
    return handleApiError(error, 'Admin Quote PATCH');
  }
}

// ============================================================================
// DELETE - Delete Draft Quote
// ============================================================================

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) return authResult.error;

    const { id } = await context.params;

    const { createSupabaseServerClient } = await import('@/lib/supabase-server');
    const supabase = await createSupabaseServerClient();

    // Check quote exists and is in draft status
    const { data: existingQuote, error: fetchError } = await supabase
      .from('quotes')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError || !existingQuote) {
      return notFound('Quote not found');
    }

    if (existingQuote.status !== 'draft') {
      return badRequest('Only draft quotes can be deleted');
    }

    // Delete the quote
    const { error: deleteError } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[Admin Quote] Delete error:', deleteError);
      throw new Error('Failed to delete quote');
    }

    // Invalidate cache
    await cache.invalidate('admin:quotes:all');

    return NextResponse.json({
      success: true,
      message: 'Quote deleted',
    });
  } catch (error) {
    return handleApiError(error, 'Admin Quote DELETE');
  }
}
