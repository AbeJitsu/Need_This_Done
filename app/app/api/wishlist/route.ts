export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

// ============================================================================
// Wishlist API Routes - GET, POST
// ============================================================================
// GET: Fetch user's wishlist items
// POST: Add item to wishlist

export async function GET() {
  try {
    // Verify authentication
    const authResult = await verifyAuth();
    if (authResult.error) return authResult.error;
    const user = authResult.user;

    const supabase = await createSupabaseServerClient();

    // Fetch wishlist items from product_interactions
    const { data: items, error } = await supabase
      .from('product_interactions')
      .select('product_id, created_at')
      .eq('user_id', user.id)
      .eq('interaction_type', 'wishlist')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch wishlist:', error);
      return NextResponse.json(
        { error: 'Failed to fetch wishlist' },
        { status: 500 }
      );
    }

    // Transform to include product info (will be enriched client-side or we can fetch from Medusa)
    return NextResponse.json({
      items: items || [],
    });
  } catch (err) {
    console.error('Wishlist API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth();
    if (authResult.error) return authResult.error;
    const user = authResult.user;

    const body = await request.json();
    const { product_id } = body;

    if (!product_id) {
      return NextResponse.json(
        { error: 'product_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Record the wishlist interaction
    const { error } = await supabase
      .from('product_interactions')
      .insert({
        user_id: user.id,
        product_id,
        interaction_type: 'wishlist',
        source_page: body.source_page || 'wishlist',
      });

    if (error) {
      console.error('Failed to add to wishlist:', error);
      return NextResponse.json(
        { error: 'Failed to add to wishlist' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('Wishlist API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
