import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import {
  sendReviewApprovedEmail,
  sendReviewRejectedEmail,
} from '@/lib/review-notifications';

// ============================================================================
// Admin Reviews API - /api/admin/reviews
// ============================================================================
// What: Admin management of pending product reviews
// Why: Admins need to moderate reviews before they appear to customers
// How: Fetch pending reviews, approve/reject with optional feedback

export const dynamic = 'force-dynamic';

// ============================================================================
// GET - Fetch pending reviews for moderation
// ============================================================================
// ?status=pending - Get pending reviews (default)
// ?status=all - Get all reviews including approved/rejected
// ?product_id=xxx - Filter by product
// ?sort=recent - Sort by recent, rating_high, rating_low

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check if admin
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') || 'pending';
    const productId = searchParams.get('product_id');
    const sortBy = searchParams.get('sort') || 'recent';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('reviews')
      .select('*, products(title, id)', { count: 'exact' });

    // Filter by status
    if (statusFilter === 'pending') {
      query = query.eq('status', 'pending');
    } else if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    // Filter by product if specified
    if (productId) {
      query = query.eq('product_id', productId);
    }

    // Apply sorting
    switch (sortBy) {
      case 'rating_high':
        query = query.order('rating', { ascending: false });
        break;
      case 'rating_low':
        query = query.order('rating', { ascending: true });
        break;
      case 'recent':
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: reviews, error, count } = await query;

    if (error) {
      console.error('Failed to fetch reviews for moderation:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reviews: reviews || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('Admin reviews GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Approve or reject a review
// ============================================================================
// action: 'approve' | 'reject'
// id: review ID
// rejection_reason: optional reason for rejection

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check if admin
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, id, rejection_reason } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Missing or invalid action. Must be approve or reject' },
        { status: 400 }
      );
    }

    // Get the review to verify it exists and is pending
    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Update review status
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const updateData: Record<string, unknown> = {
      status: newStatus,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    };

    if (action === 'reject' && rejection_reason) {
      updateData.rejection_reason = rejection_reason;
    }

    const { data: updatedReview, error: updateError } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update review:', updateError);
      return NextResponse.json(
        { error: 'Failed to update review' },
        { status: 500 }
      );
    }

    // ========================================================================
    // Send notification email to reviewer
    // ========================================================================
    // Fetch product title for email
    const { data: product } = await supabase
      .from('products')
      .select('title, featured_image')
      .eq('id', review.product_id)
      .single();

    // Fetch product URL for email (using Medusa product ID)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com';
    const productUrl = product
      ? `${siteUrl}/shop/${review.product_id}`
      : undefined;

    // Send email based on action
    if (action === 'approve' && review.reviewer_email) {
      await sendReviewApprovedEmail(
        review.reviewer_email,
        review.reviewer_name,
        product?.title || 'Product',
        product?.featured_image,
        review.rating,
        review.title,
        productUrl
      );
    } else if (action === 'reject' && review.reviewer_email) {
      await sendReviewRejectedEmail(
        review.reviewer_email,
        review.reviewer_name,
        product?.title || 'Product',
        review.rating,
        rejection_reason,
        productUrl
      );
    }

    return NextResponse.json({
      success: true,
      review: updatedReview,
      message: `Review ${action}ed successfully and reviewer has been notified`,
    });
  } catch (error) {
    console.error('Admin reviews POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
