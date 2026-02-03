import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { unauthorized, handleApiError } from '@/lib/api-errors';

export const dynamic = 'force-dynamic';

// ============================================================================
// Subscriptions API Route - /api/subscriptions
// ============================================================================
// GET: List user's active subscriptions
//
// What: Fetch all subscriptions for the authenticated user
// Why: Display subscription status in account settings
// How: Query Supabase subscriptions table, joined with product info

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return unauthorized('You must be logged in to view subscriptions');
    }

    // Fetch subscriptions for this user
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Subscriptions] Error fetching subscriptions:', error);
      throw new Error('Failed to fetch subscriptions');
    }

    // Transform for frontend display
    const formattedSubscriptions = (subscriptions || []).map((sub: {
      id: string;
      stripe_subscription_id: string;
      stripe_price_id: string;
      status: string;
      current_period_start: string | null;
      current_period_end: string | null;
      cancel_at_period_end: boolean;
      created_at: string;
    }) => ({
      id: sub.id,
      stripeSubscriptionId: sub.stripe_subscription_id,
      stripePriceId: sub.stripe_price_id,
      status: sub.status,
      currentPeriodStart: sub.current_period_start,
      currentPeriodEnd: sub.current_period_end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      createdAt: sub.created_at,
    }));

    return NextResponse.json({
      subscriptions: formattedSubscriptions,
    });
  } catch (error) {
    return handleApiError(error, 'Subscriptions GET');
  }
}
