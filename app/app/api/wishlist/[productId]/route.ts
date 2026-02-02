export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

// ============================================================================
// Wishlist Delete API Route - DELETE
// ============================================================================
// DELETE: Remove item from wishlist

export async function DELETE(
  _request: unknown,
  { params }: { params: { productId: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth();
    if (authResult.error) return authResult.error;
    const user = authResult.user;

    const productId = params.productId;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Delete the wishlist interaction
    const { error } = await supabase
      .from('product_interactions')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .eq('interaction_type', 'wishlist');

    if (error) {
      console.error('Failed to remove from wishlist:', error);
      return NextResponse.json(
        { error: 'Failed to remove from wishlist' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Wishlist API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
