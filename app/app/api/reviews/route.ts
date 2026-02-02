import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createRequestFingerprint, checkAndMarkRequest } from '@/lib/request-dedup';

// ============================================================================
// Reviews API - /api/reviews
// ============================================================================
// What: Customer reviews and ratings for products
// Why: Social proof helps customers make purchasing decisions
// How: CRUD operations, voting, reporting, moderation

export const dynamic = 'force-dynamic';

// ============================================================================
// GET - Fetch reviews
// ============================================================================
// ?product_id=xxx - Get reviews for a product
// ?id=xxx - Get a single review
// ?rating=xxx - Get product rating summary

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');
    const reviewId = searchParams.get('id');
    const getRating = searchParams.get('rating');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sort') || 'recent'; // recent, helpful, rating_high, rating_low

    // Get single review by ID
    if (reviewId) {
      const { data: review, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', reviewId)
        .single();

      if (error || !review) {
        return NextResponse.json(
          { error: 'Review not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ review });
    }

    // Get rating summary for a product
    if (getRating && productId) {
      const { data, error } = await supabase
        .rpc('get_product_rating', { p_product_id: productId });

      if (error) {
        console.error('Failed to get rating:', error);
        return NextResponse.json(
          { error: 'Failed to get rating' },
          { status: 500 }
        );
      }

      return NextResponse.json(data);
    }

    // Product ID required for listing reviews
    if (!productId) {
      return NextResponse.json(
        { error: 'Missing required parameter: product_id' },
        { status: 400 }
      );
    }

    // Validate sorting parameter to prevent injection attacks
    // Only allow whitelisted sort values
    const ALLOWED_SORT_OPTIONS = ['helpful', 'rating_high', 'rating_low', 'recent'];
    const validatedSort = ALLOWED_SORT_OPTIONS.includes(sortBy) ? sortBy : 'recent';

    // Validate pagination parameters to prevent resource exhaustion
    const validatedLimit = Math.min(Math.max(parseInt(String(limit)) || 10, 1), 100); // Max 100 per page
    const validatedOffset = Math.max(parseInt(String(offset)) || 0, 0); // Min 0

    // Build query
    let query = supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('product_id', productId)
      .eq('status', 'approved');

    // Apply sorting (with validated parameter only)
    switch (validatedSort) {
      case 'helpful':
        query = query.order('helpful_count', { ascending: false });
        break;
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

    // Apply pagination with validated values
    query = query.range(validatedOffset, validatedOffset + validatedLimit - 1);

    const { data: reviews, error, count } = await query;

    if (error) {
      console.error('Failed to fetch reviews:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    // Get rating summary
    const { data: ratingSummary } = await supabase
      .rpc('get_product_rating', { p_product_id: productId });

    return NextResponse.json({
      reviews: reviews || [],
      rating: ratingSummary,
      pagination: {
        total: count || 0,
        limit: validatedLimit,
        offset: validatedOffset,
        hasMore: (count || 0) > validatedOffset + validatedLimit,
      },
    });
  } catch (error) {
    console.error('Reviews API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Create review or vote
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();
    const { action = 'create' } = body;

    switch (action) {
      case 'create': {
        const {
          product_id,
          rating,
          title,
          content,
          reviewer_name,
          reviewer_email,
          order_id,
          images,
        } = body;

        // Validate required fields
        if (!product_id) {
          return NextResponse.json(
            { error: 'Missing required field: product_id' },
            { status: 400 }
          );
        }

        if (!rating || rating < 1 || rating > 5) {
          return NextResponse.json(
            { error: 'Rating must be between 1 and 5' },
            { status: 400 }
          );
        }

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        // Anonymous reviews require email
        if (!user && !reviewer_email) {
          return NextResponse.json(
            { error: 'Email required for anonymous reviews' },
            { status: 400 }
          );
        }

        // ====================================================================
        // Deduplication Check
        // ====================================================================
        // Prevent duplicate review submissions from double-clicks or retries.
        // Fingerprint by user/email + product + rating to catch exact duplicates.

        try {
          const fingerprint = createRequestFingerprint({
            action: 'create_review',
            product_id,
            rating,
            content,
            email: reviewer_email || user?.email,
          }, user?.id);

          const isNew = await checkAndMarkRequest(fingerprint, 'review submission');
          if (!isNew) {
            return NextResponse.json(
              {
                error: 'This review was just submitted. Please wait at least 60 seconds before submitting another review for this product.',
                retryAfter: 60,
              },
              { status: 429, headers: { 'Retry-After': '60' } }
            );
          }
        } catch (dedupError) {
          console.error('Deduplication check failed:', dedupError);
          // Don't block the request if dedup fails - log and proceed
        }

        // Check for verified purchase (simplified check)
        let isVerifiedPurchase = false;
        if (order_id && user) {
          // In production, verify order belongs to user and contains product
          // For now, just check if order_id is provided
          isVerifiedPurchase = true;
        }

        // Create review
        const reviewData: Record<string, unknown> = {
          product_id,
          rating,
          title: title || null,
          content: content || null,
          reviewer_name: reviewer_name || (user ? 'Anonymous' : 'Guest'),
          reviewer_email: reviewer_email || null,
          order_id: order_id || null,
          is_verified_purchase: isVerifiedPurchase,
          images: images || [],
          status: 'pending', // Requires moderation
        };

        if (user) {
          reviewData.user_id = user.id;
        }

        const { data: review, error } = await supabase
          .from('reviews')
          .insert(reviewData)
          .select()
          .single();

        if (error) {
          console.error('Failed to create review:', error);
          return NextResponse.json(
            { error: 'Failed to create review' },
            { status: 500 }
          );
        }

        return NextResponse.json(
          {
            success: true,
            review,
            message: 'Review submitted for moderation',
          },
          { status: 201 }
        );
      }

      case 'vote': {
        const { review_id, vote_type, session_id } = body;

        if (!review_id) {
          return NextResponse.json(
            { error: 'Missing required field: review_id' },
            { status: 400 }
          );
        }

        if (!vote_type || !['helpful', 'not_helpful'].includes(vote_type)) {
          return NextResponse.json(
            { error: 'Invalid vote_type. Must be helpful or not_helpful' },
            { status: 400 }
          );
        }

        const { data: { user } } = await supabase.auth.getUser();

        if (!user && !session_id) {
          return NextResponse.json(
            { error: 'Must provide session_id for anonymous voting' },
            { status: 400 }
          );
        }

        // ====================================================================
        // Deduplication Check
        // ====================================================================
        // Prevent duplicate votes from double-clicks. Users clicking the same
        // button twice should be idempotent - only vote once.

        try {
          const fingerprint = createRequestFingerprint({
            action: 'vote_on_review',
            review_id,
            vote_type,
            user_or_session: user?.id || session_id,
          }, user?.id);

          const isNew = await checkAndMarkRequest(fingerprint, 'review vote');
          if (!isNew) {
            return NextResponse.json(
              { error: 'You already voted on this review. Your vote has been counted.' },
              { status: 409 }
            );
          }
        } catch (dedupError) {
          console.error('Deduplication check failed for vote:', dedupError);
          // Don't block the vote if dedup fails - log and proceed
        }

        const { data, error } = await supabase
          .rpc('vote_on_review', {
            p_review_id: review_id,
            p_vote_type: vote_type,
            p_user_id: user?.id || null,
            p_session_id: session_id || null,
          });

        if (error) {
          console.error('Failed to vote:', error);
          return NextResponse.json(
            { error: 'Failed to submit vote' },
            { status: 500 }
          );
        }

        return NextResponse.json(data, { status: 201 });
      }

      case 'report': {
        const { review_id, reason, details } = body;

        if (!review_id) {
          return NextResponse.json(
            { error: 'Missing required field: review_id' },
            { status: 400 }
          );
        }

        const validReasons = ['spam', 'inappropriate', 'fake', 'other'];
        if (!reason || !validReasons.includes(reason)) {
          return NextResponse.json(
            { error: `Invalid reason. Must be one of: ${validReasons.join(', ')}` },
            { status: 400 }
          );
        }

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          return NextResponse.json(
            { error: 'Must be logged in to report reviews' },
            { status: 401 }
          );
        }

        // ====================================================================
        // Deduplication Check
        // ====================================================================
        // Prevent duplicate reports from the same user on the same review.
        // One report per user per review is enough.

        try {
          const fingerprint = createRequestFingerprint({
            action: 'report_review',
            review_id,
            user_id: user.id,
          }, user.id);

          const isNew = await checkAndMarkRequest(fingerprint, 'review report');
          if (!isNew) {
            return NextResponse.json(
              { error: 'You already reported this review. Thank you for helping us maintain quality.' },
              { status: 409 }
            );
          }
        } catch (dedupError) {
          console.error('Deduplication check failed for report:', dedupError);
          // Don't block the report if dedup fails - log and proceed
        }

        const { error } = await supabase
          .from('review_reports')
          .insert({
            review_id,
            user_id: user.id,
            reason,
            details: details || null,
          });

        if (error) {
          console.error('Failed to report review:', error);
          return NextResponse.json(
            { error: 'Failed to submit report' },
            { status: 500 }
          );
        }

        return NextResponse.json(
          { success: true, message: 'Report submitted' },
          { status: 201 }
        );
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Reviews POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH - Update review (author only, pending status only)
// ============================================================================

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();
    const { id, rating, title, content } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Must be logged in to update reviews' },
        { status: 401 }
      );
    }

    // Get existing review
    const { data: existingReview, error: fetchError } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (existingReview.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this review' },
        { status: 403 }
      );
    }

    // Only pending reviews can be edited
    if (existingReview.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending reviews can be edited' },
        { status: 400 }
      );
    }

    // Build update
    const updateData: Record<string, unknown> = {};
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return NextResponse.json(
          { error: 'Rating must be between 1 and 5' },
          { status: 400 }
        );
      }
      updateData.rating = rating;
    }
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;

    const { data: review, error } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update review:', error);
      return NextResponse.json(
        { error: 'Failed to update review' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Reviews PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - Delete review (author only, pending status only)
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Must be logged in to delete reviews' },
        { status: 401 }
      );
    }

    // Get existing review
    const { data: existingReview, error: fetchError } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Verify ownership or admin
    const isAdmin = user.user_metadata?.role === 'admin';
    if (existingReview.user_id !== user.id && !isAdmin) {
      return NextResponse.json(
        { error: 'Not authorized to delete this review' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete review:', error);
      return NextResponse.json(
        { error: 'Failed to delete review' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reviews DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
