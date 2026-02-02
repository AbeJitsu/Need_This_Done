// ============================================================================
// GET /api/user/reviews - Fetch current user's reviews
// ============================================================================
// Why: Customers need to see their review history and status
// How: Queries reviews table by customer email, returns all statuses

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_KEY || ''
    );

    // Fetch reviews for the user's email
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(
        `
        id,
        product_id,
        rating,
        title,
        content,
        status,
        created_at,
        updated_at
      `
      )
      .eq('customer_email', session.user.email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching reviews:', error);
      return Response.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    return Response.json({
      reviews: reviews || [],
      total: reviews?.length || 0,
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return Response.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
